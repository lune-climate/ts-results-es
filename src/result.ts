import { toString } from './utils.js';
import { Option, None, Some } from './option.js';
import { AsyncResult } from './asyncresult.js';

/*
 * Missing Rust Result type methods:
 * pub fn contains<U>(&self, x: &U) -> bool
 * pub fn contains_err<F>(&self, f: &F) -> bool
 * pub fn and<U>(self, res: Result<U, E>) -> Result<U, E>
 * pub fn expect_err(self, msg: &str) -> E
 * pub fn unwrap_or_default(self) -> T
 */
interface BaseResult<T, E> extends Iterable<T> {
    /** `true` when the result is Ok */
    isOk(): this is OkImpl<T>;

    /** `true` when the result is Err */
    isErr(): this is ErrImpl<E>;

    /**
     * Returns the contained `Ok` value, if exists.  Throws an error if not.
     *
     * The thrown error's
     * [`cause'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
     * is set to value contained in `Err`.
     *
     * If you know you're dealing with `Ok` and the compiler knows it too (because you tested
     * `isOk()` or `isErr()`) you should use `value` instead. While `Ok`'s `expect()` and `value` will
     * both return the same value using `value` is preferable because it makes it clear that
     * there won't be an exception thrown on access.
     *
     * @param msg the message to throw if no Ok value.
     */
    expect(msg: string): T;

    /**
     * Returns the contained `Err` value, if exists.  Throws an error if not.
     * @param msg the message to throw if no Err value.
     */
    expectErr(msg: string): E;

    /**
     * Returns the contained `Ok` value.
     * Because this function may throw, its use is generally discouraged.
     * Instead, prefer to handle the `Err` case explicitly.
     *
     * If you know you're dealing with `Ok` and the compiler knows it too (because you tested
     * `isOk()` or `isErr()`) you should use `value` instead. While `Ok`'s `unwrap()` and `value` will
     * both return the same value using `value` is preferable because it makes it clear that
     * there won't be an exception thrown on access.
     *
     * Throws if the value is an `Err`, with a message provided by the `Err`'s value and
     * [`cause'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
     * set to the value.
     */
    unwrap(): T;

    /**
     * Returns the contained `Err` value.
     * Because this function may throw, its use is generally discouraged.
     * Instead, prefer to handle the `Ok` case explicitly and access the `error` property
     * directly.
     *
     * Throws if the value is an `Ok`, with a message provided by the `Ok`'s value and
     * [`cause'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
     * set to the value.
     */
    unwrapErr(): E;

    /**
     * Returns the contained `Ok` value or a provided default.
     *
     *  @see unwrapOr
     *  @deprecated in favor of unwrapOr
     */
    else<T2>(val: T2): T | T2;

    /**
     * Returns the contained `Ok` value or a provided default.
     *
     *  (This is the `unwrap_or` in rust)
     */
    unwrapOr<T2>(val: T2): T | T2;

    /**
     * Returns the contained `Ok` value or computes a value with a provided function.
     *
     * The function is called at most one time, only if needed.
     *
     * @example
     * ```
     * Ok('OK').unwrapOrElse(
     *     (error) => { console.log(`Called, got ${error}`); return 'UGH'; }
     * ) // => 'OK', nothing printed
     *
     * Err('A03B').unwrapOrElse((error) => `UGH, got ${error}`) // => 'UGH, got A03B'
     * ```
     */
    unwrapOrElse<T2>(f: (error: E) => T2): T | T2;

