import { createCaseInsensitiveObject } from '../createCaseInsensitiveObject';
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

  it('ignoreCase: falseで大文字・小文字を区別する', () => {
    const data: Record<string, unknown> = { Name: 'Alice' };
    setByNormalizedKey(data, 'name', 'Bob', { ignoreCase: false });
    expect(data['Name']).toBe('Alice');
    expect(data['name']).toBe('Bob');
  });

  it('一致するキーがない場合は新しいキーで追加する', () => {
    const data: Record<string, unknown> = { a: 1 };
    setByNormalizedKey(data, 'b', 2);
    expect(data['b']).toBe(2);
  });

  it('ignoreSeparatorsで区切り文字の違いを無視する', () => {
    const data: Record<string, unknown> = { 'user-name': 'Alice' };
    setByNormalizedKey(data, 'userName', 'Bob', { ignoreSeparators: true });
    expect(data).toEqual({ 'user-name': 'Bob' });
  });

  it('継承プロパティは更新対象にならない', () => {
    const parent = { Name: 'Alice' };
    const child = Object.create(parent) as Record<string, unknown>;
    setByNormalizedKey(child, 'name', 'Bob');
    expect(parent['Name']).toBe('Alice');
    expect(child['name']).toBe('Bob');
  });

  it('createCaseInsensitiveObjectのオブジェクトにも設定できる', () => {
    const obj = createCaseInsensitiveObject({
      initialValues: { 'Content-Type': 'text/html' },
    });
    setByNormalizedKey(obj, 'CONTENT-TYPE', 'text/plain');
    expect({ ...obj }).toEqual({ 'Content-Type': 'text/plain' });
  });

  it('__proto__は自身のプロパティとして追加し、プロトタイプを変えない', () => {
    const data: Record<string, unknown> = {};
    setByNormalizedKey(data, '__proto__', { polluted: true });
    expect(Object.getPrototypeOf(data)).toBe(Object.prototype);
    expect(Object.keys(data)).toEqual(['__proto__']);
    expect(data['polluted']).toBeUndefined();
  });

  it('自身の__proto__があればその値を更新する', () => {
    const data = JSON.parse('{"__proto__":1}') as Record<string, unknown>;
    setByNormalizedKey(data, '__PROTO__', 2);
    expect(Object.getPrototypeOf(data)).toBe(Object.prototype);
    expect(Object.getOwnPropertyDescriptor(data, '__proto__')?.value).toBe(2);
  });
});
