'use strict';

import Vue from 'vue'

import DynamicGrid from './DynamicGrid.vue'
import DynamicGridItem from './DynamicGridItem.vue'

const VueDynamicGrid = {
	DynamicGrid,
	DynamicGridItem
}

Vue.component('dynamic-grid', DynamicGrid)
Vue.component('dynamic-grid-item', DynamicGridItem)

export default VueDynamicGrid
export { DynamicGrid, DynamicGridItem }
