import { diff, patch } from "../diffs";

describe('Diffing', () => {
  it('works on primitives', () => {
    const result = diff(1, 2);
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(['change', '', [1, 2]]);

    const nullResult = diff(1, 1);
    expect(nullResult.length).toEqual(0);
  });

  it('works on objects', () => {
    const result = diff({foo: 'bar'}, {foo: 'baz'});
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(['change', 'foo', ['bar', 'baz']]);

    const del = diff({foo: 'bar'}, {});
    expect(del.length).toEqual(1);
    expect(del[0]).toEqual(['remove', '', [ ['foo', 'bar' ] ]]);

    const ins = diff({foo: 'bar'}, {foo: 'bar', baz: 'blort'});
    expect(ins.length).toEqual(1);
    expect(ins[0]).toEqual(['add', '', [ ['baz', 'blort'] ] ])
  });

  it('works on arrays', () => {
    const change = diff({ foo: ['a'] }, { foo: ['b'] });
    expect(change.length).toEqual(1);
    expect(change[0]).toEqual(['change', ['foo', 0], [ 'a', 'b' ]])

    const del = diff({ foo: ['a', 'b', 'c'] }, { foo: ['a', 'c'] });
    expect(del.length).toEqual(2);
    expect(del[0]).toEqual(['change', ['foo', 1], ['b', 'c']]);
    expect(del[1]).toEqual(['remove', 'foo', [ [ 2, 'c' ]]]);

    const ins = diff({ foo: ['a', 'b'] }, { foo: ['a', 'b', 'c'] });
    expect(ins.length).toEqual(1);
    expect(ins[0]).toEqual(['add', 'foo', [ [2, 'c'] ]]);
  });
});

describe('Patching', () => {
  it('applies a patch', () => {
    const result = patch(
      [['add', '', [ ['baz', 'blort'] ] ]],
      { foo: 'bar' }
    );

    expect(result).toEqual({
      foo: 'bar',
      baz: 'blort'
    })
  })
})
