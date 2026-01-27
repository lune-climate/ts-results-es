.. _class-Result:

Result
======

A ``Result`` is either ``Ok`` (a success, contains a `value`_ of type ``T``) or ``Err`` (an error,
contains an `error`_ of type ``E``):

.. code-block:: typescript

    Result<T, E> = Ok<T> | Err<E>

Necessary imports:

.. code-block:: typescript

    import { Err, Ok, Result } from 'ts-results-es'

Construction:

.. code-block:: typescript

    const success = Ok('my username')
    const error = Err('error_code')

``Result`` can only be combined with synchronous code. Look at :doc:`asyncresult` if you need
to combine results with asynchronouse code.

.. _method-Result-all:

``all()``
---------

.. code-block:: typescript

    // The actual signature is more complicated but this should be good enough.
    static all(results: Result<T, E>[]): Result<T[], E>

Parse a set of ``Result``, returning an array of all ``Ok`` values.
Short circuits with the first ``Err`` found, if any.

Example:

.. code-block:: typescript

    let results: Result<Topping, GetToppingsError>[] = pizzaToppingNames.map(name => getPizzaToppingByName(name));

    let result = Result.all(results); // Result<Topping[], GetToppingsError>

    let toppings = result.unwrap(); // toppings is an array of Topping.  Could throw GetToppingsError.

.. _method-Result-andThen:

``andThen()``
-------------

.. code-block:: typescript

    andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T | T2, E | E2>

Calls ``mapper`` if the result is ``Ok``, otherwise returns the ``Err`` value of self.
This function can be used for control flow based on ``Result`` values.

Example:

.. code-block:: typescript

    let goodResult = Ok(1);
    let badResult = Err(new Error('something went wrong'));

    goodResult.andThen((num) => new Ok(num + 1)).unwrap(); // 2
    badResult.andThen((num) => new Err(new Error('2nd error'))).unwrap(); // throws Error('something went wrong')
    goodResult.andThen((num) => new Err(new Error('2nd error'))).unwrap(); // throws Error('2nd error')

    goodResult
        .andThen((num) => new Ok(num + 1))
        .mapErr((err) => new Error('mapped'))
        .unwrap(); // 2
    badResult
        .andThen((num) => new Err(new Error('2nd error')))
        .mapErr((err) => new Error('mapped'))
        .unwrap(); // throws Error('mapped')
    goodResult
        .andThen((num) => new Err(new Error('2nd error')))
        .mapErr((err) => new Error('mapped'))
        .unwrap(); // throws Error('mapped')

.. _method-Result-any:

``any()``
---------

.. code-block:: typescript

    // The actual signature is more complicated but this should be good enough.
    static any(results: Result<T, E>[]): Result<T, E[]>

Parse a set of ``Result``, short-circuits when an input value is ``Ok``.
If no ``Ok`` is found, returns an ``Err`` containing the collected error values.

Example:

.. code-block:: typescript

    let connections: Array<Result<string, Error1 | Error2 | Error3 | ...>> = [attempt1(), attempt2(), attempt3(), ...];

    let results = Result.any(connections); // Result<string, Error1 | Error2 | Error3 | ...>

    let url = results.unwrap(); // At least one attempt gave us a successful url

.. _method-Result-partition:

``partition()``
---------------

.. code-block:: typescript

    // The actual signature is more complicated but this should be good enough.
    static partition<T, E>(results: Result<T, E>[]): [T[], E[]]

Partitions a set of ``Result``, separating the ``Ok`` and ``Err`` values.

Example:

.. code-block:: typescript

    let results: Result<number, string>[] = [Ok(1), Err('error1'), Ok(2), Err('error2')];

    let [numbers, errors] = Result.partition(results); // [ [1, 2], ['error1', 'error2'] ]

.. _attribute-Err-EMPTY:

``Err.EMPTY``
-------------

.. code-block:: typescript

    static readonly EMPTY: Err<void>

A static ``Err`` instance containing ``undefined``. Useful when you need to represent
a failure without a meaningful error value.

Example:

.. code-block:: typescript

    const x: Result<string, void> = Err.EMPTY

.. _attribute-Ok-EMPTY:

``Ok.EMPTY``
------------

.. code-block:: typescript

    static readonly EMPTY: Ok<void>

