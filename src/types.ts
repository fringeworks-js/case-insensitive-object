/**
 * キーの正規化のオプション
 */
export type NormalizeKeyOptions = {
  /**
   * 英字の大文字・小文字の違いを無視する
   * @default true
   */
  ignoreCase?: boolean;

  /**
   * 全角・半角の違いを無視する\
   * 互換文字（`㈱` など）の変換はしない
   */
  ignoreWidth?: boolean;

  /**
   * ひらがな・カタカナの違いを無視する
   */
  ignoreKana?: boolean;

  /**
   * 改行以外の空白文字（半角・全角スペース、タブなど）を無視する
   */
  ignoreSpace?: boolean;

  /**
   * 区切り文字（`-`・`_`・`.`）を無視する
   */
  ignoreSeparators?: boolean;
};
