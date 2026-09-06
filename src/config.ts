import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModelId = 'ome-ms42' | 'ome-sw32'

export type ModuleConfig = {
	model: ModelId
	host: string
	port: number
	username: string
}

export type ModuleSecrets = {
	password: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			label: 'Device Configuration',
			value:
				'Enter the Atlona device IP address and Telnet port. The default Telnet port is `23`. The login credentials are the same as those used to connect to the Atlona Web UI. The device must have Telnet Login Mode enabled from the Web UI, and must be reachable from the Companion host. If "Telnet Timeout" is enabled, the connection to the Companion Host will expire and must be manually reconnected.',
			width: 12,
		},
		{
			type: 'dropdown',
			id: 'model',
			label: 'Model',
			width: 6,
			choices: [
				{ id: 'ome-ms42', label: 'OME-MS42' },
				{ id: 'ome-sw32', label: 'OME-SW32' },
			],
			default: 'ome-ms42',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Telnet Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 23,
		},
		{
			type: 'textinput',
			id: 'username',
			label: 'Username',
			width: 6,
			default: 'admin',
		},
		{
			type: 'secret-text',
			id: 'password',
			label: 'Password',
			width: 6,
			// default: 'Atlona',
		},
	]
}
