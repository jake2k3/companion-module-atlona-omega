import type ModuleInstance from './main.js'

import {
	UpdateActions as UpdateOmeMs42Actions,
	type ActionsSchema as OmeMs42ActionsSchema,
} from './actions/ome-ms42.js'

import {
	UpdateActions as UpdateOmeMs52wActions,
	type ActionsSchema as OmeMs52wActionsSchema,
} from './actions/ome-ms52w.js'

import {
	UpdateActions as UpdateOmePs62Actions,
	type ActionsSchema as OmePs62ActionsSchema,
} from './actions/ome-ps62.js'

import {
	UpdateActions as UpdateOmeSw32Actions,
	type ActionsSchema as OmeSw32ActionsSchema,
} from './actions/ome-sw32.js'

type ModelActionsSchema = OmeMs42ActionsSchema | OmeMs52wActionsSchema | OmePs62ActionsSchema | OmeSw32ActionsSchema
type KeysOfUnion<T> = T extends T ? keyof T : never
type SchemaForKey<T, K extends PropertyKey> = T extends Record<K, infer Value> ? Value : never

export type ActionsSchema = {
	[K in KeysOfUnion<ModelActionsSchema>]: SchemaForKey<ModelActionsSchema, K>
}

export function UpdateActions(self: ModuleInstance): void {
	const model = String(self.config.model)

	switch (model) {
		case 'ome-ms52w':
			UpdateOmeMs52wActions(self)
			return
		case 'ome-ps62':
			UpdateOmePs62Actions(self)
			return
		case 'ome-sw32':
			UpdateOmeSw32Actions(self)
			return
		default:
			UpdateOmeMs42Actions(self)
	}
}
