const solverSystem = require('./solver')

/*
	Set up
*/

let solver
let workingSolutions

$(setupGui)

function setupGui() {
	solver = solverSystem.createSolver()

	$("#init").click(initClick)
	$("#reinit").click(reinitClick)
	$("#byWord").click(byWordClick)
	$("#bySample").click(bySampleClick)
	$("#reset").click(resetClick)
	$("#sampleSolutions").click(sampleSolutionsClick)
	$("#filterSolutions").click(filterSolutionsClick)
}

/*
	Event handlers
*/

function initClick() {
	$("#message").html('Initializing...')
	setTimeout(() => {
		solver.init()

		$("#message").html('Initialized and cached. Now, find either 1) all solutions that include a certain word or 2) some random solutions.')
		$("#init-container").addClass('hidden')
		$("#reinit-container").removeClass('hidden')
		$("#byWord-container").removeClass('hidden')
		$("#bySample-container").removeClass('hidden')	
	}, 100)
}

function reinitClick() {
	$("#message").html('Re-initializing...')
	setTimeout(() => {
		solver.reinit()

		$("#message").html('Re-initialized and cached. Now, find either 1) all solutions that include a certain word or 2) some random solutions.')
		$("#reset-container").addClass('hidden')
		$("#sampleSolutions-container").addClass('hidden')
		$("#filterSolutions-container").addClass('hidden')	
	}, 100)
}

function byWordClick() {
	let arg = $("#byWord-arg").val()
	$("#message").html('Finding all solutions that contain "' + arg + '"...')

	setTimeout(() => {
		if (!solver.findSolutionsByWord(arg)) {
			$("#message").html('No solutions exist that contain "' + arg + '".')
		} else {
			workingSolutions = solver.getSolutions()
			$("#message").html('Found ' + workingSolutions.length + ' solutions.')
			$("#reset-container").addClass('hidden')
			$("#sampleSolutions-container").removeClass('hidden')
			$("#filterSolutions-container").removeClass('hidden')	
		}
	}, 100)
}

function bySampleClick() {
	$("#message").html('Finding some solutions by word sample...')
	setTimeout(() => {
		let arg = $("#bySample-arg").val()
		solver.findSolutionsBySample(arg)
		workingSolutions = solver.getSolutions()

		$("#message").html('Found ' + workingSolutions.length + ' solutions.')
		$("#reset-container").addClass('hidden')
		$("#sampleSolutions-container").removeClass('hidden')
		$("#filterSolutions-container").removeClass('hidden')
	}, 100)
}

function resetClick() {
	workingSolutions = solver.getSolutions()
	$("#message").html('Reset solutions.')
	$("#reset-container").addClass('hidden')
}

function sampleSolutionsClick() {
	$("#message").html('Getting some solutions...')
	setTimeout(() => {
		let arg = $("#sampleSolutions-arg").val()
		let sample = sampleWorkingSolutions(arg)

		if (sample.length > 0) {
			drawSolutions(sample)
			$("#message").html('Drew ' + sample.length + ' solutions.')
		} else {
			$("#message").html('No working solutions to sample.')
		}
	}, 100)
}

function filterSolutionsClick() {
	$("#message").html('Filtering working solutions...')
	setTimeout(() => {
		let arg = $("#filterSolutions-arg").val()
		let filtered = filterWorkingSolutions(arg)

		if (filtered.length > 0) {
			$("#message").html('Filtered solutions and got ' + filtered.length +' results.')
			$("#reset-container").removeClass('hidden')
			workingSolutions = filtered
		} else {
			$("#message").html('No working solutions contain "' + arg + '".')
		}
	}, 100)
}

/*
	Util functions
*/

function drawSolutions(solutions) {
	let html = ""
	solutions.forEach(solution => {
		html += solution + "<br \>"
	})
	$("#results").html(html)
}

function filterWorkingSolutions(word) {
	let regex = new RegExp('\\b' + word + '\\b')

	return workingSolutions.filter(solution => {
		return regex.test(solution)
	})
}

function sampleWorkingSolutions(size) {
	return _.sampleSize(workingSolutions, size)
}

