import { _memoizeString } from './_memoizeString';

describe('_memoizeString', () => {
  it('同じ値では関数を再度呼ばない', () => {
    const fn = vi.fn((value: string) => value.toLowerCase());
    const memoized = _memoizeString(fn, 2);
    expect(memoized('A')).toBe('a');
    expect(memoized('A')).toBe('a');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('上限を超えると最も長く使われていないものを捨てる', () => {
    const fn = vi.fn((value: string) => value.toLowerCase());
    const memoized = _memoizeString(fn, 2);
    memoized('A');
    memoized('B');
    memoized('A'); // A を最近使ったものにする
    memoized('C'); // B を捨てる
    fn.mockClear();
    memoized('A');
    memoized('C');
    expect(fn).not.toHaveBeenCalled();
    memoized('B');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('変換結果が空文字でもキャッシュする', () => {
    const fn = vi.fn(() => '');
    const memoized = _memoizeString(fn, 2);
    memoized(' ');
    memoized(' ');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
