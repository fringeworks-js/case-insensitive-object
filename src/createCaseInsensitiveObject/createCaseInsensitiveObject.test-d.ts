import createCaseInsensitiveObject from './createCaseInsensitiveObject';

type Headers = { 'Content-Type': string; Accept: string };

describe('createCaseInsensitiveObject の型', () => {
  const obj = createCaseInsensitiveObject({
    target: { 'Content-Type': 'text/html', Count: 1 },
  });

  it('targetから推論したキーは、本来のキー・小文字・大文字で型が付く', () => {
    expectTypeOf(obj['Content-Type']).toEqualTypeOf<string | undefined>();
    expectTypeOf(obj['content-type']).toEqualTypeOf<string | undefined>();
    expectTypeOf(obj['CONTENT-TYPE']).toEqualTypeOf<string | undefined>();
    expectTypeOf(obj.count).toEqualTypeOf<number | undefined>();
  });

  it('定義外のキーはunknown', () => {
    expectTypeOf(obj['Content-type']).toEqualTypeOf<unknown>();
    expectTypeOf(obj['x-foo']).toEqualTypeOf<unknown>();
  });

  it('型が違う値は設定できない', () => {
    // @ts-expect-error 値の型が違う
    obj['content-type'] = 1;
    obj['x-foo'] = 1;
  });

  it('型引数とkeysでtargetにないキーにも型が付く', () => {
    const headers = createCaseInsensitiveObject<Headers>({
      keys: ['Content-Type', 'Accept'],
    });
    expectTypeOf(headers.accept).toEqualTypeOf<string | undefined>();
    expectTypeOf(headers['CONTENT-TYPE']).toEqualTypeOf<string | undefined>();
  });

  it('keysの打ち間違いは型エラーになる', () => {
    // @ts-expect-error 定義にないキー
    createCaseInsensitiveObject<Headers>({ keys: ['Acept'] });
  });

  it('caseSensitive: trueでは別名に型が付かない', () => {
    const sensitive = createCaseInsensitiveObject({
      target: { Name: 'Alice' },
      caseSensitive: true,
    });
    expectTypeOf(sensitive.Name).toEqualTypeOf<string | undefined>();
    expectTypeOf(sensitive.name).toEqualTypeOf<unknown>();
  });

  it('型引数を明示してもcaseSensitive: trueを指定できる', () => {
    const sensitive = createCaseInsensitiveObject<Headers>({
      caseSensitive: true,
    });
    expectTypeOf(sensitive.Accept).toEqualTypeOf<string | undefined>();
    expectTypeOf(sensitive.accept).toEqualTypeOf<unknown>();
  });

  it('caseSensitiveがbooleanの場合は別名に型が付かない', () => {
    const caseSensitive = Math.random() > 0.5;
    const unknownCase = createCaseInsensitiveObject({
      target: { Name: 'Alice' },
      caseSensitive,
    });
    expectTypeOf(unknownCase.name).toEqualTypeOf<unknown>();
  });

  it('引数を省略した場合はすべてのキーがunknown', () => {
    const empty = createCaseInsensitiveObject();
    expectTypeOf(empty['anything']).toEqualTypeOf<unknown>();
  });
});
