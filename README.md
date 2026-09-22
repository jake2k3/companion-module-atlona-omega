# Companion Module for Atlona Omega Series Matrix Switchers

This Companion Module has been developed to control the Atlona Omega series of matrix switchers and scalers. As of version 1.0, the actions correspond to the commands listed in the [Atlona AT-OME-MS42 API](https://ts.atlona.com/pdf/AT-OME-MS42_API.pdf). Note that other Atlona devices may use similar commands, though compatibilty has not been tested and cannot be verified for all models.

If there is a specific action or feature you'd like to see implemented, please post the request on the [GitHub Issues](https://github.com/bitfocus/companion-module-atlona-omega/issues) page.

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

## Active To-Do's

- Define additional feedback for USB Routing, logic, etc
- Auto-reconnect, auto-status polling (or action Result values, perhaps?)

## Long Term To-Do's

- Create a dropdown to allow selection from multiple OME models (SW-32 for starters), and show/hide actions based on selection
- Advanced actions/commands
  - IP802.1x
  - IPDHCP
  - IPStatic
  - Mreset
  - (RS-232) RepCmd, RepeatCmdTime

## Branch "models"

- RS232para and status: Console settings are set from command "CSpara" not "RS232paraZ"
- Add variables for RS232para for Console, HDBT1, HDBT2, HDBTOut
- Finish actions, variables, feedback, and presets for SW32 and PS62
