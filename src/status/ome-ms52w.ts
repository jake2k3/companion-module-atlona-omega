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
		/*
		const queryInput = await self.waitForLine(/^InputStates\s*([01]{4})$/i, 3000)
		const inputMatch = queryInput.match(/^InputStates\s*([01]{4})$/i)
		if (!inputMatch) {
			self.log('warn', `Unexpected input status response: ${queryInput}`)
			return
		}
		*/

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
			input0Connected: inputMatch[0] === '1' ? 'connected' : 'not-connected',
			input1Connected: inputMatch[1] === '1' ? 'connected' : 'not-connected',
			input2Connected: inputMatch[2] === '1' ? 'connected' : 'not-connected',
			input3Connected: inputMatch[3] === '1' ? 'connected' : 'not-connected',
			input4Connected: inputMatch[4] === '1' ? 'connected' : 'not-connected',
			routeOutput0: String(varRoute),
			routeOutput1: String(varRoute),
		})

		self.log('info', 'Initial MS52W status query complete, variables updated.')
	} catch (err: any) {
		self.log('error', `Failed to retrieve MS52W initial status: ${err?.message ?? err}`)
	}
}
