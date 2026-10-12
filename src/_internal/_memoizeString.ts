/**
 * 文字列を変換する関数をメモ化する\
 * 保持する件数を limit までに抑え、最も長く使われていないものから捨てる（LRU）
 * @param fn 変換する関数
 * @param limit 保持する件数の上限
 * @returns
 */
export function _memoizeString(
  fn: (value: string) => string,
  limit: number,
): (value: string) => string {
  // Map の挿入順を使用順として扱う（先頭が最も長く使われていないもの）
  const cache = new Map<string, string>();
  return (value) => {
    let result = cache.get(value);
    if (result !== undefined) {
      // 最近使ったものとして末尾に移す
      cache.delete(value);
    } else {
      result = fn(value);
      if (cache.size >= limit) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) {
          cache.delete(oldest);
        }
      }
    }
    cache.set(value, result);
    return result;
  };
}
