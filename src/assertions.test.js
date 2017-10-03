import { assertDifferent } from "./assertions.js"

export default ({ pass, fail }) => {
	assertDifferent(1, 2)
	try {
		assertDifferent(1, 1)
		return fail("1 and 1 must be different")
	} catch (e) {
		return pass("1 and 1 are the same")
	}
}
