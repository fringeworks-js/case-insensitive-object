import { getByNormalizedKey } from '../getByNormalizedKey';
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

  it('enumeratedKey: originalで元のキーを保存する', () => {
    const obj = createCaseInsensitiveObject({ enumeratedKey: 'original' });
    obj['Name'] = 'Alice';
    expect(obj['name']).toBe('Alice');
    expect(obj['NAME']).toBe('Alice');
  });

  it('enumeratedKey: originalでSymbolキーも扱える', () => {
    const sym = Symbol('key');
    const obj = createCaseInsensitiveObject<Record<symbol, unknown>>({
      enumeratedKey: 'original',
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

  it('keysで指定したキーで列挙する', () => {
    const headers = createCaseInsensitiveObject({
      keys: ['Content-Type', 'Accept'],
    });
    headers['content-type'] = 'text/html';
    headers['ACCEPT'] = '*/*';
    expect({ ...headers }).toEqual({
      'Content-Type': 'text/html',
      Accept: '*/*',
    });
  });

  it('targetを変更しない', () => {
    const target: Record<string, unknown> = { Name: 'Alice' };
    const obj = createCaseInsensitiveObject({ target });
    obj['age'] = 20;
    expect(target).toEqual({ Name: 'Alice' });
    expect(obj['NAME']).toBe('Alice');
    expect(obj['AGE']).toBe(20);
  });

  it('normalizeStringのオプションでキーを正規化する', () => {
    const obj = createCaseInsensitiveObject({
      target: { ＡＢＣ: 1 },
      ignoreWidth: true,
    });
    expect(obj['abc']).toBe(1);
  });

  it('正規化のオプションを組み合わせてもキーが列挙から消えない', () => {
    const obj = createCaseInsensitiveObject({
      target: { か゛: 1 },
      ignoreCompatibility: true,
      ignoreSpace: true,
      ignoreDakuon: true,
      enumeratedKey: 'transformed',
    });
    expect(Object.keys(obj)).toEqual(['か']);
    expect(obj['が']).toBe(1);
  });

  it('正規化したキーが重なる初期値はgetByNormalizedKeyと同じ値を使う', () => {
    const target = { Foo: 1, FOO: 2 };
    const obj = createCaseInsensitiveObject({ target });
    expect(obj['foo']).toBe(getByNormalizedKey(target, 'foo'));
    expect(obj['foo']).toBe(1);
  });

  it('enumeratedKey: originalで読み取っただけのキーは登録しない', () => {
    const obj = createCaseInsensitiveObject({ enumeratedKey: 'original' });
    void obj['FOO'];
    obj['foo'] = 1;
    expect(Object.keys(obj)).toEqual(['foo']);
  });

  it('enumeratedKey: originalで別名のキーで削除した後は新しいキーで登録する', () => {
    const obj = createCaseInsensitiveObject({ enumeratedKey: 'original' });
    obj['Foo'] = 1;
    delete obj['FOO'];
    obj['foo'] = 2;
    expect(Object.keys(obj)).toEqual(['foo']);
  });

  it('getByNormalizedKeyで使った後に変更したtargetのキーを使う', () => {
    const target: Record<string, unknown> = { Foo: 1 };
    getByNormalizedKey(target, 'x');
    delete target['Foo'];
    target['FOO'] = 1;
    const obj = createCaseInsensitiveObject({
      target,
      enumeratedKey: 'original',
    });
    expect(Object.keys(obj)).toEqual(['FOO']);
  });

  it('同じtargetから作ったオブジェクトは互いに影響しない', () => {
    const target = { Foo: 1 };
    const a = createCaseInsensitiveObject<Record<string, unknown>>({
      target,
      enumeratedKey: 'original',
    });
    const b = createCaseInsensitiveObject<Record<string, unknown>>({
      target,
      enumeratedKey: 'original',
    });
    delete a['foo'];
    a['Bar'] = 2;
    expect(Object.keys(a)).toEqual(['Bar']);
    expect(Object.keys(b)).toEqual(['Foo']);
    expect(b['foo']).toBe(1);
    expect('bar' in b).toBe(false);
  });

  it('凍結後も別名のキーで調べられる', () => {
    const obj = createCaseInsensitiveObject({ target: { foo: 1 } });
    expect(() => Object.freeze(obj)).toThrow(TypeError);
    expect(Object.hasOwn(obj, 'FOO')).toBe(true);
    expect(Object.getOwnPropertyDescriptor(obj, 'FOO')?.value).toBe(1);
  });
});
