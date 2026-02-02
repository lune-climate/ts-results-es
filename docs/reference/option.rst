.. _class-Option:

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

.. _method-Option-all:

``all()``
---------

.. code-block:: typescript

    // Preferred: pass an array
    static all<T extends Option<any>[]>(options: T): Option<OptionSomeTypes<T>>

    // Deprecated: spread arguments
    static all<T extends Option<any>[]>(...options: T): Option<OptionSomeTypes<T>>

Parse a set of ``Option``'s, returning an array of all ``Some`` values.
Short circuits with the first ``None`` found, if any.

Example:

.. code-block:: typescript

    let options: Option<number>[] = [Some(1), Some(2), Some(3)];
    Option.all(options); // Some([1, 2, 3]), type: Option<number[]>

    // Short-circuits on first None
    let optionsWithNone: Option<number>[] = [Some(1), None, Some(3)];
    Option.all(optionsWithNone); // None, type: Option<number[]>

.. _method-Option-any:

``any()``
---------

.. code-block:: typescript

    // Preferred: pass an array
    static any<T extends Option<any>[]>(options: T): Option<OptionSomeTypes<T>[number]>

    // Deprecated: spread arguments
    static any<T extends Option<any>[]>(...options: T): Option<OptionSomeTypes<T>[number]>

Parse a set of ``Option``'s, short-circuits when an input value is ``Some``.
If no ``Some`` is found, returns ``None``.

Example:

.. code-block:: typescript

    let options: Option<number>[] = [None, Some(1), Some(2)];
    Option.any(options); // Some(1), type: Option<number>

    Option.any([None, None, Some(3)]); // Some(3), type: Option<number>
    Option.any([None, None, None]); // None, type: Option<never>

.. _method-Option-fromNullable:

``fromNullable()``
------------------

.. code-block:: typescript

    static fromNullable<T>(value: T): Option<Exclude<T, null>>

Converts a nullable value to an :ref:`Option <class-Option>`.
Returns ``None`` if the value is ``null``, otherwise returns ``Some`` containing the value.

See also :ref:`fromOptional() <method-Option-fromOptional>` for ``T | undefined`` and :ref:`fromNullish() <method-Option-fromNullish>` for ``T | null | undefined``.

See also the explanation :ref:`explanation-nullable-optional-nullish`.

Example:

.. code-block:: typescript

    const value: string | null = 'hello';
    Option.fromNullable(value); // Some('hello'), type: Option<string>

    const missing: string | null = null;
    Option.fromNullable(missing); // None, type: Option<string>

.. _method-Option-fromOptional:

``fromOptional()``
------------------

.. code-block:: typescript

    static fromOptional<T>(value: T): Option<Exclude<T, undefined>>

Converts an optional value to an :ref:`Option <class-Option>`.
Returns ``None`` if the value is ``undefined``, otherwise returns ``Some`` containing the value.

See also :ref:`fromNullable() <method-Option-fromNullable>` for ``T | null`` and :ref:`fromNullish() <method-Option-fromNullish>` for ``T | null | undefined``.

See also the explanation :ref:`explanation-nullable-optional-nullish`.

Example:

.. code-block:: typescript

    const value: string | undefined = 'hello';
    Option.fromOptional(value); // Some('hello'), type: Option<string>

    const missing: string | undefined = undefined;
    Option.fromOptional(missing); // None, type: Option<string>

.. _method-Option-fromNullish:

``fromNullish()``
-----------------

.. code-block:: typescript

    static fromNullish<T>(value: T): Option<NonNullable<T>>

Converts a nullish value to an :ref:`Option <class-Option>`.
Returns ``None`` if the value is ``null`` or ``undefined``, otherwise returns ``Some`` containing the value.

Prefer :ref:`fromNullable() <method-Option-fromNullable>` for ``T | null`` or :ref:`fromOptional() <method-Option-fromOptional>` for ``T | undefined``.
Use this method only when the value is already both nullable and optional and you genuinely want
``null`` and ``undefined`` to be treated the same.

