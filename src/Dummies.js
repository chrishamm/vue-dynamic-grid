'use strict';

import Vue from 'vue'

Vue.component('dummy-div', {
	data() {
		return {
			content: "default content"
		}
	},
	methods: {
		load(settings) {
			// This can be an object too
			this.content = settings;
		},
		save() {
			return this.content;
		}
	},
	props: {
		title: String
	},
	render: function(createElement) {
		return createElement("div", [this.title ? (this.title + ": " + this.content) : this.content]);
	}
});

Vue.component('dummy-button', {
	data() {
		return {
			content: "default content"
		}
	},
	methods: {
		load(settings) {
			// This can be an object too
			this.content = settings;
		},
		save() {
			return this.content;
		}
	},
	props: {
		title: String
	},
	render: function(createElement) {
		return createElement("button", { attrs: { title: this.title }, on: { click: function(e) { alert("My title: " + e.target.title); } } }, [this.content]);
	}
});

