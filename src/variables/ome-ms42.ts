import type ModuleInstance from '../main.js'
import { commonVariableDefinitions } from './common.js'

export type VariablesSchema = {
	input1Connected: string
	input2Connected: string
	input3Connected: string
	input4Connected: string
	output1Enabled: string
	output2Enabled: string
	routeOutput1: string
	routeOutput2: string
	statusAudioOutAnalog: string
	statusAudioOutHDMI: string
	statusAudioOutHDBaseT: string
	statusUsbHostLogic: string
	statusUsbHostRoute: string
	statusUsbVbusControl: string
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setModelVariableDefinitions({
		...commonVariableDefinitions,
		input1Connected: { name: 'Input 1 Connection Status' },
		input2Connected: { name: 'Input 2 Connection Status' },
		input3Connected: { name: 'Input 3 Connection Status' },
		input4Connected: { name: 'Input 4 Connection Status' },
		output1Enabled: { name: 'Output 1 Enable Status' },
		output2Enabled: { name: 'Output 2 Enable Status' },
		routeOutput1: { name: 'Output 1 Route Status' },
		routeOutput2: { name: 'Output 2 Route Status' },
		statusAudioOutAnalog: { name: 'Analog Audio Output status' },
		statusAudioOutHDMI: { name: 'HDMI Audio Output status' },
		statusAudioOutHDBaseT: { name: 'HDBaseT Audio Output status' },
		statusUsbHostLogic: { name: 'USB Host Logic status' },
		statusUsbHostRoute: { name: 'USB Host Route status' },
		statusUsbVbusControl: { name: 'USB VBus Power status' },
	})
}
