import { Err, None, Ok, Option, OptionSomeType, Result, Some } from '../src/index.js';
import { eq, notSupposedToBeCalled } from './util.js';

const someString = Some('foo');
const someNum = new Some(10);

test('basic invariants', () => {
    expect(someString.isSome()).toBeTruthy();
    expect(someNum.isSome()).toBeTruthy();
    expect(None).toBe(None);
    expect(someString.value).toBe('foo');
    expect(someNum.value).toBe(10);

    expect(Option.isOption(someString)).toBe(true);
    expect(Option.isOption(someNum)).toBe(true);
    expect(Option.isOption(None)).toBe(true);
    expect(Option.isOption('foo')).toBe(false);

    expect(None.isSome()).toBe(false);
    expect(None.isNone()).toBe(true);
    expect(someNum.isSome()).toBe(true);
    expect(someNum.isNone()).toBe(false);
});

test('type narrowing', () => {
    const opt = None as Option<string>;
    if (opt.isSome()) {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.value, string>(true);
    } else {
        eq<typeof opt, None>(true);
    }

    if (!opt.isSome()) {
        eq<typeof opt, None>(true);
    } else {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.value, string>(true);
    }

    if (opt.isNone()) {
        eq<typeof opt, None>(true);
    } else {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.value, string>(true);
    }

    if (!opt.isNone()) {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.value, string>(true);
    } else {
        eq<typeof opt, None>(true);
    }

    expect(someString).toBeInstanceOf(Some);
    expect(None).toEqual(None);
});

test('unwrap', () => {
    expect(() => someString.unwrap()).not.toThrow();
    expect(someString.unwrap()).toBe('foo');
    expect(someString.expect('msg')).toBe('foo');
    expect(someString.unwrapOr('bar')).toBe('foo');
    expect(() => None.unwrap()).toThrow(/Tried to unwrap None/);
    expect(() => None.expect('foobar')).toThrow(/foobar/);
    expect(None.unwrapOr('honk')).toBe('honk');
});

test('unwrapOrElse', () => {
    expect(Some('1').unwrapOrElse(notSupposedToBeCalled)).toEqual('1');
    expect(None.unwrapOrElse(() => '2')).toEqual('2');
});

test('map / andThen', () => {
    expect(None.map(() => 1)).toBe(None);
    expect(None.andThen(() => 1)).toBe(None);
    expect(None.andThen(() => Some(1))).toBe(None);

    expect(someString.map(() => 1)).toEqual(Some(1));
    // @ts-expect-error
    someString.andThen(() => 1);
    expect(someString.andThen(() => Some(1))).toEqual(Some(1));

    const mapped = (someString as Option<string>).andThen((val) => Some(!!val));
    expect(mapped).toEqual(Some(true));
    eq<typeof mapped, Option<boolean>>(true);
});

test('mapOr / mapOrElse', () => {
    expect(None.mapOr(1, () => -1)).toEqual(1);
    expect(
        None.mapOrElse(
            () => 1,
            () => -1,
        ),
    ).toEqual(1);

    expect(Some(11).mapOr(1, (val) => val * 2)).toEqual(22);
    expect(
        Some(11).mapOrElse(
            () => {
                throw new Error('Should not happen');
            },
            (val) => val * 2,
        ),
    ).toEqual(22);
});

test('Option.all', () => {
    const some0: Option<number> = Some(3);
    const some1: Option<boolean> = Some(true);
    const some2: Option<string> = Some('hello');

    // Empty cases
    const all0 = Option.all([]);
    expect(all0).toEqual(Some([]));
    eq<typeof all0, Option<[]>>(true);

    const all0Spread = Option.all();
    expect(all0Spread).toEqual(Some([]));
    eq<typeof all0Spread, Option<[]>>(true);

    // All Some
    const all1 = Option.all([some0, some1]);
    expect(all1).toEqual(Some([3, true]));
    eq<typeof all1, Option<[number, boolean]>>(true);

    const all1Spread = Option.all(some0, some1);
    expect(all1Spread).toEqual(Some([3, true]));
    eq<typeof all1Spread, Option<[number, boolean]>>(true);

    // With None
    const all2 = Option.all([some0, None]);
    expect(all2).toEqual(None);
    eq<typeof all2, Option<[number, never]>>(true);

    const all2Spread = Option.all(some0, None);
    expect(all2Spread).toEqual(None);
    eq<typeof all2Spread, Option<[number, never]>>(true);

    // Dynamic array
    const all3 = Option.all([] as Option<string>[]);
    eq<typeof all3, Option<string[]>>(true);

    const all3Spread = Option.all(...([] as Option<string>[]));
    eq<typeof all3Spread, Option<string[]>>(true);

    // Multiple with None in middle
    const all4 = Option.all([some0, some1, some2, None]);
    expect(all4).toEqual(None);
    eq<typeof all4, Option<[number, boolean, string, never]>>(true);

    const all4Spread = Option.all(some0, some1, some2, None);
    expect(all4Spread).toEqual(None);
    eq<typeof all4Spread, Option<[number, boolean, string, never]>>(true);
});

