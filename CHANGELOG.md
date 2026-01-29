# Not yet released

Backwards incompatible:

- Removed the `Result.else` method, use `Result.unwrapOr` instead.
- Removed the `Some.safeUnwrap` and `Ok.safeUnwrap` methods, use the
  `value` property instead.

Added:

- Added `Option.fromNullable`, `Option.fromOptional`, and `Option.fromNullish`
  static methods for converting nullable, optional, and nullish values to
  `Option`.
- Added array parameter overloads for `Option.all` and `Option.any`,
  allowing `Option.all([a, b, c])` instead of `Option.all(a, b, c)`.

Deprecated:

- The parameter spread variants of `Option.all` and `Option.any` are now
  deprecated. Use the new array parameter overloads instead.

# 6.0.0

Backwards incompatible:

- Fixed `Result`'s `andThen` and `orElse` signatures to fix situations where they
  couldn't be called (`This expression is not callable`). That comes at the cost of:

  1. Reduced type narrowing when the input type is known to be `Ok` or `Err`.
  2. Reduced type narrowing when the mapper function always returns `Ok` or
     always returns `Err`. Possible workaround: use more appropriate methods like
     `map` and `mapErr`.
  3. Type inference failure when the mapper function is generic. The failure is visible
     the `Ok` type being inferred as `unknown`. Workaround: instead of
     `andThen(someGenericFunction)` use `andThen((v) => someGenericFunction(v))`.

Added:

- Made `AsyncOption` and `AsyncResult` awaitable - you can now use `await asyncResult`
  instead of `await asyncResult.promise`.

# 5.0.1

Fixed:

- Fixed the regression introduced in 5.0.0 as part of the `AsyncResult.andThen` fix. The fix
  is completely reverted for now.

# 5.0.0

Backwards incompatible:

- Changed `Option` and `Result` iterator behavior such that iterating `Some` and `Ok` will
  instead produce only one result – the wrapped value. Previously the iteration depended on
  the type of the wrapped value (iteratable or not) and produced results obtained by iterating
  the wrapped values.

  For example:

  ```
  const o: Option<number[]> = Some([1, 2, 3])
  const rs = Array.from(o)
  // Previously: rs was [1, 2, 3]
  // Now: rs equals [[1, 2, 3]]
  ```

  Iterating `None` and `Err` is not affected and continues to produce no results.
- Removed the parameter spread variants of `Result.all` and `Result.any`. Both of these
  methods now only take a single array parameter (the array parameter has already been
  supported for a while).

Fixed:

- Fixed `Result.or` and `Result.orElse` method types to actually be callable and return
  reasonable types when called.
- Attempted to fix `AsyncResult.andThen` to return the correct type when the provided callback
  always returns an `Ok`.
  This attempt has been (for now) reverted in 5.0.1 as it created other problems.
- Fixed the `Result.partition` signature.

Added:

- `Option.unwrapOrElse`
- `Result.unwrapOrElse`

# 4.2.0

Added:

- Added a non-spread (you can pass an array as a single parameter) variant of `Result.all`
- Added a new `Result.partition` convenience method

# 4.1.0

- A whole bunch of documentation changes
- Introduced `AsyncResult` to allow composing results with asynchronous code
- Introduced `AsyncOption` as well
- Fixed `Option.any` behavior
- Fixed an edge case in using `ts-results-es` in CommonJS projects

# 4.0.0

- Improved the documentation
- Fixed the rxjs-operators submodules type declarations for CommonJS code
- Changed `Result.orElse()` and `Result.mapOrElse()` error-handling callback to take
  the error as an argument (consistent with the original Rust methods)

Backwards incompatible:

- A bunch of renames:
  - `Some.val` -> `Some.value`
  - `Result.val` -> `Ok.value` and `Err.error`
  - `Option.some` -> `Option.isSome()`
  - `Option.none` -> `Option.isNone()`
  - `Result.ok` -> `Result.isOk()`
  - `Result.err` -> `Result.isErr()`

# 3.6.1

- Improved the documentation a little bit
- Fixed rxjs-operators module imports, thanks to Jacob Nguyen

# 3.6.0