    /**
     * Calls `mapper` if the result is `Ok`, otherwise returns the `Err` value of self.
     * This function can be used for control flow based on `Result` values.
     */
    andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E | E2>;

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
     * leaving an `Err` value untouched.
     *
     * This function can be used to compose the results of two functions.
     */
    map<U>(mapper: (val: T) => U): Result<U, E>;

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value,
     * leaving an `Ok` value untouched.
     *
     * This function can be used to pass through a successful result while handling an error.
     */
    mapErr<F>(mapper: (val: E) => F): Result<T, F>;

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by either converting `T` to `U` using `mapper`
     * (in case of `Ok`) or using the `default_` value (in case of `Err`).
     *
     * If `default` is a result of a function call consider using `mapOrElse` instead, it will
     * only evaluate the function when needed.
     */
    mapOr<U>(default_: U, mapper: (val: T) => U): U;

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by either converting `T` to `U` using `mapper`
     * (in case of `Ok`) or producing a default value using the `default` function (in case of
     * `Err`).
     */
    mapOrElse<U>(default_: (error: E) => U, mapper: (val: T) => U): U;

    /**
     * Returns `Ok()` if we have a value, otherwise returns `other`.
     *
     * `other` is evaluated eagerly. If `other` is a result of a function
     * call try `orElse()` instead – it evaluates the parameter lazily.
     *
     * @example
     *
     * Ok(1).or(Ok(2)) // => Ok(1)
     * Err('error here').or(Ok(2)) // => Ok(2)
     */
    or<E2>(other: Result<T, E2>): Result<T, E2>;

    /**
     * Returns `Ok()` if we have a value, otherwise returns the result
     * of calling `other()`.
     *
     * `other()` is called *only* when needed and is passed the error value in a parameter.
     *
     * @example
     *
     * Ok(1).orElse(() => Ok(2)) // => Ok(1)
     * Err('error').orElse(() => Ok(2)) // => Ok(2)
     */
    orElse<T2, E2>(other: (error: E) => Result<T2, E2>): Result<T | T2, E2>;

    /**
     *  Converts from `Result<T, E>` to `Option<T>`, discarding the error if any
     *
     *  Similar to rust's `ok` method
     */
    toOption(): Option<T>;

    /**
     * Creates an `AsyncResult` based on this `Result`.
     *
     * Useful when you need to compose results with asynchronous code.
     */
    toAsyncResult(): AsyncResult<T, E>;
}

/**
 * Contains the error value
 */
export class ErrImpl<E> implements BaseResult<never, E> {
    /** An empty Err */
    static readonly EMPTY = new ErrImpl<void>(undefined);

    isOk(): this is OkImpl<never> {
        return false;
    }

    isErr(): this is ErrImpl<E> {
        return true;
    }

    readonly error!: E;

    private readonly _stack!: string;

    [Symbol.iterator](): Iterator<never, never, any> {
        return {
            next(): IteratorResult<never, never> {
                return { done: true, value: undefined! };
            },
        };
    }

    constructor(val: E) {
        if (!(this instanceof ErrImpl)) {
            return new ErrImpl(val);
        }

        this.error = val;

        const stackLines = new Error().stack!.split('\n').slice(2);
        if (stackLines && stackLines.length > 0 && stackLines[0].includes('ErrImpl')) {
            stackLines.shift();
        }

        this._stack = stackLines.join('\n');
    }

    /**
     * @deprecated in favor of unwrapOr
     * @see unwrapOr
     */
    else<T2>(val: T2): T2 {
        return val;
    }

    unwrapOr<T2>(val: T2): T2 {
        return val;
    }

    unwrapOrElse<T2>(f: (error: E) => T2): T2 {
        return f(this.error);
    }

    expect(msg: string): never {
        // The cause casting required because of the current TS definition being overly restrictive
        // (the definition says it has to be an Error while it can be anything).
        // See https://github.com/microsoft/TypeScript/issues/45167
        throw new Error(`${msg} - Error: ${toString(this.error)}\n${this._stack}`, { cause: this.error as any });
    }

    expectErr(_msg: string): E {
        return this.error;
    }

    unwrap(): never {
        // The cause casting required because of the current TS definition being overly restrictive
        // (the definition says it has to be an Error while it can be anything).
        // See https://github.com/microsoft/TypeScript/issues/45167
        throw new Error(`Tried to unwrap Error: ${toString(this.error)}\n${this._stack}`, { cause: this.error as any });
    }

