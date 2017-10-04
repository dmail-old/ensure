import assert from "assert"

export const isNotTrue = value => value !== true

export const isNotFalse = value => value !== false

export const isNotAFunction = value => typeof value !== "function"

export const isNotAnObject = value => typeof value !== "object"

export const isNotDeepEqual = (actual, expected) => {
	try {
		assert.deepEqual(actual, expected)
		return true
	} catch (e) {
		return false
	}
}

export const throwFailure = (...args) => assert.fail(...args)

export const assertEqual = (...args) => assert.equal(...args)
export const assertEquals = assertEqual

export const assertDifferent = (...args) => assert.notEqual(...args)

export const assertDeepEqual = (...args) => assert.deepEqual(...args)
export const assertDeepEquals = assertDeepEqual

export const assertThrows = (...args) => assert.throws(...args)
export const assertReturns = (...args) => assert.doesNotThrow(...args)

export const assertAround = (value, expectedValue) => {
	const diff = value - expectedValue
	const maxGap = expectedValue * 0.3 + 10
	const gap = Math.abs(diff)
	if (gap > maxGap) {
		assert.fail(
			`value around ${expectedValue} (+/-${maxGap})`,
			diff < 0 ? `value is too small (${value})` : `value is too big (${value})`
		)
	}
}
