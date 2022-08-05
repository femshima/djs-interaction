# djs-interactions

discord.jsのコマンドやComponentの定義と
Interactionのハンドラを近い位置に書けるようにするフレームワークです。

## 使い方

詳しい使い方は`sample/`を見てください。

| Interactionの種類 | 説明 |
| -- | -- |
| `Command` | スラッシュコマンド |
| `SubCommandGroup` | スラッシュコマンド関連、`ApplicationCommandSubGroupData`に相当 |
| `SubCommand` | スラッシュコマンド関連、`ApplicationCommandSubCommandData`に相当 |
| `MessageContextMenu` | メッセージを右クリックすると出てくるコンテキストメニュー |
| `UserContextMenu` | ユーザーを右クリックすると出てくるコンテキストメニュー |
| `Button` | ボタン |
| `SelectMenu` | 選択ボックス |
| `Modal` | モーダルウィンドウ |

### Setup

djs-interactionの`Command`、`SubCommandGroup`、`SubCommand`、`MessageContextMenu`、`UserContextMenu`、`Button`、`SelectMenu`、`Modal`を継承したクラスを一つでもインスタンス化する前に`frame.setup()`を呼び出す必要があります。
また、`frame.setup()`を複数回呼び出すとその都度コマンドの登録が行われるため、問題が発生する可能性があります。

```ts
import { frame } from 'djs-interaction';
//...
await frame.setup({
  client,
  commands: {
    ...Command,
    ...ContextMenu,
  },
  components: Component,
  guilds: !env.production,
  subscribeToEvent: true,
  async fallback(interaction) {
    if ('replied' in interaction && !interaction.replied) {
      await interaction.reply('Unknown interaction.');
    }
  },
});
```

`frame.setup()`の引数は一つで、次のようなオブジェクトです。

