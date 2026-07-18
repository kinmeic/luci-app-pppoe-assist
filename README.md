# luci-app-pppoe-assist

LuCI application for OpenWrt 24.10 that checks a PPPoE interface IP after `ifup`.
If the address starts with one of the configured bad IP prefixes, the app triggers
a redial until the configured maximum attempt count is reached.

## Behavior

- Checks only the configured logical network interface, default `wan`.
- Only PPPoE (`proto=pppoe`) interfaces are selectable in LuCI and eligible at
  runtime.
- Runs on OpenWrt `iface` hotplug `ifup` events.
- Runs once immediately when the LuCI config is applied through `ucitrack`, if
  the interface already has an IPv4 address.
- After a redial the new address is checked again inside the same process, so
  consecutive bad IPs keep triggering redials without waiting for another
  hotplug event.
- Resets the attempt counter once the interface gets an IP that does not match
  any bad prefix.
- Once the maximum attempt count is reached, redialing pauses for
  `retry_cooldown` seconds (default 3600), then the counter is reset and the
  current address is checked again. Set `retry_cooldown` to `0` to stop without
  an automatic retry.

## Bad prefix matching semantics

Bad prefixes are compared as **plain string prefixes**: an entry matches when the
assigned IPv4 address, written in dotted-quad form, starts with the entry text.
Entries are split by comma and surrounding whitespace is trimmed.

Matching is **not** aligned to octet boundaries:

- `218` matches `218.1.1.1` (and any other `218.x.x.x` address).
- `58.41` matches `58.41.2.3`.
- `21` matches `21.x.x.x` but also `210.x.x.x`, `218.x.x.x`, `219.x.x.x`, etc.
- `58.4` matches both `58.40.x.x` and `58.41.x.x`.

Write full leading octets to avoid unintended matches.

Example bad prefix setting:

```text
218,58.41
```

This matches IPs such as `218.1.1.1` and `58.41.2.3`.

## Configuration

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `0` | Enable the checks. |
| `interface` | `wan` | Logical PPPoE interface to monitor. |
| `bad_prefixes` | *(empty)* | Comma separated bad IP prefixes, see above. |
| `max_attempts` | `20` | Consecutive redials before giving up. |
| `redial_delay` | `3` | Seconds between interface down and up. |
| `ip_wait` | `5` | Seconds to wait for an IPv4 address after `ifup`. |
| `retry_cooldown` | `3600` | Pause before resetting a maxed-out counter and checking again. `0` disables automatic retry. |
