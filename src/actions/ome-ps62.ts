import type ModuleInstance from '../main.js'
/* import type { VariablesSchema } from '../variables.js' */

export type ActionsSchema = {
	blink: { options: { mode: 'on' | 'off' | 'toggle' } }
	CommaWait: { options: { mode: 'on' | 'off' | 'toggle' } }
	lock: { options: Record<string, never> }
	RS232para: {
		options: {
			port: '1' | '2' | '3'
			baud: '2400' | '9600' | '19200' | '38400' | '57600' | '115200'
			dataBits: '7' | '8'
			parity: '0' | '1' | '2'
			stopBits: '1' | '2'
		}
	}
	RS232zone: { options: { port: '1' | '2' | '3'; command: string; lineEnding: '\x0D' | '\x0A' | '\x0D\x0A' } }
	unlock: { options: Record<string, never> }
	/* VOUTMute: { options: { output: '1' | '2'; mode: 'on' | 'off' } } */
	/* xYAVxZ: { options: { input: '1' | '2' | '3'; output: '1' | '2' } } */

	// The following actions are "Get Status" commands, only necessary for troubleshooting
	blink_status: { options: Record<string, never> }
	power_status: { options: Record<string, never> }
	RS232para_status: { options: { port: '1' | '2' | '3' } }

	/*  Advanced Actions to Implement Later...
    IPCFG       Displays IP address configuration
    IPDHCP      Turns DHCP on / off
    Mreset      Sets the unit back to default settings
    RepCmdTime  Sets how many times a display command is repeated when repeat is enabled
    RepeatCmd   Enables/disables display command repeat

*/
}

