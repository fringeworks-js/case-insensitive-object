# @fringeworks/case-insensitive-object

`@fringeworks/case-insensitive-object` is a library some will find handy, for objects whose keys ignore differences such as upper and lower case.

**[日本語のREADMEはこちら](./README.ja.md)**

## Installation

```bash
npm install @fringeworks/case-insensitive-object
# or
pnpm add @fringeworks/case-insensitive-object
```

## Usage

Functions, types, and constants can be imported by the same name from the root or from a per-function path. A per-function path also provides its function as the default export.

```ts
import { createCaseInsensitiveObject } from '@fringeworks/case-insensitive-object';
import createCaseInsensitiveObject from '@fringeworks/case-insensitive-object/createCaseInsensitiveObject';
```

---

## API

| Function                                           | Description                                                                      |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| `createCaseInsensitiveObject(options?)`            | Creates an object whose keys are case-insensitive                                |
| `createKeyTransformObject(transformKey, options?)` | Creates an object that manages its keys through a transform function             |
| `getByNormalizedKey(data, key, options?)`          | Returns a property value, ignoring differences in how the key is written         |
| `setByNormalizedKey(data, key, value, options?)`   | Sets a property value, ignoring differences in how the key is written (mutating) |

### `createCaseInsensitiveObject`

```ts
createCaseInsensitiveObject<T extends Record<string, unknown>>(options?: CreateCaseInsensitiveObjectOptions<T>): T
```

Creates an object (a `Proxy`) whose keys are case-insensitive. Options of `normalizeString` from `@fringeworks/japanese-text` such as `ignoreWidth` also make it ignore differences such as full-width and half-width forms.

```ts
const headers = createCaseInsensitiveObject({
  target: { 'Content-Type': 'text/html' },
});
headers['content-type']; // 'text/html'
'CONTENT-TYPE' in headers; // true
```

| Option              | Type                          | Description                                                                                                                                                                    |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `target?`           | `T`                           | An object with the initial values. Defaults to an empty object                                                                                                                 |
| `caseSensitive?`    | `boolean`                     | If `true`, keys are case-sensitive. Defaults to `false`                                                                                                                        |
| `storedKeyType?`    | `'transformed' \| 'original'` | The keys stored in the underlying object. `'transformed'`: the normalized key (lowercase, for example); `'original'`: the original key used first. Defaults to `'transformed'` |
| `mutable?`          | `boolean`                     | If `true`, modifies `target` directly. Otherwise an object with the properties of `target` copied is used. Defaults to `false`                                                 |
| `includeInherited?` | `boolean`                     | If `true`, inherited properties of `target` are included. Defaults to `false`                                                                                                  |
| `ignore*`, ...      | `NormalizeStringOptions`      | Options of `normalizeString` from `@fringeworks/japanese-text` (except `ignoreCase`) used to normalize keys                                                                    |

### `createKeyTransformObject`

```ts
createKeyTransformObject<T extends object>(transformKey: CreateKeyTransformObjectGetKeyFn<T>, options?: CreateKeyTransformObjectOptions<T>): any
```

Creates an object (a `Proxy`) that converts keys with `transformKey` on every property access. This is the basis of `createCaseInsensitiveObject`. `transformKey` must return an already transformed key unchanged.

```ts
const obj = createKeyTransformObject((_, key) =>
  typeof key === 'string' ? key.toUpperCase() : key,
);
obj.name = 'Alice';
obj.NAME; // 'Alice'
```

| Parameter      | Type                                                     | Description                     |
| -------------- | -------------------------------------------------------- | ------------------------------- |
| `transformKey` | `(target: T, key: string \| symbol) => string \| symbol` | A function that transforms keys |
| `options?`     | `CreateKeyTransformObjectOptions<T>`                     | The options below               |

| Option              | Type                                                     | Description                                                                                                    |
| ------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `target?`           | `T`                                                      | Same as `createCaseInsensitiveObject`                                                                          |
| `storedKeyType?`    | `'transformed' \| 'original'`                            | Same as `createCaseInsensitiveObject`                                                                          |
| `mutable?`          | `boolean`                                                | Same as `createCaseInsensitiveObject`                                                                          |
| `includeInherited?` | `boolean`                                                | Same as `createCaseInsensitiveObject`                                                                          |
| `getOriginalKey?`   | `(target: T, key: string \| symbol) => string \| symbol` | Returns the original key to store under when `storedKeyType` is `'original'`. Returns the given key by default |
| `deleteKey?`        | `(target: T, key: string \| symbol) => void`             | Called after a property is deleted. Use it when keys are managed elsewhere                                     |

### `getByNormalizedKey`

```ts
getByNormalizedKey<T extends Record<string, unknown>>(data: T, key: string, options?: GetByNormalizedKeyOptions): unknown
```

Compares keys after normalizing them and returns the value of the matching property. Case is ignored by default. When several keys match, returns the value of the first one found; returns `undefined` when none match.

```ts
getByNormalizedKey({ UserName: 'A' }, 'username'); // 'A'
```

| Option           | Type                     | Description                                                                          |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| `caseSensitive?` | `boolean`                | If `true`, keys are case-sensitive. Defaults to `false`                              |
| `ignore*`, ...   | `NormalizeStringOptions` | Options of `normalizeString` from `@fringeworks/japanese-text` (except `ignoreCase`) |

### `setByNormalizedKey`

```ts
setByNormalizedKey<T extends Record<string, unknown>>(data: T, key: string, value: unknown, options?: SetByNormalizedKeyOptions): T
```

Compares keys after normalizing them and sets the value on the matching property (mutating). When no key matches, adds a property with `key` as is. Returns `data`. The options are the same as `getByNormalizedKey`.

```ts
setByNormalizedKey({ UserName: 'A' }, 'USERNAME', 'B'); // { UserName: 'B' }
```

### Types

| Type                                     | Description                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `CreateCaseInsensitiveObjectOptions<T>`  | Options for `createCaseInsensitiveObject`                                      |
| `CreateKeyTransformObjectOptions<T>`     | Options for `createKeyTransformObject`                                         |
| `CreateKeyTransformObjectOptionsBase<T>` | Options shared by `createKeyTransformObject` and `createCaseInsensitiveObject` |
| `CreateKeyTransformObjectGetKeyFn<T>`    | A function returning a key `(target, key) => string \| symbol`                 |
| `CreateKeyTransformObjectDeleteKeyFn<T>` | A function called after a key is deleted `(target, key) => void`               |
| `GetByNormalizedKeyOptions`              | Options for `getByNormalizedKey`                                               |
| `SetByNormalizedKeyOptions`              | Options for `setByNormalizedKey`                                               |

## License

MIT
