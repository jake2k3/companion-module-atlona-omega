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
	rs232consoleBaud: string
	rs232consoleDataBits: string
	rs232consoleParity: string
	rs232consoleStopBits: string
	rs232port1Baud: string
	rs232port1DataBits: string
	rs232port1Parity: string
	rs232port1StopBits: string
	rs232port2Baud: string
	rs232port2DataBits: string
	rs232port2Parity: string
	rs232port2StopBits: string
	rs232port3Baud: string
	rs232port3DataBits: string
	rs232port3Parity: string
	rs232port3StopBits: string
	statusAudioOutAnalog: string
	statusCommaWait: string
	statusPower: string
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
		rs232consoleBaud: { name: 'RS-232 Console Baud Rate' },
		rs232consoleDataBits: { name: 'RS-232 Console Data Bits' },
		rs232consoleParity: { name: 'RS-232 Console Parity' },
		rs232consoleStopBits: { name: 'RS-232 Console Stop Bits' },
		rs232port1Baud: { name: 'HDBaseT Input 1 RS-232 Baud Rate' },
		rs232port1DataBits: { name: 'HDBaseT Input 1 RS-232 Data Bits' },
		rs232port1Parity: { name: 'HDBaseT Input 1 RS-232 Parity' },
		rs232port1StopBits: { name: 'HDBaseT Input 1 RS-232 Stop Bits' },
		rs232port2Baud: { name: 'HDBaseT Input 2 RS-232 Baud Rate' },
		rs232port2DataBits: { name: 'HDBaseT Input 2 RS-232 Data Bits' },
		rs232port2Parity: { name: 'HDBaseT Input 2 RS-232 Parity' },
		rs232port2StopBits: { name: 'HDBaseT Input 2 RS-232 Stop Bits' },
		rs232port3Baud: { name: 'HDBaseT Output RS-232 Baud Rate' },
		rs232port3DataBits: { name: 'HDBaseT Output RS-232 Data Bits' },
		rs232port3Parity: { name: 'HDBaseT Output RS-232 Parity' },
		rs232port3StopBits: { name: 'HDBaseT Output RS-232 Stop Bits' },
		statusAudioOutAnalog: { name: 'Analog Audio Output status' },
		statusCommaWait: { name: 'CommaWait status' },
		statusPower: { name: 'Power status' },
	})
}