export function UpdateActions(self: ModuleInstance): void {
	self.setModelActionDefinitions<ActionsSchema>({
		blink: {
			name: 'Blink',
			description: 'Enables or disables blinking of the POWER LED indicator on the front panel.',
			options: [
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Mode',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (action) => {
				const mode = action.options.mode
				if (mode === 'on') {
					self.log('info', 'Turning blink ON')
					self.sendCommand('Blink on')
					self.setVariableValues({ statusBlink: 'on' })
					return
				}

				if (mode === 'off') {
					self.log('info', 'Turning blink OFF')
					self.sendCommand('Blink off')
					self.setVariableValues({ statusBlink: 'off' })
					return
				}

				self.log('info', 'Querying device for blink status')
				self.sendCommand('Blink sta')

				const line = await (self as any).waitForLine(/^(Blink on|Blink off)$/i, 3000)
				const status = line.trim()

				if (status === 'Blink on') {
					self.log('info', 'Blink is ON, turning OFF')
					self.sendCommand('Blink off')
					self.setVariableValues({ statusBlink: 'off' })
				} else if (status === 'Blink off') {
					self.log('info', 'Blink is OFF, turning ON')
					self.sendCommand('Blink on')
					self.setVariableValues({ statusBlink: 'on' })
				} else {
					self.log('warn', `Unexpected blink response: ${line}`)
				}
			},
		},

		blink_status: {
			name: 'Get Blink Status',
			sortName: 'zzz Get Blink Status',
			description: 'Displays the status of the blink function',
			options: [],
			callback: async () => {
				try {
					self.log('info', 'Querying device for blink status')
					self.sendCommand('Blink sta')

					const line = await (self as any).waitForLine(/^(Blink on|Blink off)$/i, 3000)
					const status = line.trim()

					if (status === 'Blink on') {
						self.log('info', 'Blink status is ON.')
						self.setVariableValues({ statusBlink: 'on' })
					} else if (status === 'Blink off') {
						self.log('info', 'Blink status is OFF.')
						self.setVariableValues({ statusBlink: 'off' })
					} else {
						self.log('warn', `Unexpected blink response: ${line}`)
					}
				} catch (err: any) {
					self.log('error', `Failed to retrieve blink status: ${err?.message ?? err}`)
				}
			},
		},

		CommaWait: {
			name: 'External Device: CommaWait',
			description:
				'Enable/Disable a comma adding a 5 second delay between commands sending to an external device. Default is on.',
			options: [
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Mode',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (action) => {
				const mode = action.options.mode
				if (mode === 'on') {
					self.log('info', 'Turning CommaWait ON')
					self.sendCommand('CommaWait on')
					self.setVariableValues({ statusCommaWait: 'on' })
					return
				}

				if (mode === 'off') {
					self.log('info', 'Turning CommaWait OFF')
					self.sendCommand('CommaWait off')
					self.setVariableValues({ statusCommaWait: 'off' })
					return
				}

				self.log('info', 'Querying device for CommaWait status')
				self.sendCommand('CommaWait sta')

				const line = await (self as any).waitForLine(/^(CommaWait on|CommaWait off)$/i, 3000)
				const status = line.trim()

				if (status === 'CommaWait on') {
					self.log('info', 'CommaWait is ON, turning OFF')
					self.sendCommand('CommaWait off')
					self.setVariableValues({ statusCommaWait: 'off' })
				} else if (status === 'CommaWait off') {
					self.log('info', 'CommaWait is OFF, turning ON')
					self.sendCommand('CommaWait on')
					self.setVariableValues({ statusCommaWait: 'on' })
				} else {
					self.log('warn', `Unexpected CommaWait response: ${line}`)
				}
			},
		},

		lock: {
			name: 'Front Panel Lock',
			description: 'Locks the buttons on the front panel of the unit',
			options: [],
			callback: async () => {
				try {
					self.sendCommand('Lock')
					self.log('info', 'Front panel buttons locked')
				} catch (err: any) {
					self.log('error', `Failed to lock front panel buttons: ${err?.message ?? err}`)
				}
			},
		},

		power_status: {
			name: 'Get Power Status',
			sortName: 'zzz Get Power Status',
			description: 'Displays the power state of the unit',
			options: [],
			callback: async () => {
				try {
					self.log('info', 'Querying device for power status')
					self.sendCommand('PWSTA')

					const line = await (self as any).waitForLine(/^(PWON|PWOFF)$/i, 3000)
					const status = line.trim().toUpperCase()

					if (status === 'PWON') {
						self.log('info', 'Power status: ON')
						self.setVariableValues({ statusPower: 'on' })
					} else if (status === 'PWOFF') {
						self.log('info', 'Power status: OFF')
						self.setVariableValues({ statusPower: 'off' })
					} else {
						self.log('warn', `Unexpected power response: ${line}`)
					}
				} catch (err: any) {
					self.log('error', `Failed to retrieve power status: ${err?.message ?? err}`)
				}
			},
		},

		RS232para: {
			name: 'Set RS-232 Parameters for HDBaseT Output',
			description: 'Set the RS-232 baud rate, data bits, parity, and stop bits for the HDBaseT Output.',
			options: [
				{
					id: 'port',
					type: 'dropdown',
					label: 'Port',
					choices: [
						{ id: '1', label: 'HDBaseT Input 1' },
						{ id: '2', label: 'HDBaseT Input 2' },
						{ id: '3', label: 'HDBaseT Output' },
					],
					default: '3',
				},
				{
					id: 'baud',
					type: 'dropdown',
					label: 'Baud Rate',
					choices: [
						{ id: '2400', label: '2400' },
						{ id: '9600', label: '9600' },
						{ id: '19200', label: '19200' },
						{ id: '38400', label: '38400' },
						{ id: '57600', label: '57600' },
						{ id: '115200', label: '115200' },
					],
					default: '9600',
				},
				{
					id: 'dataBits',
					type: 'dropdown',
					label: 'Data Bits',
					choices: [
						{ id: '7', label: '7' },
						{ id: '8', label: '8' },
					],
					default: '8',
				},
				{
					id: 'parity',
					type: 'dropdown',
					label: 'Parity',
					choices: [
						{ id: '0', label: 'None' },
						{ id: '1', label: 'Odd' },
						{ id: '2', label: 'Even' },
					],
					default: '0',
				},
				{
					id: 'stopBits',
					type: 'dropdown',
					label: 'Stop Bits',
					choices: [
						{ id: '1', label: '1' },
						{ id: '2', label: '2' },
					],
					default: '1',
				},
			],
			callback: async (action) => {
				try {
					const port = action.options.port
					const portLabel: Record<string, string> = {
						'1': 'HDBaseT Input 1',
						'2': 'HDBaseT Input 2',
						'3': 'HDBaseT Output',
					}
					const baud = action.options.baud
					const dataBits = action.options.dataBits
					const parity = action.options.parity
					const parityId = action.options.parity
					const parityLabel: Record<string, string> = {
						'0': 'None',
						'1': 'Odd',
						'2': 'Even',
					}
					const stopBits = action.options.stopBits
					self.log(
						'info',
						`Setting RS-232 parameters for ${portLabel[port] ?? port}: Baud Rate to ${baud}, Data Bits to ${dataBits}, Parity to ${parityLabel[parityId] ?? parityId}, Stop Bits to ${stopBits}`,
					)
					self.sendCommand(`RS232para${port}[${baud},${dataBits},${parity},${stopBits}]`)
				} catch (err: any) {
					self.log('error', `Failed to set RS-232 parameters: ${err?.message ?? err}`)
				}
			},
		},

		RS232para_status: {
			name: 'Get RS-232 Parameter Status',
			sortName: 'zzz Get RS-232 Parameter Status',
			description: 'Displays the RS-232 parameters for the HDBaseT Output',
			options: [
				{
					id: 'port',
					type: 'dropdown',
					label: 'Port',
					choices: [
						{ id: '1', label: 'HDBaseT Input 1' },
						{ id: '2', label: 'HDBaseT Input 2' },
						{ id: '3', label: 'HDBaseT Output' },
					],
					default: '3',
				},
			],
			callback: async (action) => {
				try {
					const port = action.options.port
					self.log('info', 'Querying device for RS-232 parameter status')
					self.sendCommand(`RS232para${port} sta`)

					/* 

					const line = await (self as any).waitForLine(/^(PWON|PWOFF)$/i, 3000)
					const status = line.trim().toUpperCase()

					if (status === 'PWON') {
						self.log('info', 'Power status: ON')
						self.setVariableValues({ statusPower: 'on' })
					} else if (status === 'PWOFF') {
						self.log('info', 'Power status: OFF')
						self.setVariableValues({ statusPower: 'off' })
					} else {
						self.log('warn', `Unexpected power response: ${line}`)
					}
					
					*/
				} catch (err: any) {
					self.log('error', `Failed to retrieve RS-232 parameters: ${err?.message ?? err}`)
				}
			},
		},

		RS232zone: {
			name: 'Send RS-232 Command',
			description: 'Sends an RS-232 Command to one of the HDBaseT Remote Connections.',
			options: [
				{
					id: 'port',
					type: 'dropdown',
					label: 'HDBaseT Port',
					choices: [
						{ id: '1', label: 'Input 1' },
						{ id: '2', label: 'Input 2' },
						{ id: '3', label: 'Output 1' },
					],
					default: '3',
				},
				{
					id: 'command',
					type: 'textinput',
					label: 'Command',
					default: '',
				},
				{
					id: 'lineEnding',
					type: 'dropdown',
					label: 'Line Ending',
					choices: [
						{ id: '\x0D', label: 'CR' },
						{ id: '\x0A', label: 'LF' },
						{ id: '\x0D\x0A', label: 'CR+LF' },
					],
					default: '\x0D',
				},
			],
			callback: async (action) => {
				try {
					const cmd = action.options.command
					const eol = action.options.lineEnding
					const port = action.options.port
					self.log('info', `Sending RS-232 Command [${cmd}] to Port ${port}`)
					self.sendCommand(`RS232zone${port}[${cmd}${eol}]`)
				} catch (err: any) {
					self.log('error', `Failed to send RS-232 command: ${err?.message ?? err}`)
				}
			},
		},

		unlock: {
			name: 'Front Panel Unlock',
			description: 'Unlocks the buttons on the front panel of the unit',
			options: [],
			callback: async () => {
				try {
					self.sendCommand('Unlock')
					self.log('info', 'Front panel buttons unlocked')
				} catch (err: any) {
					self.log('error', `Failed to unlock front panel buttons: ${err?.message ?? err}`)
				}
			},
		},
	})
}
