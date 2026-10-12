import { normalizeString } from '@fringeworks/japanese-text/normalizeString';
import { _memoizeString } from '../_internal/_memoizeString';
import { _createNormalizeOptions } from '../_internal/_normalizedKeyHelpers';
import type { KeyTransformObject } from '../createKeyTransformObject';
import { createKeyTransformObject } from '../createKeyTransformObject';
import type {
  CaseInsensitiveObject,
  CreateCaseInsensitiveObjectOptions,
} from './types';

/**
 * 正規化したキーをキャッシュする件数の上限（オブジェクトごと）
 */
const CACHE_LIMIT = 128;

/**
 * キーの大文字・小文字を意識しないオブジェクトを作成する\
 * 大文字・小文字を区別しない場合は、全部小文字・全部大文字の別名にも型が付く
 *
 * @param options
 * @returns
 */
export default function createCaseInsensitiveObject<
  T extends object = Record<string, unknown>,
>(
  options: CreateCaseInsensitiveObjectOptions<T> & { caseSensitive: true },
): KeyTransformObject<T>;
export default function createCaseInsensitiveObject<
  T extends object = Record<string, unknown>,
>(
  options?: CreateCaseInsensitiveObjectOptions<T> & { caseSensitive?: false },
): CaseInsensitiveObject<T>;
export default function createCaseInsensitiveObject<
  T extends object = Record<string, unknown>,
>(options?: CreateCaseInsensitiveObjectOptions<T>): KeyTransformObject<T>;
export default function createCaseInsensitiveObject<T extends object>(
  options: CreateCaseInsensitiveObjectOptions<T> = {},
): KeyTransformObject<T> {
  const { target, keys, enumeratedKey, ...rest } = options;
  const normalizeOptions = _createNormalizeOptions(rest);

  // normalizeString は比較的重いので、件数を抑えてキャッシュする
  const transformKey = _memoizeString(
    (key) => normalizeString(key, normalizeOptions),
    CACHE_LIMIT,
  );

  return createKeyTransformObject(transformKey, {
    target,
    keys,
    enumeratedKey,
  });
}
