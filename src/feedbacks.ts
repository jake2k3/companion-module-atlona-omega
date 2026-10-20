import type ModuleInstance from './main.js'

type HexColor = string
const hexToNumber = (value: HexColor): number => Number.parseInt(value.slice(1), 16)

export type FeedbacksSchema = {
	fbkRoutedOut1: {
		type: 'boolean'
		options: { input: { input: '1' | '2' | '3' | '4' | '5' } }
	}
	fbkRoutedOut2: {
		type: 'boolean'
		options: { input: { input: '1' | '2' | '3' | '4' | '5' } }
	}
	fbkInputNotConnected: {
		type: 'boolean'
		options: { input: { input: '1' | '2' | '3' | '4' } }
	}
	fbkOutputDisabled: {
		type: 'boolean'
		options: { output: { output: '1' | '2' } }
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		fbkRoutedOut1: {
			type: 'boolean',
			name: 'Input Routed to Output 1 (HDMI)',
			defaultStyle: {
				bgcolor: hexToNumber('#990000'),
				color: hexToNumber('#FFFFFF'),
				text: 'Input is routed to Output 1 (HDMI)',
				size: 'auto',
			},
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: '1',
					choices: [
						{ id: '1', label: 'Input 1 (USB-C)' },
						{ id: '2', label: 'Input 2 (DisplayPort)' },
						{ id: '3', label: 'Input 3 (HDMI 3)' },
						{ id: '4', label: 'Input 4 (HDMI 4)' },
						...(self.config.model === 'ome-ms52w' ? [{ id: '5' as const, label: 'Input 5 (BYOD)' }] : []),
					],
				},
			],
			callback: (feedback) => {
				const input = feedback.options.input

				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				return self.getVariableValue('routeOutput1') === `${input}`
			},
		},
		fbkRoutedOut2: {
			type: 'boolean',
			name: 'Input Routed to Output 2 (HDBaseT)',
			defaultStyle: {
				bgcolor: hexToNumber('#000066'),
				color: hexToNumber('#FFFFFF'),
				text: 'Input is routed to Output 2 (HDBaseT)',
				size: 'auto',
			},
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: '1',
					choices: [
						{ id: '1', label: 'Input 1 (USB-C)' },
						{ id: '2', label: 'Input 2 (DisplayPort)' },
						{ id: '3', label: 'Input 3 (HDMI 3)' },
						{ id: '4', label: 'Input 4 (HDMI 4)' },
						...(self.config.model === 'ome-ms52w' ? [{ id: '5' as const, label: 'Input 5 (BYOD)' }] : []),
					],
				},
			],
			callback: (feedback) => {
				const input = feedback.options.input

				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				return self.getVariableValue('routeOutput2') === `${input}`
			},
		},
		fbkInputNotConnected: {
			type: 'boolean',
			name: 'Input is Not Connected',
			defaultStyle: {
				bgcolor: hexToNumber('#242424'),
				color: hexToNumber('#B6B6B6'),
				text: 'Input is not connected',
				size: 'auto',
			},
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: '1',
					choices: [
						{ id: '1', label: 'Input 1 (USB-C)' },
						{ id: '2', label: 'Input 2 (DisplayPort)' },
						{ id: '3', label: 'Input 3 (HDMI 3)' },
						{ id: '4', label: 'Input 4 (HDMI 4)' },
						{ id: '5', label: 'Input 5 (BYOD)' },
					],
				},
			],
			callback: (feedback) => {
				const input = feedback.options.input

				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				return self.getVariableValue(`input${input}Connected`) !== 'connected'
			},
		},
		fbkOutputDisabled: {
			type: 'boolean',
			name: 'Output is disabled',
			defaultStyle: {
				bgcolor: hexToNumber('#242424'),
				color: hexToNumber('#B6B6B6'),
				text: 'Output is disabled.',
				size: 'auto',
			},
			options: [
				{
					id: 'output',
					type: 'dropdown',
					label: 'Output',
					default: '1',
					choices: [
						{ id: '1', label: 'Output 1 (HDMI)' },
						{ id: '2', label: 'Output 2 (HDBaseT)' },
					],
				},
			],
			callback: (feedback) => {
				const output = feedback.options.output

				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				return self.getVariableValue(`output${output}Enabled`) !== 'on'
			},
		},
	})
}
