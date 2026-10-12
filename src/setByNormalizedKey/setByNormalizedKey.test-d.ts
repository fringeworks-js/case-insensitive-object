import setByNormalizedKey from './setByNormalizedKey';

interface User {
  Name: string;
  Age: number;
}

describe('setByNormalizedKey の型', () => {
  it('interfaceで定義したオブジェクトも渡せ、同じ型を返す', () => {
    const user: User = { Name: 'Alice', Age: 30 };
    expectTypeOf(setByNormalizedKey(user, 'name', 'Bob')).toEqualTypeOf<User>();
  });

  it('値の型の和に含まれない値は設定できない', () => {
    const user: User = { Name: 'Alice', Age: 30 };
    // @ts-expect-error 値の型が違う
    setByNormalizedKey(user, 'name', true);
  });
});
