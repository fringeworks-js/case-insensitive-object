import getByNormalizedKey from './getByNormalizedKey';

describe('getByNormalizedKey', () => {
  it('デフォルトで大文字・小文字を区別せず取得できる', () => {
    expect(getByNormalizedKey({ Name: 'Alice' }, 'name')).toBe('Alice');
    expect(getByNormalizedKey({ NAME: 'Bob' }, 'name')).toBe('Bob');
  });

  it('完全一致でも取得できる', () => {
    expect(getByNormalizedKey({ name: 'Alice' }, 'name')).toBe('Alice');
  });

  it('ignoreCase: falseで大文字・小文字を区別する', () => {
    expect(
      getByNormalizedKey({ Name: 'Alice' }, 'name', { ignoreCase: false }),
    ).toBeUndefined();
    expect(
      getByNormalizedKey({ name: 'Alice' }, 'name', { ignoreCase: false }),
    ).toBe('Alice');
  });

  it('ignoreSeparatorsで区切り文字の違いを無視する', () => {
    expect(
      getByNormalizedKey({ 'user-name': 'Alice' }, 'userName', {
        ignoreSeparators: true,
      }),
    ).toBe('Alice');
  });

  it('存在しないキーはundefinedを返す', () => {
    expect(getByNormalizedKey({ a: 1 }, 'b')).toBeUndefined();
  });

  it('nullを渡した場合はundefinedを返す', () => {
    expect(getByNormalizedKey(null as any, 'key')).toBeUndefined();
  });

  it('継承プロパティは検索対象にならない', () => {
    const parent = { Name: 'Alice' };
    const child = Object.create(parent) as Record<string, unknown>;
    child['own'] = 'Own';
    expect(getByNormalizedKey(child, 'name')).toBeUndefined();
    expect(getByNormalizedKey(child, 'own')).toBe('Own');
  });
});
