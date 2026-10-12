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
createCaseInsensitiveObject<T extends object = Record<string, unknown>>(options: CreateCaseInsensitiveObjectOptions<T> & { ignoreCase: false }): KeyTransformObject<T>
createCaseInsensitiveObject<T extends object = Record<string, unknown>>(options?: CreateCaseInsensitiveObjectOptions<T> & { ignoreCase?: true }): CaseInsensitiveObject<T>
createCaseInsensitiveObject<T extends object = Record<string, unknown>>(options?: CreateCaseInsensitiveObjectOptions<T>): KeyTransformObject<T>
```

Creates an object (a `Proxy`) whose keys are case-insensitive. Options such as `ignoreWidth` also make it ignore differences such as full-width and half-width forms and separators (`-`, `_` and `.`).

```ts
const headers = createCaseInsensitiveObject({
  target: { 'Content-Type': 'text/html' },
});
headers['content-type']; // 'text/html'
'CONTENT-TYPE' in headers; // true
```

With the original keys given in `keys`, the object enumerates those keys whichever alias a property was set with.

```ts
type Headers = { 'Content-Type': string; Accept: string };
const headers = createCaseInsensitiveObject<Headers>({
  keys: ['Content-Type', 'Accept'],
});
headers['content-type'] = 'text/html';
headers.ACCEPT = '*/*';
JSON.stringify(headers); // '{"Content-Type":"text/html","Accept":"*/*"}'
```

| Option              | Type                            | Description                                                                                                                                                                                                                                                                                    |
| ------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target?`           | `Partial<T>`                    | An object with the initial values. Its own enumerable properties are copied, and `target` itself is never modified. The keys of `target` are also treated as original keys. When several keys normalize to the same key, the first one (its key and value) is used, as in `getByNormalizedKey` |
| `keys?`             | `readonly (keyof T & string)[]` | The original keys. They take precedence over the keys of `target`                                                                                                                                                                                                                              |
| `enumeratedKey?`    | `'original' \| 'transformed'`   | The keys returned when enumerating (`Object.keys`, spread, `JSON.stringify` and so on). `'original'`: the original key (the one in `keys` or `target`, or else the key used first); `'transformed'`: the normalized key (lowercase, for example). Defaults to `'original'`                     |
| `ignoreCase?`       | `boolean`                       | Ignores uppercase and lowercase differences. Defaults to `true`                                                                                                                                                                                                                                |
| `ignoreWidth?`      | `boolean`                       | Ignores full-width and half-width differences (`Ａ` and `A`, `ｱ` and `ア`, ...). Compatibility characters such as `㈱` are not converted                                                                                                                                                       |
| `ignoreKana?`       | `boolean`                       | Ignores hiragana and katakana differences                                                                                                                                                                                                                                                      |
| `ignoreSpace?`      | `boolean`                       | Ignores whitespace other than line breaks (half-width and full-width spaces, tabs, ...)                                                                                                                                                                                                        |
| `ignoreSeparators?` | `boolean`                       | Ignores separators (`-`, `_` and `.`), so `content-type` and `contentType` become the same key                                                                                                                                                                                                 |

#### Types

The type of the returned object is inferred from `target` or given as the type parameter `T`. The keys of `T` have their value types, and other keys are `unknown`. When keys are case-insensitive, the all-lowercase and all-uppercase aliases of the original keys (`content-type`, `CONTENT-TYPE`) have the value types too. Other aliases (`Content-type`, full-width forms and so on) are `unknown`.

```ts
const headers = createCaseInsensitiveObject({
  target: { 'Content-Type': 'text/html' },
});
headers['content-type']; // string | undefined
headers['Content-type']; // unknown
```

To give types to keys that are not in `target`, specify the type parameter and `keys`. With the type parameter, the keys of `target` are also limited to the keys of `T`.

#### Reflecting changes and limitations

To reflect the changes back to the original object, merge it yourself (for example, `Object.assign(original, { ...headers })`).

The object works as a dictionary, so it has the following limitations. They are the same for `createKeyTransformObject`.

- Every property is a data property that is writable, enumerable and configurable. Defining an accessor or a property with `configurable: false` throws a `TypeError`. `writable` and `enumerable` are ignored
- `Object.preventExtensions`, `Object.seal` and `Object.freeze` throw a `TypeError`
- The prototype is `null`, so methods such as `toString` and `hasOwnProperty` are not available (use `Object.hasOwn` and the like instead)

