AsyncOption
===========

An async-aware :doc:`option` counterpart.

Can be combined with asynchronous code without having to ``await`` anything right until
the moment when you're ready to extract the final ``Option`` out of it.

Can also be combined with synchronous code for convenience.

.. code-block:: typescript

    // T is the value type
    AsyncOption<T>

Imports:

.. code-block:: typescript

    import { AsyncOption } from 'ts-results-es'

Construction:

You can construct it directly from ``Option<T>`` or ``Promise<Option<T>>``:

.. code-block:: typescript

    const option1 = new AsyncOption(Some(1))
    const option2 = new AsyncOption((async () => None)())

Or you can use the :ref:`Option.toAsyncOption() <toAsyncOption>` method:

.. code-block:: typescript

    const option3 = Some(1).toAsyncOption()

``andThen()``
-------------

.. code-block:: typescript

    andThen<T2>(
        mapper: (val: T) => Option<T2> | Promise<Option<T2>> | AsyncOption<T2>,
    ): AsyncOption<T2>


Calls ``mapper`` if the option is ``Some``, otherwise keeps the ``None`` value intact.
This function can be used for control flow based on ``Option`` values.

Example:

.. code-block:: typescript

    let hasValue = Some(1).toAsyncOption()
    let noValue = None.toAsyncOption()

    await hasValue.andThen(async (value) => Some(value * 2)).promise // Some(2)
    await hasValue.andThen(async (value) => None).promise // None
    await noValue.andThen(async (value) => Ok(value * 2)).promise // None

``map()``
---------

.. code-block:: typescript

    map<U>(mapper: (val: T) => U | Promise<U>): AsyncOption<U>

Maps an ``AsyncOption<T>`` to ``AsyncOption<U>`` by applying a function to a contained
``Some`` value, leaving a ``None`` value untouched.

This function can be used to compose the results of two functions.

Example:

.. code-block:: typescript

    let hasValue = Ok(1).toAsyncOption()
    let noValue = None.toAsyncOption()

    await hasValue.map(async (value) => value * 2).promise // Some(2)
    await noValue.map(async (value) => value * 2).promise // None


``or()``
--------

.. code-block:: typescript

    or<U>(other: Option<U> | AsyncOption<U> | Promise<Option<U>>): AsyncOption<T | U>

Returns the value from ``other`` if this ``AsyncOption`` contains ``None``, otherwise returns self.

If ``other`` is a result of a function call consider using :ref:`AsyncOption.orElse` instead, it will
only evaluate the function when needed.

Example:

.. code-block:: typescript

    const noValue = new AsyncOption(None)
    const hasValue = new AsyncOption(Some(1))

    await noValue.or(Some(123)).promise // Some(123)
    await hasValue.or(Some(123)).promise // Some(1)

.. _AsyncOption.orElse:

``orElse()``
------------

.. code-block:: typescript

    orElse<U>(other: () => Option<U> | AsyncOption<U> | Promise<Option<U>>): AsyncOption<T | U>

Returns the value obtained by calling ``other`` if this ``AsyncOption`` contains ``None``, otherwise
returns self.

Example:

.. code-block:: typescript

    const noValue = new AsyncOption(None)
    const hasValue = new AsyncOption(Some(1))

    await noValue.orElse(() => Some(123)).promise // Some(123)
    await hasValue.orElse(() => Some(123)).promise // Some(1)



``promise``
-----------

.. code-block:: typescript

    promise: Promise<Result<T, E>>

A promise that resolves to a synchronous result.

Await it to convert ``AsyncResult<T, E>`` to ``Result<T, E>``.


``toResult()``
--------------

.. code-block:: typescript

    toResult<E>(error: E): AsyncResult<T, E>

Converts an ``AsyncOption<T>`` to an ``AsyncResult<T, E>`` so that ``None`` is converted to
``Err(error)`` and ``Some`` is converted to ``Ok``.
