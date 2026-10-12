import {
  _createKeyNormalizer,
  _findNormalizedKey,
} from '../_internal/_normalizedKeyHelpers';
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
export default function getByNormalizedKey<T extends object>(
  data: T,
  key: string,
  options: GetByNormalizedKeyOptions = {},
): T[keyof T] | undefined {
  if (!data) {
    return undefined;
  }
  const existingKey = _findNormalizedKey(
    data,
    key,
    _createKeyNormalizer(options),
  );
  return existingKey === undefined ? undefined : data[existingKey as keyof T];
}
