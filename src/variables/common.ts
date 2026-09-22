import type { CompanionVariableDefinitions } from '@companion-module/base'
import type { CommonVariablesSchema } from '../variables.js'

export const commonVariableDefinitions = {
	statusBlink: { name: 'Blink status' },
	statusPower: { name: 'Power status' },
	type: { name: 'Model of the unit' },
	version: { name: 'Current firmware version of the unit' },
} satisfies CompanionVariableDefinitions<CommonVariablesSchema>
