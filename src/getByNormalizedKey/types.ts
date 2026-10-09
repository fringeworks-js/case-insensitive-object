import type { NormalizeStringOptions } from '@fringeworks/japanese-text/normalizeString';

/**
 * オプション
 */
export type GetByNormalizedKeyOptions = Omit<
  NormalizeStringOptions,
  'ignoreCase'
> & {
  /**
   * 大文字小文字を区別する
   * @default false
   */
  caseSensitive?: boolean;
};
