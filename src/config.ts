import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModelId = 'ome-ms42' | 'ome-ms52w' | 'ome-ps62' | 'ome-sw32'

export type ModuleConfig = {
	model: ModelId
	host: string
	port: number
	username: string
	keepaliveEnabled: boolean
	keepaliveInterval: number
}

export type ModuleSecrets = {
	password: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info-config',
			width: 12,
			label: 'Device Configuration',
			value:
				'Enter the Atlona device IP address and Telnet port. The default Telnet port is `23`. Enter the same login credentials used for the Web UI.',
		},
		{
			type: 'dropdown',
			id: 'model',
			width: 6,
			label: 'Model',
			choices: [
				{ id: 'ome-ms42', label: 'OME-MS42' },
				{ id: 'ome-ms52w', label: 'OME-MS52W' },
				{ id: 'ome-ps62', label: 'OME-PS62' },
				{ id: 'ome-sw32', label: 'OME-SW32' },
			],
			default: 'ome-ms42',
		},
		{
			type: 'textinput',
			id: 'host',
			width: 8,
			label: 'Target IP',
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			width: 4,
			label: 'Telnet Port',
			min: 1,
			max: 65535,
			default: 23,
		},
		{
			type: 'textinput',
			width: 6,
			id: 'username',
			label: 'Username',
			default: 'admin',
		},
		{
			type: 'secret-text',
			id: 'password',
			width: 6,
			label: 'Password',
			// default: 'Atlona',
		},
		{
			type: 'static-text',
			id: 'info-keepalive',
			width: 12,
			label: 'Telnet Timeout Keepalive',
			value:
				'Some Atlona devices will automatically disconnect Telnet sessions after a period of inactivity. If you are experiencing unexpected disconnections AND do not have an option to disable "Telnet Timeout" from the Web UI, enable this keepalive option and set the period to a value less than the device timeout (Default timeout is 120 seconds).',
		},
		{
			type: 'checkbox',
			id: 'keepaliveEnabled',
			width: 6,
			label: 'Telnet Keepalive',
			default: false,
		},
		{
			type: 'number',
			id: 'keepaliveInterval',
			width: 6,
			label: 'Period (s)',
			min: 1,
			max: 3600,
			default: 90,
		},
	]
}
