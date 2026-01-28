import { MonoTypeOperatorFunction, Observable, ObservableInput, of, OperatorFunction } from 'rxjs';
import { filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Err, Ok, Result } from '../index.js';

/**
 * Allows you to do the same actions as the normal rxjs `map` operator on a stream of Result objects.
 *
 * @example
 * ```typescript
 * import { of, Observable } from 'rxjs';
 * import { Ok, Err, Result } from 'ts-results-es';
 * import { resultMap } from 'ts-results-es/rxjs-operators';
 *
 * const obs$: Observable<Result<number, Error>> = of(Ok(5), Err('uh oh'));
 *
 * const greaterThanZero = obs$.pipe(
 *     resultMap((number) => number > 0), // Return true for values greater zero
 * ); // Has type Observable<Result<boolean, 'uh oh'>>
 *
 * greaterThanZero.subscribe((result) => {
 *     if (result.isOk()) {
 *         console.log('Was greater than zero: ' + result.value);
 *     } else {
 *         console.log('Got Error Message: ' + result.error);
 *     }
 * });
 *
 * // Logs the following:
 * // Was greater than zero: true
 * // Got Error Message: uh oh
 * ```
 */
export function resultMap<T, T2, E>(mapper: (val: T) => T2): OperatorFunction<Result<T, E>, Result<T2, E>> {
    return (source) => {
        return source.pipe(map((result) => result.map(mapper)));
    };
}

/**
 * Behaves exactly the same as `resultMap`, but maps the error value.
 */
export function resultMapErr<T, E, E2>(mapper: (val: E) => E2): OperatorFunction<Result<T, E>, Result<T, E2>> {
    return (source) => {
        return source.pipe(map((result) => result.mapErr(mapper)));
    };
}

/**
 * Behaves the same as `resultMap`, but takes a value instead of a function.
 */
export function resultMapTo<T, T2, E>(value: T2): OperatorFunction<Result<T, E>, Result<T2, E>> {
    return (source) => {
        return source.pipe(map((result) => result.map(() => value)));
    };
}

/**
 * Behaves the same as `resultMapErr`, but takes a value instead of a function.
 */
export function resultMapErrTo<T, E, E2>(value: E2): OperatorFunction<Result<T, E>, Result<T, E2>> {
    return (source) => {
        return source.pipe(map((result) => result.mapErr(() => value)));
    };
}

/**
 * Allows you to turn a stream of Result objects into a stream of values,
 * transforming any errors into a value.
 *
 * Similar to calling the `else` function, but works on a stream of Result objects.
 *
 * @example
 * ```typescript
 * import { of, Observable } from 'rxjs';
 * import { Ok, Err, Result } from 'ts-results-es';
 * import { elseMap } from 'ts-results-es/rxjs-operators';
 *
 * const obs$: Observable<Result<number, Error>> = of(Ok(5), Err(new Error('uh oh')));
 *
 * const doubled = obs$.pipe(
 *     elseMap((err) => {
 *         console.log('Got error: ' + err.message);
 *
 *         return -1;
 *     }),
 * ); // Has type Observable<number>
 *
 * doubled.subscribe((number) => {
 *     console.log('Got number: ' + number);
 * });
 *
 * // Logs the following:
 * // Got number: 5
 * // Got error: uh oh
 * // Got number: -1
 * ```
 */
export function elseMap<T, E, E2>(mapper: (val: E) => E2): OperatorFunction<Result<T, E>, T | E2> {
    return (source) => {
        return source.pipe(
            map((result) => {
                if (result.isErr()) {
                    return mapper(result.error);
                } else {
                    return result.value;
                }
            }),
        );
    };
}

/**
 * Behaves the same as `elseMap`, but takes a value instead of a function.
 */
export function elseMapTo<T, E, E2>(value: E2): OperatorFunction<Result<T, E>, T | E2> {
    return (source) => {
        return source.pipe(
            map((result) => {
                if (result.isErr()) {
                    return value;
                } else {
                    return result.value;
                }
            }),
        );
    };
}

/**
 * Allows you to do the same actions as the normal rxjs `switchMap` operator on a stream of Result objects.
 *
 * Merging or switching from a stream of `Result<T, E>` objects onto a stream of `<T2>` objects
 * turns the stream into a stream of `Result<T2, E>` objects.
 *
 * Merging or switching from a stream of `Result<T, E>` objects onto a stream of `Result<T2, E2>`
 * objects turn the stream into a stream of `Result<T2, E | E2>` objects.
 */
export function resultSwitchMap<T, E, T2, E2>(
    mapper: (val: T) => ObservableInput<Result<T2, E2>>,
): OperatorFunction<Result<T, E>, Result<T2, E | E2>>;
export function resultSwitchMap<T, T2, E>(
    mapper: (val: T) => ObservableInput<T2>,
): OperatorFunction<Result<T, E>, Result<T2, E>>;
export function resultSwitchMap<T, E, T2, E2>(
    mapper: (val: T) => ObservableInput<Result<T2, E2> | T2>,
): OperatorFunction<Result<T, E>, Result<T2, E | E2>> {
    return (source) => {
        return source.pipe(
            switchMap((result) => {
                if (result.isOk()) {
                    return mapper(result.value);
                } else {
                    return of(result);
                }
            }),
            map((result: T2 | Result<T2, E | E2>) => {
                if (Result.isResult(result)) {
                    return result;
                } else {
                    return new Ok(result);
                }
            }),
        );
    };
}

