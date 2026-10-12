import {
  _createKeyNormalizer,
  _findNormalizedKey,
} from '../_internal/_normalizedKeyHelpers';
import type { SetByNormalizedKeyOptions } from './types';

/**
 * オブジェクトのキーの大文字・小文字などの違いを無視して値を設定する
 * @param data 対象のオブジェクト
 * @param key 設定先のキー
 * @param value 設定する値
 * @param options オプション
 */
export default function setByNormalizedKey<T extends object>(
  data: T,
  key: string,
  value: T[keyof T],
  options: SetByNormalizedKeyOptions = {},
): T {
  if (!data) {
    return data;
  }
  const existingKey =
    _findNormalizedKey(data, key, _createKeyNormalizer(options)) ?? key;
  (data as Record<string, unknown>)[existingKey] = value;

  return data;
}
