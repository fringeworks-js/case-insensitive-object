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
 * @returns data
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
  const existingKey = _findNormalizedKey(
    data,
    key,
    _createKeyNormalizer(options),
  );
  if (existingKey !== undefined) {
    (data as Record<string, unknown>)[existingKey] = value;
  } else if (key === '__proto__') {
    // 代入するとプロトタイプが書き換わるので、自身のプロパティとして定義する
    Object.defineProperty(data, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  } else {
    (data as Record<string, unknown>)[key] = value;
  }

  return data;
}
