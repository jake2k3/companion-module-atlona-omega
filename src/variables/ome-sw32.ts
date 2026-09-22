import type ModuleInstance from '../main.js'
import { commonVariableDefinitions } from './common.js'

export type VariablesSchema = {
	input1Connected: string
	input2Connected: string
	input3Connected: string
	output1Enabled: string
	output2Enabled: string
	routeOutput1: string
	routeOutput2: string
	statusAudioOutAnalog: string
	statusCommaWait: string
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setModelVariableDefinitions({
		...commonVariableDefinitions,
		input1Connected: { name: 'Input 1 Connection Status' },
		input2Connected: { name: 'Input 2 Connection Status' },
		input3Connected: { name: 'Input 3 Connection Status' },
		output1Enabled: { name: 'Output 1 Enable Status' },
		output2Enabled: { name: 'Output 2 Enable Status' },
		routeOutput1: { name: 'Output 1 Route Status' },
		routeOutput2: { name: 'Output 2 Route Status' },
		statusAudioOutAnalog: { name: 'Analog Audio Output status' },
		statusCommaWait: { name: 'CommaWait status' },
	})
}
