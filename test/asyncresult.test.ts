import {
    AsyncResult,
    Err,
    Ok,
} from '../src/index.js';

test('andThen() should work', async () => {
    const err = Err('error')
    const badResult = new AsyncResult(err)
    const goodResult = new AsyncResult(Ok(100))

    expect(await badResult.andThen(() => {throw new Error('Should not be called')}).promise).toEqual(err)
    expect(await goodResult.andThen((value) => Promise.resolve(Ok(value * 2))).promise).toEqual(Ok(200))
    expect(await goodResult.andThen((value) => Ok(value * 3).toAsyncResult()).promise).toEqual(Ok(300))
})

test('map() should work', async () => {
    const err = Err('error')
    const badResult = new AsyncResult(err)
    const goodResult = new AsyncResult(Ok(100))

    expect(await badResult.map(() => {throw new Error('Should not be called')}).promise).toEqual(err)
    expect(await goodResult.map((value) => Promise.resolve(value * 2)).promise).toEqual(Ok(200))
})

test('or() should work', async () => {
    const err = Err('Boo')
    const badResult = new AsyncResult(err)
    const goodResult = new AsyncResult(Ok(100))

    expect(await badResult.or(Ok(200)).promise).toEqual(Ok(200))
    expect(await goodResult.or(Ok(200)).promise).toEqual(Ok(100))

    expect(await badResult.or(new AsyncResult(Ok(200))).promise).toEqual(Ok(200))
    expect(await goodResult.or(new AsyncResult(Ok(200))).promise).toEqual(Ok(100))

    expect(await badResult.or(Promise.resolve(Ok(200))).promise).toEqual(Ok(200))
    expect(await goodResult.or(Promise.resolve(Ok(200))).promise).toEqual(Ok(100))
})

test('orElse() should work', async () => {
    const err = Err('Boo')
    const badResult = new AsyncResult(err)
    const goodResult = new AsyncResult(Ok(100))
    function notExpectedToBeCalled(): never {
        throw new Error('Not expected to be called')
    }

    expect(await goodResult.orElse(notExpectedToBeCalled).promise).toEqual(Ok(100))
    expect(await badResult.orElse(() => Ok(200)).promise).toEqual(Ok(200))
    expect(await badResult.orElse(() => new AsyncResult(Ok(200))).promise).toEqual(Ok(200))
    expect(await badResult.orElse(() => Promise.resolve(Ok(200))).promise).toEqual(Ok(200))
})
