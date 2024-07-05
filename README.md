# ts-results-es

A typescript implementation of Rust's [Result](https://doc.rust-lang.org/std/result/)
and [Option](https://doc.rust-lang.org/std/option/) objects.

Brings compile-time error checking and optional values to typescript.

## Relationship with ts-results

This package is a friendly fork of the excellent https://github.com/vultix/ts-results/
created due to time constraints on our (Lune's) side – we needed a package
available with some fixes.

Notable changes compared to the original package:

* Added ESM compatibility
* `Option` gained extra methods: `mapOr()`, `mapOrElse()`, `or()`,
  `orElse()`
* `Result` also gained extra methods: `mapOr()`, `mapOrElse()`,
  `expectErr()`, `or()`, `orElse()`
* `Ok` and `Err` no longer have the `val` property – it's `Ok.value` and `Err.error` now
* There is `Some.value` which replaced `Some.val`
* Boolean flags were replaced with methods:
  * `Option.some` -> `Option.isSome()`
  * `Option.none` -> `Option.isNone()`
  * `Result.ok` -> `Result.isOk()`
  * `Result.err` -> `Result.isErr()`

We'll try to get the changes merged into the upstream package so that this fork
can become obsolete.

## Contents

-   [Installation](#installation)
-   [Example](#example)
    -   [Result Example](#result-example)
    -   [Option Example](#option-example)
-   [Usage](#usage)

## Installation

```bash
$ npm install ts-results-es
```

or

```bash
$ yarn add ts-results-es
```

## Usage

See https://ts-results-es.readthedocs.io/en/latest/reference/api/index.html to see the API
reference.

## Publishing the package

The package is published manually right now.

Steps to publish:

1. Bump the version in `package.json` and `src/package.json` as needed
2. Update the CHANGELOG
3. Commit to Git in a single commit and add a tag: `git tag -a vX.X.X` (the tag description can be
   anything)
4. `npm run build && npm publish`
5. Push both the `master` branch and the new tag to GitHub
