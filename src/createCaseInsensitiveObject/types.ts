import type { NormalizeStringOptions } from '@fringeworks/japanese-text/normalizeString';
import type { CreateKeyTransformObjectOptionsBase } from '../createKeyTransformObject';

/**
 * オプション
 */
export type CreateCaseInsensitiveObjectOptions<T extends object> = Omit<
  NormalizeStringOptions,
  'ignoreCase'
> &
  CreateKeyTransformObjectOptionsBase<T> & {
    /**
     * 大文字小文字を区別する
     * @default false
     */
    caseSensitive?: boolean;
  };