A static ``Ok`` instance containing ``undefined``. Useful when you need to represent
a success without a meaningful value.

Example:

.. code-block:: typescript

    const x: Result<void, string> = Ok.EMPTY

.. _type-ResultErrType:

``ResultErrType``
-----------------

.. code-block:: typescript

    type ResultErrType<T extends Result<any, any>>

A utility type that extracts the ``Err`` value type from a ``Result``.

Example:

.. code-block:: typescript

    type Input = Result<string, Error>
    type Output = ResultErrType<Input> // Error

.. _type-ResultErrTypes:

``ResultErrTypes``
------------------

.. code-block:: typescript

    type ResultErrTypes<T extends Result<any, any>[]>

A utility type that extracts the ``Err`` value types from a tuple of ``Result``'s,
producing a tuple of the error types.

Example:

.. code-block:: typescript

    type Input = [Result<string, Error>, Result<number, Error>]
    type Output = ResultErrTypes<Input> // [Error, Error]

.. _type-ResultOkType:

``ResultOkType``
----------------

.. code-block:: typescript

    type ResultOkType<T extends Result<any, any>>

A utility type that extracts the ``Ok`` value type from a ``Result``.

Example:

.. code-block:: typescript

    type Input = Result<string, Error>
    type Output = ResultOkType<Input> // string

.. _type-ResultOkTypes:

``ResultOkTypes``
-----------------

.. code-block:: typescript

    type ResultOkTypes<T extends Result<any, any>[]>

A utility type that extracts the ``Ok`` value types from a tuple of ``Result``'s,
producing a tuple of the inner types.

Example:

.. code-block:: typescript

    type Input = [Result<string, Error>, Result<number, Error>]
    type Output = ResultOkTypes<Input> // [string, number]

.. _attribute-Err-error:

``error``
---------

The error contained in ``Err``. Only present on ``Err`` objects.

.. _attribute-Ok-value:

``value``
---------

The value contained in ``Ok``. Only present on ``Ok`` objects.

.. _method-Result-expect:

``expect()``
------------

.. code-block:: typescript

    expect(msg: string): T

Returns the contained ``Ok`` value, if exists.  Throws an error if not.

The thrown error's `cause`_ is set to value contained in ``Err``.

If you know you're dealing with ``Ok`` and the compiler knows it too (because you tested
`isOk()`_ or `isErr()`_) you should use `value`_ instead. While ``Ok``'s `expect()`_ and `value`_ will
both return the same value using `value`_ is preferable because it makes it clear that
there won't be an exception thrown on access.

``msg``: the message to throw if no Ok value.

Example:

.. code-block:: typescript

    let goodResult = Ok(1);
    let badResult = Err(new Error('something went wrong'));

    goodResult.expect('goodResult should be a number'); // 1
    badResult.expect('badResult should be a number'); // throws Error("badResult should be a number - Error: something went wrong")

.. _method-Result-expectErr:

``expectErr()``
---------------

.. code-block:: typescript

    expectErr(msg: string): E

Returns the contained ``Err`` value, if exists.  Throws an error if not.

``msg``: the message to throw if no ``Err`` value

Example:

.. code-block:: typescript

    let goodResult = Ok(1);
    let badResult = Err(new Error('something went wrong'));

    goodResult.expectErr('goodResult should not be a number'); // throws Error("goodResult should not be a number")
    badResult.expectErr('badResult should not be a number'); // new Error('something went wrong')

.. _method-Result-isOk:

``isOk()``
----------

.. code-block:: typescript

    isOk(): this is Ok<T>

``true`` when the result is ``Ok``.

.. _method-Result-isErr:

``isErr()``
-----------

.. code-block:: typescript

    isErr(): this is Err<E>

``true`` when the result is ``Err``.

.. _method-Result-map:

``map()``
---------

.. code-block:: typescript

    map<U>(mapper: (val: T) => U): Result<U, E>

Maps a ``Result<T, E>`` to ``Result<U, E>`` by applying a function to a contained ``Ok`` value,
leaving an ``Err`` value untouched.

This function can be used to compose the results of two functions.

Example:

