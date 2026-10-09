import type {
  CreateKeyTransformObjectGetKeyFn,
  CreateKeyTransformObjectOptions,
} from './types';

const DEFAULT_GET_ORIGINAL_KEY = (_: unknown, key: string | symbol) => key;

/**
 * 変換されたキーでプロパティを管理するオブジェクトのproxyを作る
 *
 * @param transformKey キーを変換する為の関数。変換後のキーを渡した場合には変換せず返す必要がある
 * @param options オプション
 * @returns
 */
export default function createKeyTransformObject<T extends object>(
  transformKey: CreateKeyTransformObjectGetKeyFn<T>,
  options: CreateKeyTransformObjectOptions<T> = {},
) {
  const {
    target = {} as T,
    getOriginalKey = DEFAULT_GET_ORIGINAL_KEY,
    deleteKey,
    storedKeyType = 'transformed',
    mutable,
    includeInherited,
  } = options;

  // 初期値の退避
  const clone = includeInherited
    ? (obj) =>
        Object.assign(Object.create(Object.getPrototypeOf(obj)), { ...obj })
    : (obj) => ({ ...obj });
  const targetObject = mutable ? target : clone(target);
  const has = includeInherited
    ? () => true
    : (object, key) => Object.hasOwn(object, key);
  const initialValues: Partial<T> = {};
  for (const key in targetObject) {
    if (has(targetObject, key)) {
      initialValues[key] = targetObject[key];
      delete targetObject[key];
    }
  }

  const resolveKey =
    storedKeyType === 'original' ? getOriginalKey : transformKey;

  const handler: ProxyHandler<T> = {
    // プロパティの設定時
    set(object, key, value) {
      // setter 内の this を proxy でなく target に向けることで、
      // setter 内部のアクセスはキー変換を経由させない
      return Reflect.set(object, resolveKey(object, key), value);
    },
    // プロパティの取得時
    get(object, key) {
      // getter 内の this を proxy でなく target に向けることで、
      // getter 内部のアクセスはキー変換を経由させない
      return Reflect.get(object, resolveKey(object, key));
    },
    // プロパティの有無判定
    has(object, key) {
      return Reflect.has(object, resolveKey(object, key));
    },
    // プロパティの削除時
    deleteProperty(object, key) {
      const result = Reflect.deleteProperty(object, resolveKey(object, key));
      if (deleteKey && result) {
        deleteKey(object, key);
      }
      return result;
    },
    // プロパティの定義取得時
    getOwnPropertyDescriptor: (object, key) => {
      return Reflect.getOwnPropertyDescriptor(object, resolveKey(object, key));
    },
    // プロパティの定義
    defineProperty(
      object: T,
      key: string | symbol,
      attributes: PropertyDescriptor,
    ) {
      return Reflect.defineProperty(
        object,
        resolveKey(object, key),
        attributes,
      );
    },
    // プロパティの列挙時
    ownKeys: (object) => {
      return Reflect.ownKeys(object);
    },
  };

  const proxy = new Proxy(targetObject, handler);
  // 初期値を設定
  for (const key in initialValues) {
    proxy[key] = initialValues[key];
  }

  return proxy;
}
