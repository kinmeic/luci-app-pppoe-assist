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

		o = s.option(form.Value, 'bad_prefixes', _('Bad IP prefixes'));
		o.datatype = 'string';
		o.placeholder = '218,58.41';
		o.rmempty = true;

		o = s.option(form.Value, 'max_attempts', _('Maximum redial attempts'));
		o.datatype = 'range(1,100)';
		o.default = '20';
		o.rmempty = false;

		o = s.option(form.Value, 'redial_delay', _('Redial delay'));
		o.datatype = 'range(0,60)';
		o.default = '3';
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
				var message = res.stderr || res.stdout || _('Check command finished. See system log for details.');
				ui.addNotification(null, E('p', {}, message), 'info');
			}).catch(function(err) {
				ui.addNotification(null, E('p', {}, err.message || _('Check command failed.')), 'danger');
			});
		};

		return m.render();
	}
});
