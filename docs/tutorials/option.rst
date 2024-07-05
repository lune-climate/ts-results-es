Getting started with ``Option``
===============================

Convert this:

.. code-block:: typescript

    declare function getLoggedInUsername(): string | undefined;

    declare function getImageURLForUsername(username: string): string | undefined;

    function getLoggedInImageURL(): string | undefined {
        const username = getLoggedInUsername();
        if (!username) {
            return undefined;
        }

        return getImageURLForUsername(username);
    }

    const stringUrl = getLoggedInImageURL();
    const optionalUrl = stringUrl ? new URL(stringUrl) : undefined;
    console.log(optionalUrl);

To this:

.. code-block:: typescript

    import { Option, Some, None } from 'ts-results-es';

    declare function getLoggedInUsername(): Option<string>;

    declare function getImageForUsername(username: string): Option<string>;

    function getLoggedInImage(): Option<string> {
        return getLoggedInUsername().andThen(getImageForUsername);
    }

    const optionalUrl = getLoggedInImage().map((url) => new URL(stringUrl));
    console.log(optionalUrl); // Some(URL('...'))

    // To extract the value, do this:
    if (optionalUrl.some) {
        const url: URL = optionalUrl.value;
    }
