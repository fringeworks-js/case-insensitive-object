import type { NormalizeStringOptions } from '@fringeworks/japanese-text/normalizeString';
import { unsafeCast } from '@fringeworks/utils/type/unsafeCast';
import { _getTransformedKey } from '../_internal/_normalizedKeyHelpers';
import type { SetByNormalizedKeyOptions } from './types';

/**
 * オブジェクトのキーの大文字・小文字などの違いを無視して値を設定する
 * @param data 対象のオブジェクト
 * @param key 設定先のキー
 * @param value 設定する値
 * @param options オプション
 */
export default function setByNormalizedKey<T extends Record<string, unknown>>(
  data: T,
  key: string,
  value: unknown,
  options: SetByNormalizedKeyOptions = {},
): T {
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
        data[existingKey] = unsafeCast(value);
        return data;
      }
    }
  }
  data[key as keyof T] = unsafeCast(value);

  return data;
}
