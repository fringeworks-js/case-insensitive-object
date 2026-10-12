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
createCaseInsensitiveObject<T extends object = Record<string, unknown>>(options: CreateCaseInsensitiveObjectOptions<T> & { ignoreCase: false }): KeyTransformObject<T>
createCaseInsensitiveObject<T extends object = Record<string, unknown>>(options?: CreateCaseInsensitiveObjectOptions<T> & { ignoreCase?: true }): CaseInsensitiveObject<T>
createCaseInsensitiveObject<T extends object = Record<string, unknown>>(options?: CreateCaseInsensitiveObjectOptions<T>): KeyTransformObject<T>
```

キーの大文字・小文字を区別しないオブジェクト（`Proxy`）を作ります。`ignoreWidth` などのオプションを指定すると、全角・半角や区切り文字（`-`・`_`・`.`）などの違いも区別しなくなります。

```ts
const headers = createCaseInsensitiveObject({
  target: { 'Content-Type': 'text/html' },
});
headers['content-type']; // 'text/html'
'CONTENT-TYPE' in headers; // true
```

`keys` に本来のキーを指定すると、どの別名で設定しても、列挙するときは本来のキーを使います。

```ts
type Headers = { 'Content-Type': string; Accept: string };
const headers = createCaseInsensitiveObject<Headers>({
  keys: ['Content-Type', 'Accept'],
});
headers['content-type'] = 'text/html';
headers.ACCEPT = '*/*';
JSON.stringify(headers); // '{"Content-Type":"text/html","Accept":"*/*"}'
```

| オプション          | 型                              | 説明                                                                                                                                                                                                                                      |
| ------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target?`           | `Partial<T>`                    | 初期値を持つオブジェクト。自身の列挙可能なプロパティをコピーし、`target` 自体は変更しない。`target` のキーも本来のキーとして扱う。正規化したキーが重なる場合は、`getByNormalizedKey` と同じく最初のもの（キーと値）を使う                 |
| `keys?`             | `readonly (keyof T & string)[]` | 本来のキー。`target` のキーより優先する                                                                                                                                                                                                   |
| `enumeratedKey?`    | `'original' \| 'transformed'`   | 列挙（`Object.keys`、スプレッド、`JSON.stringify` など）で返すキー。`'original'`: 本来のキー（`keys` や `target` にあればそのキー、なければ最初に使われたキー）、`'transformed'`: 正規化したキー（小文字など）。デフォルトは `'original'` |
| `ignoreCase?`       | `boolean`                       | 英字の大文字・小文字の違いを無視する。デフォルトは `true`                                                                                                                                                                                 |
| `ignoreWidth?`      | `boolean`                       | 全角・半角の違いを無視する（`Ａ` と `A`、`ｱ` と `ア` など）。互換文字（`㈱` など）は変換しない                                                                                                                                            |
| `ignoreKana?`       | `boolean`                       | ひらがな・カタカナの違いを無視する                                                                                                                                                                                                        |
| `ignoreSpace?`      | `boolean`                       | 改行以外の空白文字（半角・全角スペース、タブなど）を無視する                                                                                                                                                                              |
| `ignoreSeparators?` | `boolean`                       | 区切り文字（`-`・`_`・`.`）を無視する。`content-type` と `contentType` などが同じキーになる                                                                                                                                               |

#### 型

戻り値の型は、`target` から推論するか、型引数 `T` で指定します。`T` にあるキーには値の型が付き、定義外のキーは `unknown` になります。大文字・小文字を区別しない場合は、本来のキーを全部小文字・全部大文字にした別名（`content-type`、`CONTENT-TYPE`）にも値の型が付きます。それ以外の別名（`Content-type` や全角・半角の違いなど）は `unknown` になります。

```ts
const headers = createCaseInsensitiveObject({
  target: { 'Content-Type': 'text/html' },
});
headers['content-type']; // string | undefined
headers['Content-type']; // unknown
```

`target` にないキーにも型を付けたい場合は、型引数と `keys` を指定してください。型引数を指定すると、`target` のキーも `T` のキーに限られます。

#### 変更の反映と制限

変更を元のオブジェクトに反映したい場合は、利用する側でマージしてください（例: `Object.assign(original, { ...headers })`）。

辞書として動作させるため、次の制限があります。`createKeyTransformObject` も同じです。

- プロパティは常に書き換え・列挙・再定義が可能なデータプロパティになる。アクセサーや `configurable: false` のプロパティを定義すると `TypeError` になる。`writable` と `enumerable` の指定は無視する
- `Object.preventExtensions`・`Object.seal`・`Object.freeze` は `TypeError` になる
- プロトタイプは `null` なので、`toString` や `hasOwnProperty` などのメソッドは使えない（`Object.hasOwn` などを使う）

