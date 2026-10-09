/**
 * オプション
 */
export type CreateKeyTransformObjectOptions<T extends object> =
  CreateKeyTransformObjectOptionsBase<T> & {
    /**
     * 変換前のキーを取得する関数\
     * 未指定の場合は渡されたキーをそのまま返す
     */
    getOriginalKey?: CreateKeyTransformObjectGetKeyFn<T>;

    /**
     * キーの削除をする関数\
     * 外部でキーの管理をしている場合に利用
     */
    deleteKey?: CreateKeyTransformObjectDeleteKeyFn<T>;
  };

export type CreateKeyTransformObjectOptionsBase<T extends object> = {
  /**
   * 対象のオブジェクト
   * 未指定の場合は空のオブジェクトを新規で作成
   */
  target?: T;

  /**
   * 実体のオブジェクトに設定されるキーの種別
   *
   * - 'transformed': 正規化されたキー
   * - 'original': 正規化前のキー
   */
  storedKeyType?: 'transformed' | 'original';

  /**
   * targetを直接編集するか\
   * targetが指定されている場合にのみ有効
   *
   * - false: targetからプロパティをコピーしたオブジェクトを編集する
   * - true: targetを編集する
   * @default false
   */
  mutable?: boolean;

  /**
   * 継承されたプロパティを管理対象とするか\
   * targetが指定されている場合にのみ有効
   *
   * - fales: 管理対象としない
   * - true: 管理対象とする
   *
   * @default false
   */
  includeInherited?: boolean;
};

/**
 * キーの取得関数
 *
 * @param target 対象のオブジェクト
 * @param key 変換前のキー
 */
export type CreateKeyTransformObjectGetKeyFn<T> = (
  target: T,
  key: string | symbol,
) => string | symbol;

/**
 * キーの削除関数
 *
 * @param target 対象のオブジェクト
 * @param key 変換前のキー
 */
export type CreateKeyTransformObjectDeleteKeyFn<T> = (
  target: T,
  key: string | symbol,
) => void;
