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

デフォルトではInteractionの定義はメモリに保存されるため、プログラムを終了させた時点で蒸発します。これを防ぐには、データベースなどに保存しておく必要があります(なお、データベースに保存する形式を自由に指定できるようにするため、djs-interactionからは型とクラスを提供するだけになっています)。

1. 各ファイルからインポートできる位置に`adapter.ts`を作成します。

  ```ts
  import { Adapter, DefaultDataStore, StorageObject } from "djs-interaction";

  type StoreType = Record<string, string>;


  // This will be adapter to database in real use cases
  const store = new DefaultDataStore<StorageObject<StoreType>>();

  export const adapter =
      new Adapter<StoreType, DefaultDataStore<StorageObject<StoreType>>>(store)
  ```

1. 適当な箇所(`registerCommand`の直前など)でAdapterを設定します。

  ```ts
  import { adapter } from './adapter'
  //...
  await frame.store.setStore(adapter)
  ```

1. すべてのコマンド定義、コンポーネント定義の直後にserializer/deserializerを記述します。

  ```ts
  adapter.register({
    key: 'more',
    ctor: More,
    serialize(from) {
      return from.serialize()
    },
    deserialize(to) {
      return new More(to.message)
    }
  })
  ```
