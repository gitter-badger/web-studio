<template>
	<div class="layer-tree" :id="layer.id" :class="{selected: layer.selected}" @click="onclick" @contextmenu="$showPopupMenu(localPopupMenu)" v-if="layer">
		<span class="icon" :class="'icon-arrow-' + (layer.collapsed ? 'collapse' : 'expand')" @click.stop="$setQuietly(layer, 'collapsed', !layer.collapsed)" v-if="layer.type === 'group' || layer === root"></span>
		<span class="icon" :class="'icon-element-' + layer.type" v-if="layer.type"></span>
		<span class="name-edit" v-if="input">
			<input v-model.trim="inputValue" @blur.once="endRename" @keyup.enter="endRename" ref="input">
		</span>
		<span class="name" @dblclick.prevent="ondblclick" @click.stop="onclick" v-else>{{layer.name}}</span>
		<div class="actions" :class="{locked: layer.locked, hidden: layer.hidden}">
			<span class="status-text" v-if="statusText">{{statusText}}</span>
			<slot>
				<span class="icon icon-lock" @click.stop="$setQuietly(layer, 'locked', !layer.locked)"></span>
				<span class="icon icon-hidden" @click.stop="$setQuietly(layer, 'hidden', !layer.hidden)"></span>
			</slot>
		</div>
		<layer-tree :layer="l" :root="root" v-for="l in layer.children" :key="l.id"></layer-tree>
	</div>
</template>

<script lang="ts">
	import Vue, { ComponentOptions, PropOptions } from 'vue'

	interface LayerComponent extends Vue, EditorScope {
		layer: any
		root: any
		input: boolean
		inputValue: any
		popupMenu: any[]
		focus(): void
		rename(): void
	}

	export default {
		name: 'layer-tree',
		props: {
			layer: { type: Object, required: true },
			root: { type: Object, required: true },
			popupMenu: { type: Array, default: () => [] },
			statusText: String,
		},
		data() {
			return {
				input: false,
				inputValue: null,
			}
		},
		computed: {
			localPopupMenu(): any[] {
				return [
					{
						label: 'Rename',
						callback: 'rename'
					},
					{
						label: 'Delete',
						callback: 'delete'
					}
				].concat(this.popupMenu)
			}
		},
		methods: {
			onclick(e): void {
				if (this.input) {
					return
				}

				if (this.layer === this.root) {
					this.$setQuietly(this.layer, 'collapsed', !this.layer.collapsed)
					return
				}

				if (this.layer.selected) {
					return
				}

				if (!this.layer.selected) {
					this.$setQuietly(this.layer, 'selected', true)
				}
			},
			ondblclick(e): void {
				// root can be renamed by double click
				if (this.layer === this.root) {
					return
				}

				this.rename()
			},
			focus(): void {
				if (this.$refs.input) {
					(this.$refs.input as HTMLInputElement).select()
				}
			},
			rename(): void {
				if (!this.layer.selected && this.layer !== this.root) {
					this.$setQuietly(this.layer, 'selected', true)
					this.$setSelections(this.layer, this.root)
				}

				this.input = true
				this.inputValue = this.layer.name
				this.$nextTick(() => this.focus())
			},
			endRename(): void {
				if (this.inputValue) {
					this.layer.name = this.inputValue
				}
				this.input = false
				this.inputValue = null
			},
			delete(): void {
				this.$removeWebObject(this.root)
			}
		},
	} as ComponentOptions<LayerComponent>
</script>

<style lang="less">
	.layer-tree {
		position: relative;
		width: 100%;
		margin-bottom: 3px;
		cursor: pointer;

		.icon {
			font-size: 16px;
			line-height: 16px;
			vertical-align: middle;
			color: rgba(255, 255, 255, 0.6);
			transition: color 0.24s;
		}

		.name {
			font-size: 12px;
			color: rgba(255, 255, 255, 0.6);
			transition: color 0.24s;
		}

		&:hover,
		&.current {
			.name {
				color: #fff;
			}
		}
	}
</style>