.. code-block:: typescript

    let goodResult = Ok(1);
    let badResult = Err(new Error('something went wrong'));

    goodResult.map((num) => num + 1).unwrap(); // 2
    badResult.map((num) => num + 1).unwrap(); // throws Error("something went wrong")

.. _method-Result-mapErr:

``mapErr()``
------------

.. code-block:: typescript

    mapErr<F>(mapper: (val: E) => F): Result<T, F>

Maps a ``Result<T, E>`` to ``Result<T, F>`` by applying a function to a contained ``Err`` value,
leaving an ``Ok`` value untouched.

This function can be used to pass through a successful result while handling an error.

Example:

.. code-block:: typescript

    let goodResult = Ok(1);
    let badResult = Err(new Error('something went wrong'));

    goodResult
        .map((num) => num + 1)
        .mapErr((err) => new Error('mapped'))
        .unwrap(); // 2
    badResult
        .map((num) => num + 1)
        .mapErr((err) => new Error('mapped'))
        .unwrap(); // throws Error("mapped")

.. _method-Result-mapOr:

``mapOr()``
-----------

.. code-block:: typescript

    mapOr<U>(default_: U, mapper: (val: T) => U): U

Maps a ``Result<T, E>`` to ``Result<U, E>`` by either converting ``T`` to ``U`` using ``mapper``
(in case of ``Ok``) or using the ``default_`` value (in case of ``Err``).

If ``default_`` is a result of a function call consider using `mapOrElse()`_ instead, it will
only evaluate the function when needed.

Example:

.. code-block:: typescript

    let goodResult = Ok(1);
    let badResult = Err(new Error('something went wrong'));

    goodResult.mapOr(0, (value) => -value) // -1
    badResult.mapOr(0, (value) => -value) // 0

.. _method-Result-mapOrElse:

``mapOrElse()``
---------------

.. code-block:: typescript

    mapOrElse<U>(default_: (error: E) => U, mapper: (val: T) => U): U

Maps a ``Result<T, E>`` to ``Result<U, E>`` by either converting ``T`` to ``U`` using ``mapper``
(in case of ``Ok``) or producing a default value using the ``default_`` function (in case of
``Err``).

.. code-block:: typescript

    let goodResult = Ok(1);
    let badResult = Err(new Error('something went wrong'));

    goodResult.mapOrElse((_error) => 0, (value) => -value) // -1
    badResult.mapOrElse((_error) => 0, (value) => -value) // 0

.. _method-Result-or:

``or()``
--------

.. code-block:: typescript

    or<E2>(other: Result<T, E2>): Result<T, E2>

Returns ``Ok()`` if we have a value, otherwise returns ``other``.

``other`` is evaluated eagerly. If ``other`` is a result of a function
call try `orElse()`_ instead – it evaluates the parameter lazily.

Example:

.. code-block:: typescript

    Ok(1).or(Ok(2)) // => Ok(1)
    Err('error here').or(Ok(2)) // => Ok(2)

.. _method-Result-orElse:

``orElse()``
------------

.. code-block:: typescript

    orElse<E2>(other: (error: E) => Result<T, E2>): Result<T, E2>

Returns ``Ok()`` if we have a value, otherwise returns the result
of calling ``other()``.

``other()`` is called *only* when needed and is passed the error value in a parameter.

Example:

.. code-block:: typescript

    Ok(1).orElse(() => Ok(2)) // => Ok(1)
    Err('error').orElse(() => Ok(2)) // => Ok(2) 

.. _attribute-Err-stack:

``stack``
---------

A stack trace is generated when an ``Err`` is created.

.. code-block:: typescript

    let error = Err('Uh Oh');
    let stack = error.stack;

.. _method-Result-toAsyncResult:

``toAsyncResult()``
-------------------

.. code-block:: typescript

    toAsyncResult(): AsyncResult<T, E>

Creates an `AsyncResult` based on this `Result`.

Useful when you need to compose results with asynchronous code.


.. _method-Result-toOption:

``toOption()``
--------------

.. code-block:: typescript

    toOption(): Option<T>

Converts from ``Result<T, E>`` to ``Option<T>``  , discarding the error if any.

.. _method-Result-unwrap:

``unwrap()``
------------

.. code-block:: typescript

    unwrap(): T

Returns the contained ``Ok`` value.
Because this function may throw, its use is generally discouraged.
Instead, prefer to handle the ``Err`` case explicitly.

