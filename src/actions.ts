import type ModuleInstance from './main.js'
import { UpdateActions as UpdateOmeMs42Actions, type ActionsSchema } from './actions/ome-ms42.js'
import { UpdateActions as UpdateOmeSw32Actions } from './actions/ome-sw32.js'

export type { ActionsSchema }

export function UpdateActions(self: ModuleInstance): void {
	if (self.config.model === 'ome-sw32') {
		UpdateOmeSw32Actions(self)
		return
	}

	UpdateOmeMs42Actions(self)
}
