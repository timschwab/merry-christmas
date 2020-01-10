<template>
	<div class="container">
		<div>
			<p>{{ message }}</p>
		</div>

		<div id="init-container" v-show="!initialized">
			<button class="btn btn-primary" v-on:click="init">Initialize system</button>
		</div>

		<div id="reinit-container" v-show="initialized">
			<button class="btn btn-primary" v-on:click="reinit">Re-initialize system</button>
		</div>

		<div id="byWord-container" v-show="initialized">
			<button class="btn btn-primary" v-on:click="byWord">Find solutions by word</button>
			<input type="text" id="byWord-arg" value="timmy">
			<br />
		</div>

		<div id="bySample-container" v-show="initialized">
			<input type="button" class="btn" id="bySample" value="Find some solutions by random sample of words">
			<input type="text" id="bySample-arg" value="100">
			<br />
		</div>

		<div id="reset-container" v-show="initialized && solutionsFound && solutionsFiltered">
			<input type="button" class="btn" id="reset" value="Reset to most recent solution search">
			<br />
		</div>

		<div id="sampleSolutions-container" v-show="initialized && solutionsFound">
			<input type="button" class="btn" id="sampleSolutions" value="Sample current solutions">
			<input type="text" id="sampleSolutions-arg" value="15">
			<br />
		</div>

		<div id="filterSolutions-container" v-show="initialized && solutionsFound">
			<input type="button" class="btn" id="filterSolutions" value="Filter current solutions">
			<input type="text" id="filterSolutions-arg" value="caesar">
		</div>
		
		<div id="results"></div>
	</div>
</template>

<script>
	const solver = require('./solver')
	let vm

	module.exports = {
		created: function() {
			vm = this
		},
		data: function() {
			return {
				message: 'Waiting for initialization',
				initialized: false,
				solutionsFound: false,
				solutionsFiltered: false
			}
		},
		methods: {
			init: function() {
				vm.message = "Initializing..."
				solver.init()
				vm.message = "Initialized and cached. Now, find either 1) all solutions that include a certain word or 2) some random solutions."
				vm.initialized = true
			},
			reinit: function() {
				vm.message = "Re-initializing..."
				solver.reinit()
				vm.message = "'Re-initialized and cached. Now, find either 1) all solutions that include a certain word or 2) some random solutions.'"
			}
		}
	}
</script>

<style>
</style>
