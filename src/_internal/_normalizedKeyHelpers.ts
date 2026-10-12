import type { NormalizeStringOptions } from '@fringeworks/japanese-text/normalizeString';
import { normalizeString } from '@fringeworks/japanese-text/normalizeString';

/**
 * caseSensitive を含むオプション
 */
type CaseSensitiveOptions = Omit<NormalizeStringOptions, 'ignoreCase'> & {
  caseSensitive?: boolean;
};

/**
 * caseSensitive を含むオプションから normalizeString のオプションを作る
 * @param options
 * @returns
 */
export function _createNormalizeOptions(
  options: CaseSensitiveOptions,
): NormalizeStringOptions {
  const { caseSensitive = false, ...rest } = options;
  return { ...rest, ignoreCase: !caseSensitive };
}

/**
 * 正規化したキーが一致する、data 自身のキーを探す\
 * 複数ある場合は最初に見つかったキーを返す
 * @param data
 * @param key
 * @param options
 * @returns 見つからない場合は undefined
 */
export function _findNormalizedKey(
  data: object,
  key: string,
  options: NormalizeStringOptions,
): string | undefined {
  const normalizedKey = normalizeString(key, options);
  for (const existingKey in data) {
    if (
      Object.hasOwn(data, existingKey) &&
      normalizeString(existingKey, options) === normalizedKey
    ) {
      return existingKey;
    }
  }
  return undefined;
}
