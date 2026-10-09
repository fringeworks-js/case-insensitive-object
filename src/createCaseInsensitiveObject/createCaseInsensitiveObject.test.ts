import createCaseInsensitiveObject from './createCaseInsensitiveObject';

describe('createCaseInsensitiveObject', () => {
  it('デフォルトで大文字・小文字を区別しないキーでアクセスできる', () => {
    const obj = createCaseInsensitiveObject({ target: { Name: 'Alice' } });
    expect(obj['name']).toBe('Alice');
    expect(obj['NAME']).toBe('Alice');
    expect(obj['Name']).toBe('Alice');
  });

  it('デフォルトで異なるケースで同じキーに値を設定できる', () => {
    const obj = createCaseInsensitiveObject<Record<string, unknown>>();
    obj['name'] = 'Alice';
    expect(obj['Name']).toBe('Alice');
    expect(obj['NAME']).toBe('Alice');
  });

  it('inオペレータで大文字・小文字を区別しない検索ができる', () => {
    const obj = createCaseInsensitiveObject({ target: { Name: 'Alice' } });
    expect('name' in obj).toBe(true);
    expect('NAME' in obj).toBe(true);
  });

  it('deleteで大文字・小文字を区別せず削除できる', () => {
    const obj = createCaseInsensitiveObject<Record<string, unknown>>({
      target: { Name: 'Alice' },
    });
    delete obj['name'];
    expect(obj['Name']).toBeUndefined();
  });

  it('caseSensitive: trueで大文字・小文字を区別する', () => {
    const obj = createCaseInsensitiveObject({
      target: { Name: 'Alice' },
      caseSensitive: true,
    });
    expect(obj['name']).toBeUndefined();
    expect(obj['Name']).toBe('Alice');
  });

  it('Symbolキーでアクセスできる', () => {
    const sym = Symbol('key');
    const obj = createCaseInsensitiveObject<Record<symbol, unknown>>();
    obj[sym] = 'symbolValue';
    expect(obj[sym]).toBe('symbolValue');
  });

  it('deleteでSymbolキーを削除できる', () => {
    const sym = Symbol('key');
    const obj = createCaseInsensitiveObject<Record<symbol, unknown>>();
    obj[sym] = 'value';
    delete obj[sym];
    expect(obj[sym]).toBeUndefined();
  });

  it('storedKeyType: originalで元のキーを保存する', () => {
    const obj = createCaseInsensitiveObject({ storedKeyType: 'original' });
    obj['Name'] = 'Alice';
    expect(obj['name']).toBe('Alice');
    expect(obj['NAME']).toBe('Alice');
  });

  it('storedKeyType: originalでSymbolキーも扱える', () => {
    const sym = Symbol('key');
    const obj = createCaseInsensitiveObject<Record<symbol, unknown>>({
      storedKeyType: 'original',
    });
    obj[sym] = 'value';
    expect(obj[sym]).toBe('value');
  });

  it('deleteで主キーと同じケースで削除できる', () => {
    const obj = createCaseInsensitiveObject<Record<string, unknown>>({
      target: { Name: 'Alice' },
    });
    delete obj['Name'];
    expect(obj['Name']).toBeUndefined();
    expect(obj['name']).toBeUndefined();
  });

  it('mutableを指定しない場合はtargetを変更しない', () => {
    const target: Record<string, unknown> = { Name: 'Alice' };
    const obj = createCaseInsensitiveObject({ target });
    obj['age'] = 20;
    expect(target).toEqual({ Name: 'Alice' });
    expect(obj['NAME']).toBe('Alice');
    expect(obj['AGE']).toBe(20);
  });
});
