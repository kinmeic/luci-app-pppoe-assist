# luci-app-pppoe-assist

LuCI application for OpenWrt 24.10 that checks a PPPoE interface IP after `ifup`.
If the address starts with one of the configured bad IP prefixes, the app triggers
a redial until the configured maximum attempt count is reached.

## Behavior

- Checks only the configured logical network interface, default `wan`.
- Only PPPoE (`proto=pppoe`) interfaces are selectable in LuCI and eligible at
  runtime.
- Runs on OpenWrt `iface` hotplug `ifup` events.
- Runs once immediately when the LuCI config is applied through `ucitrack`.
- Splits bad prefixes by comma, trims surrounding spaces, and compares by string
  prefix.
- Resets the attempt counter once the interface gets an IP that does not match
  any bad prefix.

Example bad prefix setting:

```text
218,58.41
```

This matches IPs such as `218.1.1.1` and `58.41.2.3`.
