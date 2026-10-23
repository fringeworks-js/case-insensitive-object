import { hasOwn } from '@fringeworks/utils/object/hasOwn';
import createKeyTransformObject from './createKeyTransformObject';

const toLower = (key: string) => key.toLowerCase();

describe('createKeyTransformObject', () => {
  describe('基本操作', () => {
    it('変換されたキーでプロパティにアクセスできる', () => {
      const obj = createKeyTransformObject((key) => key.toUpperCase());
      obj['name'] = 'Alice';
      expect(obj['NAME']).toBe('Alice');
      expect(obj['Name']).toBe('Alice');
    });

    it('初期値も変換したキーでアクセスできる', () => {
      const obj = createKeyTransformObject(toLower, {
        initialValues: { Name: 'Alice' },
      });
      expect(obj['name']).toBe('Alice');
      expect(obj['NAME']).toBe('Alice');
    });

    it('別名のキーで設定すると同じプロパティを上書きする', () => {
      const obj = createKeyTransformObject(toLower);
      obj['Name'] = 'Alice';
      obj['NAME'] = 'Bob';
      expect(obj['name']).toBe('Bob');
      expect(Object.keys(obj)).toEqual(['Name']);
    });

    it('inオペレータが変換キーで動作する', () => {
      const obj = createKeyTransformObject(toLower);
      obj['Name'] = 'Alice';
      expect('NAME' in obj).toBe(true);
      expect('age' in obj).toBe(false);
    });

    it('deleteが変換キーで動作する', () => {
      const obj = createKeyTransformObject(toLower);
      obj['Name'] = 'Alice';
      expect(delete obj['NAME']).toBe(true);
      expect(obj['name']).toBeUndefined();
      expect('name' in obj).toBe(false);
      expect(Object.keys(obj)).toEqual([]);
    });

    it('存在しないキーのdeleteもtrueを返す', () => {
      const obj = createKeyTransformObject(toLower);
      expect(delete obj['name']).toBe(true);
    });

    it('Symbolキーは変換せずに扱う', () => {
      const sym = Symbol('key');
      const obj =
        createKeyTransformObject<Record<string | symbol, unknown>>(toLower);
      obj[sym] = 'value';
      expect(obj[sym]).toBe('value');
      expect(sym in obj).toBe(true);
      expect(Reflect.ownKeys(obj)).toEqual([sym]);
      delete obj[sym];
      expect(sym in obj).toBe(false);
    });
  });

  describe('initialValues', () => {
    it('initialValuesを変更しない', () => {
      const initialValues: Record<string, unknown> = { Name: 'Alice' };
      const obj = createKeyTransformObject(toLower, { initialValues });
      obj['Age'] = 30;
      delete obj['name'];
      expect(initialValues).toEqual({ Name: 'Alice' });
    });

    it('作成後にinitialValuesを変更してもオブジェクトに影響しない', () => {
      const initialValues: Record<string, unknown> = { Name: 'Alice' };
      const obj = createKeyTransformObject(toLower, { initialValues });
      initialValues['Age'] = 30;
      delete initialValues['Name'];
      expect(obj['name']).toBe('Alice');
      expect('age' in obj).toBe(false);
    });

    it('継承プロパティは初期値に含めない', () => {
      const parent = { inherited: 'yes' };
      const child = Object.create(parent) as Record<string, unknown>;
      child['own'] = 'own';
      const obj = createKeyTransformObject(toLower, { initialValues: child });
      expect(obj['own']).toBe('own');
      expect(obj['inherited']).toBeUndefined();
    });

    it('Symbolキーの初期値も引き継ぐ', () => {
      const sym = Symbol('key');
      const obj = createKeyTransformObject<Record<string | symbol, unknown>>(
        toLower,
        { initialValues: { [sym]: 'value' } },
      );
      expect(obj[sym]).toBe('value');
    });

    it('変換後のキーが重なる初期値は最初のキーと値を使う', () => {
      const obj = createKeyTransformObject(toLower, {
        initialValues: { Foo: 1, FOO: 2 },
        enumeratedKey: 'original',
      });
      expect(obj['foo']).toBe(1);
      expect({ ...obj }).toEqual({ Foo: 1 });
    });
  });

  describe('列挙', () => {
    it('既定では最初に使われたキーを列挙する', () => {
      const obj = createKeyTransformObject(toLower, {
        initialValues: { Name: 'Alice', AGE: 30 },
      });
      expect(Object.keys(obj)).toEqual(['Name', 'AGE']);
    });

    it('enumeratedKey: transformedで変換後のキーを列挙する', () => {
      const obj = createKeyTransformObject(toLower, {
        initialValues: { Name: 'Alice', AGE: 30 },
        enumeratedKey: 'transformed',
      });
      expect(Object.keys(obj)).toEqual(['name', 'age']);
      expect(Object.getOwnPropertyDescriptor(obj, 'name')?.value).toBe('Alice');
    });

    it('enumeratedKey: originalで最初に使われたキーを列挙する', () => {
      const obj = createKeyTransformObject(toLower, {
        enumeratedKey: 'original',
      });
      obj['Name'] = 'Alice';
      obj['NAME'] = 'Bob';
      expect(Object.keys(obj)).toEqual(['Name']);
      expect(obj['name']).toBe('Bob');
    });

    it.each(['original', 'transformed'] as const)(
      'enumeratedKey: %sで列挙したキーで調べるときはtransformKeyを呼ばない',
      (enumeratedKey) => {
        const transformKey = vi.fn(toLower);
        const obj = createKeyTransformObject(transformKey, {
          initialValues: { Name: 'Alice' },
          enumeratedKey,
        });
        obj['AGE'] = 30;
        transformKey.mockClear();
        void { ...obj };
        void Object.entries(obj);
        expect(transformKey).not.toHaveBeenCalled();
      },
    );

    it('削除したプロパティのキーは変換し直す', () => {
      const transformKey = vi.fn(toLower);
      const obj = createKeyTransformObject(transformKey, {
        initialValues: { Name: 'Alice' },
      });
      delete obj['Name'];
      transformKey.mockClear();
      expect('Name' in obj).toBe(false);
      expect(transformKey).toHaveBeenCalledWith('Name');
    });

    it('スプレッドとJSON.stringifyで値を取り出せる', () => {
      const obj = createKeyTransformObject(toLower, {
        initialValues: { Name: 'Alice' },
        enumeratedKey: 'original',
      });
      expect({ ...obj }).toEqual({ Name: 'Alice' });
      expect(JSON.stringify(obj)).toBe('{"Name":"Alice"}');
    });
  });

  describe('enumeratedKey: original のキーの登録', () => {
    it('読み取っただけのキーは登録しない', () => {
      const obj = createKeyTransformObject(toLower, {
        enumeratedKey: 'original',
      });
      void obj['FOO'];
      obj['foo'] = 1;
      expect(Object.keys(obj)).toEqual(['foo']);
    });

    it('inで調べただけのキーは登録しない', () => {
      const obj = createKeyTransformObject(toLower, {
        enumeratedKey: 'original',
      });
      void ('Bar' in obj);
      obj['bar'] = 1;
      expect(Object.keys(obj)).toEqual(['bar']);
    });

    it('getOwnPropertyDescriptorで調べただけのキーは登録しない', () => {
      const obj = createKeyTransformObject(toLower, {
        enumeratedKey: 'original',
      });
      Object.getOwnPropertyDescriptor(obj, 'BAZ');
      obj['baz'] = 1;
      expect(Object.keys(obj)).toEqual(['baz']);
    });

    it('別名のキーで削除した後は新しいキーで登録する', () => {
      const obj = createKeyTransformObject(toLower, {
        enumeratedKey: 'original',
      });
      obj['Foo'] = 1;
      delete obj['FOO'];
      obj['foo'] = 2;
      expect(Object.keys(obj)).toEqual(['foo']);
    });

    it('JSON.stringifyの後に設定したキーで登録する', () => {
      const obj = createKeyTransformObject(toLower, {
        enumeratedKey: 'original',
      });
      JSON.stringify(obj);
      obj['ToJSON'] = 1;
      expect(Object.keys(obj)).toEqual(['ToJSON']);
    });
  });

  describe('keys', () => {
    it('どの別名で設定してもkeysのキーで列挙する', () => {
      const obj = createKeyTransformObject(toLower, {
        keys: ['Content-Type'],
      });
      obj['content-type'] = 'text/html';
      expect(Object.keys(obj)).toEqual(['Content-Type']);
      expect(obj['CONTENT-TYPE']).toBe('text/html');
    });

    it('削除した後に別名で設定してもkeysのキーで列挙する', () => {
      const obj = createKeyTransformObject(toLower, {
        keys: ['Content-Type'],
      });
      obj['CONTENT-TYPE'] = 'a';
      delete obj['content-type'];
      obj['content-TYPE'] = 'b';
      expect({ ...obj }).toEqual({ 'Content-Type': 'b' });
    });

    it('値を設定していないkeysのキーは存在しない', () => {
      const obj = createKeyTransformObject(toLower, { keys: ['Name'] });
      expect('name' in obj).toBe(false);
      expect(Object.keys(obj)).toEqual([]);
    });

    it('initialValuesのキーよりkeysのキーを優先する', () => {
      // 型で定義するとinitialValuesのキーも本来のキーに限られるので、型は定義しない
      const obj = createKeyTransformObject<Record<string, unknown>>(toLower, {
        keys: ['Content-Type'],
        initialValues: { 'content-type': 'text/html' },
      });
      expect({ ...obj }).toEqual({ 'Content-Type': 'text/html' });
    });

    it('keysの中で変換後のキーが重なる場合は最初のキーを使う', () => {
      const obj = createKeyTransformObject(toLower, {
        keys: ['Name', 'NAME'],
      });
      obj['name'] = 'Alice';
      expect(Object.keys(obj)).toEqual(['Name']);
    });

    it('initialValuesのキーも本来のキーとして扱う', () => {
      const obj = createKeyTransformObject(toLower, {
        initialValues: { Name: 'Alice' },
      });
      delete obj['NAME'];
      obj['name'] = 'Bob';
      expect({ ...obj }).toEqual({ Name: 'Bob' });
    });

    it('enumeratedKey: transformedでは変換後のキーで列挙する', () => {
      const obj = createKeyTransformObject(toLower, {
        keys: ['Content-Type'],
        enumeratedKey: 'transformed',
      });
      obj['CONTENT-TYPE'] = 'text/html';
      expect(Object.keys(obj)).toEqual(['content-type']);
    });
  });

  describe('プロパティの定義', () => {
    it('getOwnPropertyDescriptorが別名のキーで動作する', () => {
      const obj = createKeyTransformObject(toLower);
      obj['Name'] = 'Alice';
      expect(Object.getOwnPropertyDescriptor(obj, 'NAME')).toEqual({
        value: 'Alice',
        writable: true,
        enumerable: true,
        configurable: true,
      });
      expect(Object.getOwnPropertyDescriptor(obj, 'age')).toBeUndefined();
    });

    it('hasOwnが別名のキーで動作する', () => {
      const obj = createKeyTransformObject(toLower);
      obj['Name'] = 'Alice';
      expect(hasOwn(obj, 'NAME')).toBe(true);
      expect(hasOwn(obj, 'age')).toBe(false);
    });

    it('Object.definePropertyが別名のキーで動作する', () => {
      const obj = createKeyTransformObject((key) => key.toUpperCase());
      Object.defineProperty(obj, 'name', {
        value: 'Alice',
        writable: true,
        enumerable: true,
        configurable: true,
      });
      expect(obj['NAME']).toBe('Alice');
    });

    it('configurableを省略して定義しても別名のキーで調べられる', () => {
      const obj = createKeyTransformObject(toLower);
      Object.defineProperty(obj, 'Foo', { value: 1 });
      expect(obj['foo']).toBe(1);
      expect(Object.getOwnPropertyDescriptor(obj, 'FOO')).toEqual({
        value: 1,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    });

    it('値を省略して定義すると既存の値を保つ', () => {
      const obj = createKeyTransformObject(toLower);
      obj['Foo'] = 1;
      Object.defineProperty(obj, 'FOO', { enumerable: true });
      expect(obj['foo']).toBe(1);
    });

    it('configurable: falseで定義するとTypeErrorになり、値は変わらない', () => {
      const obj = createKeyTransformObject(toLower);
      expect(() =>
        Object.defineProperty(obj, 'Foo', { value: 1, configurable: false }),
      ).toThrow(TypeError);
      expect('foo' in obj).toBe(false);
    });

    it('アクセサーを定義するとTypeErrorになる', () => {
      const obj = createKeyTransformObject(toLower);
      expect(() => Object.defineProperty(obj, 'Foo', { get: () => 1 })).toThrow(
        TypeError,
      );
      expect('foo' in obj).toBe(false);
    });
  });

  describe('拡張の禁止', () => {
    it('Object.preventExtensionsはTypeErrorになる', () => {
      const obj = createKeyTransformObject(toLower);
      expect(() => Object.preventExtensions(obj)).toThrow(TypeError);
      expect(Object.isExtensible(obj)).toBe(true);
    });

    it('Object.sealはTypeErrorになる', () => {
      const obj = createKeyTransformObject(toLower, {
        initialValues: { a: 1 },
      });
      expect(() => Object.seal(obj)).toThrow(TypeError);
    });

    it('Object.freezeはTypeErrorになり、その後も別名のキーで調べられる', () => {
      const obj = createKeyTransformObject(toLower, {
        initialValues: { foo: 1 },
      });
      expect(() => Object.freeze(obj)).toThrow(TypeError);
      expect(hasOwn(obj, 'FOO')).toBe(true);
      obj['FOO'] = 2;
      expect(obj['foo']).toBe(2);
    });
  });

  describe('プロトタイプ', () => {
    it('プロトタイプはnull', () => {
      const obj = createKeyTransformObject(toLower);
      expect(Object.getPrototypeOf(obj)).toBeNull();
    });

    it('Object.prototypeのメソッド名もキーとして扱える', () => {
      const obj = createKeyTransformObject(toLower);
      expect(obj['toString']).toBeUndefined();
      obj['toString'] = 'value';
      expect(obj['TOSTRING']).toBe('value');
    });

    it('Object.setPrototypeOfでnull以外を設定するとTypeErrorになる', () => {
      const obj = createKeyTransformObject(toLower);
      expect(() => Object.setPrototypeOf(obj, {})).toThrow(TypeError);
      expect(() => Object.setPrototypeOf(obj, null)).not.toThrow();
    });

    it('プロトタイプにしたオブジェクトへの代入は子に設定される', () => {
      const obj = createKeyTransformObject(toLower);
      obj['Name'] = 'Alice';
      const child = Object.create(obj) as Record<string, unknown>;
      child['Age'] = 30;
      expect(Object.keys(child)).toEqual(['Age']);
      expect(Object.keys(obj)).toEqual(['Name']);
      expect(child['NAME']).toBe('Alice');
    });
  });
});
