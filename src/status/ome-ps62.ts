import type ModuleInstance from '../main.js'

export async function queryInitialStatus(self: ModuleInstance): Promise<void> {
	try {
		// Query device model
		self.sendCommand('Type')
		const deviceModel = await self.waitForLine(/^(AT-.*)/i, 3000)

		// Query device firmware version
		self.sendCommand('Version')
		const deviceVersion = await self.waitForLine(/^\d+\.\d+\.\d+$/, 3000)

		// Query device power status
		self.sendCommand('PWSTA')
		const queryPower = await self.waitForLine(/^(PWON|PWOFF)$/i, 3000)
		const statusPower = queryPower.trim().toUpperCase() === 'PWON' ? 'on' : 'off'

		self.sendCommand('InputStatus')
		const inputResponse = await self.waitForLine(/^InputStatus\s*([01]{6})$/i, 3000)
		const inputMatch = inputResponse.match(/^InputStatus\s*([01]{6})$/i)
		if (!inputMatch) {
			self.log('warn', `Unexpected input status response: ${inputResponse}`)
			return
		}

		// Query device I/O routing
		const promiseRoute1 = self.waitForLine(/^x([1-6])AVx1$/i, 3000)
		const promiseRoute2 = self.waitForLine(/^x([1-6])AVx2$/i, 3000)
		self.sendCommand('Status')

		const queryRouting1 = await promiseRoute1
		const queryRouting2 = await promiseRoute2

		const routeOutputMatch1 = queryRouting1.match(/^x([1-6])AVx1$/i)
		if (!routeOutputMatch1) {
			self.log('warn', `Unexpected XY routing response: ${queryRouting1}`)
			return
		}

		const routeOutputMatch2 = queryRouting2.match(/^x([1-6])AVx2$/i)
		if (!routeOutputMatch2) {
			self.log('warn', `Unexpected XY routing response: ${queryRouting2}`)
			return
		}

		// Query RS-232 parameters for device (console) and HDBaseT ports (Input 1, Input 2, Output)
		self.sendCommand('CSpara')
		const queryCSpara = await self.waitForLine(/^CSpara\[\d{4,6},\d,\d,\d\]$/, 3000)
		const [rs232consoleBaud, rs232consoleDataBits, rs232consoleParNum, rs232consoleStopBits] = queryCSpara
			.match(/^CSpara\[(\d{4,6}),(\d),(\d),(\d)\]$/)!
			.slice(1)
			.map(Number)

		const rs232para1Promise = self.waitForLine(/^RS232para1\[\d{4,6},\d,\d,\d\]$/, 3000)
		const rs232para2Promise = self.waitForLine(/^RS232para2\[\d{4,6},\d,\d,\d\]$/, 3000)
		const rs232para3Promise = self.waitForLine(/^RS232para3\[\d{4,6},\d,\d,\d\]$/, 3000)
		self.sendCommand('RS232para')

		const [queryRS232para1, queryRS232para2, queryRS232para3] = await Promise.all([
			rs232para1Promise,
			rs232para2Promise,
			rs232para3Promise,
		])

		const [rs232port1Baud, rs232port1DataBits, rs232port1ParNum, rs232port1StopBits] = queryRS232para1
			.match(/^RS232para1\[(\d{4,6}),(\d),(\d),(\d)\]$/)!
			.slice(1)
			.map(Number)

		const [rs232port2Baud, rs232port2DataBits, rs232port2ParNum, rs232port2StopBits] = queryRS232para2
			.match(/^RS232para2\[(\d{4,6}),(\d),(\d),(\d)\]$/)!
			.slice(1)
			.map(Number)

		const [rs232port3Baud, rs232port3DataBits, rs232port3ParNum, rs232port3StopBits] = queryRS232para3
			.match(/^RS232para3\[(\d{4,6}),(\d),(\d),(\d)\]$/)!
			.slice(1)
			.map(Number)

		let rs232consoleParity: string
		if (rs232consoleParNum === 0) {
			rs232consoleParity = 'none'
		} else if (rs232consoleParNum === 1) {
			rs232consoleParity = 'odd'
		} else if (rs232consoleParNum === 2) {
			rs232consoleParity = 'even'
		} else {
			rs232consoleParity = ''
		}

		let rs232port1Parity: string
		if (rs232port1ParNum === 0) {
			rs232port1Parity = 'none'
		} else if (rs232port1ParNum === 1) {
			rs232port1Parity = 'odd'
		} else if (rs232port1ParNum === 2) {
			rs232port1Parity = 'even'
		} else {
			rs232port1Parity = ''
		}

		let rs232port2Parity: string
		if (rs232port2ParNum === 0) {
			rs232port2Parity = 'none'
		} else if (rs232port2ParNum === 1) {
			rs232port2Parity = 'odd'
		} else if (rs232port2ParNum === 2) {
			rs232port2Parity = 'even'
		} else {
			rs232port2Parity = ''
		}

		let rs232port3Parity: string
		if (rs232port3ParNum === 0) {
			rs232port3Parity = 'none'
		} else if (rs232port3ParNum === 1) {
			rs232port3Parity = 'odd'
		} else if (rs232port3ParNum === 2) {
			rs232port3Parity = 'even'
		} else {
			rs232port3Parity = ''
		}

		/*

		self.sendCommand('x1$ sta')
		const output1Response = await self.waitForLine(/^x1\$\s*(on|off)$/i, 3000)
		const output1 = output1Response.match(/^x1\$\s*(on|off)$/i)?.[1].toLowerCase() ?? 'off'

		self.sendCommand('x2$ sta')
		const output2Response = await self.waitForLine(/^x2\$\s*(on|off)$/i, 3000)
		const output2 = output2Response.match(/^x2\$\s*(on|off)$/i)?.[1].toLowerCase() ?? 'off'

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
			deviceModel,
			deviceVersion,
			input1Connected: inputMatch[1] === '1' ? 'connected' : 'not-connected',
			input2Connected: inputMatch[2] === '1' ? 'connected' : 'not-connected',
			input3Connected: inputMatch[3] === '1' ? 'connected' : 'not-connected',
			input4Connected: inputMatch[4] === '1' ? 'connected' : 'not-connected',
			input5Connected: inputMatch[5] === '1' ? 'connected' : 'not-connected',
			input6Connected: inputMatch[6] === '1' ? 'connected' : 'not-connected',
			routeOutput1: routeOutputMatch1 ? routeOutputMatch1[1] : '',
			routeOutput2: routeOutputMatch2 ? routeOutputMatch2[1] : '',
			rs232consoleBaud,
			rs232consoleDataBits,
			rs232consoleParity,
			rs232consoleStopBits,
			rs232port1Baud,
			rs232port1DataBits,
			rs232port1Parity,
			rs232port1StopBits,
			rs232port2Baud,
			rs232port2DataBits,
			rs232port2Parity,
			rs232port2StopBits,
			rs232port3Baud,
			rs232port3DataBits,
			rs232port3Parity,
			rs232port3StopBits,
			statusPower,

			/*
			output1Enabled: output1,
			output2Enabled: output2,

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
