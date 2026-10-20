import type { CompanionVariableDefinitions } from '@companion-module/base'
import type { CommonVariablesSchema } from '../variables.js'

export const commonVariableDefinitions = {
	deviceModel: { name: 'Model of the unit' },
	deviceVersion: { name: 'Current firmware version of the unit' },
} satisfies CompanionVariableDefinitions<CommonVariablesSchema>
