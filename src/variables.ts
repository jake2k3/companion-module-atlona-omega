import type ModuleInstance from './main.js'
import {
	UpdateVariableDefinitions as UpdateOmeMs42Variables,
	type VariablesSchema as OmeMs42VariablesSchema,
} from './variables/ome-ms42.js'
import {
	UpdateVariableDefinitions as UpdateOmeMs52wVariables,
	type VariablesSchema as OmeMs52wVariablesSchema,
} from './variables/ome-ms52w.js'
import {
	UpdateVariableDefinitions as UpdateOmePs62Variables,
	type VariablesSchema as OmePs62VariablesSchema,
} from './variables/ome-ps62.js'
import {
	UpdateVariableDefinitions as UpdateOmeSw32Variables,
	type VariablesSchema as OmeSw32VariablesSchema,
} from './variables/ome-sw32.js'

export type CommonVariablesSchema = {
	deviceModel: string
	deviceVersion: string
}

export type VariablesSchema = CommonVariablesSchema &
	Partial<
		Omit<OmeMs42VariablesSchema, keyof CommonVariablesSchema> &
			Omit<OmeMs52wVariablesSchema, keyof CommonVariablesSchema> &
			Omit<OmePs62VariablesSchema, keyof CommonVariablesSchema> &
			Omit<OmeSw32VariablesSchema, keyof CommonVariablesSchema>
	>

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	if (self.config.model === 'ome-ms52w') {
		UpdateOmeMs52wVariables(self)
		return
	}
	if (self.config.model === 'ome-ps62') {
		UpdateOmePs62Variables(self)
		return
	}
	if (self.config.model === 'ome-sw32') {
		UpdateOmeSw32Variables(self)
		return
	}

	UpdateOmeMs42Variables(self)
}
