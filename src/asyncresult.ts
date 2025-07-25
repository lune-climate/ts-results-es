import { AsyncOption } from './asyncoption.js';
import { Err, Result, Ok } from './result.js';

/**
 * An async-aware `Result` counterpart.
 *
 * Can be combined with asynchronous code without having to ``await`` anything right until
 * the moment when you're ready to extract the final ``Result`` out of it.
 *
 * Can also be combined with synchronous code for convenience.
 */
export class AsyncResult<T, E> {
    /**
     * A promise that resolves to a synchronous result.
     *
     * You can await it to convert `AsyncResult<T, E>` to `Result<T, E>`, but prefer
     * awaiting `AsyncResult` directly (see: `then()`). Only use this property
     * if you need the underlying Promise for specific use cases.
     */
    promise: Promise<Result<T, E>>;

    /**
     * Constructs an `AsyncResult` from a `Result` or a `Promise` of a `Result`.
     *
     * @example
     * ```typescript
     * const ar = new AsyncResult(Promise.resolve('value'))
     * ```
     */
    constructor(start: Result<T, E> | Promise<Result<T, E>>) {
        this.promise = Promise.resolve(start);
    }

    /**
     * Calls `mapper` if the result is `Ok`, otherwise keeps the `Err` value intact.
     * This function can be used for control flow based on `Result` values.
     *
     * @example
     * ```typescript
     * let goodResult = Ok(1).toAsyncResult()
     * let badResult = Err('boo').toAsyncResult()
     *
     * await goodResult.andThen(async (value) => Ok(value * 2)).promise // Ok(2)
     * await goodResult.andThen(async (value) => Err(`${value} is bad`)).promise // Err('1 is bad')
     * await badResult.andThen(async (value) => Ok(value * 2)).promise // Err('boo')
     * ```
     */
    andThen<T2, E2>(
        mapper: (val: T) => Result<T2, E2> | Promise<Result<T2, E2>> | AsyncResult<T2, E2>,
    ): AsyncResult<T2, E | E2> {
        return this.thenInternal(async (result) => {
            if (result.isErr()) {
                // SAFETY: What we're returning here is Err<E>. That doesn't sit well with
                // TypeScript for some reason, let's explicitly expand the type to what this
                // function is supposed to return.
                return result as Err<E | E2>;
            }
            const mapped = mapper(result.value);
            return mapped instanceof AsyncResult ? mapped.promise : mapped;
        });
    }

    /**
     * Maps an `AsyncResult<T, E>` to `AsyncResult<U, E>` by applying a function to a contained
     * `Ok` value, leaving an `Err` value untouched.
     *
     * This function can be used to compose the results of two functions.
     *
     * @example
     * ```typescript
     * let goodResult = Ok(1).toAsyncResult()
     * let badResult = Err('boo').toAsyncResult()
     *
     * await goodResult.map(async (value) => value * 2).promise // Ok(2)
     * await badResult.andThen(async (value) => value * 2).promise // Err('boo')
     * ```
     */
    map<U>(mapper: (val: T) => U | Promise<U>): AsyncResult<U, E> {
        return this.thenInternal(async (result) => {
            if (result.isErr()) {
                return result;
            }
            return Ok(await mapper(result.value));
        });
    }

    /**
     * Maps an `AsyncResult<T, E>` to `AsyncResult<T, F>` by applying `mapper` to the `Err` value,
     * leaving `Ok` value untouched.
     *
     * @example
     * ```typescript
     * let goodResult = Ok(1).toAsyncResult()
     * let badResult = Err('boo').toAsyncResult()
     *
     * await goodResult.mapErr(async (error) => `Error is ${error}`).promise // Ok(1)
     * await badResult.mapErr(async (error) => `Error is ${error}`).promise // Err('Error is boo')
     * ```
     */
    mapErr<F>(mapper: (val: E) => F | Promise<F>): AsyncResult<T, F> {
        return this.thenInternal(async (result) => {
            if (result.isOk()) {
                return result;
            }
            return Err(await mapper(result.error));
        });
    }

    /**
     * Returns the value from `other` if this `AsyncResult` contains `Err`, otherwise returns self.
     *
     * If `other` is a result of a function call consider using `orElse` instead, it will
     * only evaluate the function when needed.
     *
     * @example
     * ```
     * const badResult = new AsyncResult(Err('Error message'))
     * const goodResult = new AsyncResult(Ok(1))
     *
     * await badResult.or(Ok(123)).promise // Ok(123)
     * await goodResult.or(Ok(123)).promise // Ok(1)
     * ```
     */
    or<E2>(other: Result<T, E2> | AsyncResult<T, E2> | Promise<Result<T, E2>>): AsyncResult<T, E2> {
        return this.orElse(() => other);
    }

    /**
     * Returns the value obtained by calling `other` if this `AsyncResult` contains `Err`, otherwise
     * returns self.
     *
     * @example
     * ```
     * const badResult = new AsyncResult(Err('Error message'))
     * const goodResult = new AsyncResult(Ok(1))
     *
     * await badResult.orElse(() => Ok(123)).promise // Ok(123)
     * await goodResult.orElse(() => Ok(123)).promise // Ok(1)
     * ```
     */
    orElse<E2>(other: (error: E) => Result<T, E2> | AsyncResult<T, E2> | Promise<Result<T, E2>>): AsyncResult<T, E2> {
        return this.thenInternal(async (result) => {
            if (result.isOk()) {
                return result;
            }
            const otherValue = other(result.error);
            return otherValue instanceof AsyncResult ? otherValue.promise : otherValue;
        });
    }

    /**
     * Converts from `AsyncResult<T, E>` to `AsyncOption<T>` so that `Err` is converted to `None`
     * and `Ok` is converted to `Some`.
     */
    toOption(): AsyncOption<T> {
        return new AsyncOption(this.promise.then((result) => result.toOption()));
    }

    /**
     * Makes `AsyncResult` awaitable by implementing the thenable interface.
     * This allows you to use `await` directly on `AsyncResult` instances.
     *
     * See the [Promise.then() documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)
     * for details on the thenable interface.
     *
     * @example
     * ```typescript
     * const asyncResult = new AsyncResult(Ok(42))
     * const result = await asyncResult // Returns Result<number, Error>
     *
     * // Equivalent to:
     * const result2 = await asyncResult.promise
     * ```
     */
    then<TResult1 = Result<T, E>, TResult2 = never>(
        onfulfilled?: ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected);
    }

    private thenInternal<T2, E2>(mapper: (result: Result<T, E>) => Promise<Result<T2, E2>>): AsyncResult<T2, E2> {
        return new AsyncResult(this.promise.then(mapper));
    }
}
