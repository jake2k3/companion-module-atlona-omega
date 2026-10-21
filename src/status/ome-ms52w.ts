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
		// Query device model
		const modelResult = getResponseResult(await queryJson(self, 'Misc:Model:Get'), 'misc:model:get')
		if (typeof modelResult.model !== 'string') {
			throw new Error(`Unexpected model value: ${JSON.stringify(modelResult.model)}`)
		}
		const varModel = modelResult.model.replace(/\s+/g, '')
		self.log('debug', `Device model: ${varModel}`)

		// Query device firmware version
		const versionResult = getResponseResult(await queryJson(self, 'Misc:Version:Get'), 'misc:version:get')
		if (!isJsonObject(versionResult.version) || typeof versionResult.version.master !== 'string') {
			throw new Error(`Unexpected master version value: ${JSON.stringify(versionResult.version)}`)
		}
		const varVersion = versionResult.version.master.replace(/\s+/g, '')
		self.log('debug', `Firmware version: ${varVersion}`)

		// Query device hostname
		const hostnameResult = getResponseResult(await queryJson(self, 'GetHostName'), 'gethostname')
		if (typeof hostnameResult.hostname !== 'string') {
			throw new Error(`Unexpected hostname value: ${JSON.stringify(hostnameResult.hostname)}`)
		}
		const hostname = hostnameResult.hostname.replace(/\s+/g, '')

		// Query whether inputs are connected/disconnected, return is plain-text, not JSON
		const inputStatesPattern =
			/^\[\s*USB-C\s*:\s*(true|false)\s*,\s*DisplayPort\s*:\s*(true|false)\s*,\s*HDMI 3\s*:\s*(true|false)\s*,\s*HDMI 4\s*:\s*(true|false)\s*,\s*BYOD\s*:\s*(true|false)\s*\]$/i
		self.sendCommand('GetInputStates')
		const line = await (self as any).waitForLine(inputStatesPattern, 3000)
		const inputStateMatch = inputStatesPattern.exec(line)
		if (!inputStateMatch) {
			self.log('warn', `Unexpected input status response: ${line}`)
			return
		}
		const inputStates = inputStateMatch.slice(1).map((state) => state.toLowerCase() === 'true')
		const inputNames = ['USB-C', 'DisplayPort', 'HDMI 3', 'HDMI 4', 'BYOD']
		const varInput1State = inputStates[0] ? 'connected' : 'not-connected'
		const varInput2State = inputStates[1] ? 'connected' : 'not-connected'
		const varInput3State = inputStates[2] ? 'connected' : 'not-connected'
		const varInput4State = inputStates[3] ? 'connected' : 'not-connected'
		const varInput5State = inputStates[4] ? 'connected' : 'not-connected'
		for (let input = 0; input < inputStates.length; input++) {
			self.log(
				'info',
				`Input ${input + 1} (${inputNames[input]}) is ${inputStates[input] ? 'connected.' : 'not connected.'}`,
			)
		}

		// Query active input and BYOD type, if applicable
		const displayInputResult = getResponseResult(await queryJson(self, 'Display:Input:Get'), 'display:input:get')
		const inputValue = displayInputResult.input
		const inputIndex =
			typeof inputValue === 'number' || typeof inputValue === 'string' ? Number(inputValue) : Number.NaN
		const varRoute =
			typeof inputValue === 'string' && inputValue.trim().toLowerCase() === 'unknown'
				? 'unknown'
				: String(inputIndex + 1)
		if (varRoute !== 'unknown' && (!Number.isInteger(inputIndex) || inputIndex < 0 || inputIndex > 4)) {
			throw new Error(`Unexpected active input: ${displayInputResult.input}`)
		}
		const byodType = typeof displayInputResult.type === 'string' ? displayInputResult.type : 'unknown'

		// Update variables with retrieved values
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
			routeOutput1: varRoute,
			routeOutput2: varRoute,
		})

		self.log('info', 'Initial MS52W status query complete, variables updated.')
	} catch (err: any) {
		self.log('error', `Failed to retrieve MS52W initial status: ${err?.message ?? err}`)
	}
}
