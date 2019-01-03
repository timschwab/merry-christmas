// When the DOM is ready, initialize the event handlers and whatnot
let solver
$(initGui)

function initGui() {
	solver = createSolver()

	$("#init").click(() => {
		solver.init()
		$("#reinit-container").removeClass('hidden')
		$("#init-container").addClass('hidden')
	})
}

