import type ModuleInstance from '../main.js'

export async function queryInitialStatus(self: ModuleInstance): Promise<void> {
	try {
		self.sendCommand('Type')
		const varType = await self.waitForLine(/^(AT-.*)/i, 3000)
		self.log('debug', `Device type: ${varType}`)

		self.sendCommand('Version')
		const varVersion = await self.waitForLine(/^\d+\.\d+\.\d+$/, 3000)
		self.log('debug', `Firmware version: ${varVersion}`)

		self.sendCommand('PWSTA')
		const queryPower = await self.waitForLine(/^(PWON|PWOFF)$/i, 3000)
		const replyPower = queryPower.trim().toUpperCase()
		const varPower = replyPower === 'PWON' ? 'on' : 'off'

		self.sendCommand('InputStatus')
		const queryInput = await self.waitForLine(/^InputStatus\s*([01]{4})$/i, 3000)
		const inputMatch = queryInput.match(/^InputStatus\s*([01]{4})$/i)
		if (!inputMatch) {
			self.log('warn', `Unexpected input status response: ${queryInput}`)
			return
		}

		self.sendCommand('x1$ sta')
		const queryOutput1 = await self.waitForLine(/^x1\$\s*(on|off)$/i, 3000)
		const output1 = queryOutput1.match(/^x1\$\s*(on|off)$/i)?.[1].toLowerCase() ?? 'off'

		self.sendCommand('x2$ sta')
		const queryOutput2 = await self.waitForLine(/^x2\$\s*(on|off)$/i, 3000)
		const output2 = queryOutput2.match(/^x2\$\s*(on|off)$/i)?.[1].toLowerCase() ?? 'off'

		self.sendCommand('Status')
		const queryRouting = await self.waitForLine(/^x([1-4])AVx1\s*,\s*x([1-4])AVx2$/i, 3000)
		const routingMatch = queryRouting.match(/^x([1-4])AVx1\s*,\s*x([1-4])AVx2$/i)
		if (!routingMatch) {
			self.log('warn', `Unexpected XY routing response: ${queryRouting}`)
			return
		}

		self.sendCommand('Blink sta')
		const queryBlink = await self.waitForLine(/^(Blink on|Blink off)$/i, 3000)
		const blink = queryBlink.trim().toLowerCase().replace('blink ', '')

		self.sendCommand('LRAUD sta')
		const queryAnalogAudio = await self.waitForLine(/^(LRAUD on|LRAUD off)$/i, 3000)
		const analogAudio = queryAnalogAudio.trim().toLowerCase().replace('lraud ', '')

		self.sendCommand('USBHostLogic sta')
		const queryUsbLogic = await self.waitForLine(/^(USBHostLogic follow usb|USBHostLogic follow video|manual)$/i, 3000)
		const usbLogic = queryUsbLogic.trim()
		const statusUsbHostLogic =
			usbLogic === 'USBHostLogic follow usb'
				? 'follow-usb'
				: usbLogic === 'USBHostLogic follow video'
					? 'follow-video'
					: 'manual'

		self.sendCommand('USBHostRoute sta')
		const queryUsbRoute = await self.waitForLine(
			/^(USBHostRoute C|USBHostRoute 1|USBHostRoute 2|USBHostRoute 3)$/i,
			3000,
		)
		const usbRoute = queryUsbRoute.trim()
		const statusUsbHostRoute = usbRoute.replace('USBHostRoute ', '')

		self.sendCommand('UsbVbusControl sta')
		const queryUsbVbus = await self.waitForLine(/^(UsbVbusControl on|UsbVbusControl off)$/i, 3000)
		const statusUsbVbusControl = queryUsbVbus.trim().replace('UsbVbusControl ', '')

		self.sendCommand('VOUTMute1 sta')
		const queryVoutMute1 = await self.waitForLine(/^(VOUTMute1 on|VOUTMute1 off)$/i, 3000)
		const statusAudioOutHDMI = queryVoutMute1.trim().endsWith(' on') ? 'off' : 'on'

		self.sendCommand('VOUTMute2 sta')
		const queryVoutMute2 = await self.waitForLine(/^(VOUTMute2 on|VOUTMute2 off)$/i, 3000)
		const statusAudioOutHDBaseT = queryVoutMute2.trim().endsWith(' on') ? 'off' : 'on'

		self.setVariableValues({
			type: varType,
			version: varVersion,
			statusPower: varPower,
			input1Connected: inputMatch[1] === '1' ? 'connected' : 'not-connected',
			input2Connected: inputMatch[2] === '1' ? 'connected' : 'not-connected',
			input3Connected: inputMatch[3] === '1' ? 'connected' : 'not-connected',
			input4Connected: inputMatch[4] === '1' ? 'connected' : 'not-connected',
			output1Enabled: output1,
			output2Enabled: output2,
			routeOutput1: routingMatch[1],
			routeOutput2: routingMatch[2],
			statusBlink: blink,
			statusAudioOutAnalog: analogAudio,
			statusAudioOutHDMI,
			statusAudioOutHDBaseT,
			statusUsbHostLogic,
			statusUsbHostRoute,
			statusUsbVbusControl,
		})

		self.log('info', 'Initial MS42 status query complete, variables updated.')
		self.checkFeedbacks('fbkInputNotConnected', 'fbkRoutedOut1', 'fbkRoutedOut2', 'fbkOutputDisabled')
	} catch (err: any) {
		self.log('error', `Failed to retrieve MS42 initial status: ${err?.message ?? err}`)
	}
}
