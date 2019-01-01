let anagrams
let words
let sentences

const numOfBlocks = blocks.length
const numOfChoices = blocks[0].length

function main() {
	anagrams = {}
	words = []

	getAnagrams()
	getWords()
	generateSentences()
}

function getAnagrams() {
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

function generateSentences() {
	console.log('Generating sentences...')
	let processing = initSentences()
	//while (processing.length > 0) {
		processing = filterSentences(processing)
		processing = combineSentences(processing)
	//}

	sentences = processing
	console.log('Done')
}

function initSentences() {
	console.log('Copying words into processing list...')

	let processing = []
	words.forEach((word) => {
		let copy = {
			canonical: word.canonical,
			list: []
		}

		word.list.forEach((original) => {
			copy.list.push(original)
		})

		processing.push(copy)
	})

	return processing
}

function filterSentences(processing) {
	return processing.filter((phrase) => {
		return (phrase.canonical.length == numOfBlocks)
	})
}

function combineSentences(processing) {
	// O(n^2), where n = processing.length

	// Combine every word with every other word
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












