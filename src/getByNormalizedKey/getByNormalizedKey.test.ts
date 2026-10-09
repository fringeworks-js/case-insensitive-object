import getByNormalizedKey from './getByNormalizedKey';

describe('getByNormalizedKey', () => {
  it('デフォルトで大文字・小文字を区別せず取得できる', () => {
    expect(getByNormalizedKey({ Name: 'Alice' }, 'name')).toBe('Alice');
    expect(getByNormalizedKey({ NAME: 'Bob' }, 'name')).toBe('Bob');
  });

  it('完全一致でも取得できる', () => {
    expect(getByNormalizedKey({ name: 'Alice' }, 'name')).toBe('Alice');
  });

  it('caseSensitive: trueで大文字・小文字を区別する', () => {
    expect(
      getByNormalizedKey({ Name: 'Alice' }, 'name', { caseSensitive: true }),
    ).toBeUndefined();
    expect(
      getByNormalizedKey({ name: 'Alice' }, 'name', { caseSensitive: true }),
    ).toBe('Alice');
  });

  it('存在しないキーはundefinedを返す', () => {
    expect(getByNormalizedKey({ a: 1 }, 'b')).toBeUndefined();
  });

  it('nullを渡した場合はnullを返す', () => {
    expect(getByNormalizedKey(null as any, 'key')).toBeNull();
  });

  it('継承プロパティは検索対象にならない', () => {
    const parent = { Name: 'Alice' };
    const child = Object.create(parent) as Record<string, unknown>;
    child['own'] = 'Own';
    expect(getByNormalizedKey(child, 'name')).toBeUndefined();
    expect(getByNormalizedKey(child, 'own')).toBe('Own');
  });
});
