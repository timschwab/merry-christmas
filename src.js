let anagrams
let words
let sentences

const numOfBlocks = blocks.length
const numOfChoices = blocks[0].length
const defaultSampleSize = 100

function main(sampleSize) {
	sampleSize = sampleSize || defaultSampleSize

	getAnagrams()
	getWords()
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
}

function generateOneAnagram(index) {
	let anagram = ''

	for (let k = 0 ; k < blocks.length ; k++) {
		let choice = index % numOfChoices
		anagram += blocks[k][choice]
		index = Math.round((index - choice) / numOfChoices)
	}

	return canonicalVersion(anagram)
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
	let wordCount = 2
	while (solutionSet.length > 0) {
		solutions.push(solutionSet)
		console.log('Finding solutions with ' + wordCount + ' words...')
		solutionSet = nextSolutions(solutionSet)
		wordCount++
	}

	console.log('Done')
}

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

		for (let wrd = sol ; wrd < words.length ; wrd ++) {
			let wrdCanon = words[wrd].canonical

			if (wrdCanon.length > maxLength) {
				continue
			}

			let combined = canonicalVersion(solCanon + wrdCanon)
			if (canWork(combined)) {
				addToSolution(nextSolutions, combined, solutions[sol], wrdCanon)
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

function addToSolution(solutionSet, canonical, prev, factor) {
	let newFactors = prev.factors.map((factorList) => {
		return factorList.concat(factor)
	})

	if (solutionSet[canonical]) {
		solutionSet[canonical] = solutionSet[canonical].concat(newFactors)
	} else {
		solutionSet[canonical] = newFactors
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

function recalc() {
	localStorage.removeItem('anagrams')
	localStorage.removeItem('words')
	main()
}