    unwrapErr(): E {
        return this.error;
    }

    map(_mapper: unknown): Err<E> {
        return this;
    }

    andThen<T2, E2>(op: (val: never) => Result<T2, E2>): Result<T2, E | E2> {
        return this;
    }

    mapErr<E2>(mapper: (err: E) => E2): Err<E2> {
        return new Err(mapper(this.error));
    }

    mapOr<U>(default_: U, _mapper: unknown): U {
        return default_;
    }

    mapOrElse<U>(default_: (error: E) => U, _mapper: unknown): U {
        return default_(this.error);
    }

    or<T>(other: Ok<T>): Result<T, never>;
    or<R extends Result<any, any>>(other: R): R;
    or<T, E2>(other: Result<T, E2>): Result<T, E2> {
        return other;
    }

    orElse<T2, E2>(other: (error: E) => Result<T2, E2>): Result<T2, E2> {
        return other(this.error);
    }

    toOption(): Option<never> {
        return None;
    }

    toString(): string {
        return `Err(${toString(this.error)})`;
    }

    get stack(): string | undefined {
        return `${this}\n${this._stack}`;
    }

    toAsyncResult(): AsyncResult<never, E> {
        return new AsyncResult(this);
    }
}

// This allows Err to be callable - possible because of the es5 compilation target
export const Err = ErrImpl as typeof ErrImpl & (<E>(err: E) => Err<E>);
export type Err<E> = ErrImpl<E>;

/**
 * Contains the success value
 */
export class OkImpl<T> implements BaseResult<T, never> {
    static readonly EMPTY = new OkImpl<void>(undefined);

    isOk(): this is OkImpl<T> {
        return true;
    }

    isErr(): this is ErrImpl<never> {
        return false;
    }

    readonly value!: T;

    [Symbol.iterator](): Iterator<T> {
        return [this.value][Symbol.iterator]();
    }

    constructor(val: T) {
        if (!(this instanceof OkImpl)) {
            return new OkImpl(val);
        }

        this.value = val;
    }

    /**
     * @see unwrapOr
     * @deprecated in favor of unwrapOr
     */
    else(_val: unknown): T {
        return this.value;
    }

    unwrapOr(_val: unknown): T {
        return this.value;
    }

    unwrapOrElse(_f: unknown): T {
        return this.value;
    }

    expect(_msg: string): T {
        return this.value;
    }

    expectErr(msg: string): never {
        throw new Error(msg);
    }

    unwrap(): T {
        return this.value;
    }

    unwrapErr(): never {
        // The cause casting required because of the current TS definition being overly restrictive
        // (the definition says it has to be an Error while it can be anything).
        // See https://github.com/microsoft/TypeScript/issues/45167
        throw new Error(`Tried to unwrap Ok: ${toString(this.value)}`, { cause: this.value as any });
    }

    map<T2>(mapper: (val: T) => T2): Ok<T2> {
        return new Ok(mapper(this.value));
    }

    andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E2> {
        return mapper(this.value);
    }

    mapErr(_mapper: unknown): Ok<T> {
        return this;
    }

    mapOr<U>(_default_: U, mapper: (val: T) => U): U {
        return mapper(this.value);
    }

    mapOrElse<U>(_default_: (_error: never) => U, mapper: (val: T) => U): U {
        return mapper(this.value);
    }

    or(_other: Result<T, any>): Ok<T> {
        return this;
    }

    orElse<T2, E2>(_other: (error: never) => Result<T2, E2>): Result<T, never> {
        return this;
    }

    toOption(): Option<T> {
        return Some(this.value);
    }

