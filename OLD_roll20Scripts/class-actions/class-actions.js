function createMod() {
	function playerFeedBack(msg) {
		sendChat('System', `&{template:desc} {{desc=${msg}}}`);
	}
	function consoleLog(log) {
		if (!dev) {
			return;
		}
		log(msg);
	}
	function systemAlert(msg) {
		sendChat('System', msg, null, { noarchive: true });
	}
	function findCharToken(charId) {
		return function (graphic) {
			consoleLog({ grid: graphic.get('represents'), charId });
			return graphic.get('represents') === charId;
		};
	}
	function filterTokens(graphic) {
		return graphic.get('_subtype') === 'token';
	}
	function toggleDmgModifier(charId, action, value) {
		function findDmgModifType(type) {
			return function (obj) {
				if (!obj) {
					return;
				}

				consoleLog(obj.get('current'));

				return `${obj.get('current')}`.toLowerCase() === type;
			};
		}

		const baseName = 'repeating_damagemod';
		const flagSuffix = 'global_damage_active_flag';
		const damageModObjs = findObjs({
			characterid: charId,
			type: 'attribute',
		}).filter((obj) => obj.get('name').includes(baseName));

		consoleLog(damageModObjs);

		const dmgModTypeObject = damageModObjs.find(findDmgModifType(action));
		const nameId = dmgModTypeObject.get('name').split('_')[2];
		const flagName = `${baseName}_${nameId}_${flagSuffix}`;
		sendChat(
			'',
			`!setattr --silent --charid ${charId} --sel --${flagName}|${
				value ? 1 : 0
			}`,
			null,
			{
				noarchive: true,
			}
		);
	}
	function setMarker(token, action, value = true) {
		const markers = {
			rage: 'strong',
		};
		token.set({
			[`status_${markers[action]}`]: value,
		});
	}
	function getMappedAction(action) {
		const map = Object.keys(actionsMapping);
		return map.find((key) => actionsMapping[key] === action);
	}
	function findAction(content) {
		const findActionRegex = /{{name=(.*?)}}/;
		let action = content.match(findActionRegex)[1].toLowerCase();

		if (actionsMapping[action]) {
			action = actionsMapping[action];
		}

		return action.toLowerCase();
	}
	function decreaseClassResource(charId) {
		const resource = findObjs({
			characterid: charId,
			type: 'attribute',
			name: 'class_resource',
		})[0];
		const resource_name = findObjs({
			characterid: charId,
			type: 'attribute',
			name: 'class_resource_name',
		})[0];
		let current = resource.get('current');

		if (current <= 0) {
			systemAlert('You have no more avaliable class features today');
			return false;
		}

		resource.set('current', current - 1);

		current = resource.get('current');
		const max = resource.get('max');
		const name = resource_name.get('current');
		let msg = `You have ${current} of ${max} on ${name}`;
		playerFeedBack(msg);

		return true;
	}
	function handleChatMessage(msg) {
		const { content, rolledByCharacterId, rolltemplate } = msg;
		const char = getObj('character', rolledByCharacterId);

		if (content === noTokenErroMsg || rolltemplate !== 'traits') {
			return;
		}

		if (char) {
			const action = findAction(content);

			// var usage = systemAlert(`?{Use ${action}|yes|no}`);

			// if (usage === 'no') {
			// 	return;
			// }

			const charToken = everything.find(
				findCharToken(rolledByCharacterId)
			);

			if (!charToken) {
				systemAlert(noTokenErroMsg);
				return;
			}

			if (actions.includes(action)) {
				const perfomed = decreaseClassResource(rolledByCharacterId);
				switch (action) {
					case 'rage':
						toggleDmgModifier(
							rolledByCharacterId,
							'rage',
							perfomed
						);
						break;

					default:
						break;
				}
				setMarker(charToken, action, perfomed);
			}
		}
	}
	// Flecha do Agarrar
	// Flecha Sombria
	const noTokenErroMsg = 'Your token is not on the table';
	const actions = ['rage', 'divine sense'];
	const actionsMapping = {
		fúria: 'rage',
		'sentido divino': 'divine sense',
	};
	const dev = false;
	const everything = findObjs({ type: 'graphic' }).filter(filterTokens);
	consoleLog(everything);

	on('chat:message', handleChatMessage);
	log('=== Class Actions ready ===');
}

on('ready', createMod);
