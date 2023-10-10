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

``andThen()``
-------------

.. code-block:: typescript

    andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T | T2, E | E2>

Calls ``mapper`` if the result is ``Ok``, otherwise returns the ``Err`` value of self.
This function can be used for control flow based on ``Result`` values.

``error``
---------

The error contained in ``Err``. Only present on ``Err`` objects.

``value``
---------

The value contained in ``Ok``. Only present on ``Ok`` objects.

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

``expectErr()``
---------------

.. code-block:: typescript

    expectErr(msg: string): E

Returns the contained ``Err`` value, if exists.  Throws an error if not.

``msg``: the message to throw if no ``Err`` value

``isOk()``
----------

.. code-block:: typescript

    isOk(): this is Ok<T>

``true`` when the result is ``Ok``.

``isErr()``
-----------

.. code-block:: typescript

    isErr(): this is Err<E>

``true`` when the result is ``Err``.

``map()``
---------

.. code-block:: typescript

    map<U>(mapper: (val: T) => U): Result<U, E>

Maps a ``Result<T, E>`` to ``Result<U, E>`` by applying a function to a contained ``Ok`` value,
leaving an ``Err`` value untouched.

This function can be used to compose the results of two functions.

``mapErr()``
------------

.. code-block:: typescript

    mapErr<F>(mapper: (val: E) => F): Result<T, F>

Maps a ``Result<T, E>`` to ``Result<T, F>`` by applying a function to a contained ``Err`` value,
leaving an ``Ok`` value untouched.

This function can be used to pass through a successful result while handling an error.

``mapOr()``
-----------

.. code-block:: typescript

    mapOr<U>(default_: U, mapper: (val: T) => U): U

Maps a ``Result<T, E>`` to ``Result<U, E>`` by either converting ``T`` to ``U`` using ``mapper``
(in case of ``Ok``) or using the ``default_`` value (in case of ``Err``).

If ``default_`` is a result of a function call consider using `mapOrElse()`_ instead, it will
only evaluate the function when needed.

``mapOrElse()``
---------------

.. code-block:: typescript

    mapOrElse<U>(default_: (error: E) => U, mapper: (val: T) => U): U

Maps a ``Result<T, E>`` to ``Result<U, E>`` by either converting ``T`` to ``U`` using ``mapper``
(in case of ``Ok``) or producing a default value using the ``default_`` function (in case of
``Err``).

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

``toOption()``
--------------

.. code-block:: typescript

    toOption(): Option<T>

Converts from ``Result<T, E>`` to ``Option<T>``  , discarding the error if any.

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

``unwrapErr()``
---------------

.. code-block:: typescript

    unwrapErr(): E

Returns the contained ``Err`` value.
Because this function may throw, its use is generally discouraged.
Instead, prefer to handle the ``Ok`` case explicitly.

Throws if the value is an ``Ok``, with a message provided by the ``Ok``'s value and
`cause`_ set to the value.

``unwrapOr()``
--------------

.. code-block:: typescript

    unwrapOr<T2>(val: T2): T | T2

Returns the contained ``Ok`` value or a provided default.


.. _cause: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
