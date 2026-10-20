import type ModuleInstance from '../main.js'
import { commonVariableDefinitions } from './common.js'

export type VariablesSchema = {
	byodType: string
	hostname: string
	input1Connected: string
	input2Connected: string
	input3Connected: string
	input4Connected: string
	input5Connected: string
	output1Status: string
	output2Status: string
	routeOutput1: string
	routeOutput2: string
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setModelVariableDefinitions({
		...commonVariableDefinitions,
		byodType: { name: 'BYOD Input Type' },
		hostname: { name: 'Hostname of the Atlona switcher' },
		input1Connected: { name: 'USB-C Input Connection Status' },
		input2Connected: { name: 'DisplayPort Input Connection Status' },
		input3Connected: { name: 'HDMI 3 Input Connection Status' },
		input4Connected: { name: 'HDMI 4 Input Connection Status' },
		input5Connected: { name: 'BYOD Input Connection Status' },
		output1Status: { name: 'HDBaseT Output Status' },
		output2Status: { name: 'HDMI Output Status' },
		routeOutput1: { name: 'HDBaseT Output Route' },
		routeOutput2: { name: 'HDMI Output Route' },
	})
}
