import {
	InstanceBase,
	InstanceStatus,
	TelnetHelper,
	type CompanionActionDefinitions,
	type CompanionActionSchema,
	type CompanionOptionValues,
	type CompanionVariableDefinitions,
	type CompanionVariableValues,
	type SomeCompanionConfigField,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, type ModuleSecrets } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { queryInitialStatus as queryOmeMs42Status } from './status/ome-ms42.js'
import { queryInitialStatus as queryOmeMs52wStatus } from './status/ome-ms52w.js'
import { queryInitialStatus as queryOmePs62Status } from './status/ome-ps62.js'
import { queryInitialStatus as queryOmeSw32Status } from './status/ome-sw32.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: ModuleSecrets
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

type PendingLineWaiter = {
	regex: RegExp
	resolve: (line: string) => void
	reject: (error: Error) => void
	timer: NodeJS.Timeout
}

type PendingJsonWaiter = {
	resolve: (value: unknown) => void
	reject: (error: Error) => void
	timer: NodeJS.Timeout
}

function createAbortError(message: string): Error {
	const error = new Error(message)
	error.name = 'AbortError'
	return error
}

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // Setup in init()
	secrets!: ModuleSecrets // Setup in init()

	private telnet: TelnetHelper | undefined
	private receiveBuffer = ''
	private jsonBuffer = ''
	private authenticated = false
	private pendingLineWaiters: PendingLineWaiter[] = []
	private pendingJsonWaiters: PendingJsonWaiter[] = []

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions
		this.initConnection()
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.destroyConnection()
		this.log('debug', 'Module destroyed')
	}

	// When user saves changes to the module config
	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		this.updateActions()
		this.updateVariableDefinitions()
		this.initConnection()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private initConnection(): void {
		this.destroyConnection()
		if (!this.config.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'Target IP is required')
			return
		}
		this.updateStatus(InstanceStatus.Connecting)
		this.log('info', `Attempting initial Telnet connection to ${this.config.host}:${this.config.port}`)
		this.telnet = new TelnetHelper(this.config.host, this.config.port)
		this.telnet.on('connect', () => {
			this.authenticated = false
			this.updateStatus(InstanceStatus.Connecting, 'Connected; awaiting authentication')
			this.log('info', `Connected to device at ${this.config.host}:${this.config.port}`)
			this.receiveBuffer = ''
		})
		this.telnet.on('data', (data: Buffer) => {
			this.handleData(data)
		})
		this.telnet.on('error', (error) => {
			this.log('error', `Connection error: ${error.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, error.message)
		})
		this.telnet.on('end', () => {
			this.log('info', `Connection to device at ${this.config.host}:${this.config.port} closed`)
			this.updateStatus(InstanceStatus.Disconnected, 'Connection closed')
		})
	}

	private destroyConnection(): void {
		this.telnet?.destroy()
		this.telnet = undefined
		this.authenticated = false
		this.receiveBuffer = ''
		this.jsonBuffer = ''
		for (const waiter of this.pendingLineWaiters) {
			clearTimeout(waiter.timer)
			waiter.reject(new Error('Connection closed while waiting for a response line'))
		}
		this.pendingLineWaiters = []
		for (const waiter of this.pendingJsonWaiters) {
			clearTimeout(waiter.timer)
			waiter.reject(new Error('Connection closed while waiting for a JSON response'))
		}
		this.pendingJsonWaiters = []
	}

	async waitForLine(regex: RegExp, timeoutMs: number, signal?: AbortSignal): Promise<string> {
		if (signal?.aborted) {
			throw createAbortError('Response line wait aborted')
		}

		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				pendingWaiter.reject(new Error(`Timed out waiting for line matching ${regex}`))
			}, timeoutMs)

			const abortHandler = () => pendingWaiter.reject(createAbortError('Response line wait aborted'))
			const pendingWaiter: PendingLineWaiter = {
				regex,
				resolve: (line) => {
					clearTimeout(timer)
					signal?.removeEventListener('abort', abortHandler)
					this.pendingLineWaiters = this.pendingLineWaiters.filter((waiter) => waiter !== pendingWaiter)
					resolve(line)
				},
				reject: (error) => {
					clearTimeout(timer)
					signal?.removeEventListener('abort', abortHandler)
					this.pendingLineWaiters = this.pendingLineWaiters.filter((waiter) => waiter !== pendingWaiter)
					reject(error)
				},
				timer,
			}

			this.pendingLineWaiters.push(pendingWaiter)
			signal?.addEventListener('abort', abortHandler, { once: true })
		})
	}

	async waitForJson(timeoutMs: number, signal?: AbortSignal): Promise<unknown> {
		if (signal?.aborted) {
			throw createAbortError('JSON response wait aborted')
		}

		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				pendingWaiter.reject(new Error('Timed out waiting for a JSON response'))
			}, timeoutMs)

			const abortHandler = () => pendingWaiter.reject(createAbortError('JSON response wait aborted'))
			const pendingWaiter: PendingJsonWaiter = {
				resolve: (value) => {
					clearTimeout(timer)
					signal?.removeEventListener('abort', abortHandler)
					this.pendingJsonWaiters = this.pendingJsonWaiters.filter((waiter) => waiter !== pendingWaiter)
					resolve(value)
				},
				reject: (error) => {
					clearTimeout(timer)
					signal?.removeEventListener('abort', abortHandler)
					this.pendingJsonWaiters = this.pendingJsonWaiters.filter((waiter) => waiter !== pendingWaiter)
					reject(error)
				},
				timer,
			}

			this.pendingJsonWaiters.push(pendingWaiter)
			signal?.addEventListener('abort', abortHandler, { once: true })
		})
	}

	// Query the status of the device on connection and update variables accordingly
	private async queryInitialStatus(): Promise<void> {
		if (this.config.model === 'ome-ms52w') {
			await queryOmeMs52wStatus(this)
			return
		}
		if (this.config.model === 'ome-ps62') {
			await queryOmePs62Status(this)
			return
		}
		if (this.config.model === 'ome-sw32') {
			await queryOmeSw32Status(this)
			return
		}
		await queryOmeMs42Status(this)
		return
	}

	private handleJsonPayload(payload: string): void {
		try {
			const parsed = JSON.parse(payload) as Record<string, unknown>
			if (this.pendingJsonWaiters.length > 0) {
				const pendingWaiter = this.pendingJsonWaiters[0]
				pendingWaiter.resolve(parsed)
				return
			}
		} catch (error) {
			this.log('warn', `Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	private handleData(data: Buffer): void {
		const chunk = data.toString('utf8')
		this.receiveBuffer += chunk

		this.log('debug', `RX chunk: ${JSON.stringify(chunk)}`)
		this.handleLoginPrompts()

		const lines = this.receiveBuffer.split(/\r?\n/)
		this.receiveBuffer = lines.pop() ?? ''

		for (const rawLine of lines) {
			const line = rawLine.trim()
			this.log('debug', `RX: [${line}]`)

			if (line.length > 0) {
				const jsonStart = this.jsonBuffer.length === 0 && line.startsWith('{')
				if (jsonStart || this.jsonBuffer.length > 0) {
					this.jsonBuffer = jsonStart ? line : `${this.jsonBuffer}\n${line}`
					let braceDepth = 0
					let inString = false
					let escaped = false
					for (const character of this.jsonBuffer) {
						switch (character) {
							case '\\':
								if (inString) escaped = !escaped
								break
							case '"':
								if (!escaped) inString = !inString
								escaped = false
								break
							case '{':
								if (!inString) braceDepth += 1
								break
							case '}':
								if (!inString) braceDepth -= 1
								break
							default:
								if (escaped && inString) escaped = false
								break
						}
					}
					if (braceDepth <= 0 && this.jsonBuffer.includes('{') && this.jsonBuffer.includes('}')) {
						const payload = this.jsonBuffer
						this.jsonBuffer = ''
						this.handleJsonPayload(payload)
						continue
					}
					continue
				}
			}

			const matchingWaiter = this.pendingLineWaiters.find((waiter) => waiter.regex.test(line))
			if (matchingWaiter) {
				matchingWaiter.resolve(line)
				continue
			}

			const welcomeMessage = ['Welcome to TELNET.', 'Welcome to Telnet!', 'Authentication succeded'] // yes, succeded is misspelled
			if (welcomeMessage.includes(line)) {
				if (!this.authenticated) {
					this.authenticated = true
					this.updateStatus(InstanceStatus.Ok, 'Authenticated')
					this.log('info', 'Authenticated successfully')
					void this.queryInitialStatus()
				}
				continue
			}
		}
	}

	private handleLoginPrompts(): void {
		let handled = true
		while (handled) {
			handled = false

			const usernamePrompt = /^[\s\S]*(?:Username:|AT-OME-[\w-]+ login:)/i
			const passwordPrompt = /^[\s\S]*(?:Password:)/i

			if (usernamePrompt.test(this.receiveBuffer)) {
				if (this.config.username) {
					this.sendRawCommand(this.config.username)
					this.receiveBuffer = this.receiveBuffer.replace(usernamePrompt, '')
					handled = true
				} else {
					this.log('error', 'Username prompt received but username is not configured')
					return
				}
			}

			if (passwordPrompt.test(this.receiveBuffer)) {
				if (this.secrets.password) {
					this.sendRawCommand(this.secrets.password)
					this.receiveBuffer = this.receiveBuffer.replace(passwordPrompt, '')
					handled = true
				} else {
					this.log('error', 'Password prompt received but password is not configured')
					return
				}
			}
		}
	}

	private sendRawCommand(command: string): void {
		if (!this.telnet?.isConnected) {
			this.log('warn', `Cannot send raw command while disconnected: ${command}`)
			return
		}

		const cleanCommand = command.replace(/[\r\n]+$/g, '')
		if (!cleanCommand) {
			return
		}

		this.log('debug', `Sending raw command: ${cleanCommand}`)
		this.telnet.send(`${cleanCommand}\r`)
	}

	sendCommand(command: string): boolean {
		if (!this.telnet?.isConnected) {
			this.log('warn', `Cannot send command while disconnected: ${command}`)
			return false
		}

		if (!this.authenticated) {
			this.log('warn', `Cannot send command before authentication: ${command}`)
			return false
		}
		const cleanCommand = command.replace(/[\r\n]+$/g, '')
		if (!cleanCommand) {
			return false
		}
		this.log('debug', `Sending command: ${cleanCommand}`)
		this.telnet.send(`${cleanCommand}\r`)
		return true
	}

	updateActions(): void {
		UpdateActions(this)
	}

	setModelActionDefinitions<TActions extends Record<string, CompanionActionSchema<CompanionOptionValues>>>(
		actions: CompanionActionDefinitions<TActions>,
	): void {
		this.setActionDefinitions(actions as unknown as CompanionActionDefinitions<ActionsSchema>)
	}

	setModelVariableDefinitions<TVariables extends Record<string, CompanionVariableValues[string]>>(
		variables: CompanionVariableDefinitions<TVariables>,
	): void {
		this.setVariableDefinitions(variables as CompanionVariableDefinitions<VariablesSchema>)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}