See also the explanation :ref:`explanation-nullable-optional-nullish`.

Example:

.. code-block:: typescript

    const value: string | null | undefined = 'hello';
    Option.fromNullish(value); // Some('hello'), type: Option<string>

    const missing: string | null | undefined = null;
    Option.fromNullish(missing); // None, type: Option<string>

.. _attribute-Some-EMPTY:

``Some.EMPTY``
--------------

.. code-block:: typescript

    static readonly EMPTY: Some<void>

A static ``Some`` instance containing ``undefined``. Useful when you need to represent
a successful presence without a meaningful value.

Example:

.. code-block:: typescript

    const x: Option<void> = Some.EMPTY

.. _method-Option-andThen:

``andThen()``
-------------

.. code-block:: typescript

    andThen<T2>(mapper: (val: T) => Option<T2>): Option<T2>

Calls ``mapper`` if the ``Option`` is ``Some``, otherwise returns ``None``.
This function can be used for control flow based on ``Option`` values.

.. _attribute-Some-value:

``value``
---------

The value contained in ``Some``. Only present on ``Some`` objects.

.. _method-Option-expect:

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

.. _method-Option-isNone:

``isNone()``
------------

.. code-block:: typescript

    isNone(): this is None

``true`` when the ``Option`` is ``None``.

.. _method-Option-isSome:

``isSome()``
------------

.. code-block:: typescript

    isSome(): this is Some<T>

``true`` when the ``Option`` is ``Some``.

.. _method-Option-map:

``map()``
---------

.. code-block:: typescript

    map<U>(mapper: (val: T) => U): Option<U>

Maps an ``Option<T>`` to ``Option<U>`` by applying a function to a contained ``Some`` value,
leaving a ``None`` value untouched.

This function can be used to compose the Options of two functions.

.. _method-Option-mapOr:

``mapOr()``
-----------

.. code-block:: typescript

    mapOr<U>(default_: U, mapper: (val: T) => U): U

Maps an ``Option<T>`` to ``Option<U>`` by either converting ``T`` to ``U`` using ``mapper`` (in case
of ``Some``) or using the ``default_`` value (in case of ``None``).

If ``default_`` is a result of a function call consider using `mapOrElse()`_ instead, it will
only evaluate the function when needed.

.. _method-Option-mapOrElse:

``mapOrElse()``
---------------

.. code-block:: typescript

    mapOrElse<U>(default_: () => U, mapper: (val: T) => U): U

Maps an ``Option<T>`` to ``Option<U>`` by either converting ``T`` to ``U`` using ``mapper`` (in case
of ``Some``) or producing a default value using the ``default_`` function (in case of ``None``).

.. _method-Option-or:

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

.. _method-Option-orElse:

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

.. _type-OptionSomeType:

``OptionSomeType``
------------------

.. code-block:: typescript

    type OptionSomeType<T extends Option<any>>

A utility type that extracts the ``Some`` value type from an ``Option``.

Example:

.. code-block:: typescript

    type Input = Option<string>
    type Output = OptionSomeType<Input> // string

.. _type-OptionSomeTypes:

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

.. _method-Option-toAsyncOption:

``toAsyncOption()``
-------------------

.. code-block:: typescript

    toAsyncOption(): AsyncOption<T>

Creates an `AsyncOption` based on this `Option`.

Useful when you need to compose results with asynchronous code.


.. _method-Option-toResult:

``toResult()``
--------------

.. code-block:: typescript

    toResult<E>(error: E): Result<T, E>

Maps an ``Option<T>`` to a ``Result<T, E>``.

.. _method-Option-unwrap:

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

.. _method-Option-unwrapOr:

``unwrapOr()``
--------------

.. code-block:: typescript

    unwrapOr<T2>(val: T2): T | T2

Returns the contained ``Some`` value or a provided default.

.. _method-Option-unwrapOrElse:

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

.. _method-Option-Iterable:

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
