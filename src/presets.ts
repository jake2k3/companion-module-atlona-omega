import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'

type HexColor = string
const hexToNumber = (value: HexColor): number => Number.parseInt(value.slice(1), 16)

export function UpdatePresets(self: ModuleInstance): void {
	const structure: CompanionPresetSection[] = [
		{
			id: 'ome-ms42',
			name: 'AT-OME-MS42',
			definitions: [
				{
					id: `route-hdmi`,
					name: `Route Input to Output 1 (HDMI)`,
					type: 'template',
					presetId: 'routeYout1',

					templateVariableName: 'input',
					templateValues: [
						{ name: `Input 1 (USB-C) to Output 1 (HDMI)`, value: '1' },
						{ name: `Input 2 (DisplayPort) to Output 1 (HDMI)`, value: '2' },
						{ name: `Input 3 (HDMI 3) to Output 1 (HDMI)`, value: '3' },
						{ name: `Input 4 (HDMI 4) to Output 1 (HDMI)`, value: '4' },
					],
				},
				{
					id: `route-hdbaset`,
					name: `Route Input to Output 2 (HDBaseT)`,
					type: 'template',
					presetId: 'routeYout2',

					templateVariableName: 'input',
					templateValues: [
						{ name: `Input 1 (USB-C) to Output 2 (HDBaseT)`, value: '1' },
						{ name: `Input 2 (DisplayPort) to Output 2 (HDBaseT)`, value: '2' },
						{ name: `Input 3 (HDMI 3) to Output 2 (HDBaseT)`, value: '3' },
						{ name: `Input 4 (HDMI 4) to Output 2 (HDBaseT)`, value: '4' },
					],
				},
				{
					id: 'usbhost',
					name: 'USB Host Route',
					description: 'Select which USB Host port is used',
					type: 'simple',
					presets: [
						'usbhost-follow-usb',
						'usbhost-follow-video',
						'usbhost-route-c',
						'usbhost-route-1',
						'usbhost-route-2',
						'usbhost-route-3',
					],
				},
				{
					id: 'xY$',
					name: 'Enable/Disable Video Outputs',
					description: 'Enable or disable the HDMI or HDBaseT outputs',
					type: 'simple',
					presets: ['hdmi-enable', 'hdmi-disable', 'hdbaset-enable', 'hdbaset-disable'],
				},
				{
					id: 'power',
					name: 'Power & Debugging Tools',
					description: 'System commands and tools for troubleshooting',
					type: 'simple',
					presets: ['reboot', 'lock', 'unlock', 'pwon', 'pwoff', 'blink', 'get-var'],
				},
				{
					id: 'rs232',
					name: 'Send RS-232 Commands Over HDBaseT',
					description: 'NOTE: Generic commands will vary depending on receiving device.',
					type: 'simple',
					presets: ['eiki-on', 'eiki-off', 'epson-on', 'epson-off'],
				},
			],
		},

		{
			id: 'ome-sw32',
			name: 'AT-OME-SW32',
			definitions: [
				{
					id: 'power',
					name: 'Power & Debugging Tools',
					description: 'System commands and tools for troubleshooting',
					type: 'simple',
					presets: ['lock', 'unlock', 'pwon', 'pwoff', 'blink'],
				},
				{
					id: 'rs232',
					name: 'Send RS-232 Commands Over HDBaseT',
					description: 'NOTE: Generic commands will vary depending on receiving device.',
					type: 'simple',
					presets: ['eiki-on', 'eiki-off', 'epson-on', 'epson-off'],
				},
			],
		},
	]

	const presets: CompanionPresetDefinitions<ModuleSchema> = {}

	presets['routeYout1'] = {
		name: `Route Input $(local:input) to Output 1 (HDMI)`,
		type: 'simple',
		style: {
			text: 'Input $(local:input) to HDMI Out',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: 'fbkRoutedOut1',
				options: { input: { isExpression: true, value: '$(local:input)' } },
				style: {
					bgcolor: hexToNumber('#990000'),
					color: hexToNumber('#FFFFFF'),
				},
			},
			{
				feedbackId: 'fbkInputNotConnected',
				options: { input: { isExpression: true, value: '$(local:input)' } },
				style: {
					bgcolor: hexToNumber('#242424'),
					color: hexToNumber('#B6B6B6'),
					text: 'Input $(local:input) not connected',
					size: 'auto',
				},
			},
			{
				feedbackId: 'fbkOutputDisabled',
				options: { output: { isExpression: true, value: '$(local:output)' } },
				style: {
					bgcolor: hexToNumber('#242424'),
					color: hexToNumber('#B6B6B6'),
					text: 'Output $(local:output) disabled',
					size: 'auto',
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'xYAVxZ',
						options: {
							input: { isExpression: true, value: '$(local:input)' },
							output: '1',
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'output',
				startupValue: '1',
			},
		],
	}

	presets['routeYout2'] = {
		name: `Route Input $(local:input) to Output 2 (HDBaseT)`,
		type: 'simple',
		style: {
			text: 'Input $(local:input) to HDBaseT Out',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [
			{
				feedbackId: 'fbkRoutedOut2',
				options: { input: { isExpression: true, value: '$(local:input)' } },
				style: {
					bgcolor: hexToNumber('#000066'),
					color: hexToNumber('#FFFFFF'),
				},
			},
			{
				feedbackId: 'fbkInputNotConnected',
				options: { input: { isExpression: true, value: '$(local:input)' } },
				style: {
					bgcolor: hexToNumber('#242424'),
					color: hexToNumber('#B6B6B6'),
					text: 'Input $(local:input) not connected',
					size: 'auto',
				},
			},
			{
				feedbackId: 'fbkOutputDisabled',
				options: { output: { isExpression: true, value: '$(local:output)' } },
				style: {
					bgcolor: hexToNumber('#242424'),
					color: hexToNumber('#B6B6B6'),
					text: 'Output $(local:output) disabled',
					size: 'auto',
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'xYAVxZ',
						options: {
							input: { isExpression: true, value: '$(local:input)' },
							output: '2',
						},
					},
				],
				up: [],
			},
		],
		localVariables: [
			{
				variableType: 'simple',
				variableName: 'input',
				startupValue: 0,
			},
			{
				variableType: 'simple',
				variableName: 'output',
				startupValue: '2',
			},
		],
	}

	presets['usbhost-follow-usb'] = {
		name: 'Sets the USB Host to follow the most recently connected USB Host',
		type: 'simple',
		style: {
			text: 'USB Host: Follow USB',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'USBHostLogic',
						options: {
							mode: 'follow usb',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['usbhost-follow-video'] = {
		name: 'Locks each USB Host to the specified Output in the Atlona Web UI',
		type: 'simple',
		style: {
			text: 'USB Host: Follow Video',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'USBHostLogic',
						options: {
							mode: 'follow video',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['usbhost-route-c'] = {
		name: 'Sets the USB Host route to USB-C port',
		type: 'simple',
		style: {
			text: 'USB Host: USB-C',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'USBHostLogic',
						options: {
							mode: 'manual',
						},
					},
					{
						actionId: 'USBHostRoute',
						delay: 100,
						options: {
							mode: 'C',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['usbhost-route-1'] = {
		name: 'Sets the USB Host route to USB Host 1',
		type: 'simple',
		style: {
			text: 'USB Host: USB 1',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'USBHostLogic',
						options: {
							mode: 'manual',
						},
					},
					{
						actionId: 'USBHostRoute',
						delay: 100,
						options: {
							mode: '1',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['usbhost-route-2'] = {
		name: 'Sets the USB Host route to USB Host 2',
		type: 'simple',
		style: {
			text: 'USB Host: USB 2',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'USBHostLogic',
						options: {
							mode: 'manual',
						},
					},
					{
						actionId: 'USBHostRoute',
						delay: 100,
						options: {
							mode: '2',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['usbhost-route-3'] = {
		name: 'Sets the USB Host route to the remote HDBaseT USB Host port',
		type: 'simple',
		style: {
			text: 'USB Host: HDBaseT',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'USBHostLogic',
						options: {
							mode: 'manual',
						},
					},
					{
						actionId: 'USBHostRoute',
						delay: 100,
						options: {
							mode: '3',
						},
					},
				],
				up: [],
			},
		],
	}

	presets['hdmi-enable'] = {
		name: 'Enable the HDMI Video Output',
		type: 'simple',
		style: {
			text: 'Enable HDMI Out',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'xY$',
						options: { output: '1', mode: 'on' },
					},
				],
				up: [],
			},
		],
	}

	presets['hdmi-disable'] = {
		name: 'Disable the HDMI Video Output',
		type: 'simple',
		style: {
			text: 'Disable HDMI Out',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'xY$',
						options: { output: '1', mode: 'off' },
					},
				],
				up: [],
			},
		],
	}

	presets['hdbaset-enable'] = {
		name: 'Enable the HDBaseT Video Output',
		type: 'simple',
		style: {
			text: 'Enable HDBaseT Out',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'xY$',
						options: { output: '2', mode: 'on' },
					},
				],
				up: [],
			},
		],
	}

	presets['hdbaset-disable'] = {
		name: 'Disable the HDBaseT Video Output',
		type: 'simple',
		style: {
			text: 'Disable HDBaseT Out',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'xY$',
						options: { output: '2', mode: 'off' },
					},
				],
				up: [],
			},
		],
	}

	presets['reboot'] = {
		name: 'Reboot Device',
		type: 'simple',
		style: {
			text: 'Reboot',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'reboot',
						options: {},
					},
				],
				up: [],
			},
		],
	}

	presets['lock'] = {
		name: 'Lock the Front Panel',
		type: 'simple',
		style: {
			text: 'Lock Panel',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'lock',
						options: {},
					},
				],
				up: [],
			},
		],
	}

	presets['unlock'] = {
		name: 'Unlock the Front Panel',
		type: 'simple',
		style: {
			text: 'Unlock Panel',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'unlock',
						options: {},
					},
				],
				up: [],
			},
		],
	}

	presets['pwon'] = {
		name: 'Power On the Device',
		type: 'simple',
		style: {
			text: 'Power ON',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'pwon',
						options: {},
					},
				],
				up: [],
			},
		],
	}

	presets['pwoff'] = {
		name: 'Power Off the Device',
		type: 'simple',
		style: {
			text: 'Power OFF',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'pwoff',
						options: {},
					},
				],
				up: [],
			},
		],
	}

	presets['blink'] = {
		name: 'Blink the Power LED on the Front Panel for 60 Seconds',
		type: 'simple',
		style: {
			text: 'Blink 60s',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'blink',
						options: { mode: 'on' },
					},
					{
						actionId: 'blink',
						delay: 60000,
						options: { mode: 'off' },
					},
				],
				up: [],
			},
		],
	}

	presets['get-var'] = {
		name: 'Query the device and refresh all variables',
		type: 'simple',
		style: {
			text: 'Get Status',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'blink_status',
						options: {},
					},
					{
						actionId: 'displayButton_status',
						options: {},
					},
					{
						actionId: 'input_status',
						options: {},
					},
					{
						actionId: 'lraud_status',
						options: {},
					},
					{
						actionId: 'outHdmi5vKeep_status',
						options: {},
					},
					{
						actionId: 'power_status',
						options: {},
					},
					{
						actionId: 'status',
						options: {},
					},
					{
						actionId: 'USBHostLogic_status',
						options: {},
					},
					{
						actionId: 'USBHostRoute_status',
						options: {},
					},
					{
						actionId: 'UsbVbusControl_status',
						options: {},
					},
					{
						actionId: 'VOUTMute_status',
						options: {},
					},
					{
						actionId: 'xY$_status',
						options: {},
					},
				],
				up: [],
			},
		],
	}

	presets['eiki-on'] = {
		name: 'Send command [C00] followed by a CR',
		type: 'simple',
		style: {
			text: 'Eiki\nPower\nON',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'RS232zone',
						options: {
							command: 'C00',
							lineEnding: `\x0D`,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['eiki-off'] = {
		name: 'Send command [C01] followed by a CR',
		type: 'simple',
		style: {
			text: 'Eiki\nPower\nOFF',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'RS232zone',
						options: {
							command: 'C01',
							lineEnding: `\x0D`,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['epson-on'] = {
		name: 'Send command [PWR ON] followed by a CR',
		type: 'simple',
		style: {
			text: 'Epson\nPower\nON',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'RS232zone',
						options: {
							command: 'PWR ON',
							lineEnding: `\x0D`,
						},
					},
				],
				up: [],
			},
		],
	}

	presets['epson-off'] = {
		name: 'Send command [PWR OFF] followed by a CR',
		type: 'simple',
		style: {
			text: 'Epson\nPower\nOFF',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'RS232zone',
						options: {
							command: 'PWR OFF',
							lineEnding: '\x0D',
						},
					},
				],
				up: [],
			},
		],
	}

	self.setPresetDefinitions(structure, presets)
}