test('Option.any', () => {
    const some0: Option<number> = Some(3);
    const some1: Option<boolean> = Some(true);
    const some2: Option<string> = Some('hello');

    // Empty cases
    const any0 = Option.any([]);
    expect(any0).toEqual(None);
    eq<typeof any0, Option<never>>(true);

    const any0Spread = Option.any();
    expect(any0Spread).toEqual(None);
    eq<typeof any0Spread, Option<never>>(true);

    // All Some - returns first
    const any1 = Option.any([some0, some1]);
    expect(any1).toEqual(Some(3));
    eq<typeof any1, Option<number | boolean>>(true);

    const any1Spread = Option.any(some0, some1);
    expect(any1Spread).toEqual(Some(3));
    eq<typeof any1Spread, Option<number | boolean>>(true);

    // All None
    const any2 = Option.any([None, None]);
    expect(any2).toEqual(None);
    eq<typeof any2, Option<never>>(true);

    const any2Spread = Option.any(None, None);
    expect(any2Spread).toEqual(None);
    eq<typeof any2Spread, Option<never>>(true);

    // Dynamic array
    const any3 = Option.any([] as Option<string>[]);
    eq<typeof any3, Option<string>>(true);

    const any3Spread = Option.any(...([] as Option<string>[]));
    eq<typeof any3Spread, Option<string>>(true);

    // None then Some
    const any4 = Option.any([None, None, some2, some0]);
    expect(any4).toEqual(Some('hello'));
    eq<typeof any4, Option<string | number>>(true);

    const any4Spread = Option.any(None, None, some2, some0);
    expect(any4Spread).toEqual(Some('hello'));
    eq<typeof any4Spread, Option<string | number>>(true);
});

test('Type Helpers', () => {
    eq<OptionSomeType<Option<string>>, string>(true);
    eq<OptionSomeType<Some<string>>, string>(true);
    eq<OptionSomeType<None>, never>(true);
});

test('to string', () => {
    expect(`${Some(1)}`).toEqual('Some(1)');
    expect(`${Some({ name: 'George' })}`).toEqual('Some({"name":"George"})');
    expect(`${None}`).toEqual('None');
});

test('to result', () => {
    const option = Some(1) as Option<number>;
    const result = option.toResult('error');
    eq<typeof result, Result<number, string>>(true);

    expect(result).toMatchResult(Ok(1));

    const option2 = None as Option<number>;
    const result2 = option2.toResult('error');
    eq<typeof result2, Result<number, string>>(true);

    expect(result2).toMatchResult(Err('error'));
});

test('or / orElse', () => {
    expect(None.or(Some(1))).toEqual(Some(1));
    expect(None.orElse(() => Some(1))).toEqual(Some(1));

    expect(Some(1).or(Some(2))).toEqual(Some(1));
    expect(
        Some(1).orElse(() => {
            throw new Error('Call unexpected');
        }),
    ).toEqual(Some(1));
});

test('toAsyncOption()', async () => {
    expect(await Some(1).toAsyncOption().promise).toEqual(Some(1));
    expect(await None.toAsyncOption().promise).toEqual(None);
});

test('iteration', () => {
    const iterator = (Some(1) as Option<number>)[Symbol.iterator]();
    eq<Iterator<number>, typeof iterator>(true);

    expect(Array.from(Some(1))).toEqual([1]);
    expect(Array.from(None)).toEqual([]);
});
