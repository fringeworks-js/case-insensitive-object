import { stableStringify } from '@fringeworks/utils/object/stableStringify';

/**
 * 変換前のキーと変換後のキーのキャッシュを管理するクラス
 */
export default class TransformedKeyManager<O extends object> {
  /**
   * 対象のオブジェクトをキーとしてキャッシュされた情報を持つマップ
   */
  private _cache = new WeakMap<object, Map<string, TransformedKeyItem<O>>>();

  /**
   * オプションを文字列化した情報を持つマップ
   */
  private _optionsCache = new WeakMap<O, string>();

  private readonly _transform: (originalKey: string, options?: O) => string;

  constructor(transform: (originalKey: string, options?: O) => string) {
    this._transform = transform;
  }

  /**
   * 変換前のキーから主となる変換前のキーを取得
   *
   * @param originalKey
   * @param data
   * @param options
   * @returns
   */
  public resolveOriginalKey(originalKey: string, data: object, options?: O) {
    return this._getItem(data, options).resolveOriginalKey(originalKey);
  }

  /**
   * 変換後のキー → 変換前のキー
   *
   * @param transformedKey
   * @param data
   * @param options
   * @returns
   */
  public getOriginalKey(transformedKey: string, data: object, options?: O) {
    return this._getItem(data, options).getOriginalKey(transformedKey);
  }

  /**
   * 変換前のキー → 変換後のキー
   *
   * @param originalKey
   * @param data
   * @param options
   * @returns
   */
  public getTransformedKey(
    originalKey: string,
    data: object,
    options?: O,
  ): string | undefined {
    return this._getItem(data, options).getTransformedKey(originalKey);
  }

  /**
   * 変換前のキーのキャッシュを削除
   *
   * @param originalKey
   * @param data
   * @param options
   * @returns 変換前のキーに紐づく変換後のキー
   */
  public deleteOriginalKey(originalKey: string, data: object, options?: O) {
    return this._getItem(data, options).deleteOriginalKey(originalKey);
  }

  /**
   * 変換後のキーのキャッシュを削除
   *
   * @param originalKey
   * @param data
   * @param options
   * @returns 変換後のキーに紐づく変換前のキー
   */
  public deleteTransformedKey(
    transformedKey: string,
    data: object,
    options?: O,
  ) {
    return this._getItem(data, options).deleteTransformedKey(transformedKey);
  }

  /**
   * TransformedKeyItemの取得
   * @param data
   * @param options
   * @returns
   */
  private _getItem(data: object, options: O | undefined) {
    const optionKey = this._getOptionsKey(options);
    let cacheData = this._cache.get(data);
    if (!cacheData) {
      cacheData = new Map();
      this._cache.set(data, cacheData);
    }
    let item = cacheData.get(optionKey);
    if (!item) {
      item = new TransformedKeyItem(data, this._transform, options);
      cacheData.set(optionKey, item);
    }
    return item;
  }

  /**
   * 文字列化したオプションの取得
   * @param options
   * @returns
   */
  private _getOptionsKey(options: O | undefined) {
    if (!options) {
      return '{}';
    }
    const optionsCache = this._optionsCache;
    let optionsKey = optionsCache.get(options);
    if (!optionsKey) {
      optionsKey = stableStringify(options);
      optionsCache.set(options, optionsKey);
    }
    return optionsKey;
  }
}

/**
 * data & options毎のキャッシュを管理するクラス
 */
class TransformedKeyItem<O extends object> {
  /**
   * 変換前のキー → 変換後のキー 用のキャッシュ
   * 正引き用
   */
  private _orgToTrans = new Map<string, string>();

  /**
   * 変換後のキー → 変換前のキー 用のキャッシュ
   * 逆引き用
   */
  private _transToOrg = new Map<string, string>();

  private readonly _transform: (originalKey: string, options: O) => string;
  private readonly _options: O;

  constructor(
    data: object,
    transform: (originalKey: string, options?: O) => string,
    options: O = undefined,
  ) {
    this._transform = transform;
    this._options = options;
    this._initialize(data);
  }

  /**
   * 変換前のキーから主となる変換前のキーを取得
   */
  public resolveOriginalKey(originalKey: string): string | undefined {
    const transformedKey = this.getTransformedKey(originalKey);
    return this.getOriginalKey(transformedKey);
  }

  /**
   * 変換後のキー → 変換前のキー
   */
  public getOriginalKey(transformedKey: string): string | undefined {
    return this._transToOrg.get(transformedKey);
  }

  /**
   * 変換前のキー → 変換後のキー
   */
  public getTransformedKey(originalKey: string): string {
    if (!this._orgToTrans.has(originalKey)) {
      this._addCacheEntry(originalKey);
    }
    return this._orgToTrans.get(originalKey);
  }

  /**
   * 変換前のキーの有無
   */
  public hasOriginalKey(originalKey: string): boolean {
    return this._orgToTrans.has(originalKey);
  }

  /**
   * 変換後のキーの有無
   */
  public hasTransformedKey(transformedKey: string): boolean {
    return this._transToOrg.has(transformedKey);
  }

  /**
   * 変換前のキーの削除
   * @param originalKey
   * @returns 変換前のキーに紐づく変換後のキー
   */
  public deleteOriginalKey(originalKey: string): string | undefined {
    const transformedKey = this._orgToTrans.get(originalKey);
    if (transformedKey !== undefined) {
      const primaryOriginalKey = this._transToOrg.get(transformedKey);
      if (originalKey === primaryOriginalKey) {
        // 主となる変換前のキーの場合は逆引き用のキャッシュから削除
        this._transToOrg.delete(transformedKey);
      }
      // 正引き用のキャッシュから削除
      this._orgToTrans.delete(originalKey);
    }
    return transformedKey;
  }

  /**
   * 変換後のキーの削除
   * @param transformedKey
   * @returns 変換後のキーに紐づく変換前のキー
   */
  public deleteTransformedKey(transformedKey: string): string | undefined {
    const originalKey = this._transToOrg.get(transformedKey);
    // 逆引き用のキャッシュを削除
    this._transToOrg.delete(transformedKey);
    // 正引き用のキャッシュは_orgToTransのvaluesから引く必要があるので、そのままにしておく
    return originalKey;
  }

  /**
   * 現在のdataのキーで更新
   * @param data
   */
  public update(data: object) {
    this._transToOrg.clear();
    this._orgToTrans.clear();
    this._initialize(data);
  }

  /**
   * 初期化
   * @param data
   */
  private _initialize(data: object) {
    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        this._addCacheEntry(key);
      }
    }
  }

  /**
   * キャッシュへの登録
   */
  private _addCacheEntry(originalKey: string): void {
    const transformedKey =
      this._orgToTrans.get(originalKey) ||
      this._transform(originalKey, this._options);

    // 変換後のキー → 変換前のキー (既にある場合は上書きしない。先勝ち)
    if (!this._transToOrg.has(transformedKey)) {
      this._transToOrg.set(transformedKey, originalKey);
    }

    // 変換前のキー → 変換後のキー
    this._orgToTrans.set(originalKey, transformedKey);
  }
}