/**
 * Allows you to do the same actions as the normal rxjs `mergeMap` operator on a stream of Result objects.
 *
 * Merging or switching from a stream of `Result<T, E>` objects onto a stream of `<T2>` objects
 * turns the stream into a stream of `Result<T2, E>` objects.
 *
 * Merging or switching from a stream of `Result<T, E>` objects onto a stream of `Result<T2, E2>`
 * objects turn the stream into a stream of `Result<T2, E | E2>` objects.
 *
 * @example
 * ```typescript
 * import { of, Observable } from 'rxjs';
 * import { Ok, Err, Result } from 'ts-results-es';
 * import { resultMergeMap } from 'ts-results-es/rxjs-operators';
 *
 * const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));
 *
 * const obs2$: Observable<Result<string, CustomError>> = of(new Ok('hi'), new Err(new CustomError('custom error')));
 *
 * const test$ = obs$.pipe(
 *     resultMergeMap((number) => {
 *         console.log('Got number: ' + number);
 *
 *         return obs2$;
 *     }),
 * ); // Has type Observable<Result<string, CustomError | Error>>
 *
 * test$.subscribe((result) => {
 *     if (result.isOk()) {
 *         console.log('Got string: ' + result.value);
 *     } else {
 *         console.log('Got error: ' + result.error.message);
 *     }
 * });
 *
 * // Logs the following:
 * // Got number: 5
 * // Got string: hi
 * // Got error: custom error
 * // Got error: uh oh
 * ```
 */
export function resultMergeMap<T, E, T2, E2>(
    mapper: (val: T) => ObservableInput<Result<T2, E2>>,
): OperatorFunction<Result<T, E>, Result<T2, E | E2>>;
export function resultMergeMap<T, T2, E>(
    mapper: (val: T) => ObservableInput<T2>,
): OperatorFunction<Result<T, E>, Result<T2, E>>;
export function resultMergeMap<T, E, T2, E2>(
    mapper: (val: T) => ObservableInput<Result<T2, E2> | T2>,
): OperatorFunction<Result<T, E>, Result<T2, E | E2>> {
    return (source) => {
        return source.pipe(
            mergeMap((result) => {
                if (result.isOk()) {
                    return mapper(result.value);
                } else {
                    return of(result);
                }
            }),
            map((result: T2 | Result<T2, E | E2>) => {
                if (Result.isResult(result)) {
                    return result;
                } else {
                    return new Ok(result);
                }
            }),
        );
    };
}

/**
 * Converts an `Observable<Result<T, E>>` to an `Observable<T>` by
 * filtering out the Errs and mapping to the Ok values.
 *
 * @example
 * ```typescript
 * import { of, Observable } from 'rxjs';
 * import { Ok, Err, Result } from 'ts-results-es';
 * import { filterResultOk } from 'ts-results-es/rxjs-operators';
 *
 * const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));
 *
 * const test$ = obs$.pipe(filterResultOk()); // Has type Observable<number>
 *
 * test$.subscribe((result) => {
 *     console.log('Got number: ' + result);
 * });
 *
 * // Logs the following:
 * // Got number: 5
 * ```
 */
export function filterResultOk<T, E>(): OperatorFunction<Result<T, E>, T> {
    return (source) => {
        return source.pipe(
            filter((result): result is Ok<T> => result.isOk()),
            map((result) => result.value),
        );
    };
}

/**
 * Converts an `Observable<Result<T, E>>` to an `Observable<E>` by
 * filtering out the Oks and mapping to the error values.
 *
 * @example
 * ```typescript
 * import { of, Observable } from 'rxjs';
 * import { Ok, Err, Result } from 'ts-results-es';
 * import { filterResultErr } from 'ts-results-es/rxjs-operators';
 *
 * const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));
 *
 * const test$ = obs$.pipe(filterResultErr()); // Has type Observable<Error>
 *
 * test$.subscribe((result) => {
 *     console.log('Got error: ' + result);
 * });
 *
 * // Logs the following:
 * // Got error: uh oh
 * ```
 */
export function filterResultErr<T, E>(): OperatorFunction<Result<T, E>, E> {
    return (source) => {
        return source.pipe(
            filter((result): result is Err<E> => result.isErr()),
            map((result) => result.error),
        );
    };
}

export function tapResultErr<T, E>(tapFn: (err: E) => void): MonoTypeOperatorFunction<Result<T, E>> {
    return (source: Observable<Result<T, E>>) => {
        return source.pipe(
            tap((r) => {
                if (!r.isOk()) {
                    tapFn(r.error);
                }
            }),
        );
    };
}

export function tapResultOk<T, E>(tapFn: (val: T) => void): MonoTypeOperatorFunction<Result<T, E>> {
    return (source: Observable<Result<T, E>>) => {
        return source.pipe(
            tap((r) => {
                if (r.isOk()) {
                    tapFn(r.value);
                }
            }),
        );
    };
}
