import setByNormalizedKey from './setByNormalizedKey';

describe('setByNormalizedKey', () => {
  it('デフォルトで大文字・小文字を区別せず設定できる', () => {
    const data = { Name: 'Alice' };
    setByNormalizedKey(data, 'name', 'Bob');
    expect(data['Name']).toBe('Bob');
  });

  it('完全一致でも設定できる', () => {
    const data = { name: 'Alice' };
    setByNormalizedKey(data, 'name', 'Bob');
    expect(data['name']).toBe('Bob');
  });

  it('caseSensitive: trueで大文字・小文字を区別する', () => {
    const data: Record<string, unknown> = { Name: 'Alice' };
    setByNormalizedKey(data, 'name', 'Bob', { caseSensitive: true });
    expect(data['Name']).toBe('Alice');
    expect(data['name']).toBe('Bob');
  });

  it('一致するキーがない場合は新しいキーで追加する', () => {
    const data: Record<string, unknown> = { a: 1 };
    setByNormalizedKey(data, 'b', 2);
    expect(data['b']).toBe(2);
  });

  it('nullを渡した場合はそのまま返す', () => {
    const result = setByNormalizedKey(null as any, 'key', 1);
    expect(result).toBeNull();
  });

  it('継承プロパティは更新対象にならない', () => {
    const parent = { Name: 'Alice' };
    const child = Object.create(parent) as Record<string, unknown>;
    setByNormalizedKey(child, 'name', 'Bob');
    expect(parent['Name']).toBe('Alice');
    expect(child['name']).toBe('Bob');
  });
});
