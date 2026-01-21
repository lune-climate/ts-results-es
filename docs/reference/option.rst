Option
======

An ``Option`` is either ``Some`` (contains a `value`_ of type ``T`` inside) or ``None`` (no value).

.. code-block:: typescript

    Option<T> = Some<T> | None

Necessary imports:

.. code-block:: typescript

    import { None, Option, Some } from 'ts-results-es'

Construction:

.. code-block:: typescript

    const some = Some('some value')
    // None is a singleton, no construction necessary

``all()``
---------

.. code-block:: typescript

    static all<T extends Option<any>[]>(...options: T): Option<OptionSomeTypes<T>>

Parse a set of ``Option``'s, returning an array of all ``Some`` values.
Short circuits with the first ``None`` found, if any.

Example:

.. code-block:: typescript

    let options: Option<number>[] = [Some(1), Some(2), Some(3)];

    Option.all(...options); // Some([1, 2, 3]), type: Option<number[]>

    // Short-circuits on first None
    Option.all(Some(1), None, Some(3)); // None, type: Option<number>

``any()``
---------

.. code-block:: typescript

    static any<T extends Option<any>[]>(...options: T): Option<OptionSomeTypes<T>[number]>

Parse a set of ``Option``'s, short-circuits when an input value is ``Some``.
If no ``Some`` is found, returns ``None``.

Example:

.. code-block:: typescript

    Option.any(None, Some(1), Some(2)); // Some(1), type: Option<number>
    Option.any(None, None, Some(3)); // Some(3), type: Option<number>
    Option.any(None, None, None); // None, type: Option<never>

``Some.EMPTY``
--------------

.. code-block:: typescript

    static readonly EMPTY: Some<void>

A static ``Some`` instance containing ``undefined``. Useful when you need to represent
a successful presence without a meaningful value.

Example:

.. code-block:: typescript

    const x: Option<void> = Some.EMPTY

``andThen()``
-------------

.. code-block:: typescript

    andThen<T2>(mapper: (val: T) => Option<T2>): Option<T2>

Calls ``mapper`` if the ``Option`` is ``Some``, otherwise returns ``None``.
This function can be used for control flow based on ``Option`` values.

``value``
---------

The value contained in ``Some``. Only present on ``Some`` objects.

``expect()``
------------

.. code-block:: typescript

    expect(msg: string): T

Returns the contained ``Some`` value, if exists.  Throws an error if not.

If you know you're dealing with ``Some`` and the compiler knows it too (because you tested
`isSome()`_ or `isNone()`_) you should use `value`_ instead. While ``Some``'s `expect()`_ and `value`_ will
both return the same value using `value`_ is preferable because it makes it clear that
there won't be an exception thrown on access.

``msg``: the message to throw if no ``Some`` value.

``isNone()``
------------

.. code-block:: typescript

    isNone(): this is None

``true`` when the ``Option`` is ``None``.

``isSome()``
------------

.. code-block:: typescript

    isSome(): this is Some<T>

``true`` when the ``Option`` is ``Some``.

``map()``
---------

.. code-block:: typescript

    map<U>(mapper: (val: T) => U): Option<U>

Maps an ``Option<T>`` to ``Option<U>`` by applying a function to a contained ``Some`` value,
leaving a ``None`` value untouched.

This function can be used to compose the Options of two functions.

``mapOr()``
-----------

.. code-block:: typescript

    mapOr<U>(default_: U, mapper: (val: T) => U): U

Maps an ``Option<T>`` to ``Option<U>`` by either converting ``T`` to ``U`` using ``mapper`` (in case
of ``Some``) or using the ``default_`` value (in case of ``None``).

If ``default_`` is a result of a function call consider using `mapOrElse()`_ instead, it will
only evaluate the function when needed.

``mapOrElse()``
---------------

.. code-block:: typescript

    mapOrElse<U>(default_: () => U, mapper: (val: T) => U): U

