<style>
.vue-grid-item > * {
	height: 100%;
	width: 100%;
}
.vue-grid-item:focus {
	background-color: red;
}
.vue-grid-item:focus > * {
	opacity: 0.8;
}
.vue-grid-item.vue-resizable > * {
	pointer-events: none;
}
.vue-grid-item > .close-icon {
	top: 3px;
	box-sizing: border-box;
	cursor: pointer;
	height: 12px;
	padding: 0 3px 3px 0;
	pointer-events: all;
	position: absolute;
	right: 0;
	width: 12px;
	z-index: 1;
}
.vue-grid-item.vue-resizable > span.vue-resizable-handle {
	pointer-events: all;
}
</style>

<script>
'use strict';

import VueGridLayout from 'vue-grid-layout'

const breakpoints = [ "xs", "sm", "md", "lg", "xl" ];
const inheritedGridItemProperties = ["minW", "minH", "maxW", "maxH"];

let itemsToAdd = [];

// Get the requested size from an object or at least a deserialized fallback option
function getDescriptor(item, size) {
	let value;
	if (item.hasOwnProperty(size)) {
		value = item[size];
	} else if (item.hasOwnProperty("fallback")) {
		value = item.fallback;
	} else if (item.hasOwnProperty("md")) {
		value = item.md;
	} else {
		throw "Descriptor not found";
	}

	if (value == "hidden") {
		return [0, 0, 0, 0];
	}
	if (value.constructor === String) {
		return JSON.parse(value);
	}
	return value;
}

