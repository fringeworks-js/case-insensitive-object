# @fringeworks/case-insensitive-object

`@fringeworks/case-insensitive-object` は、キーの大文字・小文字などの違いを区別しないオブジェクトを扱う、誰かにとっては便利なライブラリです。

**[English README is available here](./README.md)**

## インストール

```bash
npm install @fringeworks/case-insensitive-object
# または
pnpm add @fringeworks/case-insensitive-object
```

## 使い方

関数・型・定数は、ルートと関数単位のパスのどちらからでも同じ名前で import できます。関数単位のパスでは、その関数を default import することもできます。

```ts
import { createCaseInsensitiveObject } from '@fringeworks/case-insensitive-object';
import createCaseInsensitiveObject from '@fringeworks/case-insensitive-object/createCaseInsensitiveObject';
```

---

## API

| 関数                                               | 説明                                                         |
| -------------------------------------------------- | ------------------------------------------------------------ |
| `createCaseInsensitiveObject(options?)`            | キーの大文字・小文字を区別しないオブジェクトを作る           |
| `createKeyTransformObject(transformKey, options?)` | キーを変換して管理するオブジェクトを作る                     |
| `getByNormalizedKey(data, key, options?)`          | キーの表記の違いを無視してプロパティの値を返す               |
| `setByNormalizedKey(data, key, value, options?)`   | キーの表記の違いを無視してプロパティに値を設定する（破壊的） |

### `createCaseInsensitiveObject`

```ts
createCaseInsensitiveObject<T extends Record<string, unknown>>(options?: CreateCaseInsensitiveObjectOptions<T>): T
```

キーの大文字・小文字を区別しないオブジェクト（`Proxy`）を作ります。`ignoreWidth` などの `@fringeworks/japanese-text` の `normalizeString` のオプションを指定すると、全角・半角などの違いも区別しなくなります。

```ts
const headers = createCaseInsensitiveObject({
  target: { 'Content-Type': 'text/html' },
});
headers['content-type']; // 'text/html'
'CONTENT-TYPE' in headers; // true
```

| オプション          | 型                            | 説明                                                                                                                                                |
| ------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target?`           | `T`                           | 初期値を持つオブジェクト。デフォルトは空のオブジェクト                                                                                              |
| `caseSensitive?`    | `boolean`                     | `true` の場合、大文字・小文字を区別する。デフォルトは `false`                                                                                       |
| `storedKeyType?`    | `'transformed' \| 'original'` | 実体のオブジェクトに格納するキー。`'transformed'`: 正規化したキー（小文字など）、`'original'`: 最初に使われた元のキー。デフォルトは `'transformed'` |
| `mutable?`          | `boolean`                     | `true` の場合、`target` を直接変更する。`false` の場合は `target` のプロパティをコピーしたオブジェクトを使う。デフォルトは `false`                  |
| `includeInherited?` | `boolean`                     | `true` の場合、`target` の継承したプロパティも対象にする。デフォルトは `false`                                                                      |
| `ignore*` など      | `NormalizeStringOptions`      | `@fringeworks/japanese-text` の `normalizeString` のオプション（`ignoreCase` を除く）。キーの正規化に使う                                           |

### `createKeyTransformObject`

```ts
createKeyTransformObject<T extends object>(transformKey: CreateKeyTransformObjectGetKeyFn<T>, options?: CreateKeyTransformObjectOptions<T>): any
```

プロパティの読み書きのたびに `transformKey` でキーを変換するオブジェクト（`Proxy`）を作ります。`createCaseInsensitiveObject` の基になっている関数です。`transformKey` は、変換後のキーを渡された場合にはそのまま返す必要があります。

```ts
const obj = createKeyTransformObject((_, key) =>
  typeof key === 'string' ? key.toUpperCase() : key,
);
obj.name = 'Alice';
obj.NAME; // 'Alice'
```

| 引数           | 型                                                       | 説明               |
| -------------- | -------------------------------------------------------- | ------------------ |
| `transformKey` | `(target: T, key: string \| symbol) => string \| symbol` | キーを変換する関数 |
| `options?`     | `CreateKeyTransformObjectOptions<T>`                     | 下記のオプション   |

| オプション          | 型                                                       | 説明                                                                                                         |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `target?`           | `T`                                                      | `createCaseInsensitiveObject` と同じ                                                                         |
| `storedKeyType?`    | `'transformed' \| 'original'`                            | `createCaseInsensitiveObject` と同じ                                                                         |
| `mutable?`          | `boolean`                                                | `createCaseInsensitiveObject` と同じ                                                                         |
| `includeInherited?` | `boolean`                                                | `createCaseInsensitiveObject` と同じ                                                                         |
| `getOriginalKey?`   | `(target: T, key: string \| symbol) => string \| symbol` | `storedKeyType` が `'original'` の場合に、格納先の元のキーを返す関数。デフォルトは渡されたキーをそのまま返す |
| `deleteKey?`        | `(target: T, key: string \| symbol) => void`             | プロパティを削除した後に呼ばれる関数。キーを外部で管理している場合に使う                                     |

### `getByNormalizedKey`

```ts
getByNormalizedKey<T extends Record<string, unknown>>(data: T, key: string, options?: GetByNormalizedKeyOptions): unknown
```

キーを正規化して比較し、一致したプロパティの値を返します。デフォルトでは大文字・小文字を区別しません。一致するキーが複数ある場合は最初に見つかったものの値を返し、無い場合は `undefined` を返します。

```ts
getByNormalizedKey({ UserName: 'A' }, 'username'); // 'A'
```

| オプション       | 型                       | 説明                                                                                  |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------------- |
| `caseSensitive?` | `boolean`                | `true` の場合、大文字・小文字を区別する。デフォルトは `false`                         |
| `ignore*` など   | `NormalizeStringOptions` | `@fringeworks/japanese-text` の `normalizeString` のオプション（`ignoreCase` を除く） |

### `setByNormalizedKey`

```ts
setByNormalizedKey<T extends Record<string, unknown>>(data: T, key: string, value: unknown, options?: SetByNormalizedKeyOptions): T
```

キーを正規化して比較し、一致したプロパティに値を設定します（破壊的）。一致するキーが無い場合は `key` のままプロパティを追加します。`data` を返します。オプションは `getByNormalizedKey` と同じです。

```ts
setByNormalizedKey({ UserName: 'A' }, 'USERNAME', 'B'); // { UserName: 'B' }
```

### 型

| 型                                       | 説明                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `CreateCaseInsensitiveObjectOptions<T>`  | `createCaseInsensitiveObject` のオプション                                       |
| `CreateKeyTransformObjectOptions<T>`     | `createKeyTransformObject` のオプション                                          |
| `CreateKeyTransformObjectOptionsBase<T>` | `createKeyTransformObject` と `createCaseInsensitiveObject` に共通するオプション |
| `CreateKeyTransformObjectGetKeyFn<T>`    | キーを返す関数 `(target, key) => string \| symbol`                               |
| `CreateKeyTransformObjectDeleteKeyFn<T>` | キーを削除した後に呼ばれる関数 `(target, key) => void`                           |
| `GetByNormalizedKeyOptions`              | `getByNormalizedKey` のオプション                                                |
| `SetByNormalizedKeyOptions`              | `setByNormalizedKey` のオプション                                                |

## ライセンス

MIT
