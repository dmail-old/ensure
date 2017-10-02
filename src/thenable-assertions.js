import assert from "assert"

export const createPromiseResolvedIn = (...args) => {
	const [ms, value] = args
	return new Promise(resolve => {
		setTimeout(() => (args.length > 1 ? resolve(value) : resolve()), ms)
	})
}

export const assertResolvedAround = (thenable, expectedMs, maxGap) => {
	if (typeof expectedMs !== "number") {
		throw new TypeError("assertResolvedAround second arg must be a number")
	}
	if (maxGap === undefined) {
		maxGap = expectedMs * 0.3 + 10
	} else if (typeof maxGap !== "number") {
		throw new TypeError("assertResolvedAround thrid arg must be a number")
	}
	const timeout = {}
	const before = Number(Date.now())
	let duration
	let minDuration = expectedMs - maxGap
	let maxDuration = expectedMs + maxGap
	return Promise.race([
		exports.createPromiseResolvedIn(maxDuration).then(() => timeout),
		Promise.resolve(thenable).then(value => {
			duration = Number(Date.now()) - before
			return value
		})
	]).then(value => {
		if (value === timeout) {
			assert.fail(
				`resolved around ${expectedMs}ms (+/-${maxGap}ms)`,
				`timedout after ${maxDuration}ms`
			)
		}
		if (duration < minDuration) {
			assert.fail(
				`resolved around ${expectedMs}ms (+/-${maxGap}ms)`,
				`resolved too fast (after ${duration}ms)`
			)
		}
		return value
	})
}

export const assertResolved = thenable =>
	thenable.then(
		value => value,
		reason => assert.fail(`has rejected with ${reason}`, "expected to resolve")
	)
export const assertRejected = thenable =>
	thenable.then(() => {
		assert.fail("has resolved", "expected to reject")
	}, reason => reason)

export const assertRejectAfterAround = (thenable, expectedDuration) => {
	const offset = Date.now()
	const maxGap = expectedDuration * 0.4 + 10
	return exports.assertRejected(thenable).then(reason => {
		const duration = Date.now() - offset
		const gap = expectedDuration - duration
		if (gap > 0 && gap > maxGap) {
			assert.fail(
				`rejected after around ${expectedDuration}`,
				`rejected faster than expected (${duration})`
			)
		} else if (Math.abs(gap) > maxGap) {
			assert.fail(
				`rejected after around ${expectedDuration}`,
				`rejected slowly than expected (${duration})`
			)
		}
		return reason
	})
}

export const assertResolveAfterAround = (thenable, expectedDuration) => {
	const offset = Date.now()
	const maxGap = expectedDuration * 0.4 + 10
	return thenable.then(value => {
		const duration = Date.now() - offset
		const gap = expectedDuration - duration
		if (gap > 0 && gap > maxGap) {
			assert.fail(
				`resolved after around ${expectedDuration}`,
				`resolved faster than expected (${duration})`
			)
		} else if (Math.abs(gap) > maxGap) {
			assert.fail(
				`resolved after around ${expectedDuration}`,
				`resolved slowly than expected (${duration})`
			)
		}
		return value
	})
}
