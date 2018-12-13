'use strict';

import Vue from 'vue'

import AutoSize from './AutoSize.js'
import DynamicGrid from './DynamicGrid.vue'
import DynamicGridItem from './DynamicGridItem.vue'

const VueDynamicGrid = {
	DynamicGrid,
	DynamicGridItem
}

Vue.component('dynamic-grid', DynamicGrid)
Vue.component('dynamic-grid-item', DynamicGridItem)
Vue.directive('auto-size', AutoSize);

export default VueDynamicGrid
export { DynamicGrid, DynamicGridItem, AutoSize }
