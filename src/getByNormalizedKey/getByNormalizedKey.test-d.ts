import getByNormalizedKey from './getByNormalizedKey';

interface User {
  Name: string;
  Age: number;
}

describe('getByNormalizedKey の型', () => {
  it('interfaceで定義したオブジェクトも渡せ、値の型の和を返す', () => {
    const user: User = { Name: 'Alice', Age: 30 };
    expectTypeOf(getByNormalizedKey(user, 'name')).toEqualTypeOf<
      string | number | undefined
    >();
  });

  it('Recordの値の型を返す', () => {
    const data: Record<string, boolean> = {};
    expectTypeOf(getByNormalizedKey(data, 'key')).toEqualTypeOf<
      boolean | undefined
    >();
  });
});
