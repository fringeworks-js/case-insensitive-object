import type { NormalizeStringOptions } from '@fringeworks/japanese-text/normalizeString';
import { normalizeString } from '@fringeworks/japanese-text/normalizeString';
import TransformedKeyManager from './_TransformedKeyManager';

const manager = new TransformedKeyManager<NormalizeStringOptions>(
  normalizeString,
);

/**
 * 変換前のキーから主となる変換前のキーを取得
 * @param originalKey
 * @param data
 * @param options
 * @returns
 */
export function _resolveOriginalKey(
  originalKey: string,
  data: object,
  options?: NormalizeStringOptions,
): string | undefined {
  return manager.resolveOriginalKey(originalKey, data, options);
}

/**
 * 変換前のキーを取得する
 * @param transformedKey
 * @param data
 * @param options
 * @returns
 */
export function _getOriginalKey(
  transformedKey: string,
  data: object,
  options?: NormalizeStringOptions,
): string | undefined {
  return manager.getOriginalKey(transformedKey, data, options);
}

/**
 * 変換後のキーを取得する
 * @param originalKey
 * @param data
 * @param options
 * @returns
 */
export function _getTransformedKey(
  originalKey: string,
  data: object,
  options?: NormalizeStringOptions,
): string {
  return manager.getTransformedKey(originalKey, data, options);
}

/**
 * 変換前のキー削除する
 * @param originalKey
 * @param data
 * @param options
 * @returns
 */
export function _deleteOriginalKey(
  originalKey: string,
  data: object,
  options?: NormalizeStringOptions,
): string | undefined {
  return manager.deleteOriginalKey(originalKey, data, options);
}

/**
 * 変換後のキーを削除する
 * @param transformedKey
 * @param data
 * @param options
 * @returns
 */
export function _deleteTransformedKey(
  transformedKey: string,
  data: object,
  options?: NormalizeStringOptions,
): string {
  return manager.deleteTransformedKey(transformedKey, data, options);
}
