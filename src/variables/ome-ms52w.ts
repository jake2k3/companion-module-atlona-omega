import type ModuleInstance from '../main.js'
import { commonVariableDefinitions } from './common.js'

export type VariablesSchema = {
	byodType: string
	hostname: string
	input0Connected: string
	input1Connected: string
	input2Connected: string
	input3Connected: string
	input4Connected: string
	output0Status: string
	output1Status: string
	routeOutput0: string
	routeOutput1: string
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setModelVariableDefinitions({
		...commonVariableDefinitions,
		byodType: { name: 'BYOD Input Type' },
		hostname: { name: 'Hostname of the Atlona switcher' },
		input0Connected: { name: 'USB-C Input Connection Status' },
		input1Connected: { name: 'DisplayPort Input Connection Status' },
		input2Connected: { name: 'HDMI 3 Input Connection Status' },
		input3Connected: { name: 'HDMI 4 Input Connection Status' },
		input4Connected: { name: 'BYOD Input Connection Status' },
		output0Status: { name: 'HDBaseT Output Status' },
		output1Status: { name: 'HDMI Output Status' },
		routeOutput0: { name: 'HDBaseT Output Route' },
		routeOutput1: { name: 'HDMI Output Route' },
	})
}