| キー |  説明 |
| -- |  -- |
| client | Discord.jsのclientです。 |
| commands | 登録するコマンド(`Command`、`MessageContextMenu`、`UserContextMenu`を継承したもの)をすべてここに指定します。コマンドのクラス(インスタンス化してあっても、する前のものでも構いません)の配列または、keyを文字列、それらのクラスをvalueとするオブジェクトを渡してください。 |
| components | 使用時に都度インスタンス化して使うもの(`Button`、`SelectMenu`、`Modal`を継承したもの)をすべてここに指定します。コマンドのクラス(インスタンス化する前のものである必要があります)の配列または、keyを文字列、それらのクラスをvalueとするオブジェクトを渡してください。|
| subscribeToEvent | setupメソッドの中で自動的に`interactionCreate`イベントにハンドラを登録するかどうかbooleanで指定します。`false`をセットした場合、別の場所で`frame.interactionCreate`をハンドラとして登録する必要があります。 |
| fallback | 受信したinteractionのハンドラが見つからなかった場合や、ハンドラが応答しなかった場合に呼び出される関数です。 |
| database | データベースとの連携を使用する場合、このオプションを使います。詳しくは[データベースと連携させる](#データベースと連携させる)を参照してください。 |
| idGen | idを生成するクラスのインスタンスを指定します。ユニークなID(文字列)を生成して返す`generateID`メソッドを実装している必要があります。 |

### スラッシュコマンド(ChatInputApplicationCommand)

すべてのコマンド定義は`Command`を継承している必要があります。
`constructor`でコマンド定義を`super`に渡して呼び出します。
`handler`を実装していなくてもTypeScriptのエラーは出ませんが、interactionに応答しないとDiscord側でエラーメッセージが表示されるため、SubCommandを使用する時以外は実装することが推奨されます。
<details>
<summary>例</summary>

```ts
import { CommandInteraction } from 'discord.js';
import { Command } from 'djs-interaction';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'ping',
      description: 'Ping!',
    });
  }

  async handle(interaction: CommandInteraction<'cached'>) {
    await interaction.reply({ content: 'Pong!' });
  }
}
```

</details>

#### サブコマンド

djs-interactionsはサブコマンドにも対応しています。
サブコマンドでは`SubCommand`を継承してください。
通常のコマンドと同じように、`constructor`でコマンド定義を`super`に渡して呼び出します。
ただし、通常のコマンドと異なり、`handler`を定義しないとTypeScriptでエラーになります。
<details>
<summary>例</summary>

```ts
import { ChatInputCommandInteraction } from 'discord.js';
import { SubCommand } from 'djs-interaction';

export default class Locale extends SubCommand {
  constructor() {
    super({
      name: 'locale',
      description: 'shows supported locales',
    });
  }
  async handle(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.reply('en,ja');
  }
}
```

</details>

サブコマンドを定義したら、それらをオプションとしてまとめたコマンドを定義します。

<details>
<summary>例</summary>

```ts
import { Command } from 'djs-interaction';
import Admin from './admin';
import Langs from './langs';
import Locale from './locales';

export default class Greet extends Command {
  constructor() {
    super({
      name: 'greet',
      description: 'Commands about greetings',
      options: [new Langs(), new Locale(), new Admin()],
    });
  }
}
```

</details>

なお、サブコマンドをもつコマンドでも、通常のコマンド同様handlerを定義することができます。handlerは`Command`、(存在する場合は)`SubCommandGroup`、`SubCommand`の順に呼び出されます。

handler内で`djs-interaction`からインポートした`AbortError`をthrowすると、そのhandler以降のhandlerは実行されません。すなわち、`Command`のhandlerで`AbortError`をthrowすると、`SubCommandGroup`、`SubCommand`のhandlerは実行されません。

```ts
//...
async handle(interaction: ChatInputCommandInteraction<'cached'>) {
  if (
    !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    await interaction.reply(
      'You are not admin, so you cannot use this command.'
    );
    throw new AbortError();
  }
}
//...
```

#### サブコマンドグループ

サブコマンドをまとめるコマンドと同様に使います。ただし、`Command`ではなく`SubCommandGroup`を継承してください。

### ContextMenu

ContextMenuには、ユーザーを右クリックしたときに実行される`UserApplicationCommand`とメッセージを右クリックしたときに実行される`MessageApplicationCommand`があります。

基本的にはコマンド定義と同様ですが、`UserApplicationCommand`は`UserContextMenu`を、`MessageApplicationCommand`は`MessageContextMenu`を継承したクラスを作成してください。

### Component

ここで、`Component`は`Button`、`SelectMenu`、`Modal`のことを指しています(`Modal`は微妙かもしれませんが)。

これらもコマンド同様、定義を`constructor`内で`super`に渡すだけです。

`Button`はhandlerを定義しなくてもエラーにはなりませんが、これはstyleがLinkのときにhandlerを定義しなくてもいいためです。そうでない場合は定義すべきです。

## データベースと連携させる

デフォルトではInteractionの定義はメモリに保存されるため、プログラムを終了させた時点で蒸発します。これを防ぐには、データベースなどに保存しておく必要があります。

djs-interactionでデータベースを使うには、`frame.setup`の実行時に`database`オプションを指定します。

### [Prisma](https://www.prisma.io/)を使う場合

  まず、スキーマの例を示します。重要なのは`model Interaction`の部分だけですので、他の部分は適宜変更してください。また、列名と型が同じであればテーブル名を変えても構いません。

  ```Prisma
  generator client {
    provider      = "prisma-client-js"
    binaryTargets = ["native"]
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  model Interaction {
    id           String  @id
    classKey     String
    classVersion String?
    data         Json
  }
  ```

  setup部分は次のように書きます。テーブル名はスキーマに合わせてください。

  ```ts
  const prisma = new PrismaClient()
  await frame.setup({
    //...
    database: prisma.interaction
  });
  ```

### Prismaを使わない場合

  ```ts
  await frame.setup({
      //...
      database: {
        findUnique(options) {
          // options.where.idがidに一致するレコードを探して返します。
          // レコードの形式は次のようになっています。
          // {
          //   id: string; // depends on what kind of idgen you use.
          //   classKey: string; // the key set in class or the name of the class
          //   classVersion: string | null; // version set in class or null
          //   data: JsonObject;
          // }
          //
          // 例:
          // {
          //   id: 'id-1',
          //   classKey: 'Target',
          //   classVersion: null,
          //   data: {
          //     type: 'MODAL',
          //     message: 'msg',
          //     data: { d: 'X' },
          //   },
          // }
        },
        create(options) {
          // findUniqueで説明したようなレコードがoptions.dataとして渡されるので、データベースに登録します。
          // idが重複することは想定されていませんので、重複した場合は例外を投げるべきです。
        }
      }
    });
  ```