- Added `or()` and `orElse()` methods to both `Option` and `Result`

# 3.5.0

- Added `andThen()` documentation, thanks to Drew De Ponte
- Added the `expectErr()` method to `Result`, thanks to TheDudeFromCI
- Added `mapOr()` and `mapOrElse()` to both `Option` and `Result`

# 3.4.0

-   Fixed some type errors that prevented the package from being built with recent
    TypeScript versions
-   Fixed ESM compatibility so that client code can use named imports without resorting
    to workarounds (fixes https://github.com/vultix/ts-results/issues/37)

# 3.3.0
Big thank you to [@petehunt](https://github.com/petehunt) for all his work adding stack traces to `Err`.

-   Added a `stack` property to all `Err` objects.  Can be used to pull a stack trace
-   Added `toOption` and `toResult` methods for converting between `Option` and `Result` objects

# v3.2.1

-   Fix regression found in [Issue#24](https://github.com/vultix/ts-results/issues/24)

# v3.2.0

-   Fixes for Typescript 4.2

# v3.1.0

Big thank you to [@petehunt](https://github.com/petehunt) for all his work adding the `Option` type.

### New Features

-   Added new `Option<T>`, `Some<T>`, and `None` types!

    -   You should feel at home if you're used to working with Rust:

        ```typescript
        import { Option, Some, None } from 'ts-results';

        const optionalNum: Option<number> = Some(3).map((num) => num * 2);

        if (optionalNum.some) {
            console.log(optionalNum.val === 6); // prints `true`
        }

        const noneNum: Option<number> = None;

        if (noneNum.some) {
            // You'll never get in here
        }
        ```

-   Added new `Option.isOption` and `Result.isResult` helper functions.

### Other Improvements

-   Got to 100% test coverage on all code!
-   Removed uses of `@ts-ignore`

# v3.0.0

Huge shout out to [@Jack-Works](https://github.com/Jack-Works) for helping get this release out. Most of the work was
his, and it would not have happened without him.

### New Features

-   `Ok<T>` and `Err<T>` are now callable without `new`!
-   No longer breaks when calling from node
-   Tree-shakable when using tools like rollup or webpack
-   Fully unit tested
-   Added these helper functions:
    -   `Result.all(...)` - Same as `Results` from previous releases. Collects all `Ok` values, or returns the first `Err`
        value.
    -   `Results.any(...)` - Returns the first `Ok` value, or all of the `Err` values.
    -   `Result.wrap<T, E>(() => ...)` - Wraps an operation that may throw an error, uses try / catch to return
        a `Result<T, E>`
    -   `Result.wrapAsync<T, E>(() => ...)` - Same as the above, but async
-   Deprecated `else` in favor of `unwrapOr` to prefer api parity with Rust

# v2.0.1

### New Features

-   **core:** Added `reaonly static EMPTY: Ok<void>;` to `Ok` class.
-   **core:** Added `reaonly static EMPTY: Err<void>;` to `Err` class.

# v2.0.0

This release features a complete rewrite of most of the library with one focus in mind: simpler types.

The entire library now consists of only the following:

-   Two classes: `Ok<T>` and `Err<E>`.
-   A `Result<T, E>` type that is a simple or type between the two classes.
-   A simple `Results` function that allows combining multiple results.

### New Features

-   **core:** much simpler Typescript types
-   **rxjs:** added new `filterResultOk` and `filterResultErr` operators
-   **rxjs:** added new `resultMapErrTo` operator

### Breaking Changes

-   **core:** `Err` and `Ok` now require `new`:
    -   **Before:** `let result = Ok(value); let error = Err(message);`
    -   **After:** `let result = new Ok(value); let error = new Err(message);`
-   **core:** `map` function broken into two functions: `map` and `mapErr`
    -   **before**: `result.map(value => "new value", error => "new error")`
    -   **after**: `result.map(value => "newValue").mapError(error => "newError")`
-   **rxjs:** `resultMap` operator broken into two operators: `resultMap` and `resultMapErr`
    -   **before**: `obs.pipe(resultMap(value => "new value", error => "new error"))`
    -   **after**: `result.pipe(resultMap(value => "newValue"), resultMapError(error => "newError"))`
