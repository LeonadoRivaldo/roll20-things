/**
 * 
on('ready', () => {
	const tokenMarkers = JSON.parse(Campaign().get('token_markers'));

	const getChatMessageFromTokenMarkers = (markers) =>
		markers
			.map(
				(marker) =>
					`<p><img src='${marker.url}'> ${marker.id}: ${marker.name}</p>`
			)
			.join('');

	on('chat:message', (msg) => {
		const command = msg.content.split(' ')[0].toLowerCase();

		switch (command) {
			case '!markernames':
				sendChat(
					'Token Markers',
					getChatMessageFromTokenMarkers(tokenMarkers)
				);
				break;
			case '!markerids':
				const markerName = msg.content.split(' ')[1].toLowerCase();
				const results = tokenMarkers.filter(
					(marker) => marker.name.toLowerCase() === markerName
				);
				const chatMessage =
					getChatMessageFromTokenMarkers(results) ||
					'Unable to find any matching token markers';
				sendChat('Token Markers', chatMessage);
				break;
			case '!settokenmarker':
				if (msg.selected && msg.selected[0]._type === 'graphic') {
					const obj = getObj(
						msg.selected[0]._type,
						msg.selected[0]._id
					);
					const currentMarkers = obj.get('statusmarkers').split(',');
					const markerName = msg.content.split(' ')[1].toLowerCase();
					currentMarkers.push(markerName);
					obj.set('statusmarkers', currentMarkers.join(','));
				}
				break;
			case '!gettokenmarkers':
				if (msg.selected && msg.selected[0]._type === 'graphic') {
					const obj = getObj(
						msg.selected[0]._type,
						msg.selected[0]._id
					);
					const currentMarkers = obj.get('statusmarkers');
					sendChat('Token Markers', currentMarkers);
				}
				break;
		}
	});
});
 */

// on('ready', () => {
//
// 	on('chat:message', (msg) => {
// 		const { selected, content } = msg;
// 		const command = content.split(' ')[0].toLowerCase();
// 		if (comands.includes(command)) {
// 			if (!selected) {
// 				sendChat('Class action warn:', 'No token selected');
// 				return;
// 			}
// 		}
// 	});
// });

// function systemAlert(msg) {
// 	sendChat('System', msg, null, { noarchive: true });
// }

// on('chat:message', function (msg) {
// 	const { selected, content, rolledByCharacterId } = msg;
// 	const char = getObj('character', rolledByCharacterId);
// 	if (content === '!rage') {
// 		if (!selected) {
// 			systemAlert('Token not selected, select ur token');
// 			return;
// 		}
// 		const token = getObj(selected[0]._type, selected[0]._id);
// 		setMarker(token, action);
// 		return;
// 	}
// 	if (content === 'Token not selected, select ur token') {
// 		return;
// 	}

// 	if (char) {
// 		const action = findAction(content);
// 		if (actions.includes(action)) {
// 			const perfomed = decreaseClassResource(rolledByCharacterId);
// 			if (perfomed) {
// 				sendChat('', `!${action}`, null, { noarchive: true });
// 			}
// 		}
// 	}
// });

function createMod() {
	function systemAlert(msg) {
		sendChat('System', msg, null, { noarchive: true });
	}
	function findCharToken(charId) {
		return function (graphic) {
			log({ grid: graphic.get('represents'), charId });
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

				log(obj.get('current'));

				return `${obj.get('current')}`.toLowerCase() === type;
			};
		}

		const baseName = 'repeating_damagemod';
		const flagSuffix = 'global_damage_active_flag';
		const damageModObjs = findObjs({
			characterid: charId,
			type: 'attribute',
		}).filter((obj) => obj.get('name').includes(baseName));

		log(damageModObjs);

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
		let action = content.split(' ').find((c) => c.includes('{{name='));
		action = action.split('=')[1].replace('}}', '');

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
		const current = resource.get('current');

		if (current <= 0) {
			systemAlert('You have no more avaliable class features today');
			return false;
		}

		resource.set('current', current - 1);
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

	const noTokenErroMsg = 'Your token is not on the table';
	const actions = ['rage'];
	const actionsMapping = {
		Fúria: 'rage',
	};
	const everything = findObjs({ type: 'graphic' }).filter(filterTokens);
	log(everything);

	on('chat:message', handleChatMessage);
	log('=== Class Actions ready ===');
}

on('ready', createMod);
