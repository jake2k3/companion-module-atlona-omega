# Atlona Omega Series Companion Module

This module lets Bitfocus Companion control supported Atlona Omega devices over Telnet. Use it to remotely manage power, signal routing, output contols, and USB host settings.

## Configuration and Login

Enter the Atlona device's IP address and Telnet port. The default Telnet port is `23`. The login credentials are the same as those used to connect to the Atlona Web UI. If you have Telnet Login Mode disabled from the Web UI (not recommended, for obvious reasons) the authentication sequence is bypassed, thus login credentials can be left blank.

If "Telnet Timeout" is enabled, the connection to the Companion Host will expire and must be manually reconnected.

## Actions

The module provides actions for the following commands from the Atlona API:

- Power: Power On, Power Off, and Reboot
- Front panel: Blink LED, DISPLAY button control, Lock and Unlock
- Routing: Select an input for HDMI and HDBaseT outputs
- Output control: Enable or disable HDMI and HDBaseT outputs
- Audio: Mute or unmute HDMI and HDBaseT audio outputs
- USB: Configure USB Host Logic, USB Host Route, and USB VBus power

Actions named `Get ... Status` are intended for manually refreshing variables or troubleshooting. Status variables are also populated automatically when the connection is established.

RS-232 commands can be sent over HDBaseT to a remote device by using the "Send RS-232 Command" action. Configuration of serial baud rate, parity, etc. must be done in the Atlona Web UI for this action to function correctly. Please refer to the remote device's documentation for details on RS-232 setup and accepted commands. A line-ending character must be specified (either a carriage return, line feed, or both).

## Variables

The module exposes variables for:

- Device model and firmware version
- Power and blink status
- Input 1-4 connection status
- Output 1-2 enable status
- XY Status: Displays which input is routed to which output
- Analog audio output status
- HDMI and HDBaseT audio mute status
- USB Host Logic and USB Host Route
- USB VBus power status

Variables are updated during initial connection and when the corresponding action (or `Get ... Status` action) is run.

Input connection status, XY routing, and output enable status variables can be called using feedback to dynamically change the style of any button.

## Supported Devices

All actions have been tested with the Atlona AT-OME-MS42. Other Atlona Omega series devices may work but have not been verified; please check the API for your specific device to see if the commands match.

Partial support has been implemented for the following models:

- AT-OME-MS52W
- AT-OME-PS62
- AT-OME-SW32

If you would like to request a specific model for integration in a future release, please submit a request [here](https://github.com/bitfocus/companion-module-atlona-omega/issues) and attach a PDF of that model's current API document to the request.

## Troubleshooting

- Confirm the IP address and Telnet port.
- Confirm the username and password are correct (if Telnet Login Mode is enabled on the device).
- Confirm that the Companion host can reach the device on the configured port.
- Check the Companion log for authentication or connection errors.
- Run the relevant `Get ... Status` action to refresh a variable manually.

If something is still not working, please file a bug report [here](https://github.com/bitfocus/companion-module-atlona-omega/issues).
