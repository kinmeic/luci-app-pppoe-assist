'use strict';
'require view';
'require form';
'require network';
'require fs';
'require ui';

return view.extend({
	load: function() {
		return network.getNetworks();
	},

	render: function(data) {
		var networks = data;
		var m, s, o;
		var pppoeFound = false;

		m = new form.Map('pppoe-assist', _('PPPoE Assist'),
			_('Check the configured PPPoE interface after it comes up. If the assigned IPv4 address starts with a configured bad prefix, the interface is redialed until the maximum attempt count is reached.'));

		s = m.section(form.NamedSection, 'main', 'settings');
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.option(form.ListValue, 'interface', _('Monitored interface'));
		o.default = 'wan';
		o.rmempty = false;
		networks.forEach(function(net) {
			var name = net.getName();
			var proto = net.getProtocol && net.getProtocol();
			if (name && proto == 'pppoe') {
				pppoeFound = true;
				o.value(name, name);
			}
		});
		if (!pppoeFound) {
			o.value('', _('No PPPoE interfaces found'));
			o.default = '';
		}
		o.validate = function(section_id, value) {
			if (!value && !pppoeFound)
				return true;

			for (var i = 0; i < networks.length; i++) {
				if (networks[i].getName() == value && networks[i].getProtocol && networks[i].getProtocol() == 'pppoe')
					return true;
			}

			return _('Please select a PPPoE interface.');
		};

		o = s.option(form.Value, 'bad_prefixes', _('Bad IP prefixes'),
			_('Comma separated list. Matching is a plain string prefix comparison: an entry matches when the assigned IP starts with the entry text. Entries are not aligned to octet boundaries, so "218" matches 218.x.x.x, but "21" would also match 210.x.x.x or 218.x.x.x. Write full leading octets, e.g. "218,58.41".'));
		o.datatype = 'string';
		o.placeholder = '218,58.41';
		o.rmempty = true;

		o = s.option(form.Value, 'max_attempts', _('Maximum redial attempts'),
			_('Redials pause after this many consecutive attempts. The counter resets when a good IP is assigned or after the retry cooldown.'));
		o.datatype = 'range(1,100)';
		o.default = '20';
		o.rmempty = false;

		o = s.option(form.Value, 'redial_delay', _('Redial delay'),
			_('Seconds to wait between taking the interface down and bringing it back up.'));
		o.datatype = 'range(0,60)';
		o.default = '3';
		o.rmempty = false;

		o = s.option(form.Value, 'ip_wait', _('IP wait time'),
			_('Seconds to wait for an IPv4 address to appear on the interface before giving up.'));
		o.datatype = 'range(1,60)';
		o.default = '5';
		o.rmempty = false;

		o = s.option(form.Value, 'retry_cooldown', _('Retry cooldown'),
			_('Seconds to pause after the maximum attempts is reached. The counter is then reset and the current IP is checked again. Set to 0 to disable the automatic retry.'));
		o.datatype = 'range(0,86400)';
		o.default = '3600';
		o.rmempty = false;

		o = s.option(form.Button, '_check_now', _('Check now'));
		o.inputtitle = _('Run check');
		o.inputstyle = 'apply';
		o.onclick = function(section_id) {
			var iface = this.map.lookupOption('interface', section_id)[0].formvalue(section_id);

			if (!iface) {
				ui.addNotification(null, E('p', {}, _('No PPPoE interface is selected.')), 'warning');
				return Promise.resolve();
			}

			return fs.exec('/usr/bin/pppoe-assist-check', [ iface, 'luci' ]).then(function(res) {
				var output = (res.stderr || '').trim() || (res.stdout || '').trim();
				var message = output || _('Check started. See system log for progress.');
				ui.addNotification(null, E('p', { 'style': 'white-space:pre-wrap' }, message), 'info');
			}).catch(function(err) {
				ui.addNotification(null, E('p', {}, err.message || _('Check command failed.')), 'danger');
			});
		};

		return m.render();
	}
});