    /**
     * Returns the contained `Ok` value, but never throws.
     * Unlike `unwrap()`, this method doesn't throw and is only callable on an Ok<T>
     *
     * Therefore, it can be used instead of `unwrap()` as a maintainability safeguard
     * that will fail to compile if the error type of the Result is later changed to an error that can actually occur.
     *
     * (this is the `into_ok()` in rust)
     */
    safeUnwrap(): T {
        return this.value;
    }

    toString(): string {
        return `Ok(${toString(this.value)})`;
    }

    toAsyncResult(): AsyncResult<T, never> {
        return new AsyncResult(this);
    }
}

// This allows Ok to be callable - possible because of the es5 compilation target
export const Ok = OkImpl as typeof OkImpl & (<T>(val: T) => Ok<T>);
export type Ok<T> = OkImpl<T>;

export type Result<T, E> = Ok<T> | Err<E>;

export type ResultOkType<T extends Result<any, any>> = T extends Ok<infer U> ? U : never;
export type ResultErrType<T> = T extends Err<infer U> ? U : never;

export type ResultOkTypes<T extends Result<any, any>[]> = {
    [key in keyof T]: T[key] extends Result<infer U, any> ? ResultOkType<T[key]> : never;
};
export type ResultErrTypes<T extends Result<any, any>[]> = {
    [key in keyof T]: T[key] extends Result<infer U, any> ? ResultErrType<T[key]> : never;
};

export namespace Result {
    /**
     * Parse a set of `Result`s, returning an array of all `Ok` values.
     * Short circuits with the first `Err` found, if any
     */
    export function all<const T extends Result<any, any>[]>(
        results: T,
    ): Result<ResultOkTypes<T>, ResultErrTypes<T>[number]> {
        const okResult = [];
        for (let result of results) {
            if (result.isOk()) {
                okResult.push(result.value);
            } else {
                return result as Err<ResultErrTypes<T>[number]>;
            }
        }

        return new Ok(okResult as ResultOkTypes<T>);
    }

    /**
     * Parse a set of `Result`s, short-circuits when an input value is `Ok`.
     * If no `Ok` is found, returns an `Err` containing the collected error values
     */
    export function any<const T extends Result<any, any>[]>(
        results: T,
    ): Result<ResultOkTypes<T>[number], ResultErrTypes<T>> {
        const errResult = [];

        // short-circuits
        for (const result of results) {
            if (result.isOk()) {
                return result as Ok<ResultOkTypes<T>[number]>;
            } else {
                errResult.push(result.error);
            }
        }

        // it must be a Err
        return new Err(errResult as ResultErrTypes<T>);
    }

    /**
     * Wrap an operation that may throw an Error (`try-catch` style) into checked exception style
     * @param op The operation function
     */
    export function wrap<T, E = unknown>(op: () => T): Result<T, E> {
        try {
            return new Ok(op());
        } catch (e) {
            return new Err<E>(e as E);
        }
    }

    /**
     * Wrap an async operation that may throw an Error (`try-catch` style) into checked exception style
     * @param op The operation function
     */
    export function wrapAsync<T, E = unknown>(op: () => Promise<T>): Promise<Result<T, E>> {
        try {
            return op()
                .then((val) => new Ok(val))
                .catch((e) => new Err(e));
        } catch (e) {
            return Promise.resolve(new Err(e as E));
        }
    }

    /**
     * Partitions a set of results, separating the `Ok` and `Err` values.
     */
    export function partition<T extends Result<any, any>[]>(results: T): [ResultOkTypes<T>, ResultErrTypes<T>] {
        return results.reduce(
            ([oks, errors], v) =>
                v.isOk()
                    ? [[...oks, v.value] as ResultOkTypes<T>, errors]
                    : [oks, [...errors, v.error] as ResultErrTypes<T>],
            [[], []] as [ResultOkTypes<T>, ResultErrTypes<T>],
        );
    }

    export function isResult<T = any, E = any>(val: unknown): val is Result<T, E> {
        return val instanceof Err || val instanceof Ok;
    }
}
