let solver
let workingSolutions

$(setupGui)

function setupGui() {
	solver = createSolver()

	$("#init").click(initClick)
	$("#reinit").click(reinitClick)
	$("#byWord").click(byWordClick)
	$("#bySample").click(bySampleClick)
	$("#sampleSolutions").click(sampleSolutionsClick)
	$("#filterSolutions").click(filterSolutionsClick)
}

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
		$("#sampleSolutions-container").addClass('hidden')
		$("#filterSolutions-container").addClass('hidden')	
	}, 100)
}

function byWordClick() {
	let arg = $("#byWord-arg").val()
	$("#message").html('Finding solutions that contain "' + arg + '"...')

	setTimeout(() => {
		if (!solver.findSolutionsByWord(arg)) {
			$("#message").html('No solutions exist that contain "' + arg + '".')
			return
		}

		$("#message").html('Found ' + solver.getSolutions().length + ' solutions.')
		$("#sampleSolutions-container").removeClass('hidden')
		$("#filterSolutions-container").removeClass('hidden')	
	}, 100)
}

function bySampleClick() {
	$("#message").html('Finding solutions by word sample...')
	setTimeout(() => {
		let arg = $("#bySample-arg").val()
		solver.findSolutionsBySample(arg)

		$("#message").html('Found ' + solver.getSolutions().length + ' solutions.')
		$("#sampleSolutions-container").removeClass('hidden')
		$("#filterSolutions-container").removeClass('hidden')
	}, 100)
}

function sampleSolutionsClick() {
	$("#message").html('Getting some solutions...')
	setTimeout(() => {
		let arg = $("#sampleSolutions-arg").val()
		let workingSolutions = solver.sampleSolutions(arg)

		if (workingSolutions.length > 0) {
			drawSolutions(workingSolutions)
		} else {

		}
	}, 100)
}

function filterSolutionsClick() {
	$("#message").html('Filtering current solutions...')
	setTimeout(() => {
		let arg = $("#sampleSolutions-arg").val()
		let workingSolutions = solver.filterSolutions(arg)

		if (workingSolutions.length > 0) {
			$("#message").html('Filtered solutions and got ' + 2 +' results...')
		} else {
			$("#message").html('Filtered solutions...')
		}
	}, 100)
}

function drawSolutions(solutions) {
	let html = ""
	$("results").html(html)
}

