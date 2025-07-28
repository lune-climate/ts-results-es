import { assert } from 'conditional-type-checks';
import { Err, Ok, Result } from '../src/index.js';
import { eq, expect_never, expect_string } from './util.js';

test('Constructable & Callable', () => {
    const a = new Ok(3);
    expect(a).toBeInstanceOf(Ok);
    eq<typeof a, Ok<number>>(true);

    const b = Ok(3);
    expect(b).toBeInstanceOf(Ok);
    eq<typeof b, Ok<number>>(true);

    function mapper<T>(fn: (val: string) => T): T {
        return fn('hi');
    }

    const mapped = mapper(Ok);
    expect(mapped).toMatchResult(new Ok('hi'));

    // TODO: This should work!
    // eq<typeof mapped, Ok<string>>(true);

    // @ts-expect-error Ok<string> is not assignable to Ok<number>
    mapper<Ok<number>>(Ok);
});

test('ok, err, and val', () => {
    const err = new Ok(32);
    expect(err.isErr()).toBe(false);

    expect(err.isOk()).toBe(true);

    expect(err.value).toBe(32);
    eq<typeof err.value, number>(true);
});

test('static EMPTY', () => {
    expect(Ok.EMPTY).toBeInstanceOf(Ok);
    expect(Ok.EMPTY.value).toBe(undefined);
    eq<typeof Ok.EMPTY, Ok<void>>(true);
});

test('else, unwrapOr', () => {
    const e1 = Ok(3).else(false);
    expect(e1).toBe(3);
    eq<number, typeof e1>(true);

    const e2 = Ok(3).unwrapOr(false);
    expect(e2).toBe(3);
    eq<number, typeof e2>(true);
});

test('expect', () => {
    const val = Ok(true).expect('should not fail!');
    expect(val).toBe(true);
    eq<boolean, typeof val>(true);
});

test('expectErr', () => {
    expect(() => {
        const val = Ok(true).expectErr('should fail!');
        expect_never(val, true);
    }).toThrowError('should fail!');
});

test('unwrap', () => {
    const val = Ok(true).unwrap();
    expect(val).toBe(true);
    eq<boolean, typeof val>(true);
});

test('unwrapErr', () => {
    try {
        const err = Ok('boom').unwrapErr();
        expect_never(err, true);
        throw new Error('Unreachable');
    } catch (e) {
        expect((e as Error).message).toMatch('boom');
        expect((e as Error).cause).toEqual('boom');
    }
});

test('map', () => {
    const mapped = Ok(3).map((x) => x.toString(10));
    expect(mapped).toMatchResult(Ok('3'));
    eq<typeof mapped, Ok<string>>(true);
});

test('andThen', () => {
    const ok = new Ok('Ok').andThen(() => new Ok(3));
    expect(ok).toMatchResult(Ok(3));
    eq<typeof ok, Result<number, unknown>>(true);

    const err = new Ok('Ok').andThen(() => new Err(false));
    expect(err).toMatchResult(Err(false));
    eq<typeof err, Result<unknown, boolean>>(true);
});

test('mapErr', () => {
    const ok = Ok('32').mapErr((x: any) => +x);
    expect(ok).toMatchResult(Ok('32'));
    eq<typeof ok, Ok<string>>(true);
});

test('mapOr / mapOrElse', () => {
    expect(Ok(11).mapOr(1, (val) => val * 2)).toEqual(22);
    expect(
        Ok(11).mapOrElse(
            (_error) => 1,
            (val) => val * 2,
        ),
    ).toEqual(22);
});

test('iterable', () => {
    expect(Array.from(Ok('hello'))).toEqual(['hello']);
    expect(Array.from(Ok([1, 2, 3]))).toEqual([[1, 2, 3]]);
    expect(Array.from(Ok(1))).toEqual([1]);
});

test('to string', () => {
    expect(`${Ok(1)}`).toEqual('Ok(1)');
    expect(`${Ok({ name: 'George' })}`).toEqual('Ok({"name":"George"})');
});
