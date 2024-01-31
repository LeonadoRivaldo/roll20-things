import { ChatEventDataExtended, IMod, GenericClass } from '../../../models';
import * as packageInfo from '../package.json';
import { BaseClass } from './classes/BaseClass';
import { Barbarian } from './classes/barbarian/Barbarian';
import { Fighter } from './classes/fighter/Fighter';
import { Paladin } from './classes/paladin/Paladin';
import { InstallationMessageService } from './services/InstallationMessageService';

/** MOD STARTS */
// var ClassActions: IMod = (function () {
// 	'use strict';
// 	function createMod(): void {
// 		function systemFeedBack(msg: string): void {
// 			sendChat('System', `&{template:desc} {{desc=${msg}}}`);
// 		}

// 		function consoleLog(msg: any): void {
// 			if (!dev) {
// 				return;
// 			}
// 			log(msg);
// 		}

// 		function systemAlert(msg: string): void {
// 			sendChat('System', msg, undefined, { noarchive: true });
// 		}

// 		function findCharToken(charId: string): (graphic: Graphic) => boolean {
// 			return (graphic: Graphic) => {
// 				return graphic.get('represents') === charId;
// 			};
// 		}

// 		function filterTokens(graphic: Graphic): boolean {
// 			return graphic.get('_subtype') === 'token';
// 		}

// 		function toggleDmgModifier(
// 			charId: string,
// 			action: string,
// 			value: boolean
// 		): void {
// 			function findDmgModifType(type: string) {
// 				return (obj: Attribute) => {
// 					if (!obj) {
// 						return false;
// 					}
// 					return `${obj.get('current')}`.toLowerCase() === type;
// 				};
// 			}

// 			const baseName = 'repeating_damagemod';
// 			const flagSuffix = 'global_damage_active_flag';
// 			const damageModObjs = findObjs({
// 				characterid: charId,
// 				type: 'attribute',
// 			}).filter((obj) =>
// 				(obj as Attribute).get('name').includes(baseName)
// 			) as Attribute[];

// 			const filter = findDmgModifType(action);
// 			const dmgModTypeObject = damageModObjs.find(filter);
// 			if (dmgModTypeObject) {
// 				const nameId = dmgModTypeObject.get('name').split('_')[2];
// 				const flagName = `${baseName}_${nameId}_${flagSuffix}`;
// 				sendChat(
// 					'',
// 					`!setattr --silent --charid ${charId} --sel --${flagName}|${value ? 1 : 0}`,
// 					undefined,
// 					{
// 						noarchive: true,
// 					}
// 				);
// 			}
// 		}

// 		function setMarker(token: Graphic, action: string, value = true): void {
// 			const markers: Markers = {
// 				rage: 'strong',
// 			};
// 			token.set({
// 				[`status_${markers[action]}`]: value,
// 			});
// 		}

// 		function getMappedAction(action: string): string | undefined {
// 			const map = Object.keys(actionsMapping);
// 			return map.find((key) => actionsMapping[key] === action);
// 		}

// 		function findAction(content: string): string {
// 			const findActionRegex = /{{name=(.*?)}}/;
// 			const result = content.match(findActionRegex);

// 			if (!result) {
// 				return '';
// 			}

// 			let action = result[1].toLowerCase();

// 			if (actionsMapping[action]) {
// 				action = actionsMapping[action];
// 			}

// 			return action.toLowerCase();
// 		}

// 		function decreaseClassResource(charId: string): boolean {
// 			const resource = findObjs({
// 				characterid: charId,
// 				type: 'attribute',
// 				name: 'class_resource',
// 			})[0] as Attribute;

// 			const resource_name = findObjs({
// 				characterid: charId,
// 				type: 'attribute',
// 				name: 'class_resource_name',
// 			})[0] as Attribute;

// 			let current = resource.get('current') as number;

// 			if (current <= 0) {
// 				systemFeedBack(
// 					'You have no more available class features today'
// 				);
// 				return false;
// 			}

// 			resource.set('current', current - 1);

// 			current = resource.get('current') as number;
// 			const max = resource.get('max');
// 			const name = resource_name.get('current');
// 			let msg = `You have ${current} of ${max} on ${name}`;
// 			systemFeedBack(msg);

// 			return true;
// 		}

// 		function handleChatMessage(msg: ChatEventDataExtended): void {
// 			const { content, rolledByCharacterId, rolltemplate } = msg;
// 			const char = getObj('character', rolledByCharacterId);

// 			if (content === noTokenErroMsg || rolltemplate !== 'traits') {
// 				return;
// 			}

// 			if (char) {
// 				const action = findAction(content);

// 				const charToken = everything.find(
// 					findCharToken(rolledByCharacterId)
// 				) as Graphic;

// 				if (actions.includes(action)) {
// 					const perfomed = decreaseClassResource(rolledByCharacterId);

// 					//toggle dmg modif if needed
// 					if (dmgModActions.includes(action)) {
// 						toggleDmgModifier(
// 							rolledByCharacterId,
// 							action,
// 							perfomed
// 						);
// 					}

// 					//set marker if its needed
// 					if (setMarkerActions.includes(action)) {
// 						if (!charToken) {
// 							systemAlert(noTokenErroMsg);
// 							return;
// 						}
// 						setMarker(charToken, action, perfomed);
// 					}
// 				}
// 			}
// 		}

// 		const noTokenErroMsg = 'Your token is not on the table';
// 		const actions = ['rage', 'divine sense'];
// 		const dmgModActions = ['rage'];
// 		const setMarkerActions = ['rage'];
// 		const actionsMapping: Record<string, string> = {
// 			fúria: 'rage',
// 			'sentido divino': 'divine sense',
// 		};
// 		const dev = true;
// 		const everything = findObjs({ type: 'graphic' }).filter((obj) =>
// 			filterTokens(obj as Graphic)
// 		) as Graphic[];

// 		on('chat:message', (msg: ChatEventData) => {
// 			if (msg) {
// 				handleChatMessage(msg as ChatEventDataExtended);
// 			}
// 		});
// 	}
// 	function checkInstall() {
// 		log('=== Class Actions ready ===');
// 	}
// 	function registerEventHandlers() {
// 		createMod();
// 	}

// 	return {
// 		checkInstall,
// 		registerEventHandlers,
// 	};
// })();

// on('ready', () => {
// 	'use strict';
// 	ClassActions.checkInstall();
// 	ClassActions.registerEventHandlers();
// });

class ClassActionMod implements IMod {
	private readonly imSvc: InstallationMessageService;
	private classActionsList: BaseClass[] = [
		new Barbarian(),
		new Paladin(),
		new Fighter(),
	];

	constructor() {
		this.imSvc = InstallationMessageService.getInstance();
	}
	registerEventHandlers() {
		this.classActionsList.forEach((klass) => klass.registerEventHandlers());
		this.imSvc.printMessages();
	}
	checkInstall() {
		const version = packageInfo.version;
		this.imSvc.installMessage(`Class actions V${version} ready`);
	}
}

on('ready', () => {
	const classActionsMod = new ClassActionMod();
	if (classActionsMod) {
		classActionsMod.checkInstall();
		classActionsMod.registerEventHandlers();
	}
});

/** MOD ENDS */
