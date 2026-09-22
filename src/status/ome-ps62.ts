import type ModuleInstance from '../main.js'

export async function queryInitialStatus(self: ModuleInstance): Promise<void> {
	try {
		self.sendCommand('Type')
		const type = await self.waitForLine(/^(AT-.*)/i, 3000)

		self.sendCommand('Version')
		const version = await self.waitForLine(/^\d+\.\d+\.\d+$/, 3000)

		self.sendCommand('PWSTA')
		const powerResponse = await self.waitForLine(/^(PWON|PWOFF)$/i, 3000)
		const power = powerResponse.trim().toUpperCase() === 'PWON' ? 'on' : 'off'

		/*

		self.sendCommand('InputStatus')
		const inputResponse = await self.waitForLine(/^InputStatus\s*([01]{3})$/i, 3000)
		const inputMatch = inputResponse.match(/^InputStatus\s*([01]{3})$/i)
		if (!inputMatch) {
			self.log('warn', `Unexpected input status response: ${inputResponse}`)
			return
		}

		self.sendCommand('x1$ sta')
		const output1Response = await self.waitForLine(/^x1\$\s*(on|off)$/i, 3000)
		const output1 = output1Response.match(/^x1\$\s*(on|off)$/i)?.[1].toLowerCase() ?? 'off'

		self.sendCommand('x2$ sta')
		const output2Response = await self.waitForLine(/^x2\$\s*(on|off)$/i, 3000)
		const output2 = output2Response.match(/^x2\$\s*(on|off)$/i)?.[1].toLowerCase() ?? 'off'

		self.sendCommand('Status')
		const routingResponse = await self.waitForLine(/^x([1-3])AVx1\s*,\s*x([1-3])AVx2$/i, 3000)
		const routingMatch = routingResponse.match(/^x([1-3])AVx1\s*,\s*x([1-3])AVx2$/i)
		if (!routingMatch) {
			self.log('warn', `Unexpected XY routing response: ${routingResponse}`)
			return
		}

		self.sendCommand('Blink sta')
		const blinkResponse = await self.waitForLine(/^(Blink on|Blink off)$/i, 3000)
		const blink = blinkResponse.trim().toLowerCase().replace('blink ', '')

		self.sendCommand('LRAUD sta')
		const analogAudioResponse = await self.waitForLine(/^(LRAUD on|LRAUD off)$/i, 3000)
		const analogAudio = analogAudioResponse.trim().toLowerCase().replace('lraud ', '')

		self.sendCommand('CommaWait sta')
		const commaWaitResponse = await self.waitForLine(/^(CommaWait on|CommaWait off)$/i, 3000)
		const commaWait = commaWaitResponse.trim().toLowerCase().replace('commawait ', '')

		*/

		self.setVariableValues({
			type,
			version,
			statusPower: power,

			/*
			input1Connected: inputMatch[1] === '1' ? 'connected' : 'not-connected',
			input2Connected: inputMatch[2] === '1' ? 'connected' : 'not-connected',
			input3Connected: inputMatch[3] === '1' ? 'connected' : 'not-connected',
			output1Enabled: output1,
			output2Enabled: output2,
			routeOutput1: routingMatch[1],
			routeOutput2: routingMatch[2],
			statusBlink: blink,
			statusAudioOutAnalog: analogAudio,
			statusCommaWait: commaWait,
			*/
		})

		self.log('info', 'Initial PS62 status query complete, variables updated.')
		self.checkFeedbacks('fbkInputNotConnected') /*, 'fbkRoutedOut1', 'fbkRoutedOut2', 'fbkOutputDisabled' */
	} catch (err: any) {
		self.log('error', `Failed to retrieve PS62 initial status: ${err?.message ?? err}`)
	}
}
