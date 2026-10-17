import type ModuleInstance from '../main.js'

export async function queryInitialStatus(self: ModuleInstance): Promise<void> {
	try {
		self.sendCommand('Misc:Model:Get')
		const modelLine = await self.waitForLine(/"model"\s*:\s*("(?:\\.|[^"\\])*")/, 3000)
		const modelMatch = modelLine.match(/"model"\s*:\s*("(?:\\.|[^"\\])*")/)
		if (!modelMatch) {
			throw new Error(`Unexpected model response: ${modelLine}`)
		}
		const parsedModel: unknown = JSON.parse(modelMatch[1])
		if (typeof parsedModel !== 'string') {
			throw new Error(`Unexpected model value: ${modelMatch[1]}`)
		}
		const type = parsedModel.replace(/\s+/g, '')

		self.sendCommand('Misc:Version:Get')
		const versionLine = await self.waitForLine(/"master"\s*:\s*("(?:\\.|[^"\\])*")/, 3000)
		const versionMatch = versionLine.match(/"master"\s*:\s*("(?:\\.|[^"\\])*")/)
		if (!versionMatch) {
			throw new Error(`Unexpected version response: ${versionLine}`)
		}
		const parsedVersion: unknown = JSON.parse(versionMatch[1])
		if (typeof parsedVersion !== 'string') {
			throw new Error(`Unexpected version value: ${versionMatch[1]}`)
		}
		const version = parsedVersion.replace(/\s+/g, '')

		self.sendCommand('GetHostName')
		const hostnameLine = await self.waitForLine(/"hostname"\s*:\s*("(?:\\.|[^"\\])*")/, 3000)
		const hostnameMatch = hostnameLine.match(/"hostname"\s*:\s*("(?:\\.|[^"\\])*")/)
		if (!hostnameMatch) {
			throw new Error(`Unexpected hostname response: ${hostnameLine}`)
		}
		const parsedHostname: unknown = JSON.parse(hostnameMatch[1])
		if (typeof parsedHostname !== 'string') {
			throw new Error(`Unexpected hostname value: ${hostnameMatch[1]}`)
		}
		const hostname = parsedHostname.replace(/\s+/g, '')
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
			hostname,
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

		self.log('info', 'Initial MS52W status query complete, variables updated.')
		// self.checkFeedbacks('fbkInputNotConnected', 'fbkRoutedOut1', 'fbkRoutedOut2', 'fbkOutputDisabled')
	} catch (err: any) {
		self.log('error', `Failed to retrieve MS52W initial status: ${err?.message ?? err}`)
	}
}
