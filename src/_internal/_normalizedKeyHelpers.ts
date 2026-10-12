import type { NormalizeStringOptions } from '@fringeworks/japanese-text/normalizeString';
import { normalizeString } from '@fringeworks/japanese-text/normalizeString';
import { hasOwn } from '@fringeworks/utils/object/hasOwn';
import type { NormalizeKeyOptions } from '../types';

/**
 * 区切り文字
 */
const SEPARATORS = /[-_.]/g;

/**
 * キーを正規化する関数を作る
 * @param options
 * @returns
 */
export function _createKeyNormalizer(
  options: NormalizeKeyOptions,
): (key: string) => string {
  const {
    ignoreCase = true,
    ignoreWidth = false,
    ignoreKana = false,
    ignoreSpace = false,
    ignoreSeparators = false,
  } = options;
  const normalizeOptions: NormalizeStringOptions = {
    ignoreCase,
    ignoreWidth,
    ignoreKana,
    ignoreSpace,
  };
  // 全角の区切り文字も除去できるよう、区切り文字は normalizeString の後に除去する
  return ignoreSeparators
    ? (key) => normalizeString(key, normalizeOptions).replace(SEPARATORS, '')
    : (key) => normalizeString(key, normalizeOptions);
}

/**
 * 正規化したキーが一致する、data 自身のキーを探す\
 * 複数ある場合は最初に見つかったキーを返す
 * @param data
 * @param key
 * @param normalize キーを正規化する関数
 * @returns 見つからない場合は undefined
 */
export function _findNormalizedKey(
  data: object,
  key: string,
  normalize: (key: string) => string,
): string | undefined {
  const normalizedKey = normalize(key);
  for (const existingKey in data) {
    if (hasOwn(data, existingKey) && normalize(existingKey) === normalizedKey) {
      return existingKey;
    }
  }
  return undefined;
}