If you know you're dealing with ``Ok`` and the compiler knows it too (because you tested
`isOk()`_ or `isErr()`_) you should use `value`_ instead. While ``Ok``'s `unwrap()`_ and `value`_ will
both return the same value using `value`_ is preferable because it makes it clear that
there won't be an exception thrown on access.

Throws if the value is an ``Err``, with a message provided by the ``Err``'s value and
`cause`_ set to the value.

Example:

.. code-block:: typescript

    let goodResult = new Ok(1);
    let badResult = new Err(new Error('something went wrong'));

    goodResult.unwrap(); // 1
    badResult.unwrap(); // throws Error("something went wrong")

.. _method-Result-unwrapErr:

``unwrapErr()``
---------------

.. code-block:: typescript

    unwrapErr(): E

Returns the contained ``Err`` value.
Because this function may throw, its use is generally discouraged.
Instead, prefer to handle the ``Ok`` case explicitly and access the `error`_ property
directly.

Throws if the value is an ``Ok``, with a message provided by the ``Ok``'s value and
`cause`_ set to the value.

Example:

.. code-block:: typescript

    let goodResult = new Ok(1);
    let badResult = new Err('something went wrong');

    goodResult.unwrapErr(); // throws an exception
    badResult.unwrapErr(); // returns 'something went wrong'

.. _method-Result-unwrapOr:

``unwrapOr()``
--------------

.. code-block:: typescript

    unwrapOr<T2>(val: T2): T | T2

Returns the contained ``Ok`` value or a provided default.

Example:

.. code-block:: typescript

    let goodResult = Ok(1);
    let badResult = Err(new Error('something went wrong'));

    goodResult.unwrapOr(5); // 1
    badResult.unwrapOr(5); // 5

.. _method-Result-unwrapOrElse:

``unwrapOrElse()``
------------------

.. code-block:: typescript

    unwrapOrElse<T2>(f: (error: E) => T2): T | T2

Returns the contained ``Ok`` value or computes a value with a provided function.

The function is called at most one time, only if needed.

Example:

.. code-block:: typescript

    Ok('OK').unwrapOrElse(
        (error) => { console.log(`Called, got ${error}`); return 'UGH'; }
    ) // => 'OK', nothing printed

    Err('A03B').unwrapOrElse((error) => `UGH, got ${error}`) // => 'UGH, got A03B'

.. _method-Result-wrap:

``wrap()``
----------

.. code-block:: typescript

    static wrap<T, E = unknown>(op: () => T): Result<T, E>

Wraps an operation that may throw an error (``try-catch`` style) into a ``Result``.

This is useful for converting exception-based code into ``Result``-based code.

Example:

.. code-block:: typescript

    Result.wrap(() => JSON.parse('{"valid": "json"}')) // Ok({ valid: 'json' }), type: Result<any, unknown>

    Result.wrap(() => JSON.parse('not json')) // Err(SyntaxError: ...), type: Result<any, unknown>

.. _method-Result-wrapAsync:

``wrapAsync()``
---------------

.. code-block:: typescript

    static wrapAsync<T, E = unknown>(op: () => Promise<T>): Promise<Result<T, E>>

Wraps an async operation that may throw an error (``try-catch`` style) into a ``Result``.

This is useful for converting promise-based code that may reject into ``Result``-based code.

Example:

.. code-block:: typescript

    await Result.wrapAsync(() => fetch('/api/data').then(r => r.json())) // Ok(data) or Err(error), type: Result<any, unknown>

.. _method-Result-Iterable:

Iterable
--------

``Result`` implements the ``Iterable`` interface, allowing you to use it in ``for...of`` loops
and with spread syntax.

- ``Ok<T>`` yields its contained value once
- ``Err<E>`` yields nothing (empty iterator)

Example:

.. code-block:: typescript

    for (const value of Ok(42)) {
        console.log(value); // 42
    }

    for (const value of Err('error')) {
        console.log(value); // never executes
    }

    [...Ok(1)] // [1], type: number[]
    [...Err('oops')] // [], type: never[]

    const results = [Ok(1), Err('bad'), Ok(3)];
    results.flatMap(res => [...res]); // [1, 3], type: number[]


.. _cause: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
