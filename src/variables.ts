import type ModuleInstance from './main.js'
import {
	UpdateVariableDefinitions as UpdateOmeMs42Variables,
	type VariablesSchema as OmeMs42VariablesSchema,
} from './variables/ome-ms42.js'
import {
	UpdateVariableDefinitions as UpdateOmeSw32Variables,
	type VariablesSchema as OmeSw32VariablesSchema,
} from './variables/ome-sw32.js'

export type CommonVariablesSchema = {
	statusBlink: string
	statusPower: string
	type: string
	version: string
}

export type VariablesSchema = CommonVariablesSchema &
	Partial<
		Omit<OmeMs42VariablesSchema, keyof CommonVariablesSchema> &
			Omit<OmeSw32VariablesSchema, keyof CommonVariablesSchema>
	>

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	if (self.config.model === 'ome-sw32') {
		UpdateOmeSw32Variables(self)
		return
	}

	UpdateOmeMs42Variables(self)
}
