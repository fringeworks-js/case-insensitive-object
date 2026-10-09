import createKeyTransformObject from './createKeyTransformObject';

describe('createKeyTransformObject', () => {
  it('変換されたキーでプロパティにアクセスできる', () => {
    const obj = createKeyTransformObject((_, key) =>
      typeof key === 'string' ? key.toUpperCase() : key,
    );
    obj['name'] = 'Alice';
    expect(obj['NAME']).toBe('Alice');
  });

  it('初期値が変換キーで保存される', () => {
    const obj = createKeyTransformObject(
      (_, key) => (typeof key === 'string' ? key.toLowerCase() : key),
      { target: { Name: 'Alice' } },
    );
    expect(obj['name']).toBe('Alice');
  });

  it('inオペレータが変換キーで動作する', () => {
    const obj = createKeyTransformObject((_, key) =>
      typeof key === 'string' ? key.toUpperCase() : key,
    );
    obj['name'] = 'Alice';
    expect('NAME' in obj).toBe(true);
  });

  it('deletePropertyが変換キーで動作する', () => {
    const obj = createKeyTransformObject<Record<string, unknown>>((_, key) =>
      typeof key === 'string' ? key.toUpperCase() : key,
    );
    obj['name'] = 'Alice';
    delete obj['name'];
    expect(obj['NAME']).toBeUndefined();
  });

  it('Object.keysで変換後のキーを列挙できる', () => {
    const obj = createKeyTransformObject(
      (_, key) => (typeof key === 'string' ? key.toLowerCase() : key),
      { target: { Name: 'Alice', AGE: 30 } as any },
    );
    const keys = Object.keys(obj);
    expect(keys).toContain('name');
    expect(keys).toContain('age');
  });

  it('Object.getOwnPropertyDescriptorが変換キーで動作する', () => {
    const obj = createKeyTransformObject((_, key) =>
      typeof key === 'string' ? key.toLowerCase() : key,
    );
    obj['Name'] = 'Alice';
    const desc = Object.getOwnPropertyDescriptor(obj, 'Name');
    expect(desc).toBeDefined();
    expect(desc!.value).toBe('Alice');
  });

  it('Object.definePropertyが変換キーで動作する', () => {
    const obj = createKeyTransformObject<Record<string, unknown>>((_, key) =>
      typeof key === 'string' ? key.toUpperCase() : key,
    );
    Object.defineProperty(obj, 'name', {
      value: 'Alice',
      writable: true,
      enumerable: true,
      configurable: true,
    });
    expect(obj['NAME']).toBe('Alice');
  });

  it('includeInherited: trueで継承プロパティを含めてコピーする', () => {
    const parent = { inherited: 'yes' };
    const child = Object.create(parent) as Record<string, unknown>;
    child['own'] = 'own';
    const obj = createKeyTransformObject(
      (_, key) => (typeof key === 'string' ? key.toLowerCase() : key),
      { target: child, includeInherited: true },
    );
    expect(obj['own']).toBe('own');
    expect(obj['inherited']).toBe('yes');
  });

  it('mutable: trueで元のオブジェクトを直接変更する', () => {
    const target: Record<string, unknown> = { Name: 'Alice' };
    const obj = createKeyTransformObject(
      (_, key) => (typeof key === 'string' ? key.toLowerCase() : key),
      { target, mutable: true },
    );
    obj['Age'] = 30;
    expect(target['age']).toBe(30);
  });

  it('storedKeyType: originalで元のキーを保存する', () => {
    const sym = Symbol('test');
    const obj = createKeyTransformObject<Record<string | symbol, unknown>>(
      (_, key) => key,
      { storedKeyType: 'original' },
    );
    obj[sym] = 'symbolValue';
    expect(obj[sym]).toBe('symbolValue');
  });

  it('mutable: trueで継承プロパティは初期値に含まれない', () => {
    const parent = { inherited: 'yes' };
    const child = Object.create(parent) as Record<string, unknown>;
    child['own'] = 'own';
    const obj = createKeyTransformObject(
      (_, key) => (typeof key === 'string' ? key.toLowerCase() : key),
      { target: child, mutable: true },
    );
    expect(obj['own']).toBe('own');
    expect(obj['inherited']).toBe('yes');
  });
});