### `createKeyTransformObject`

```ts
createKeyTransformObject<T extends object = Record<string, unknown>>(transformKey: (key: string) => string, options?: CreateKeyTransformObjectOptions<T>): KeyTransformObject<T>
```

プロパティの読み書きのたびに、文字列のキーを `transformKey` で変換するオブジェクト（`Proxy`）を作ります。`createCaseInsensitiveObject` の基になっている関数です。Symbol のキーはそのまま使います。`transformKey` は、変換後のキーを渡された場合にはそのまま返す必要があります。

```ts
const obj = createKeyTransformObject((key) => key.toUpperCase());
obj.name = 'Alice';
obj.NAME; // 'Alice'
```

変換は任意の関数なので、別名には型が付きません。`T` にあるキーには値の型が付き、それ以外のキーは `unknown` になります。

| 引数           | 型                                   | 説明               |
| -------------- | ------------------------------------ | ------------------ |
| `transformKey` | `(key: string) => string`            | キーを変換する関数 |
| `options?`     | `CreateKeyTransformObjectOptions<T>` | 下記のオプション   |

| オプション       | 型                              | 説明                                 |
| ---------------- | ------------------------------- | ------------------------------------ |
| `target?`        | `Partial<T>`                    | `createCaseInsensitiveObject` と同じ |
| `keys?`          | `readonly (keyof T & string)[]` | `createCaseInsensitiveObject` と同じ |
| `enumeratedKey?` | `'original' \| 'transformed'`   | `createCaseInsensitiveObject` と同じ |

### `getByNormalizedKey`

```ts
getByNormalizedKey<T extends object>(data: T, key: string, options?: GetByNormalizedKeyOptions): T[keyof T] | undefined
```

キーを正規化して比較し、一致したプロパティの値を返します。デフォルトでは大文字・小文字を区別しません。一致するキーが複数ある場合は最初に見つかったものの値を返し、無い場合は `undefined` を返します。呼び出すたびに `data` のすべてのキーを正規化するので、同じオブジェクトを繰り返し検索する場合は `createCaseInsensitiveObject` を使ってください。

```ts
getByNormalizedKey({ UserName: 'A' }, 'username'); // 'A'
```

| オプション          | 型        | 説明                                                                                           |
| ------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `ignoreCase?`       | `boolean` | 英字の大文字・小文字の違いを無視する。デフォルトは `true`                                      |
| `ignoreWidth?`      | `boolean` | 全角・半角の違いを無視する（`Ａ` と `A`、`ｱ` と `ア` など）。互換文字（`㈱` など）は変換しない |
| `ignoreKana?`       | `boolean` | ひらがな・カタカナの違いを無視する                                                             |
| `ignoreSpace?`      | `boolean` | 改行以外の空白文字（半角・全角スペース、タブなど）を無視する                                   |
| `ignoreSeparators?` | `boolean` | 区切り文字（`-`・`_`・`.`）を無視する。`content-type` と `contentType` などが同じキーになる    |

### `setByNormalizedKey`

```ts
setByNormalizedKey<T extends object>(data: T, key: string, value: T[keyof T], options?: SetByNormalizedKeyOptions): T
```

キーを正規化して比較し、一致したプロパティに値を設定します（破壊的）。一致するキーが無い場合は `key` のままプロパティを追加します。`data` を返します。オプションは `getByNormalizedKey` と同じです。`getByNormalizedKey` と同じく、呼び出すたびに `data` のすべてのキーを正規化します。

```ts
setByNormalizedKey({ UserName: 'A' }, 'USERNAME', 'B'); // { UserName: 'B' }
```

### 型

| 型                                      | 説明                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `CreateCaseInsensitiveObjectOptions<T>` | `createCaseInsensitiveObject` のオプション                                                                   |
| `CaseInsensitiveObject<T>`              | `createCaseInsensitiveObject` が返すオブジェクト（別名にも型が付く）                                         |
| `CaseAliases<T>`                        | `T` のキーを全部小文字・全部大文字にした別名                                                                 |
| `CreateKeyTransformObjectOptions<T>`    | `createKeyTransformObject` のオプション                                                                      |
| `KeyTransformObject<T>`                 | `createKeyTransformObject` が返すオブジェクト（定義外のキーは `unknown`）                                    |
| `NormalizeKeyOptions`                   | キーの正規化のオプション（`createCaseInsensitiveObject`・`getByNormalizedKey`・`setByNormalizedKey` で共通） |
| `GetByNormalizedKeyOptions`             | `getByNormalizedKey` のオプション                                                                            |
| `SetByNormalizedKeyOptions`             | `setByNormalizedKey` のオプション                                                                            |

## ライセンス

MIT
