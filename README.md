# djs-interactions

discord.jsには各種のInteractionがありますが、
それらの定義とハンドラを近い位置に書けるようにすることで
使いやすくするフレームワーク的何かです。

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

## データベースと連携させる場合

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
