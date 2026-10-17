import type ModuleInstance from './main.js'
import { UpdateActions as UpdateOmeMs42Actions, type ActionsSchema } from './actions/ome-ms42.js'
import { UpdateActions as UpdateOmeMs52wActions } from './actions/ome-ms52w.js'
import { UpdateActions as UpdateOmePs62Actions } from './actions/ome-ps62.js'
import { UpdateActions as UpdateOmeSw32Actions } from './actions/ome-sw32.js'

export type { ActionsSchema }

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
