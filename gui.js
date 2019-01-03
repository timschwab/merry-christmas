// When the DOM is ready, initialize the event handlers and whatnot
$(initGui)

function initGui() {
	$("#init").click(() => {
		init()
		$("#reinit-container").removeClass('hidden')
		$("#init-container").addClass('hidden')
	})
}