Publishing the package
======================

The package is published manually right now.

Steps to publish:

1. Bump the version in ``package.json`` and ``src/package.json`` as needed
2. Update the CHANGELOG
3. Commit to Git in a single commit and add a tag: ``git tag -a vX.X.X`` (the tag description can be
   anything)
4. ```npm run build && npm publish```
5. Push both the ``master`` branch and the new tag to GitHub