### `createKeyTransformObject`

```ts
createKeyTransformObject<T extends object = Record<string, unknown>>(transformKey: (key: string) => string, options?: CreateKeyTransformObjectOptions<T>): KeyTransformObject<T>
```

Creates an object (a `Proxy`) that converts string keys with `transformKey` on every property access. This is the basis of `createCaseInsensitiveObject`. Symbol keys are used as is. `transformKey` must return an already transformed key unchanged.

```ts
const obj = createKeyTransformObject((key) => key.toUpperCase());
obj.name = 'Alice';
obj.NAME; // 'Alice'
```

Since the transformation is an arbitrary function, aliases have no types. The keys of `T` have their value types, and other keys are `unknown`.

| Parameter      | Type                                 | Description                     |
| -------------- | ------------------------------------ | ------------------------------- |
| `transformKey` | `(key: string) => string`            | A function that transforms keys |
| `options?`     | `CreateKeyTransformObjectOptions<T>` | The options below               |

| Option           | Type                            | Description                           |
| ---------------- | ------------------------------- | ------------------------------------- |
| `target?`        | `Partial<T>`                    | Same as `createCaseInsensitiveObject` |
| `keys?`          | `readonly (keyof T & string)[]` | Same as `createCaseInsensitiveObject` |
| `enumeratedKey?` | `'original' \| 'transformed'`   | Same as `createCaseInsensitiveObject` |

### `getByNormalizedKey`

```ts
getByNormalizedKey<T extends object>(data: T, key: string, options?: GetByNormalizedKeyOptions): T[keyof T] | undefined
```

Compares keys after normalizing them and returns the value of the matching property. Case is ignored by default. When several keys match, returns the value of the first one found; returns `undefined` when none match. Every call normalizes all the keys of `data`, so use `createCaseInsensitiveObject` to look up the same object repeatedly.

```ts
getByNormalizedKey({ UserName: 'A' }, 'username'); // 'A'
```

| Option              | Type      | Description                                                                                                                              |
| ------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `ignoreCase?`       | `boolean` | Ignores uppercase and lowercase differences. Defaults to `true`                                                                          |
| `ignoreWidth?`      | `boolean` | Ignores full-width and half-width differences (`Ａ` and `A`, `ｱ` and `ア`, ...). Compatibility characters such as `㈱` are not converted |
| `ignoreKana?`       | `boolean` | Ignores hiragana and katakana differences                                                                                                |
| `ignoreSpace?`      | `boolean` | Ignores whitespace other than line breaks (half-width and full-width spaces, tabs, ...)                                                  |
| `ignoreSeparators?` | `boolean` | Ignores separators (`-`, `_` and `.`), so `content-type` and `contentType` become the same key                                           |

### `setByNormalizedKey`

```ts
setByNormalizedKey<T extends object>(data: T, key: string, value: T[keyof T], options?: SetByNormalizedKeyOptions): T
```

Compares keys after normalizing them and sets the value on the matching property (mutating). When no key matches, adds a property with `key` as is. Returns `data`. The options are the same as `getByNormalizedKey`. Like `getByNormalizedKey`, every call normalizes all the keys of `data`.

```ts
setByNormalizedKey({ UserName: 'A' }, 'USERNAME', 'B'); // { UserName: 'B' }
```

### Types

| Type                                    | Description                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `CreateCaseInsensitiveObjectOptions<T>` | Options for `createCaseInsensitiveObject`                                                                          |
| `CaseInsensitiveObject<T>`              | The object returned by `createCaseInsensitiveObject` (aliases are typed)                                           |
| `CaseAliases<T>`                        | The all-lowercase and all-uppercase aliases of the keys of `T`                                                     |
| `CreateKeyTransformObjectOptions<T>`    | Options for `createKeyTransformObject`                                                                             |
| `KeyTransformObject<T>`                 | The object returned by `createKeyTransformObject` (other keys are `unknown`)                                       |
| `NormalizeKeyOptions`                   | Options to normalize keys (shared by `createCaseInsensitiveObject`, `getByNormalizedKey` and `setByNormalizedKey`) |
| `GetByNormalizedKeyOptions`             | Options for `getByNormalizedKey`                                                                                   |
| `SetByNormalizedKeyOptions`             | Options for `setByNormalizedKey`                                                                                   |

## License

MIT
