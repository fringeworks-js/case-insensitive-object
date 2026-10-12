import type { NormalizeStringOptions } from '@fringeworks/japanese-text/normalizeString';
import type {
  CreateKeyTransformObjectOptions,
  KeyTransformObject,
} from '../createKeyTransformObject';

/**
 * オプション
 */
export type CreateCaseInsensitiveObjectOptions<T extends object> = Omit<
  NormalizeStringOptions,
  'ignoreCase'
> &
  CreateKeyTransformObjectOptions<T> & {
    /**
     * 大文字小文字を区別する
     * @default false
     */
    caseSensitive?: boolean;
  };

/**
 * 本来のキーを全部小文字・全部大文字にした別名
 */
export type CaseAliases<T extends object> = {
  [K in keyof T as K extends string ? Lowercase<K> : never]: T[K];
} & {
  [K in keyof T as K extends string ? Uppercase<K> : never]: T[K];
};

/**
 * createCaseInsensitiveObject が返すオブジェクトの型\
 * 本来のキーに加えて、全部小文字・全部大文字の別名にも値の型が付く
 */
export type CaseInsensitiveObject<T extends object> = KeyTransformObject<T> &
  Partial<CaseAliases<T>>;
