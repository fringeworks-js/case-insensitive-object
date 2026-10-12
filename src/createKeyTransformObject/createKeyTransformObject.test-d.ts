import createKeyTransformObject from './createKeyTransformObject';

const toLower = (key: string) => key.toLowerCase();

describe('createKeyTransformObject の型', () => {
  it('targetから推論したキーに型が付き、別名と定義外のキーはunknown', () => {
    const obj = createKeyTransformObject(toLower, {
      target: { Name: 'Alice' },
    });
    expectTypeOf(obj.Name).toEqualTypeOf<string | undefined>();
    expectTypeOf(obj.name).toEqualTypeOf<unknown>();
    expectTypeOf(obj['x-foo']).toEqualTypeOf<unknown>();
  });

  it('型引数とkeysでtargetにないキーにも型が付く', () => {
    const obj = createKeyTransformObject<{ Name: string; Age: number }>(
      toLower,
      { keys: ['Name', 'Age'] },
    );
    expectTypeOf(obj.Age).toEqualTypeOf<number | undefined>();
    // @ts-expect-error 値の型が違う
    obj.Age = 'thirty';
  });

  it('keysの打ち間違いは型エラーになる', () => {
    // @ts-expect-error 定義にないキー
    createKeyTransformObject<{ Name: string }>(toLower, { keys: ['Nmae'] });
  });

  it('Symbolキーも扱える', () => {
    const sym = Symbol('key');
    const obj = createKeyTransformObject<Record<symbol, string>>(toLower);
    expectTypeOf(obj[sym]).toEqualTypeOf<string | undefined>();
  });
});
