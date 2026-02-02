.. _explanation-nullable-optional-nullish:

Why three methods for converting nullable values to Option
==========================================================

TypeScript distinguishes between ``null`` and ``undefined``, but it is common to treat them
interchangeably using the ``T | null | undefined`` (nullish) type. This is not always correct.

``null`` and ``undefined`` can carry different meanings. A value that is ``null`` might mean
"explicitly empty" while ``undefined`` might mean "not yet provided." If your code conflates the
two, a type change from ``T | null`` to ``T | null | undefined`` — intended to introduce a new
``undefined`` case that should be handled differently — will compile silently and the new case
will be swallowed.

This is why ts-results-es provides three separate methods:

- :ref:`fromNullable() <method-Option-fromNullable>` for ``T | null`` — only ``null`` becomes
  ``None``, ``undefined`` stays in ``Some``.
- :ref:`fromOptional() <method-Option-fromOptional>` for ``T | undefined`` — only ``undefined``
  becomes ``None``, ``null`` stays in ``Some``.
- :ref:`fromNullish() <method-Option-fromNullish>` for ``T | null | undefined`` — both ``null``
  and ``undefined`` become ``None``.

By using the most specific method, the compiler will catch it if the value type changes in a way
that requires attention. For example, suppose you have a value of type ``string | null`` and convert
it using :ref:`fromNullable() <method-Option-fromNullable>`:

.. code-block:: typescript

    const name: string | null = getName();
    const option = Option.fromNullable(name); // Option<string>

If the type of ``name`` later changes to ``string | null | undefined`` — with the intention that
``undefined`` should be handled differently — the code above will fail to compile, forcing you to
decide how to handle the new case. Had you used
:ref:`fromNullish() <method-Option-fromNullish>` instead, the change would compile silently and
``undefined`` would be swallowed into ``None``.

Prefer :ref:`fromNullable() <method-Option-fromNullable>` or
:ref:`fromOptional() <method-Option-fromOptional>` when possible. Use
:ref:`fromNullish() <method-Option-fromNullish>` only when the value is already both nullable and
optional and you genuinely want ``null`` and ``undefined`` to be treated the same.
