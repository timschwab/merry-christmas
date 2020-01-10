/*
	Available functions:
		init()
		reinit(arg) - 'all', 'anagrams', 'words', 'wordDict'
		findSolutionsByWord(wordToFind)
		findSolutionsBySample(sampleSize)
		sampleSolutions(amount)
		filterSolutions(word)
*/
function createSolver() {
	let solver = {}

	let anagrams
	let words
	let wordDict
	let solutions

	const numOfBlocks = blocks.length
	const defaultSampleSize = 100
	const defaultRetrieveAmount = 100

	solver.init = function() {
		if (!anagrams) {
			getAnagrams()
		}

		if (!words) {
			getWords()
		}

		if (!wordDict) {
			buildWordDict()
		}

		console.log('Done')

		function getAnagrams() {
			anagrams = {}
		
			if (localStorage.getItem('anagrams')) {
				console.log('Retrieving anagrams...')
				anagrams = JSON.parse(localStorage.getItem('anagrams'))
			
			} else {
				console.log('Generating anagrams...')
			
				let rawAnagrams = listCombinations(blocks, '')
				rawAnagrams.forEach((anagram) => {
					anagrams[canonicalVersion(anagram)] = 1
				})

				delete anagrams['']
			
				localStorage.setItem('anagrams', JSON.stringify(anagrams))
			}
		}

		function getWords() {
			words = []
		
			if (localStorage.getItem('words')) {
				console.log('Retrieving words...')
				words = JSON.parse(localStorage.getItem('words'))
			} else {
				console.log('Loading words...')
				wordList = rawWords.trim().toLowerCase().split('\n')
				nameList = names.trim().toLowerCase().split('\n')
				words = _.uniq(wordList.concat(nameList))
			
				console.log('Removing impossible words...')
				words = words.filter((word) => {
					return canWork(word)
				})
			
				console.log('Generating canonical reverse indices...')
				words = words.map((word) => {
					return {
						original: word,
						canonical: canonicalVersion(word)
					}
				})
			
				console.log('Sorting by canonical index...')
				words = words.sort((a, b) => {
					if (a.canonical > b.canonical){
						return 1
					} else {
						return -1
					}
				})
			
				console.log('Combining identical indices...')
				words = words.reduce((soFar, next, index, array) => {
				if ((soFar.length == 0) || (array[index-1].canonical != next.canonical)) {
					soFar.push({
						canonical: next.canonical,
						list: [next.original]
					})
				} else {
					soFar[soFar.length-1].list.push(next.original)
				}
			
				return soFar
				}, [])

				localStorage.setItem('words', JSON.stringify(words))
			}
		}

		function buildWordDict() {
			wordDict = {}
		
			console.log('Building word dictionary...')
		
			words.forEach((word) => {
				wordDict[word.canonical] = word.list
			})
		}
	}

	solver.reinit = function(arg) {
		arg = arg || 'all'

		if (arg == 'all') {
			localStorage.removeItem('anagrams')
			anagrams = undefined

			localStorage.removeItem('words')
			words = undefined

			wordDict = undefined
		} else if (arg == 'anagrams') {
			localStorage.removeItem('anagrams')
			anagrams = undefined
		} else if (arg == 'words') {
			localStorage.removeItem('words')
			words = undefined
		} else if (arg == 'wordDict') {
			wordDict = undefined
		} else {
			console.log('Didn\'t understand that argument.')
			return
		}

		solver.init()
	}

	// Find all the solutions that contain this word
	solver.findSolutionsByWord = function(wordToFind) {
		wordToFind = wordToFind || ''
		wordToFind = wordToFind.toLowerCase()

		console.log('Checking possibility...')

		if (!canWork(wordToFind)) {
			console.log('No solutions contain "' + wordToFind + '".')
			return false
		}

		console.log('Creating initial solution set...')

		let word = words.filter(word => {
			return word.list.includes(wordToFind)
		})

		let firstSet = [{
			canonical: word[0].canonical,
			factors: [[word[0].canonical]]
		}]

		solutions = findSolutions(words, firstSet)
		return true
	}

	// Find all the solutions by randomly restricting the available words to a certain number
	solver.findSolutionsBySample = function(sampleSize) {
		sampleSize = sampleSize || defaultSampleSize

		console.log('Sampling word list...')
		let wordList = _.sampleSize(words, sampleSize)
		let firstSet = firstSolutions(wordList)

		solutions = findSolutions(wordList, firstSet)

		function firstSolutions(wordList) {
			// Simply copy the words into the first solution list
			let firstList = []
			wordList.forEach((word) => {
				let copy = {
					canonical: word.canonical,
					factors: [[word.canonical]]
				}

				firstList.push(copy)
			})

			return firstList
		}
	}

	// Get a random sample of the solutions already found
	solver.sampleSolutions = function(amount) {
		amount = amount || defaultRetrieveAmount

		return _.sampleSize(solutions, amount)
	}

	// Return only the solutions that contain a particular word
	solver.filterSolutions = function(word) {
		return solutions.filter(s => {
			return s.includes(word)
		})
	}

	solver.getSolutions = function() {
		return solutions
	}

	return solver

	/*
		Main algorithm. Starts with one word solutions, which is exactly the words data
		structure. Next it combines them all with each other, finding the two word
		solutions. Then it combines these with the one word solutions, which finds
		the three word solutions. And so on, until it cannot continue.
	*/
	function findSolutions(wordList, firstSet) {
		console.log('Finding solutions...')

		let result = []

		let solutionSet = firstSet
		let wordCount = 1
		while (solutionSet.length > 0) {
			result.push(solutionSet)
			wordCount++
			console.log('Finding solutions with ' + wordCount + ' words...')
			solutionSet = nextSolutions(solutionSet)
		}
		console.log('No solutions with ' + wordCount + ' words.')

		console.log('Combining all solutions...')
		result = _.flatten(result)

		console.log('Translating solutions...')
		result = result.map(translateSolution)
		result = _.flatten(result)

		console.log('Done.')

		return result

		// By far, the most compute-intensive function
		function nextSolutions(solutions) {
			let nextSolutions = {}
		
			// For every solution, try combining it with every word
			// This double loop is the bottleneck of the entire algorithm
			for (let sol = 0 ; sol < solutions.length ; sol++) {
				let solCanon =  solutions[sol].canonical
				let maxLength = numOfBlocks - solCanon.length
			
				for (let wrd = 0 ; wrd < wordList.length ; wrd ++) {
					let wrdCanon = wordList[wrd].canonical

					// Some optimization - a length check is faster than canWorkFast(canonicalVersion(solCanon + wrdCanon))
					if (wrdCanon.length > maxLength) {
						continue
					}
				
					let combined = canonicalVersion(solCanon + wrdCanon)
					if (canWorkFast(combined)) {
						addToSolutionSet(nextSolutions, combined, solutions[sol], wrdCanon)
					}
				}
			}
		
			// Convert back to list
			let result = []
			for (let solution in nextSolutions) {
				result.push({
					canonical: solution,
					factors: nextSolutions[solution]
				})
			}
		
			return result
		}

		// This isn't the bottleneck, but any optimization here would be pretty big, and there definitely could be optimization
		function addToSolutionSet(solutionSet, canonical, prev, factor) {
			let newFactors = prev.factors.map((factorList) => {
				return factorList.concat(factor).sort()
			})
		
			if (solutionSet[canonical]) {
				solutionSet[canonical] = _.uniqBy(solutionSet[canonical].concat(newFactors), (list) => {
					return list.join('-')
				})
			} else {
				solutionSet[canonical] = newFactors
			}
		}

		function translateSolution(solution) {
			// Replace each canonical form with the array of real words
			let expanded = solution.factors.map((factors) => {
				return factors.map((word) => {
					return wordDict[word]
				})
			})

			// Generate the possible sentences with the real words
			let translated = expanded.map((list) => {
				return listCombinations(list, ' ')
			})

			return _.flatten(translated)
		}
	}

	/*
		Only util functions beneath this line
	*/

	function canonicalVersion(str) {
		let chars = str.split('')
		let sorted = chars.sort()
		return sorted.join('')
	}

	function canWork(str) {
		return canWorkFast(canonicalVersion(str))
	}

	// Assumes str is in canonical version and anagrams has been built
	function canWorkFast(str) {
		if (anagrams[str] !== undefined) {
			return true
		} else {
			return false
		}
	}

	// Given an array of arrays of strings, get all combinations of contents, with one selection per child array
	function listCombinations(array, separator) {
		let numOfChoices = array.reduce((soFar, current) => {return soFar * current.length}, 1)
		let choices = []

		// Iterate through all choices
		for (let choice = 0 ; choice < numOfChoices ; choice++) {
			let row = []

			// With the choice we have, select one element from each subarray
			let choiceVar = choice
			for (let subarray = 0 ; subarray < array.length ; subarray++) {
				let index = choiceVar % array[subarray].length
				row[subarray] = array[subarray][index]
				choiceVar = Math.round((choiceVar - index) / array[subarray].length)
			}

			choices[choice] = row.join(separator)
		}

		return choices
	}
}

module.exports = {
	createSolver: createSolver
}







