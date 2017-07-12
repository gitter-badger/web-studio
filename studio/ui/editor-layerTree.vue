<template>
	<div class="layer-tree" :class="{selected: layer.selected}" @click="select" @dblclick="select">
		<span class="icon" :class="'icon-arrow-' + (layer.collapsed ? 'collapse' : 'expand')" @click.stop="$noRecordUpdateWeb(layer, 'collapsed', !layer.collapsed)" v-if="layer.type === 'group'"></span>
		<span class="icon" :class="'icon-element-' + layer.type"></span>
		<span class="title-edit" v-if="input">
			<input v-model="layer.title" @focus="input = false" @keypress.enter="input = false">
		</span>
		<span class="title" @dblclick.stop="rename" v-else>{{layer.title}}</span>
		<div class="status" :class="{locked: layer.locked, hidden: layer.hidden}">
			<span class="icon icon-lock" @click.stop="$set(layer, 'locked', !layer.locked)"></span>
			<span class="icon icon-hidden" @click.stop="$set(layer, 'hidden', !layer.hidden)"></span>
		</div>
		<layer-tree :layer="l" :parent="layer" v-for="l in layer.children" :key="l"></layer-tree>
	</div>
</template>

<script lang="ts">
	import Vue, { ComponentOptions } from 'vue'

	interface LayerComponent extends Vue, EditorScope {
		layer: any
		input: boolean
	}

	export default {
		name: 'layer-tree',
		props: ['layer', 'parent'],
		data() {
			return {
				input: false
			}
		},
		methods: {
			select: function (e) {
				if (!this.layer.selected) {
					Vue.set(this.layer, 'selected', true)
				}
			},
			rename: function () {
				if (!this.layer.selected) {
					this.$setSelections(this.layer)
				}

				this.input = true
			}
		},
	} as ComponentOptions<LayerComponent>
</script>

<style lang="less">
	.layer-tree {
		position: relative;
		width: 100%;
		margin-bottom: 3px;

		.icon {
			font-size: 16px;
			line-height: 16px;
			vertical-align: middle;
			color: rgba(255, 255, 255, 0.6);
			transition: color 0.24s;
			cursor: pointer;
		}

		.text {
			font-size: 12px;
			line-height: 16px;
			vertical-align: middle;
			text-transform: uppercase;
		}

		.title {
			color: rgba(255, 255, 255, 0.6);
			transition: color 0.24s;

			&:hover,
			&.current {
				color: #fff;
			}
		}
	}
</style>
