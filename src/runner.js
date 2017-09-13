import path from 'path'

const asyncSerie = (array, fn) => array.reduce(
	(acc, value) => acc.then(
		() => fn(value)
	),
	Promise.resolve()
)

// const mapAsync = (...args) => Promise.all(args.map(
// 	(arg) => Promise.resolve().then(arg)
// ))

export const ensure = (testName, namedFunctions, ...args) => {
	const exec = (execution) => asyncSerie(
		Object.keys(namedFunctions),
		(name) => new Promise(
			(resolve) => {
				if (execution.stopped) {
					resolve()
					return
				}
				execution.currentTestName = name
				const value = namedFunctions[name]
				if (name === 'stop' && value) {
					execution.stopped = true
					resolve()
					return
				}
				resolve(value(...args))
			}
		)
	)
	return {
		name: testName,
		exec,
	}
}

const run = (test) => {
	const execution = {
		stopped: false,
		currentTestName: null
	}

	return test.exec(execution).then(
		() => console.log(`tests passed: ${test.name}`),
		(e) => {
			setTimeout(
				() => {
					console.log(execution.currentTestName)
					throw e
				}
			)
		}
	)
}

export const expose = (test, testModule) => {
	testModule.exports = test
	if (require.main === testModule) {
		run(test)
	}
}

export const runFiles = (filenames, dirname) => {
	const execution = {
		stopped: false,
		currentTestName: null
	}

	asyncSerie(
		filenames,
		(filename) => {
			const filepath = path.resolve(dirname, filename)
			// eslint-disable-next-line import/no-dynamic-require
			const fileExports = require(filepath)

			return fileExports ? run(fileExports) : undefined
		}
	).then(
		() => {
			console.log('all test passed')
		},
		(e) => {
			setTimeout(
				() => {
					console.log('currentTest', execution.currentTestName)
					throw e
				}
			)
		}
	)
}
