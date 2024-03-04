import {
    AsyncOption,
    None,
    Some,
} from '../src/index.js';

test('the constructor should work', async () => {
    const option = new AsyncOption(Some(1))
    expect(await option.promise).toEqual(Some(1))
})

test('andThen() should work', async () => {
    const noValue = new AsyncOption(None)
    const hasValue = new AsyncOption(Some(1))

    expect(await noValue.andThen(() => {throw new Error('Should not be called')}).promise).toEqual(None)

    expect(await hasValue.andThen((value) => Some(value * 3)).promise).toEqual(Some(3))
    expect(await hasValue.andThen(async (value) => Some(value * 3)).promise).toEqual(Some(3))
    expect(await hasValue.andThen((value) => new AsyncOption(Some(value * 3))).promise).toEqual(Some(3))
})

test('map() should work', async () => {
    const noValue = new AsyncOption(None)
    const hasValue = new AsyncOption(Some(1))

    expect(await noValue.map(() => {throw new Error('Should not be called')}).promise).toEqual(None)
    expect(await hasValue.map((value) => value * 2).promise).toEqual(Some(2))
    expect(await hasValue.map(async (value) => value * 2).promise).toEqual(Some(2))
})

test('or() should work', async () => {
    const noValue = new AsyncOption(None)
    const hasValue = new AsyncOption(Some(1))

    expect(await noValue.or(Some(200)).promise).toEqual(Some(200))
    expect(await hasValue.or(Some(200)).promise).toEqual(Some(1))

    expect(await noValue.or(new AsyncOption(Some(200))).promise).toEqual(Some(200))
    expect(await hasValue.or(new AsyncOption(Some(200))).promise).toEqual(Some(1))

    expect(await noValue.or(Promise.resolve(Some(200))).promise).toEqual(Some(200))
    expect(await hasValue.or(Promise.resolve(Some(200))).promise).toEqual(Some(1))
})

test('orElse() should work', async () => {
    const noValue = new AsyncOption(None)
    const hasValue = new AsyncOption(Some(1))

    function notExpectedToBeCalled(): never {
        throw new Error('Not expected to be called')
    }

    expect(await hasValue.orElse(notExpectedToBeCalled).promise).toEqual(Some(1))
    expect(await noValue.orElse(() => Some(200)).promise).toEqual(Some(200))
    expect(await noValue.orElse(() => new AsyncOption(Some(200))).promise).toEqual(Some(200))
    expect(await noValue.orElse(() => Promise.resolve(Some(200))).promise).toEqual(Some(200))
})

test('toResult() should work', async () => {
    const result = new AsyncOption(None)
    expect((await result.toResult('Blah').promise).unwrapErr()).toEqual('Blah')
})
