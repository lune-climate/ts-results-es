import { MonoTypeOperatorFunction, Observable, ObservableInput, of, OperatorFunction } from 'rxjs';
import { filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Err, Ok, Result } from '../index.js';

export function resultMap<T, T2, E>(mapper: (val: T) => T2): OperatorFunction<Result<T, E>, Result<T2, E>> {
    return (source) => {
        return source.pipe(map((result) => result.map(mapper)));
    };
}

export function resultMapErr<T, E, E2>(mapper: (val: E) => E2): OperatorFunction<Result<T, E>, Result<T, E2>> {
    return (source) => {
        return source.pipe(map((result) => result.mapErr(mapper)));
    };
}

export function resultMapTo<T, T2, E>(value: T2): OperatorFunction<Result<T, E>, Result<T2, E>> {
    return (source) => {
        return source.pipe(map((result) => result.map(() => value)));
    };
}

export function resultMapErrTo<T, E, E2>(value: E2): OperatorFunction<Result<T, E>, Result<T, E2>> {
    return (source) => {
        return source.pipe(map((result) => result.mapErr(() => value)));
    };
}

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

export function filterResultOk<T, E>(): OperatorFunction<Result<T, E>, T> {
    return (source) => {
        return source.pipe(
            filter((result): result is Ok<T> => result.isOk()),
            map((result) => result.value),
        );
    };
}

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
