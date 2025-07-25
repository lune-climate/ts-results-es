import { AsyncResult } from './asyncresult.js';
import { Option, Some } from './option.js';

/**
 * An async-aware `Option` counterpart.
 *
 * Can be combined with asynchronous code without having to ``await`` anything right until
 * the moment when you're ready to extract the final ``Option`` out of it.
 *
 * Can also be combined with synchronous code for convenience.
 */
export class AsyncOption<T> {
    /**
     * A promise that resolves to a synchronous ``Option``.
     *
     * Await it to convert `AsyncOption<T>` to `Option<T>`.
     */
    promise: Promise<Option<T>>;

    /**
     * Constructs an `AsyncOption` from an `Option` or a `Promise` of an `Option`.
     *
     * @example
     * ```typescript
     * const option = new AsyncOption(Promise.resolve(Some('username')))
     * ```
     */
    constructor(start: Option<T> | Promise<Option<T>>) {
        this.promise = Promise.resolve(start);
    }

    /**
     * Calls `mapper` if the option is `Some`, otherwise keeps the `None` value intact.
     * This function can be used for control flow based on `Option` values.
     *
     * @example
     * ```typescript
     * let hasValue = Some(1).toAsyncOption()
     * let noValue = None.toAsyncOption()
     *
     * await hasValue.andThen(async (value) => Some(value * 2)).promise // Some(2)
     * await hasValue.andThen(async (value) => None).promise // None
     * await noValue.andThen(async (value) => Some(value * 2)).promise // None
     * ```
     */
    andThen<T2>(mapper: (val: T) => Option<T2> | Promise<Option<T2>> | AsyncOption<T2>): AsyncOption<T2> {
        return this.thenInternal(async (option) => {
            if (option.isNone()) {
                return option;
            }
            const mapped = mapper(option.value);
            return mapped instanceof AsyncOption ? mapped.promise : mapped;
        });
    }

    /**
     * Maps an `AsyncOption<T>` to `AsyncOption<U>` by applying a function to a contained
     * `Some` value, leaving a `None` value untouched.
     *
     * This function can be used to compose the results of two functions.
     *
     * @example
     * ```typescript
     * let hasValue = Some(1).toAsyncOption()
     * let noValue = None.toAsyncOption()
     *
     * await hasValue.map(async (value) => value * 2).promise // Some(2)
     * await noValue.map(async (value) => value * 2).promise // None
     * ```
     */
    map<U>(mapper: (val: T) => U | Promise<U>): AsyncOption<U> {
        return this.thenInternal(async (option) => {
            if (option.isNone()) {
                return option;
            }
            return Some(await mapper(option.value));
        });
    }

    /**
     * Returns the value from `other` if this `AsyncOption` contains `None`, otherwise returns self.
     *
     * If `other` is a result of a function call consider using `orElse` instead, it will
     * only evaluate the function when needed.
     *
     * @example
     * ```
     * const noValue = new AsyncOption(None)
     * const hasValue = new AsyncOption(Some(1))
     *
     * await noValue.or(Some(123)).promise // Some(123)
     * await hasValue.or(Some(123)).promise // Some(1)
     * ```
     */
    or<U>(other: Option<U> | AsyncOption<U> | Promise<Option<U>>): AsyncOption<T | U> {
        return this.orElse(() => other);
    }

    /**
     * Returns the value obtained by calling `other` if this `AsyncOption` contains `None`, otherwise
     * returns self.
     *
     * @example
     * ```
     * const noValue = new AsyncOption(None)
     * const hasValue = new AsyncOption(Some(1))
     *
     * await noValue.orElse(() => Some(123)).promise // Some(123)
     * await hasValue.orElse(() => Some(123)).promise // Some(1)
     * ```
     */
    orElse<U>(other: () => Option<U> | AsyncOption<U> | Promise<Option<U>>): AsyncOption<T | U> {
        return this.thenInternal(async (option): Promise<Option<T | U>> => {
            if (option.isSome()) {
                return option;
            }
            const otherValue = other();
            return otherValue instanceof AsyncOption ? otherValue.promise : otherValue;
        });
    }

    /**
     * Converts an `AsyncOption<T>` to an `AsyncResult<T, E>` so that `None` is converted to
     * `Err(error)` and `Some` is converted to `Ok`.
     */
    toResult<E>(error: E): AsyncResult<T, E> {
        return new AsyncResult(this.promise.then((option) => option.toResult(error)));
    }

    private thenInternal<T2>(mapper: (option: Option<T>) => Promise<Option<T2>>): AsyncOption<T2> {
        return new AsyncOption(this.promise.then(mapper));
    }
}
