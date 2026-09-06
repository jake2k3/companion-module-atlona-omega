import type ModuleInstance from '../main.js'
import type { VariablesSchema } from '../variables.js'

export type ActionsSchema = {
	blink: { options: { mode: 'on' | 'off' | 'toggle' } }
	lock: { options: Record<string, never> }
	lraud: { options: { mode: 'on' | 'off' } }
	pwoff: { options: Record<string, never> }
	pwon: { options: Record<string, never> }
	RS232zone: { options: { command: string; lineEnding: '\x0D' | '\x0A' | '\x0D\x0A' } }
	unlock: { options: Record<string, never> }
	VOUTMute: { options: { output: '1' | '2'; mode: 'on' | 'off' } }

	// The following actions are "Get Status" commands, only necessary for troubleshooting
	blink_status: { options: Record<string, never> }
	displayButton_status: { options: Record<string, never> }
	lraud_status: { options: Record<string, never> }
	power_status: { options: Record<string, never> }
	VOUTMute_status: { options: Record<string, never> }

	/*
    CommaWait   Enable/Disable a comma adding a 5 second delay between commands
    DispBtn     Sets the command triggered through display control (set in the webGUI)
    InputStatus Displays the status for each input
    Status      Displays the routing state of the unit
    VOUTMute    Mutes/Unmutes audio output volume
    x?$         Mutes/Unmutes AV signals for the specified output channel
    x?AVx&      Switch a specific input to a specific output
*/

	/*  Advanced Actions to Implement Later...
    IP802.1x    Sets the 802.1x security status
    IPCFG       Displays IP address configuration
    IPDHCP      Turns DHCP on / off
    IPStatic    Sets a static IP address
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

		displayButton_status: {
			name: 'Get DISPLAY Button Status',
			sortName: 'zzz Get DISPLAY Button Status',
			description: 'Displays the status of the DISPLAY button',
			options: [],
			callback: async () => {
				try {
					self.log('info', 'Querying device for DISPLAY button status')
					self.sendCommand('DispBtn sta')

					const line = await (self as any).waitForLine(/^(DispBtn on|DispBtn off)$/i, 3000)
					const status = line.trim()

					if (status === 'DispBtn on') {
						self.log('info', 'DISPLAY button is on.')
						self.setVariableValues({ statusDisplayButton: 'on' } as Partial<VariablesSchema>)
					} else if (status === 'DispBtn off') {
						self.log('info', 'DISPLAY button is off.')
						self.setVariableValues({ statusDisplayButton: 'off' } as Partial<VariablesSchema>)
					} else {
						self.log('warn', `Unexpected DISPLAY button response: ${line}`)
					}
				} catch (err: any) {
					self.log('error', `Failed to retrieve DISPLAY button status: ${err?.message ?? err}`)
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

		lraud: {
			name: 'Analog Audio Output',
			description: 'Enables or disables the analog audio output.',
			options: [
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Mode',
					default: 'on',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
					],
				},
			],
			callback: async (action) => {
				try {
					const mode = action.options.mode
					if (mode === 'on') {
						self.log('info', 'Analog audio output set to ON')
						self.sendCommand('LRAUD on')
						self.setVariableValues({ statusAudioOutAnalog: 'on' })
						return
					}

					if (mode === 'off') {
						self.log('info', 'Analog audio output set to OFF')
						self.sendCommand('LRAUD off')
						self.setVariableValues({ statusAudioOutAnalog: 'off' })
						return
					}
				} catch (err: any) {
					self.log('error', `Failed to set analog audio output mode: ${err?.message ?? err}`)
				}
			},
		},

		lraud_status: {
			name: 'Get Analog Audio Output Status',
			sortName: 'zzz Get Analog Audio Output Status',
			description: 'Displays the status of the analog audio output',
			options: [],
			callback: async () => {
				try {
					self.log('info', 'Querying device for analog audio output status')
					self.sendCommand('LRAUD sta')

					const line = await (self as any).waitForLine(/^(LRAUD on|LRAUD off)$/i, 3000)
					const status = line.trim()

					if (status === 'LRAUD on') {
						self.log('info', 'Analog audio output status is on.')
						self.setVariableValues({ statusAudioOutAnalog: 'on' })
					} else if (status === 'LRAUD off') {
						self.log('info', 'Analog audio output status is off.')
						self.setVariableValues({ statusAudioOutAnalog: 'off' })
					} else {
						self.log('warn', `Unexpected analog audio output response: ${line}`)
					}
				} catch (err: any) {
					self.log('error', `Failed to retrieve analog audio output status: ${err?.message ?? err}`)
				}
			},
		},

		pwoff: {
			name: 'Power Off',
			description: 'Turns the unit off',
			options: [],
			callback: async () => {
				try {
					self.sendCommand('PWOFF')
					self.log('info', 'Unit powered off')
				} catch (err: any) {
					self.log('error', `Failed to power off the unit: ${err?.message ?? err}`)
				}
			},
		},

		pwon: {
			name: 'Power On',
			description: 'Turns the unit on',
			options: [],
			callback: async () => {
				try {
					self.sendCommand('PWON')
					self.log('info', 'Unit powered on')
				} catch (err: any) {
					self.log('error', `Failed to power on the unit: ${err?.message ?? err}`)
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

		RS232zone: {
			name: 'Send RS232 Command',
			description: 'Sends an RS232 Command to the HDBaseT Remote Connection.',
			options: [
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
					self.log('info', `Sending RS232 Command [${cmd}] followed by a CR`)
					self.sendCommand(`RS232zone[${cmd}${eol}]`)
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

		// NOTE: these labels are inverted to be consistent with LRAUD behavior,
		// as the Atlona API returns a boolean for Mute/Unmute rather than On/Off.
		VOUTMute: {
			name: 'HDMI Audio Outputs',
			description: 'Enables or disables the audio output for the HDMI outputs.',
			options: [
				{
					id: 'output',
					type: 'dropdown',
					label: 'Output',
					default: '1',
					choices: [
						{ id: '1', label: 'HDMI 1' },
						{ id: '2', label: 'HDMI 2' },
					],
				},
				{
					id: 'mode',
					type: 'dropdown',
					label: 'State',
					default: 'on',
					choices: [
						{ id: 'off', label: 'On' },
						{ id: 'on', label: 'Off' },
					],
				},
			],
			callback: async (action) => {
				try {
					const output = action.options.output
					const mode = action.options.mode
					const names: Record<string, string> = {
						'1': 'HDMI 1',
						'2': 'HDMI 2',
					}

					self.log('info', `Output ${output} (${names[output]}) set to ${mode}`)
					self.sendCommand(`VOUTMute${output} ${mode}`)
					self.setVariableValues({ [`statusVOUTMute${output}`]: mode })
				} catch (err: any) {
					self.log('error', `Failed to set HDMI audio output mode: ${err?.message ?? err}`)
				}
			},
		},

		VOUTMute_status: {
			name: 'Get Output Volume Mute Status',
			sortName: 'zzz Get Output Volume Mute Status',
			description: 'Displays the status of the HDMI and HDBaseT audio outputs',
			options: [],
			callback: async () => {
				try {
					self.log('info', 'Querying device for output volume mute status')
					self.sendCommand('VOUTMute1 sta')

					const line1 = await (self as any).waitForLine(/^(VOUTMute1 on|VOUTMute1 off)$/i, 3000)
					const status1 = line1.trim()

					if (status1 === 'VOUTMute1 off') {
						self.log('info', 'HDMI audio output status is on.')
						self.setVariableValues({ statusAudioOutHDMI: 'on' })
					} else if (status1 === 'VOUTMute1 on') {
						self.log('info', 'HDMI audio output status is off.')
						self.setVariableValues({ statusAudioOutHDMI: 'off' })
					} else {
						self.log('warn', `Unexpected HDMI audio output response: ${line1}`)
					}

					self.sendCommand('VOUTMute2 sta')

					const line2 = await (self as any).waitForLine(/^(VOUTMute2 on|VOUTMute2 off)$/i, 3000)
					const status2 = line2.trim()

					if (status2 === 'VOUTMute2 off') {
						self.log('info', 'HDBaseT audio output status is on.')
						self.setVariableValues({ statusAudioOutHDBaseT: 'on' })
					} else if (status2 === 'VOUTMute2 on') {
						self.log('info', 'HDBaseT audio output status is off.')
						self.setVariableValues({ statusAudioOutHDBaseT: 'off' })
					} else {
						self.log('warn', `Unexpected HDBaseT audio output response: ${line2}`)
					}
				} catch (err: any) {
					self.log('error', `Failed to retrieve VOUTMute status: ${err?.message ?? err}`)
				}
			},
		},
	})
}
