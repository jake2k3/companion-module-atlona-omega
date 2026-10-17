import type ModuleInstance from '../main.js'
// import type { VariablesSchema } from '../variables.js'

export type ActionsSchema = {
	displayInputSet: { options: { input: '0' | '1' | '2' | '3' | '4' } }
	displayMinimalSet: { options: { state: '0' | '1' } }

	// The following actions are "Get Status" commands, only necessary for troubleshooting
	// displayInputGet: { options: Record<string, never> }
	// displayMinimalGet: { options: Record<string, never> }
	// getInputStates: { options: Record<string, never> }
}

export function UpdateActions(self: ModuleInstance): void {
	self.setModelActionDefinitions<ActionsSchema>({
		displayInputSet: {
			name: 'Set Active Input',
			description: 'Sets the active input.',
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: '0',
					choices: [
						{ id: '0', label: '1 - USB-C' },
						{ id: '1', label: '2 - DisplayPort' },
						{ id: '2', label: '3 - HDMI 3' },
						{ id: '3', label: '4 - HDMI 4' },
						{ id: '4', label: '5 - BYOD' },
					],
				},
			],
			callback: async (action) => {
				try {
					const input = action.options.input
					const names: Record<string, string> = {
						'0': 'USB-C',
						'1': 'DisplayPort',
						'2': 'HDMI 3',
						'3': 'HDMI 4',
						'4': 'BYOD',
					}

					if (!/^[0-4]$/.test(input)) {
						self.log('warn', `Invalid input selection: ${input}`)
						return
					}

					self.log('info', `Routing Input ${Number(input) + 1} (${names[input]}) to HDBaseT and HDMI Outputs`)
					self.sendCommand(`displayInputSet ${input}`)
				} catch (err: any) {
					self.log('error', `Failed to set active input: ${err?.message ?? err}`)
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
						self.setVariableValues({ output0Status: 'off', output1Status: 'off' })
						return
					}

					if (state === '1') {
						self.log('info', 'Output display set to ON')
						self.sendCommand('Display:Minimal:Set 1')
						self.setVariableValues({ output0Status: 'on', output1Status: 'on' })
						return
					}
				} catch (err: any) {
					self.log('error', `Failed to set output display state: ${err?.message ?? err}`)
				}
			},
		},
	})
}
