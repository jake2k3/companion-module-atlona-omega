import type ModuleInstance from '../main.js'
// import type { VariablesSchema } from '../variables.js'

export type ActionsSchema = {
	displayInputSet: { options: { input: '1' | '2' | '3' | '4' | '5' } }
	displayMinimalSet: { options: { state: '0' | '1' } }

	// The following actions are "Get Status" commands, only necessary for troubleshooting
	displayInputGet: { options: Record<string, never> }
	displayMinimalGet: { options: Record<string, never> }
	getInputStates: { options: Record<string, never> }
}

export function UpdateActions(self: ModuleInstance): void {
	self.setModelActionDefinitions<ActionsSchema>({
		displayInputGet: {
			name: 'Get Active Input',
			sortName: 'zzz Get Active Input',
			description: 'Gets the active input.',
			options: [],
			callback: async () => {
				try {
					self.log('info', 'Querying device for active input')
					const responsePromise = self.waitForJson(3000)
					self.sendCommand('Display:Input:Get')
					const response = await responsePromise
					const displayInputPayload = response as {
						methodreturn?: string
						result?: { input?: number | string; type?: string }
					}
					const methodreturn =
						typeof displayInputPayload.methodreturn === 'string'
							? displayInputPayload.methodreturn.replace(/\s+/g, '').toLowerCase()
							: ''
					if (methodreturn !== 'display:input:get' || !displayInputPayload.result) {
						self.log('warn', `Unexpected display input response: ${JSON.stringify(displayInputPayload)}`)
						return
					}
					const input = Number(displayInputPayload.result.input)
					if (!Number.isInteger(input) || input < 0 || input > 4) {
						self.log('warn', `Unexpected active input: ${displayInputPayload.result.input}`)
						return
					}
					self.setVariableValues({
						routeOutput1: String(input),
						routeOutput2: String(input),
						byodType: typeof displayInputPayload.result.type === 'string' ? displayInputPayload.result.type : 'unknown',
					})
				} catch (err: any) {
					self.log('error', `Failed to retrieve active input: ${err?.message ?? err}`)
				}
			},
		},

		displayInputSet: {
			name: 'Set Active Input',
			description: 'Sets the active input.',
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: '1',
					choices: [
						{ id: '1', label: '1 - USB-C' },
						{ id: '2', label: '2 - DisplayPort' },
						{ id: '3', label: '3 - HDMI 3' },
						{ id: '4', label: '4 - HDMI 4' },
						{ id: '5', label: '5 - BYOD' },
					],
				},
			],
			callback: async (action) => {
				try {
					const input = action.options.input
					const names: Record<string, string> = {
						'1': 'USB-C',
						'2': 'DisplayPort',
						'3': 'HDMI 3',
						'4': 'HDMI 4',
						'5': 'BYOD',
					}

					if (!/^[1-5]$/.test(input)) {
						self.log('warn', `Invalid input selection: ${input}`)
						return
					}

					const inputIndexed = Number(input) - 1
					self.log('info', `Routing Input ${input} (${names[input]}) to HDBaseT and HDMI Outputs`)
					self.sendCommand(`Display:Input:Set ${inputIndexed}`)
					self.setVariableValues({
						routeOutput1: String(inputIndexed),
						routeOutput2: String(inputIndexed),
					})
				} catch (err: any) {
					self.log('error', `Failed to set active input: ${err?.message ?? err}`)
				}
			},
		},

		displayMinimalGet: {
			name: 'Get Output Display State',
			sortName: 'zzz Get Output Display State',
			description: 'Retrieves the state of the output display.',
			options: [],
			callback: async () => {
				try {
					self.log('info', 'Querying device for output display state')
					self.sendCommand('Display:Minimal:Get')

					const line = await (self as any).waitForLine(/^(on|off|false)$/i, 3000)
					const status = line.trim()

					if (status === 'on') {
						self.log('info', 'Output display is ON.')
						self.setVariableValues({ output1Status: 'on', output2Status: 'on' })
					} else if (status === 'off') {
						self.log('info', 'Output display is OFF.')
						self.setVariableValues({ output1Status: 'off', output2Status: 'off' })
					} else if (status === 'false') {
						self.log('info', 'Output display is NOT CONNECTED.')
						self.setVariableValues({ output1Status: 'false', output2Status: 'false' })
					} else {
						self.log('warn', `Unexpected output display response: ${line}`)
					}
				} catch (err: any) {
					self.log('error', `Failed to retrieve output display state: ${err?.message ?? err}`)
				}
			},
		},

		displayMinimalSet: {
			name: 'Set Output Display State',
			description: 'Sets the state of the output display.',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: '0',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					],
				},
			],
			callback: async (action) => {
				try {
					const state = action.options.state

					if (state === '0') {
						self.log('info', 'Output display set to OFF')
						self.sendCommand('Display:Minimal:Set 0')
						self.setVariableValues({ output1Status: 'off', output2Status: 'off' })
						return
					}

					if (state === '1') {
						self.log('info', 'Output display set to ON')
						self.sendCommand('Display:Minimal:Set 1')
						self.setVariableValues({ output1Status: 'on', output2Status: 'on' })
						return
					}
				} catch (err: any) {
					self.log('error', `Failed to set output display state: ${err?.message ?? err}`)
				}
			},
		},

		getInputStates: {
			name: 'Get Input Status',
			sortName: 'zzz Get Input States',
			description: 'Displays the connection status of each input on the unit (e.g., HDMI, DisplayPort, etc.)',
			options: [],
			callback: async () => {
				try {
					self.log('info', 'Querying device for input connection status')
					self.sendCommand('getInputStates')

					const line = await (self as any).waitForLine(
						/^\[\s*GetInputState\s+[0-4]\s+(?:true|false)(?:\s*,\s*GetInputState\s+[0-4]\s+(?:true|false)){4}\s*\]$/i,
						3000,
					)
					const inputStates: (boolean | undefined)[] = []
					for (const match of line.matchAll(/GetInputState\s+([0-4])\s+(true|false)/gi)) {
						const input = Number(match[1])
						if (inputStates[input] !== undefined) {
							self.log('warn', `Duplicate input status for input ${input}: ${line}`)
							return
						}
						inputStates[input] = match[2].toLowerCase() === 'true'
					}
					if (inputStates.some((state) => state === undefined) || inputStates.length !== 5) {
						self.log('warn', `Unexpected input status response: ${line}`)
						return
					}

					const inputNames = ['USB-C', 'DisplayPort', 'HDMI 3', 'HDMI 4', 'BYOD']
					for (let input = 0; input < inputStates.length; input++) {
						const connected = inputStates[input]
						self.log(
							'info',
							`Input ${input + 1} (${inputNames[input]}) is ${connected ? 'connected.' : 'not connected.'}`,
						)
					}

					const input1Connected = inputStates[0] ? 'connected' : 'not-connected'
					const input2Connected = inputStates[1] ? 'connected' : 'not-connected'
					const input3Connected = inputStates[2] ? 'connected' : 'not-connected'
					const input4Connected = inputStates[3] ? 'connected' : 'not-connected'
					const input5Connected = inputStates[4] ? 'connected' : 'not-connected'

					self.setVariableValues({
						input1Connected,
						input2Connected,
						input3Connected,
						input4Connected,
						input5Connected,
					})

					self.checkFeedbacks('fbkInputNotConnected')
				} catch (err: any) {
					self.log('error', `Failed to retrieve input status: ${err?.message ?? err}`)
				}
			},
		},
	})
}
