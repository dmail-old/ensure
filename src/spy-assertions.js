import assert from "assert"
import { assertAround } from "./assertions.js"

const getLastCallWhenSpy = value => {
	if (typeof value === "function") {
		value = value.getLastCall()
	}
	return value
}
const whenSpy = (getCallFromSpy, fn) => (value, ...args) => {
	if (typeof value === "function") {
		value = getCallFromSpy(value)
	}
	return fn(value, ...args)
}
const allowSpy = fn => whenSpy(getLastCallWhenSpy, fn)

// always prefer assertCalledOnce, assertCalledTwice, assertCalledExactly to assertCalled
// because assertCalled is just too permissive
export const assertCalled = (...args) =>
	args.forEach(arg => assert(getLastCallWhenSpy(arg).wasCalled(), null, "was not called"))

export const assertNotCalled = (...args) =>
	args.forEach(arg => assert(getLastCallWhenSpy(arg).wasCalled() === false, null, "was called"))

export const assertCalledExactly = (spy, expectedCallCount) => {
	const actualCallCount = spy.getCallCount()
	assert.equal(
		actualCallCount,
		expectedCallCount,
		`should be called exactly ${expectedCallCount} times (got ${actualCallCount})`
	)
}
export const assertCallCount = assertCalledExactly

export const assertCalledOnce = spy => assertCalledExactly(spy, 1)
export const assertCalledTwice = spy => assertCalledExactly(spy, 2)

// always prefer assertCalls to assertCalledWith
// because assertCalledWith is too permissive
export const assertCalledWith = allowSpy((call, ...args) => {
	assertCalled(call)
	assert.deepEqual(call.getArgs(), args)
})

export const assertLastCallArgs = (spy, fn) => {
	assertCalled(spy)
	fn(spy.getLastCall().getArgs())
}

export const assertLastCallReturn = (spy, fn) => {
	assertCalled(spy)
	fn(spy.getLastCall().getValue())
}

export const assertCalledIn = allowSpy((call, expectedMs) => {
	assertCalled(call)
	assertAround(call.getDuration(), expectedMs)
})

export const assertCalls = (spy, ...expectedCallsArgs) => {
	assertCalledExactly(spy, expectedCallsArgs.length)
	expectedCallsArgs.forEach((expectedCallArgs, index) =>
		assertCalledWith(spy.getCall(index), ...expectedCallArgs)
	)
}

export const assertCalledBefore = (spy, nextSpy) => {
	const spyFirstCall = spy.getFirstCall()
	const nextSpyFirstCall = nextSpy.getFirstCall()

	assertCalled(spyFirstCall)
	assertCalled(nextSpyFirstCall)

	if (spyFirstCall.wasCalledBefore(nextSpyFirstCall)) {
		assert.fail("must be called before", "called after")
	}
}

export const assertCalledInOrder = (...spies) => {
	spies.forEach((spy, index) => {
		if (index > 0) {
			assertCalledBefore(spies[index - 1], spy)
		}
	})
}