Maps an ``Option<T>`` to ``Option<U>`` by either converting ``T`` to ``U`` using ``mapper`` (in case
of ``Some``) or producing a default value using the ``default_`` function (in case of ``None``).

``or()``
--------

.. code-block:: typescript

    or(other: Option<T>): Option<T>

Returns ``Some()`` if we have a value, otherwise returns ``other``.

``other`` is evaluated eagerly. If ``other`` is a result of a function
call try `orElse()`_ instead – it evaluates the parameter lazily.

Example:

.. code-block:: typescript

    Some(1).or(Some(2)) // => Some(1)
    None.or(Some(2)) // => Some(2)

``orElse()``
------------

.. code-block:: typescript

    orElse(other: () => Option<T>): Option<T>

Returns ``Some()`` if we have a value, otherwise returns the result
of calling ``other()``.

``other()`` is called *only* when needed.

Example:

.. code-block:: typescript

    Some(1).orElse(() => Some(2)) // => Some(1)
    None.orElse(() => Some(2)) // => Some(2)

``OptionSomeType``
------------------

.. code-block:: typescript

    type OptionSomeType<T extends Option<any>>

A utility type that extracts the ``Some`` value type from an ``Option``.

Example:

.. code-block:: typescript

    type Input = Option<string>
    type Output = OptionSomeType<Input> // string

``OptionSomeTypes``
-------------------

.. code-block:: typescript

    type OptionSomeTypes<T extends Option<any>[]>

A utility type that extracts the ``Some`` value types from a tuple of ``Option``'s,
producing a tuple of the inner types.

Example:

.. code-block:: typescript

    type Input = [Option<string>, Option<number>, Option<boolean>]
    type Output = OptionSomeTypes<Input> // [string, number, boolean]

.. _toAsyncOption:

``toAsyncOption()``
-------------------

.. code-block:: typescript

    toAsyncOption(): AsyncOption<T>

Creates an `AsyncOption` based on this `Option`.

Useful when you need to compose results with asynchronous code.


``toResult()``
--------------

.. code-block:: typescript

    toResult<E>(error: E): Result<T, E>

Maps an ``Option<T>`` to a ``Result<T, E>``.

``unwrap()``
------------

.. code-block:: typescript

    unwrap(): T

Returns the contained ``Some`` value.
Because this function may throw, its use is generally discouraged.
Instead, prefer to handle the ``None`` case explicitly.

If you know you're dealing with ``Some`` and the compiler knows it too (because you tested
`isSome()`_ or `isNone()`_) you should use `value`_ instead. While ``Some``'s `unwrap()`_ and `value`_ will
both return the same value using `value`_ is preferable because it makes it clear that
there won't be an exception thrown on access.

Throws if the value is ``None``.

``unwrapOr()``
--------------

.. code-block:: typescript

    unwrapOr<T2>(val: T2): T | T2

Returns the contained ``Some`` value or a provided default.

``unwrapOrElse()``
------------------

.. code-block:: typescript

    unwrapOrElse<T2>(f: () => T2): T | T2

Returns the contained ``Some`` value or computes a value with a provided function.

The function is called at most one time, only if needed.

Example:

.. code-block:: typescript

    Some('OK').unwrapOrElse(
        () => { console.log('Called'); return 'UGH'; }
    ) // => 'OK', nothing printed

    None.unwrapOrElse(() => 'UGH') // => 'UGH'

Iterable
--------

``Option`` implements the ``Iterable`` interface, allowing you to use it in ``for...of`` loops
and with spread syntax.

- ``Some<T>`` yields its contained value once
- ``None`` yields nothing (empty iterator)

Example:

.. code-block:: typescript

    for (const value of Some(42)) {
        console.log(value); // 42
    }

    for (const value of None) {
        console.log(value); // never executes
    }

    [...Some(1)] // [1], type: number[]
    [...None] // [], type: never[]

    const options = [Some(1), None, Some(3)];
    options.flatMap(opt => [...opt]); // [1, 3], type: number[]


.. _cause: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
