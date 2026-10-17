import type ModuleInstance from '../main.js'
import { commonVariableDefinitions } from './common.js'

export type VariablesSchema = {
	hostname: string
	output0Status: string
	output1Status: string
	routeOutput0: string
	routeOutput1: string
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setModelVariableDefinitions({
		...commonVariableDefinitions,
		hostname: { name: 'Hostname of the Atlona switcher' },
		output0Status: { name: 'HDBaseT Output Status' },
		output1Status: { name: 'HDMI Output Status' },
		routeOutput0: { name: 'HDBaseT Output Route' },
		routeOutput1: { name: 'HDMI Output Route' },
	})
}
