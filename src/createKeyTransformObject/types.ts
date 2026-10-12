/**
 * オプション
 */
export type CreateKeyTransformObjectOptions<T extends object> = {
  /**
   * 初期値を持つオブジェクト\
   * 自身の列挙可能なプロパティをコピーする。target 自体は変更しない。
   * target のキーも本来のキーとして扱う
   */
  target?: Partial<T>;

  /**
   * 本来のキー\
   * どの別名で設定しても、列挙するときはこのキーを使う
   */
  keys?: readonly (keyof T & string)[];

  /**
   * 列挙するときのキーの種別
   *
   * - 'original': 本来のキー（keys や target にあればそのキー、なければ最初に使われたキー）
   * - 'transformed': 変換後のキー
   * @default 'original'
   */
  enumeratedKey?: 'original' | 'transformed';
};

/**
 * createKeyTransformObject が返すオブジェクトの型\
 * 定義したキーには値の型が付き、定義外のキーは unknown になる
 */
export type KeyTransformObject<T extends object> = Partial<T> & {
  [key: string]: unknown;
};
