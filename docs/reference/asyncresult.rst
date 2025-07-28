AsyncResult
===========

An async-aware :doc:`result` counterpart.

Can be combined with asynchronous code without having to ``await`` anything right until
the moment when you're ready to extract the final ``Result`` out of it.

Can also be combined with synchronous code for convenience.

``AsyncResult`` is awaitable - see `then()`_ for details.

.. code-block:: typescript

    // T is the Ok value type, E is the Err error type
    AsyncResult<T, E>

Imports:

.. code-block:: typescript

    import { AsyncResult } from 'ts-results-es'

Construction:

You can construct it directly from ``Result<T, E>`` or ``Promise<Result<T, E>>``:

.. code-block:: typescript

    const result1 = new AsyncResult(Ok(1))
    const result2 = new AsyncResult((async () => Err('bad_error')())

Or you can use the :ref:`Result.toAsyncResult() <toAsyncResult>` method:

.. code-block:: typescript

    const result3 = Ok(1).toAsyncResult()


``andThen()``
-------------

.. code-block:: typescript

    andThen<T2, E2>(
        mapper: (val: T) => Result<T2, E2> | Promise<Result<T2, E2>> | AsyncResult<T2, E2>
    ): AsyncResult<T2, E | E2>

Calls ``mapper`` if the result is ``Ok``, otherwise keeps the ``Err`` value intact.
This function can be used for control flow based on ``Result`` values.

Example:

.. code-block:: typescript

    let goodResult = Ok(1).toAsyncResult()
    let badResult = Err('boo').toAsyncResult()

    await goodResult.andThen(async (value) => Ok(value * 2)).promise // Ok(2)
    await goodResult.andThen(async (value) => Err(`${value} is bad`)).promise // Err('1 is bad')
    await badResult.andThen(async (value) => Ok(value * 2)).promise // Err('boo')


``map()``
---------

.. code-block:: typescript

    map<U>(mapper: (val: T) => U | Promise<U>): AsyncResult<U, E>

Maps an ``AsyncResult<T, E>`` to ``AsyncResult<U, E>`` by applying a function to a contained
``Ok`` value, leaving an ``Err`` value untouched.

This function can be used to compose the results of two functions.

Example:

.. code-block:: typescript

    let goodResult = Ok(1).toAsyncResult()
    let badResult = Err('boo').toAsyncResult()

    await goodResult.map(async (value) => value * 2).promise // Ok(2)
    await badResult.andThen(async (value) => value * 2).promise // Err('boo')

``mapErr()``
------------

.. code-block:: typescript

    mapErr<F>(mapper: (val: E) => F | Promise<F>): AsyncResult<T, F>

Maps an ``AsyncResult<T, E>`` to ``AsyncResult<T, F>`` by applying ``mapper`` to the ``Err`` value, 
leaving ``Ok`` value untouched.

Example:

.. code-block:: typescript

    let goodResult = Ok(1).toAsyncResult()
    let badResult = Err('boo').toAsyncResult()

    await goodResult.mapErr(async (error) => `Error is ${error}`).promise // Ok(1)
    await badResult.mapErr(async (error) => `Error is ${error}`).promise // Err('Error is boo')


``or()``
--------

.. code-block:: typescript

    or<E2>(other: Result<T, E2> | AsyncResult<T, E2> | Promise<Result<T, E2>>): AsyncResult<T, E2>

Returns the value from ``other`` if this ``AsyncResult`` contains ``Err``, otherwise returns self.

If ``other`` is a result of a function call consider using :ref:`AsyncResult.orElse` instead, it will
only evaluate the function when needed.

Example:

.. code-block:: typescript

    const badResult = new AsyncResult(Err('Error message'))
    const goodResult = new AsyncResult(Ok(1))

    await badResult.or(Ok(123)).promise // Ok(123)
    await goodResult.or(Ok(123)).promise // Ok(1)


.. _AsyncResult.orElse:

``orElse()``
------------

.. code-block:: typescript

    orElse<E2>(
        other: (error: E) => Result<T, E2> | AsyncResult<T, E2> | Promise<Result<T, E2>>,
    ): AsyncResult<T, E2>


Returns the value obtained by calling ``other`` if this ``AsyncResult`` contains ``Err``, otherwise
returns self.

Example:

.. code-block:: typescript

    const badResult = new AsyncResult(Err('Error message'))
    const goodResult = new AsyncResult(Ok(1))

    await badResult.orElse(() => Ok(123)).promise // Ok(123)
    await goodResult.orElse(() => Ok(123)).promise // Ok(1)


``promise``
-----------

.. code-block:: typescript

    promise: Promise<Result<T, E>>

A promise that resolves to a synchronous result.

You can await it to convert ``AsyncResult<T, E>`` to ``Result<T, E>``, but prefer 
awaiting ``AsyncResult`` directly (see: `then()`_). Only use this property 
if you need the underlying Promise for specific use cases.

``then()``
----------

.. code-block:: typescript

    then<TResult1 = Result<T, E>, TResult2 = never>(
        onfulfilled?: ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2>

Makes ``AsyncResult`` awaitable by implementing the thenable interface.
This allows you to use ``await`` directly on ``AsyncResult`` instances.

See the `Promise.then() documentation <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then>`_ 
for details on the thenable interface.

Example:

.. code-block:: typescript

    const asyncResult = new AsyncResult(Ok(42))
    const result = await asyncResult // Returns Result<number, Error>


``toOption()``
--------------

.. code-block:: typescript

    toOption(): AsyncOption<T>

Converts from ``AsyncResult<T, E>`` to ``AsyncOption<T>`` so that ``Err`` is converted to ``None``
and ``Ok`` is converted to ``Some``.
