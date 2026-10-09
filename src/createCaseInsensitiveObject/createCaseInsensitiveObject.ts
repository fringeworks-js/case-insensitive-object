import type { NormalizeStringOptions } from '@fringeworks/japanese-text/normalizeString';
import * as R from 'remeda';
import {
  _deleteOriginalKey,
  _getOriginalKey,
  _getTransformedKey,
  _resolveOriginalKey,
} from '../_internal/_normalizedKeyHelpers';
import { createKeyTransformObject } from '../createKeyTransformObject';
import type { CreateCaseInsensitiveObjectOptions } from './types';

/**
 * キーの大文字・小文字を意識しないオブジェクトを作成する
 *
 * @param options
 * @returns
 */
export default function createCaseInsensitiveObject<
  T extends Record<string, unknown>,
>(options: CreateCaseInsensitiveObjectOptions<T> = {}): T {
  const {
    target = {} as T,
    includeInherited,
    mutable,
    storedKeyType = 'transformed',
    caseSensitive = false,
    ...rest
  } = options;
  const normalizeOptions: NormalizeStringOptions = {
    ...rest,
    ignoreCase: !caseSensitive,
  };
  // オブジェクトに設定するキーの取得関数
  const transformKey = (data, key) => {
    if (R.isString(key)) {
      return _getTransformedKey(key, data, normalizeOptions);
    }
    return key;
  };
  // 主となる正規化前のキーを取得
  const getOriginalKey = (data, key) => {
    if (R.isString(key)) {
      return _resolveOriginalKey(key, data, normalizeOptions);
    }
    return key;
  };
  // キーが削除されたときの処理
  const deleteKey = (data, key) => {
    if (R.isString(key)) {
      _deleteOriginalKey(key, data, normalizeOptions);
    }
  };

  // 正規化前のキーで値を持つオブジェクトのproxyを作成
  return createKeyTransformObject(transformKey, {
    target,
    getOriginalKey,
    deleteKey,
    storedKeyType,
    mutable,
    includeInherited,
  });
}
