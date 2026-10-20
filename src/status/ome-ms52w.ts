import type ModuleInstance from '../main.js'

type JsonObject = Record<string, unknown>

function isJsonObject(value: unknown): value is JsonObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getResponseResult(response: unknown, expectedMethod: string): JsonObject {
	if (!isJsonObject(response)) {
		throw new Error(`Unexpected response for ${expectedMethod}: ${JSON.stringify(response)}`)
	}

	const methodreturn =
		typeof response.methodreturn === 'string' ? response.methodreturn.replace(/\s+/g, '').toLowerCase() : ''
	if (methodreturn !== expectedMethod || !isJsonObject(response.result)) {
		throw new Error(`Unexpected response for ${expectedMethod}: ${JSON.stringify(response)}`)
	}

	return response.result
}

async function queryJson(self: ModuleInstance, command: string): Promise<unknown> {
	const response = self.waitForJson(3000)
	self.sendCommand(command)
	return response
}

export async function queryInitialStatus(self: ModuleInstance): Promise<void> {
	try {
		self.sendCommand('Misc:Model:Get')
		const modelResult = getResponseResult(await queryJson(self, 'Misc:Model:Get'), 'misc:model:get')
		if (typeof modelResult.model !== 'string') {
			throw new Error(`Unexpected model value: ${JSON.stringify(modelResult.model)}`)
		}
		const varModel = modelResult.model.replace(/\s+/g, '')
		self.log('debug', `Device model: ${varModel}`)

		self.sendCommand('Misc:Version:Get')
		const versionResult = getResponseResult(await queryJson(self, 'Misc:Version:Get'), 'misc:version:get')
		if (!isJsonObject(versionResult.version) || typeof versionResult.version.master !== 'string') {
			throw new Error(`Unexpected master version value: ${JSON.stringify(versionResult.version)}`)
		}
		const varVersion = versionResult.version.master.replace(/\s+/g, '')
		self.log('debug', `Firmware version: ${varVersion}`)

		self.sendCommand('GetHostName')
		const hostnameResult = getResponseResult(await queryJson(self, 'GetHostName'), 'gethostname')
		if (typeof hostnameResult.hostname !== 'string') {
			throw new Error(`Unexpected hostname value: ${JSON.stringify(hostnameResult.hostname)}`)
		}
		const hostname = hostnameResult.hostname.replace(/\s+/g, '')

		self.sendCommand('GetInputStates')
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
			self.log('info', `Input ${input + 1} (${inputNames[input]}) is ${connected ? 'connected.' : 'not connected.'}`)
		}

		const varInput1State = inputStates[0] ? 'connected' : 'not-connected'
		const varInput2State = inputStates[1] ? 'connected' : 'not-connected'
		const varInput3State = inputStates[2] ? 'connected' : 'not-connected'
		const varInput4State = inputStates[3] ? 'connected' : 'not-connected'
		const varInput5State = inputStates[4] ? 'connected' : 'not-connected'

		self.sendCommand('Display:Input:Get')
		const displayInputResult = getResponseResult(await queryJson(self, 'Display:Input:Get'), 'display:input:get')
		const varRoute =
			typeof displayInputResult.input === 'number' || typeof displayInputResult.input === 'string'
				? Number(displayInputResult.input)
				: NaN
		if (!Number.isInteger(varRoute) || varRoute < 0 || varRoute > 4) {
			throw new Error(`Unexpected active input: ${displayInputResult.input}`)
		}
		const byodType = typeof displayInputResult.type === 'string' ? displayInputResult.type : 'unknown'

		self.setVariableValues({
			deviceModel: String(varModel),
			deviceVersion: String(varVersion),
			byodType,
			hostname,
			input1Connected: varInput1State,
			input2Connected: varInput2State,
			input3Connected: varInput3State,
			input4Connected: varInput4State,
			input5Connected: varInput5State,
			routeOutput1: String(varRoute),
			routeOutput2: String(varRoute),
		})

		self.log('info', 'Initial MS52W status query complete, variables updated.')
	} catch (err: any) {
		self.log('error', `Failed to retrieve MS52W initial status: ${err?.message ?? err}`)
	}
}
