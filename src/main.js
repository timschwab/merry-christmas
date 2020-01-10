window.$ = window.jQuery = require('jquery')
window._ = require('lodash')

const Vue = require('vue')
const App = require('./App.vue').default

new Vue({
	el: '#app',
	render: h => h(App)
})
