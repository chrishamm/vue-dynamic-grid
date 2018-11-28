<style>
.vue-grid-layout {
	background-color: #EEEEEE;
}

.vue-grid-item {
	background-color: #00FFFF;
}

.current-size {
	background-color: #FFCCCC;
}
</style>

<template>
    <div id="app">
		<h1>Vue Dynamic Grid</h1>
		<div style="width: 100%;">
			<div style="display: inline; width: 100%;">
				<div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" :class="{ 'current-size' : size == windowSize }" style="display: inline-block; width: 20%;">
					<h4>{{ size }} layout</h4>
					X: <input v-model.number="newItemParams[size].values[0]" :disabled="newItemParams[size].hidden || newItemParams[size].skip" type="number"><br/>
					Y: <input v-model.number="newItemParams[size].values[1]" :disabled="newItemParams[size].hidden || newItemParams[size].skip" type="number"><br/>
					Width: <input v-model.number="newItemParams[size].values[2]" :disabled="newItemParams[size].hidden || newItemParams[size].skip" type="number"><br/>
					Height: <input v-model.number="newItemParams[size].values[3]" :disabled="newItemParams[size].hidden || newItemParams[size].skip" type="number"><br/>
					Hidden: <input v-model="newItemParams[size].hidden" type="checkbox">
					Skip: <input v-model="newItemParams[size].skip" type="checkbox">
				</div>
			</div>
		</div>

		<div style="width: 100%; margin-top: 30px;">
			Title (Prop): <input v-model="newItemParams.title" type="text">
			Content (Setting): <input v-model="newItemParams.setting" type="text">
			Min Width: <input v-model.number="newItemParams.minW" type="number">
			Min Height: <input v-model.number="newItemParams.minH" type="number">
			Max Width: <input v-model.number="newItemParams.maxW" type="number">
			Max Height: <input v-model.number="newItemParams.maxW" type="number">
		</div>

		<div style="width: 100%; margin-top: 30px;">
			<button @click="addItem('dummy-div')">Add new div</button>
			<button @click="addItem('dummy-button')">Add new button</button>
			<input v-model="editing" type="checkbox">Edit Mode</input>
			<button @click="save">Save</button>
			<button @click="clear">Clear</button>
			<button @click="load" :disabled="storedLayout == null">Load</button>
			<br/><br/>
			<span>Note: If layouts for different sizes are skipped, the default is copied for each resolution. This grid has 24 columns.</span>
		</div>

		<h2>Grid Container:</h2>
		<dynamic-grid ref="grid" :editing="editing" :size.sync="windowSize" :autoResize="true">
			<dynamic-grid-item :md="[0, 0, 8, 4]" settings="created via static template">
				<dummy-div>
					<!-- Components must remain empty if save+load are supposted to be used. We don't support recursive reconstruction, so use settings+props instead -->
				</dummy-div>
			</dynamic-grid-item>

			<dynamic-grid-item :md="[0, 4, 8, 4]" settings="created via static template">
				<dummy-div>
					<!-- See above -->
				</dummy-div>
			</dynamic-grid-item>
		</dynamic-grid>
	</div>
</template>

<script>
'use strict';

import Vue from 'vue'
import './components'

// Note: Components that are used by the grid's addElement function MUST BE REGISTERED GLOBALLY!
import './Dummies.js'

export default {
	mounted() {
		// This add call is as minimalist as possible
		this.$refs.grid.addElement("dummy-div", { md: [ 8, 0, 8, 4] }, "created programatically on load");
	},
	data() {
		return {
			newItemParams: {
				xs: { values: [ 0, 0, 4, 2], hidden: false, skip: true },
				sm: { values: [ 0, 0, 4, 2], hidden: false, skip: true },
				md: { values: [ 0, 0, 4, 2], hidden: false, skip: false },
				lg: { values: [ 0, 0, 4, 2], hidden: false, skip: true },
				xl: { values: [ 0, 0, 4, 2], hidden: false, skip: true },
				minW: 1,
				minH: 1,
				maxW: 24,		// These default
				maxH: 24,		// to Infinity
				title: "",
				setting: "test"
			},
			editing: true,
			storedLayout: null,
			windowSize: "md"
		}
	},
	methods: {
		addItem(tag) {
			let layouts = {
				xs: this.newItemParams.xs.hidden ? "hidden" : this.newItemParams.xs.values,
				sm: this.newItemParams.sm.hidden ? "hidden" : this.newItemParams.sm.values,
				md: this.newItemParams.md.hidden ? "hidden" : this.newItemParams.md.values,
				lg: this.newItemParams.lg.hidden ? "hidden" : this.newItemParams.lg.values,
				xl: this.newItemParams.xl.hidden ? "hidden" : this.newItemParams.xl.values,
				minW: this.newItemParams.minW,
				minH: this.newItemParams.minH,
				maxW: this.newItemParams.maxW,
				maxH: this.newItemParams.maxH
			};

			if (this.newItemParams.xs.skip) { delete layouts.xs; }
			if (this.newItemParams.sm.skip) { delete layouts.sm; }
			if (this.newItemParams.md.skip) { delete layouts.md; }
			if (this.newItemParams.lg.skip) { delete layouts.lg; }
			if (this.newItemParams.xl.skip) { delete layouts.xl; }

			this.$refs.grid.addElement(tag, layouts, this.newItemParams.setting, { title: this.newItemParams.title });
		},
		save() {
			// This attempts to retrieve the settings of each element by evaluating save() where applicable
			this.storedLayout = this.$refs.grid.save();
		},
		clear() {
			this.$refs.grid.clear();
		},
		load() {
			// This also invokes load(settings) on the child components where applicable
			this.$refs.grid.load(this.storedLayout);
		}
	}
}
</script>
