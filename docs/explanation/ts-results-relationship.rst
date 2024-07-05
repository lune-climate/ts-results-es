Relationship with ts-results
============================

This package is a friendly fork of the excellent https://github.com/vultix/ts-results/
created due to time constraints on our (Lune's) side – we needed a package
available with some fixes.

Notable changes compared to the original package:

* Added ESM compatibility
* ``Option`` gained extra methods: ``mapOr()``, ``mapOrElse()``, ``or()``,
  ``orElse()``
* ``Result`` also gained extra methods: ``mapOr()``, ``mapOrElse()``,
  ``expectErr()``, ``or()``, ``orElse()``
* ``Ok`` and ``Err`` no longer have the ``val`` property – it's ``Ok.value`` and ``Err.error`` now
* There is ``Some.value`` which replaced ``Some.val``
* Boolean flags were replaced with methods:

  * ``Option.some`` -> ``Option.isSome()``
  * ``Option.none`` -> ``Option.isNone()``
  * ``Result.ok`` -> ``Result.isOk()``
  * ``Result.err`` -> ``Result.isErr()``

We'll try to get the changes merged into the upstream package so that this fork
can become obsolete.
