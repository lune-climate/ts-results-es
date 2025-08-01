import {
    Err,
    None,
    Ok,
    Option,
    Result,
    ResultErrType,
    ResultErrTypes,
    ResultOkType,
    ResultOkTypes,
    Some,
} from '../src/index.js';
import { eq, notSupposedToBeCalled } from './util.js';

test('Err<E> | Ok<T> should be Result<T, E>', () => {
    const r1 = Err(0);
    const r2 = new Ok('');
    const r = Math.random() ? r1 : r2;

    expect(Result.isResult(r1)).toEqual(true);
    expect(Result.isResult(r2)).toEqual(true);
    expect(Result.isResult(Some(3))).toEqual(false);
    eq<typeof r, Result<string, number>>(true);
});

test('Type can be narrowed using ok & err', () => {
    const r1 = Ok(0) as Result<number, string>;
    if (r1.isOk()) {
        eq<Ok<number>, typeof r1>(true);
    } else {
        eq<Err<string>, typeof r1>(true);
    }

    if (r1.isErr()) {
        eq<Err<string>, typeof r1>(true);
    } else {
        eq<Ok<number>, typeof r1>(true);
    }
});

test('map', () => {
    const r = new Err(0) as Result<string, number>;
    const r2 = r.map(Symbol);
    eq<typeof r2, Result<symbol, number>>(true);
});

test('andThen', () => {
    const result = new Ok('Ok') as Result<string, boolean>;
    const then = result.andThen(() => new Err('broke') as Result<boolean, string>);
    expect(then).toMatchResult(new Err('broke'));
    function takesResult(result: Result<boolean, string | boolean>): void {}
    takesResult(then);
});

test('mapErr', () => {
    const r = new Err(0) as Result<string, number>;
    const r2 = r.mapErr(Symbol);
    eq<typeof r2, Result<string, symbol>>(true);
});

test('Iterable', () => {
    const r1 = new Ok([true, false]) as Result<boolean[], number>;
    const r1Iter = r1[Symbol.iterator]();
    eq<Iterator<boolean[]>, typeof r1Iter>(true);

    const r2 = new Ok(32) as Result<number, string>;
    const r2Iter = r2[Symbol.iterator]();
    eq<Iterator<number>, typeof r2Iter>(true);
});

test('ResultOkType', () => {
    type a = ResultOkType<Ok<string>>;
    eq<string, a>(true);
    type b = ResultOkType<Err<string>>;
    eq<never, b>(true);
    type c = ResultOkType<Result<string, number>>;
    eq<string, c>(true);
});

test('ResultErrType', () => {
    type a = ResultErrType<Ok<string>>;
    eq<never, a>(true);
    type b = ResultErrType<Err<string>>;
    eq<string, b>(true);
    type c = ResultErrType<Result<string, number>>;
    eq<number, c>(true);
});

test('ResultOkTypes & ResultErrTypes', () => {
    type a = ResultOkTypes<
        [Ok<string>, Err<string>, Result<symbol, number>, Result<never, string>, Ok<32> | Err<boolean>]
    >;
    eq<[string, never, symbol, never, 32], a>(true);

    type b = ResultErrTypes<
        [Ok<string>, Err<string>, Result<symbol, number>, Result<never, symbol>, Ok<boolean> | Err<32>]
    >;
    eq<[never, string, number, symbol, 32], b>(true);
});

test('Result.all', () => {
    const ok0 = Ok(3);
    const ok1 = new Ok(true);
    const ok2 = new Ok(8 as const) as Result<8, boolean>;
    const err0 = Err(Symbol());
    const err1 = new Err(Error());
    const err2 = new Err(9 as const) as Result<boolean, 9>;

    const all0_array = Result.all([]);
    expect(all0_array).toMatchResult(Ok([]));
    eq<typeof all0_array, Result<[], never>>(true);

    const all1Array = Result.all([ok0, ok1]);
    expect(all1Array).toMatchResult(Ok([3, true]));
    eq<typeof all1Array, Result<[number, boolean], never>>(true);

    const all2Array = Result.all([err0, err1]);
    expect(all2Array).toMatchResult(Err(err0.error));
    eq<typeof all2Array, Result<[never, never], symbol | Error>>(true);

    const all3Array = Result.all([] as Result<string, number>[]);
    eq<typeof all3Array, Result<string[], number>>(true);

    const all4Array = Result.all([ok0, ok1, ok2, err2]);
    expect(all4Array).toMatchResult(Err(9));
    eq<typeof all4Array, Result<[number, boolean, 8, boolean], boolean | 9>>(true);
});

