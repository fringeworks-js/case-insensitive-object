import type { NormalizeStringOptions } from '@fringeworks/japanese-text/normalizeString';
import { _getTransformedKey } from '../_internal/_normalizedKeyHelpers';
import type { GetByNormalizedKeyOptions } from './types';

/**
 * 正規化されたキーに基づいて、オブジェクトから値を取得する。
 * 複数のキーが同じ正規化結果を持つ場合、最初に見つかった要素の値を返す。
 *
 * @param data 検索対象のオブジェクト
 * @param key 検索したいキー（未正規化）
 * @param options 正規化オプション
 * @returns 見つかった値。存在しない場合は undefined
 */
export default function getByNormalizedKey<T extends Record<string, unknown>>(
  data: T,
  key: string,
  options: GetByNormalizedKeyOptions = {},
): unknown {
  if (!data) {
    return data;
  }
  const { caseSensitive = false, ...rest } = options;
  const normalizeOptions: NormalizeStringOptions = {
    ...rest,
    ignoreCase: !caseSensitive,
  };
  const normalizedKey = _getTransformedKey(key, data, normalizeOptions);
  for (const existingKey in data) {
    if (Object.hasOwn(data, existingKey)) {
      if (
        _getTransformedKey(existingKey, data, normalizeOptions) ===
        normalizedKey
      ) {
        return data[existingKey];
      }
    }
  }

  return undefined;
}