export default {
	name: 'DynamicGrid',
	components: {
		'vue-grid-layout': VueGridLayout.GridLayout,
		'vue-grid-item':  VueGridLayout.GridItem
	},
	computed: {
		layout: {
			get() { return this.responsive ? this.layouts[this.size] : this.layouts.md; },
			set(value) {
				if (this.responsive) {
					this.layouts[this.size] = value;
				} else {
					this.layout.md = value;
				}
			}
		}
	},
	data() {
		return {
			gridItems: [],
			isReady: false,
			itemKey: 1,
			items: [],
			layouts: {
				xs: [],
				sm: [],
				md: [],
				lg: [],
				xl: []
			},
			selectedItem: null,
			size: "md"
		}
	},
	props: {
		editing: {
			type: Boolean,
			default: false
		},
		numCols: {
			type: Number,
			default: 24
		},
		responsive: {
			type: Boolean,
			default: true
		}
	},
	watch: {
		editing(to) {
			if (!to) {
				// Reset selected item once the edit mode is turned off
				this.selectElement(null);
			}
		}
	},
	methods: {
		addElement(tagName, layouts, settings, childProps) {
			if (!this.isReady) {
				this.$nextTick(function() {
					// FiXME If we attempt to add elements before vue-grid-layout is rendered
					// for the first time, we get a JavaScript error message in the console...
					this.addElement(tagName, layouts, settings, childProps);
				});
				return;
			}

			this.items.push({
				key: this.itemKey++,
				settings,
				settingsLoaded: false
			});

			breakpoints.forEach(function(size) {
				const descriptor = getDescriptor(layouts, size).slice();
				this.layouts[size].push({
					x: descriptor[0],
					y: descriptor[1],
					w: descriptor[2],
					h: descriptor[3],
					i: this.layouts[size].length,
				});
			}, this);

			itemsToAdd.push({ tagName, childProps });
			this.$forceUpdate();
		},
		removeElement(item) {
			if (item == this.selectedItem) {
				this.selectElement(null);
			}

			this.gridItems.splice(item.i, 1);
			this.items.splice(item.i, 1);
			breakpoints.forEach(function(size) {
				this.layouts[size].splice(item.i, 1);
				this.layouts[size].forEach(function(layout, i) {
					if (layout.i > item.i) {
						layout.i--;
					}
				});
			}, this);

			this.$emit("itemRemoved", item);
		},
		selectElement(item) {
			if (item == this.selectedItem) {
				// Don't invoke too many events...
				return;
			}

			if (this.editing || item == null) {
				this.selectedItem = item;
				this.$emit("itemSelected", item);
			}

			if (item == null) {
				// Hide the placeholder in case a drag event is still going
				this.$children[0].placeholder.i = -1;

				const focusedItem = this.$el.querySelector(":focus");
				if (focusedItem != null) {
					focusedItem.blur();
				}
			}
		},
		clear() {
			this.gridItems = [];
			this.items = [];
			breakpoints.forEach(function(size) {
				this.layouts[size] = [];
			}, this);
			this.itemKey = 1;
		},
		load(items) {
			this.clear();
			items.forEach(function(item) {
				this.addElement(item.tagName, item.layouts, item.settings, item.childProps);
			}, this);
		},
		save() {
			return this.gridItems.map(function(gridItem, index) {
				const child = gridItem.componentOptions.children[0];

				let item = {
					tagName: child.componentOptions.tag,
					layouts: {}
				};

				breakpoints.forEach(function(size) {
					const descriptor = this.layouts[size][index];
					item.layouts[size] = [ descriptor.x, descriptor.y, descriptor.w, descriptor.h ];
				}, this);
				inheritedGridItemProperties.forEach(function(prop) {
					if (gridItem.componentOptions.propsData.hasOwnProperty(prop)) {
						item.layouts[prop] = gridItem.componentOptions.propsData[prop];
					}
				});

				if (child.componentOptions.propsData !== undefined) {
					item.childProps = child.componentOptions.propsData;
				}
				if (child.componentInstance.save !== undefined) {
					item.settings = child.componentInstance.save();
				}

				return item;
			}, this);
		},
		registerBreakpoint(condition, size) {
			if (window.matchMedia(condition).matches) {
				this.size = size;
			}

			const me = this;
			window.matchMedia(condition).addListener(function(query) {
				if (query.matches) {
					me.size = size;
					me.$emit("sizeChanged", size);
				}
			});
		}
	},
	beforeMount() {
		// Add missing layout entries for each slot
		this.$slots.default.forEach(function(slot, index) {
			breakpoints.forEach(function(size) {
				const descriptor = getDescriptor(slot.componentOptions.propsData, size);
				this.layouts[size].push({
					x: descriptor[0],
					y: descriptor[1],
					w: descriptor[2],
					h: descriptor[3],
					i: index
				});
			}, this);

			this.gridItems.push(slot);
			this.items.push({
				key: this.itemKey++,
				settings: slot.componentOptions.propsData.settings,
				settingsLoaded: false
			});
		}, this);

		// Make sure this component becomes responsive. See Element-UI breakpoints for further information.
		// Unfortunately we cannot use the "responsive" prop of the GridLayout because that messes up the rendering during resizes
		this.registerBreakpoint("(max-width: 767px)", "xs");
		this.registerBreakpoint("(min-width: 768px) and (max-width: 991px)", "sm");
		this.registerBreakpoint("(min-width: 992px) and (max-width: 1199px)", "md");
		this.registerBreakpoint("(min-width: 1200px) and (max-width: 1919px)", "lg");
		this.registerBreakpoint("(min-width: 1920px)", "xl");
	},
	render(createElement) {
		// FIXME See note in addElement()
		if (!this.isReady) {
			this.$nextTick(function() {
				this.isReady = true;
			});
		}

		// Create new items programatically here
		itemsToAdd.forEach(function(item) {
			const component = createElement(item.tagName, (item.childProps !== undefined) ? { props: item.childProps } : {});
			const gridItem = createElement('grid-item', [ component ]);
			this.gridItems.push(gridItem);
			this.$slots.default.push(gridItem);
		}, this);
		itemsToAdd = [];

		// Render everything
		return createElement('vue-grid-layout',
			{
				props: {
					layout: this.layout,
					colNum: this.numCols,
					rowHeight: 15,
					isDraggable: this.editing,
					isResizable: this.editing,
					verticalCompact: true,
					margin: [10, 10],
					useCssTransforms: false
				},
			},
			this.gridItems.map(function(gridItem, index) {
				// Bind layout values and inherit layout properties
				const layout = this.layout[index];
				let props = {
					x: layout.x,
					y: layout.y,
					w: layout.w,
					h: layout.h,
					i: index
				};

				const gridItemProps = gridItem.componentOptions.propsData;
				for(let key in gridItemProps) {
					if (inheritedGridItemProperties.indexOf(key) != -1) {
						props[key] = gridItemProps[key];
					}
				}

				// Render replacement for virtual grid item component
				const item = this.items[index];
				const el = createElement('vue-grid-item',
					{
						attrs: this.editing ? { tabIndex: (index + 1) } : {},
						key: this.items[index].key,
						nativeOn: {
							blur(e) { el.context.selectElement(null); },
							focus(e) { el.context.selectElement(el.componentInstance); }
						},
						props,
						style: (layout.w + layout.h == 0) ? { display: "none" } : {}
					},
					[
						createElement('span',
							{
								class: { 'close-icon': true },
								on: {
									click(e) { el.context.removeElement(el.componentInstance); }
								},
								style: (!this.editing) ? { display: "none" } : {}
							},
							["x"]
						),
						gridItem.componentOptions.children
					]);

				// Load saved data on next tick
				if (!item.settingsLoaded) {
					this.$nextTick(function() {
						const instance = gridItem.componentOptions.children[0].componentInstance;
						if (!item.settingsLoaded && instance !== undefined) {
							const loadFn = instance.load;
							if (loadFn !== undefined) {
								loadFn(item.settings);
							}

							item.settingsLoaded = true;
							el.context.$emit("itemAdded", instance.$parent);
						}
					});
				}

				return el;
			}, this)
		);
	}
}
</script>