test('Result.any', () => {
    const ok0 = new Ok(3);
    const ok1 = new Ok(true);
    const ok2 = new Ok(8 as const) as Result<8, boolean>;
    const err0 = new Err(Symbol());
    const err1 = new Err(Error());
    const err2 = new Err(9 as const) as Result<boolean, 9>;

    const any0Array = Result.any([]);
    expect(any0Array).toMatchResult(Err([]));
    eq<typeof any0Array, Result<never, []>>(true);

    const any1Array = Result.any([ok0, ok1]);
    expect(any1Array).toMatchResult(Ok(3));
    eq<typeof any1Array, Result<number | boolean, [never, never]>>(true);

    const any2Array = Result.any([err0, err1]);
    expect(any2Array).toMatchResult(Err([err0.error, err1.error]));
    eq<typeof any2Array, Result<never, [symbol, Error]>>(true);

    const any3Array = Result.any([] as Result<string, number>[]);
    eq<typeof any3Array, Result<string, number[]>>(true);

    const any4Array = Result.any([err0, err1, err2, ok2]);
    expect(any4Array).toMatchResult(Ok(8));
    eq<typeof any4Array, Result<boolean | 8, [symbol, Error, 9, boolean]>>(true);
});

test('Result.wrap', () => {
    const a = Result.wrap(() => 1);
    expect(a).toMatchResult(Ok(1));
    eq<typeof a, Result<number, unknown>>(true);

    class CustomError {
        readonly message = 'hi';
    }
    const err = new CustomError();

    const b = Result.wrap<number, CustomError>(() => {
        throw err;
    });
    expect(b).toMatchResult(Err(err));
    eq<typeof b, Result<number, CustomError>>(true);
});

test('Result.wrapAsync', async () => {
    const a = await Result.wrapAsync(async () => 1);
    expect(a).toMatchResult(Ok(1));
    eq<typeof a, Result<number, unknown>>(true);

    class CustomError {
        readonly message = 'hi';
    }
    const err = new CustomError();

    const b = await Result.wrapAsync<number, CustomError>(async () => {
        throw err;
    });
    expect(b).toMatchResult(Err(err));
    eq<typeof b, Result<number, CustomError>>(true);

    const c = await Result.wrapAsync<number, string>(() => {
        throw 'thrown before promise';
        return Promise.resolve(3);
    });

    expect(c).toMatchResult(Err('thrown before promise'));
    eq<typeof c, Result<number, string>>(true);
});

test('Result.partition', async () => {
    const ok0 = Ok(3);
    const ok1 = new Ok(true);
    const err0 = Err(Symbol());
    const err1 = new Err(Error());
    const result0 = Ok(3) as unknown as Result<number, symbol>;
    const result1 = new Ok(true) as unknown as Result<boolean, Error>;

    const all0 = Result.partition([]);
    expect(all0).toEqual([[], []]);
    eq<typeof all0, [never[], never[]]>(true);

    const all1 = Result.partition([ok0, ok1, err0, err1]);
    expect(all1).toEqual([
        [ok0.value, ok1.value],
        [err0.error, err1.error],
    ]);
    eq<typeof all1, [(number | boolean)[], (symbol | Error)[]]>(true);

    const all2 = Result.partition([ok0, ok1]);
    expect(all2).toEqual([[ok0.value, ok1.value], []]);
    eq<typeof all2, [(number | boolean)[], never[]]>(true);

    const all3 = Result.partition([err0, err1]);
    expect(all3).toEqual([[], [err0.error, err1.error]]);
    eq<typeof all3, [never[], (symbol | Error)[]]>(true);

    const all4 = Result.partition([1, 2, 3, 4].map((num) => Ok(num) as Result<number, Error>));
    expect(all4).toEqual([[1, 2, 3, 4], []]);
    eq<typeof all4, [number[], Error[]]>(true);

    const all5 = Result.partition([result0, result1]);
    expect(all5).toEqual([[(result0 as Ok<number>).value, (result1 as Ok<boolean>).value], []]);
    eq<typeof all5, [(number | boolean)[], (symbol | Error)[]]>(true);
});

test('safeUnwrap', () => {
    const ok1 = new Ok(3).safeUnwrap();
    expect(ok1).toEqual(3);
    eq<typeof ok1, number>(true);

    const err = new Err('hi');
    const result = new Ok(1) as Result<number, string>;

    expect(() => {
        // @ts-expect-error
        err.safeUnwrap();
    }).toThrowError();

    // @ts-expect-error
    result.safeUnwrap();

    if (result.isOk()) {
        const val = result.safeUnwrap();
        eq<typeof val, number>(true);
        expect(val).toEqual(1);
    } else {
        // @ts-expect-error
        result.safeUnwrap();
    }
});

