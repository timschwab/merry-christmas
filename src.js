let anagrams
let words
let wordDict
let solutions

const numOfBlocks = blocks.length
const numOfChoices = blocks[0].length
const defaultSampleSize = 100
const defaultSolutionAmount = 100

function getSolutions(amount) {
	amount = amount || defaultSolutionAmount

	return _.sampleSize(solutions, amount)
}

function main(sampleSize) {
	sampleSize = sampleSize || defaultSampleSize

	getAnagrams()
	getWords()
	buildWordDict()
	findSolutions(sampleSize)
}

function getAnagrams() {
	anagrams = {}

	if (localStorage.getItem('anagrams')) {
		console.log('Retrieving anagrams...')
		anagrams = JSON.parse(localStorage.getItem('anagrams'))
	} else {
		console.log('Generating anagrams...')
		for (let i = 0 ; i < numOfChoices**numOfBlocks ; i++) {
			anagrams[generateOneAnagram(i)] = 1
		}

		localStorage.setItem('anagrams', JSON.stringify(anagrams))
	}

	console.log('Done')

	function generateOneAnagram(index) {
		let anagram = ''
	
		for (let k = 0 ; k < blocks.length ; k++) {
			let choice = index % numOfChoices
			anagram += blocks[k][choice]
			index = Math.round((index - choice) / numOfChoices)
		}
	
		return canonicalVersion(anagram)
	}
}

function getWords() {
	words = []

	if (localStorage.getItem('words')) {
		console.log('Retrieving words...')
		words = JSON.parse(localStorage.getItem('words'))
	} else {
		console.log('Loading words...')
		scrabbleList = scrabble.trim().split('\n')
		nameList = names.trim().split('\n')
		words = _.uniq(scrabbleList.concat(nameList))
	
		console.log('Removing impossible words...')
		words = words.filter((word) => {
			return canWork(canonicalVersion(word))
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

	console.log('Done')
}

function buildWordDict() {
	wordDict = {}

	console.log('Building word dictionary...')

	words.forEach((word) => {
		wordDict[word.canonical] = word.list
	})
}

/*
	Algorithm: starts with one word solutions, which is exactly the words data
	structure. Next it combines them all with each other, finding the two word
	solutions. Then it combines these with the one word solutions, which finds
	the three word solutions. And so on, until it cannot continue.
*/
function findSolutions(sampleSize) {
	console.log('Sampling word list...')
	words = _.sampleSize(words, sampleSize)

	solutions = []

	console.log('Finding solutions...')

	console.log('Finding solutions with 1 word...')
	let solutionSet = firstSolutions()
	let wordCount = 1
	while (solutionSet.length > 0) {
		solutions.push(solutionSet)
		console.log('Finding solutions with ' + wordCount + ' words...')
		wordCount++
		solutionSet = nextSolutions(solutionSet)
	}
	console.log('No solutions with ' + wordCount + ' words.')

	console.log('Combining all solutions...')
	solutions = _.flatten(solutions)

	console.log('Translating solutions...')
	solutions = solutions.map(translateSolution)
	solutions = _.flatten(solutions)

	console.log('Done')

	function firstSolutions() {
		console.log('Copying words into first solution list...')

		let firstList = []
		words.forEach((word) => {
			let copy = {
				canonical: word.canonical,
				factors: [[word.canonical]]
			}

			firstList.push(copy)
		})

		return firstList
	}

	// By far, most compute-intensive function
	function nextSolutions(solutions) {
		let nextSolutions = {}
	
		// For every solution, try combining it with every word
		// This double loop is the bottleneck of the entire algorithm
		for (let sol = 0 ; sol < solutions.length ; sol++) {
			let solCanon =  solutions[sol].canonical
			let maxLength = numOfBlocks - solCanon.length
	
			for (let wrd = 0 ; wrd < words.length ; wrd ++) {
				let wrdCanon = words[wrd].canonical
	
				if (wrdCanon.length > maxLength) {
					continue
				}
	
				let combined = canonicalVersion(solCanon + wrdCanon)
				if (canWork(combined)) {
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
		let expanded = solution.factors.map((factors) => {
			return factors.map((word) => {
				return wordDict[word]
			})
		})

		let translated = expanded.map((list) => {
			return listCombinations(list, ' ')
		})

		return _.flatten(translated)
	}
}

// Assumes str is in canonical version
function canWork(str) {
	if (anagrams[str] !== undefined) {
		return true
	} else {
		return false
	}
}

function canonicalVersion(str) {
	let chars = str.split('')
	let sorted = chars.sort()
	return sorted.join('')
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
			row.push(array[subarray][index])
			choiceVar = Math.round((choiceVar - index) / array[subarray].length)
		}

		choices[choice] = row.join(separator)
	}

	return choices
}

function recalc() {
	localStorage.removeItem('anagrams')
	localStorage.removeItem('words')
	main()
}










