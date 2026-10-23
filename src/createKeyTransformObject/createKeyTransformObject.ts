import type {
  CreateKeyTransformObjectOptions,
  KeyTransformObject,
} from './types';

/**
 * 格納しているプロパティ
 */
type Entry = {
  /**
   * 本来のキー（keys や initialValues にあればそのキー、なければ最初に使われたキー）
   */
  key: string | symbol;
  value: unknown;
};

/**
 * データプロパティのディスクリプターを作る\
 * プロパティは常に書き換え・列挙・再定義が可能なものとして扱う
 */
const createDataDescriptor = (value: unknown): PropertyDescriptor => ({
  value,
  writable: true,
  enumerable: true,
  configurable: true,
});

/**
 * 変換されたキーでプロパティを管理するオブジェクトのproxyを作る
 *
 * プロパティは proxy の内部で管理し、initialValues には書き込まない。
 * 別名のキーでも一貫して動作させるため、次の制限がある
 *
 * - プロパティは常に書き換え・列挙・再定義が可能なデータプロパティ。
 *   アクセサーや `configurable: false` の定義は TypeError になる
 * - `Object.preventExtensions` / `seal` / `freeze` は TypeError になる
 * - プロトタイプは null
 *
 * @param transformKey キーを変換する関数。変換後のキーを渡した場合にはそのまま返す必要がある
 * @param options オプション
 * @returns
 */
export default function createKeyTransformObject<
  T extends object = Record<string, unknown>,
>(
  transformKey: (key: string) => string,
  options: CreateKeyTransformObjectOptions<T> = {},
): KeyTransformObject<T> {
  const { initialValues, keys = [], enumeratedKey = 'original' } = options;

  // 変換後のキー → プロパティ
  const entries = new Map<string | symbol, Entry>();
  // 変換後のキー → 本来のキー
  const originalKeys = new Map<string | symbol, string | symbol>();
  // 格納しているプロパティの本来のキー・変換後のキー → 変換後のキー
  // 列挙したキーで調べるときに、transformKey を呼ばずに済ませる
  const knownEntryKeys = new Map<string, string>();
  const toEntryKey = (key: string | symbol) =>
    typeof key === 'string'
      ? (knownEntryKeys.get(key) ?? transformKey(key))
      : key;
  // 変換後のキーが重なる場合は、getByNormalizedKey に合わせて最初のものを使う
  const addOriginalKey = (key: string | symbol) => {
    const entryKey = toEntryKey(key);
    if (!originalKeys.has(entryKey)) {
      originalKeys.set(entryKey, key);
    }
  };
  const setValue = (key: string | symbol, value: unknown) => {
    const entryKey = toEntryKey(key);
    const entry = entries.get(entryKey);
    if (entry) {
      entry.value = value;
    } else {
      const originalKey = originalKeys.get(entryKey) ?? key;
      entries.set(entryKey, { key: originalKey, value });
      if (typeof originalKey === 'string' && typeof entryKey === 'string') {
        knownEntryKeys.set(originalKey, entryKey);
        knownEntryKeys.set(entryKey, entryKey);
      }
    }
  };
  const deleteValue = (key: string | symbol) => {
    const entryKey = toEntryKey(key);
    const entry = entries.get(entryKey);
    if (entry) {
      entries.delete(entryKey);
      if (typeof entry.key === 'string' && typeof entryKey === 'string') {
        knownEntryKeys.delete(entry.key);
        knownEntryKeys.delete(entryKey);
      }
    }
  };

  // 本来のキーを登録（keys を initialValues より優先する）
  for (const key of keys) {
    addOriginalKey(key);
  }
  // 初期値をコピー
  if (initialValues) {
    const source = initialValues as Record<string | symbol, unknown>;
    for (const key of Reflect.ownKeys(source)) {
      if (Object.prototype.propertyIsEnumerable.call(source, key)) {
        addOriginalKey(key);
        if (!entries.has(toEntryKey(key))) {
          setValue(key, source[key]);
        }
      }
    }
  }

  const handler: ProxyHandler<object> = {
    // プロパティの取得時
    get(_, key) {
      return entries.get(toEntryKey(key))?.value;
    },
    // プロパティの設定時
    set(_, key, value, receiver) {
      if (receiver !== proxy) {
        // プロトタイプとして使われた場合は、通常のオブジェクトと同様に代入先に定義する
        return Reflect.defineProperty(
          receiver,
          key,
          createDataDescriptor(value),
        );
      }
      setValue(key, value);
      return true;
    },
    // プロパティの有無判定
    has(_, key) {
      return entries.has(toEntryKey(key));
    },
    // プロパティの削除時
    deleteProperty(_, key) {
      deleteValue(key);
      return true;
    },
    // プロパティの列挙時
    ownKeys() {
      return enumeratedKey === 'original'
        ? Array.from(entries.values(), (entry) => entry.key)
        : Array.from(entries.keys());
    },
    // プロパティの定義取得時
    getOwnPropertyDescriptor(_, key) {
      const entry = entries.get(toEntryKey(key));
      return entry ? createDataDescriptor(entry.value) : undefined;
    },
    // プロパティの定義
    defineProperty(_, key, attributes) {
      if ('get' in attributes || 'set' in attributes) {
        throw new TypeError(
          `Cannot define property ${String(key)}: accessor properties are not supported`,
        );
      }
      if (attributes.configurable === false) {
        throw new TypeError(
          `Cannot define property ${String(key)}: non-configurable properties are not supported`,
        );
      }
      if ('value' in attributes || !entries.has(toEntryKey(key))) {
        setValue(key, attributes.value);
      }
      return true;
    },
    // 拡張の禁止
    preventExtensions() {
      throw new TypeError(
        'Cannot prevent extensions: preventExtensions, seal and freeze are not supported',
      );
    },
    // プロトタイプの設定
    setPrototypeOf(_, prototype) {
      if (prototype !== null) {
        throw new TypeError(
          'Cannot set prototype: only null is supported as the prototype',
        );
      }
      return true;
    },
  };

  const proxy = new Proxy(Object.create(null) as object, handler);
  return proxy as KeyTransformObject<T>;
}