test('Issue #24', () => {
    const getStatus = (payload: boolean): Result<boolean, Error> => {
        if (payload) {
            return Ok(payload);
        }
        return Err(new Error('Payload is false'));
    };

    // Changed while resolving https://github.com/lune-climate/ts-results-es/issues/197
    // Originally the return type here had Error in the Err position but that's an edge
    // case (attaching a mapper always returning Ok). It was difficult to maintain the
    // existing behavior while fixing the andThen/orElse problems that were much
    // more general and affecting actually idiomatic use of the library.
    const processStatus = (): Result<boolean, unknown> => {
        return getStatus(true)
            .andThen((result) => Ok(result))
            .map((data) => data);
    };
});

test('To option', () => {
    const result = new Ok('hello') as Result<string, number>;
    const option = result.toOption();
    eq<typeof option, Option<string>>(true);
    expect(option).toEqual(Some('hello'));

    const result2: Result<string, number> = new Err(32);
    const option2 = result2.toOption();
    expect(option2).toEqual(None);
});

test('or / orElse', () => {
    const result = Err('boo') as Result<number, string>;

    const afterOrElseAlwaysErr = result.orElse((error) => Err(error === 'boo'));
    eq<typeof afterOrElseAlwaysErr, Result<number | unknown, boolean>>(true);
    const afterOrElseAlwaysOk = result.orElse((_error) => Ok(1));
    eq<typeof afterOrElseAlwaysOk, Result<number | 1, unknown>>(true);
    const afterOrElseAnyResult = result.orElse((error) => (error === 'foo' ? Ok(1) : Err('bar')));
    eq<typeof afterOrElseAnyResult, Result<number | 1, string>>(true);

    const afterOrErr = result.or(Err(true));
    eq<typeof afterOrErr, Result<number, boolean>>(true);
    const afterOrOk = result.or(Ok(1));
    eq<typeof afterOrOk, Result<number, never>>(true);
    const afterOrResult = result.or(Err(true) as Result<number, boolean>);
    eq<typeof afterOrResult, Result<number, boolean>>(true);

    expect(Err('error').or(Ok(1))).toEqual(Ok(1));
    expect(Err('error').orElse((error) => Ok(error.length))).toEqual(Ok(5));

    expect(Ok(1).or(Ok(2))).toEqual(Ok(1));
    expect(
        Ok(1).orElse((_error) => {
            throw new Error('Call unexpected');
        }),
    ).toEqual(Ok(1));
});

test('toAsyncResult()', async () => {
    expect(await Ok(1).toAsyncResult().promise).toEqual(Ok(1));
    const err = Err('error');
    expect(await err.toAsyncResult().promise).toEqual(err);
});

test('unwrapOrElse', () => {
    expect(Ok({ data: 'user data' }).unwrapOrElse(notSupposedToBeCalled)).toEqual({ data: 'user data' });
    expect(Err('bad error').unwrapOrElse((error) => ({ error }))).toEqual({ error: 'bad error' });
});

test('andThen/orElse chaining regression', () => {
    // Based on this issue: https://github.com/lune-climate/ts-results-es/issues/197
    class T1 {
        name = 'T1' as const;
    }
    class T2 {
        name = 'T2' as const;
    }
    class T3 {
        name = 'T3' as const;
    }
    class E1 {
        name = 'E1' as const;
    }
    class E2 {
        name = 'E2' as const;
    }
    class E3 {
        name = 'E3' as const;
    }

    function foo1(): Result<T1, E1> {
        return Ok({ name: 'T1' });
    }
    function foo2(): Result<T2, E2> {
        return Ok({ name: 'T2' });
    }
    function foo3(): Result<T3, E3> {
        return Ok({ name: 'T3' });
    }

    // The orElse line used to produce this error:
    //
    // This expression is not callable.
    // Each member of the union type ... has signatures, but none of those signatures are compatible with each other. (ts 2349)
    const test1 = foo1()
        .andThen(() => foo2())
        .orElse(() => foo3());

    expect(test1).toEqual(Ok({ name: 'T2' }));
    eq<typeof test1, Ok<T2> | Ok<T3> | Err<E3>>(true);

    // Test the opposite order too just to be sure
    const test2 = foo1()
        .orElse(() => foo2())
        .andThen(() => foo3());

    expect(test2).toEqual(Ok({ name: 'T3' }));
    eq<typeof test2, Ok<T3> | Err<E3> | Err<E2 | E3>>(true);
});
