Getting started with ``Result``
===============================

Convert this:

.. code-block:: typescript

    import { existsSync, readFileSync } from 'fs';

    function readFile(path: string): string {
        if (existsSync(path)) {
            return readFileSync(path);
        } else {
            // Callers of readFile have no way of knowing the function can fail
            throw new Error('invalid path');
        }
    }

    // This line may fail unexpectedly without warnings from typescript
    const text = readFile('test.txt');


To this:

.. code-block:: typescript

    import { existsSync, readFileSync } from 'fs';
    import { Ok, Err, Result } from 'ts-results-es';

    function readFile(path: string): Result<string, 'invalid path'> {
        if (existsSync(path)) {
            return new Ok(readFileSync(path)); // new is optional here
        } else {
            return new Err('invalid path'); // new is optional here
        }
    }

    // Typescript now forces you to check whether you have a valid result at compile time.
    const result = readFile('test.txt');
    if (result.isOk()) {
        // text contains the file's content
        const text = result.value;
    } else {
        // err equals 'invalid path'
        const err = result.error;
    }
