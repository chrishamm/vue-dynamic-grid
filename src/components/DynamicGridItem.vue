<template>
	<div>
		This is just a dummy and is replaced by a vue-grid-item instance during rendering!
		<slot></slot>
	</div>
</template>

<script>
'use strict';

export default {
	name: "DynamicGridItem",
	props: {
		fallback: Array,
		xs: Array,
		sm: Array,
		md: Array,
		lg: Array,
		xl: Array,

		minW: Number,
		minH: Number,
		maxW: Number,
		maxH: Number,

		settings: Object
	},
}
</script>
