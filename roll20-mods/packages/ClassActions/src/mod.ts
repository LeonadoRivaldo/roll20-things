import { GenericClass, IMod, ChatEventDataExtended } from '../../../models';

/** MOD STARTS */

const MOD = null;

/**
 * all models and must be in this section
 *  ANCHOR MODELS/CONSTS */
interface ClassActionEvent {
	rolledByCharacterId: string;
	rolltemplate: string;
	action: string;
	char: Character;
	perfomedAction: boolean;
	charToken?: Graphic;
}

interface I18n {
	pt_br: GenericClass;
}

const ERROR_MESSAGES: GenericClass = {
	noTokenErroMsg: 'Your token is not on the table',
	noMoreAvailableClassFeatures:
		'You have no more available <br /> class features today',
};

const TOKEN_MARKERS: GenericClass = {
	rage: 'strong',
};

const i18n: I18n = {
	pt_br: {
		fúria: 'rage',
		'sentido divino': 'divine sense',
		'retomar o fôlego': 'second wind',
		'Surto de Ação': 'action surge',
	},
};

/** MODELS/CONSTS END */

/** ANCHOR loose vars */
const { noTokenErroMsg, noMoreAvailableClassFeatures } = ERROR_MESSAGES;
const packageInfo = {
	version: '2.0.1',
};
/** loose vars ends */

/**
 * all services must be in this section
 *  ANCHOR SERVICES */
class ActionService {
	findAction(content: string): string {
		const findActionRegex = /{{name=(.*?)}}/;
		const result = content.match(findActionRegex);

		if (!result) {
			return '';
		}

		let action = result[1];

		return action.toLowerCase();
	}
}

class AlertService {
	private static instance: AlertService | null = null;
	public dev = true;

	private constructor() {
		// Evitar instância direta
	}

	static getInstance(): AlertService {
		if (!AlertService.instance) {
			AlertService.instance = new AlertService();
		}

		return AlertService.instance;
	}

	sysFeedBack(msg: string): void {
		sendChat('System', `&{template:desc} {{desc=${msg}}}`);
	}

	sysErrFeedBack(msg: string) {
		this.sysFeedBack(`<b style="color:red">${msg}</b>`);
	}

	sysMessage(msg: string): void {
		sendChat('System', msg, undefined, { noarchive: true });
	}

	consoleLog(msg: any): void {
		if (!this.dev) {
			return;
		}
		log(msg);
	}
}

class AttributesService {
	public getAttrsByCharId(charId: string) {
		return findObjs({ characterid: charId });
	}

	public getClassResourceByCharId(charId: string) {
		return this.getAttributeByCharId(charId, 'class_resource');
	}

	public getClassResourceNameByCharId(charId: string) {
		return this.getAttributeByCharId(charId, 'class_resource_name');
	}

	public getAttributeByCharId(charId: string, attrName: string) {
		return findObjs({
			characterid: charId,
			type: 'attribute',
			name: attrName,
		})[0] as Attribute;
	}

	public getAttributesByCharId(charId: string): Attribute[] {
		return findObjs({
			characterid: charId,
			type: 'attribute',
		}) as Attribute[];
	}
}

class CharacterService {
	findPCById(pcId: string): Character {
		return getObj('character', pcId) as Character;
	}
}
class ClassResourceService {
	private readonly alert: AlertService;
	private readonly attrSvc: AttributesService;
	constructor() {
		this.alert = AlertService.getInstance();
		this.attrSvc = new AttributesService();
	}

	decreaseClassResource(charId: string): boolean {
		const resource = this.attrSvc.getClassResourceByCharId(charId);
		const resource_name = this.attrSvc.getClassResourceNameByCharId(charId);

		let current = resource.get('current') as number;

		if (current <= 0) {
			this.alert.sysErrFeedBack(noMoreAvailableClassFeatures);
			return false;
		}

		resource.set('current', current - 1);

		current = resource.get('current') as number;
		const max = resource.get('max');
		const name = resource_name.get('current');
		let msg = `You have ${current} of ${max} on ${name}`;
		this.alert.sysFeedBack(msg);

		return true;
	}
}

class DamageModifierService {
	private readonly baseName = 'repeating_damagemod';
	private readonly flagSuffix = 'global_damage_active_flag';
	private readonly attrSvc: AttributesService;

	constructor() {
		//init
		this.attrSvc = new AttributesService();
	}

	toggleDmgModifier(charId: string, action: string, value: boolean): void {
		const damageModObjs = this.findRepeatingDmgMods(charId);
		log({ damageModObjs });
		const dmgModTypeObject = damageModObjs.find(
			this.findDmgModifType(action)
		);

		if (dmgModTypeObject) {
			const nameId = dmgModTypeObject.get('name').split('_')[2];
			const flagName = `${this.baseName}_${nameId}_${this.flagSuffix}`;

			sendChat(
				'',
				`!setattr --silent --charid ${charId} --sel --${flagName}|${value ? 1 : 0}`,
				undefined,
				{
					noarchive: true,
				}
			);
		}
	}

	private findDmgModifType(type: string) {
		return (obj: Attribute) => {
			if (!obj) {
				return false;
			}
			return `${obj.get('current')}`.toLowerCase() === type;
		};
	}

	private findRepeatingDmgMods(charId: string) {
		const mods = this.attrSvc.getAttributesByCharId(charId);
		return mods.filter((mod) => mod.get('name').includes(this.baseName));
	}
}

class InstallationMessageService {
	private static instance: InstallationMessageService | null = null;
	private messages: string[] = [];
	private maxLength: number = 0; // Propriedade para armazenar o comprimento máximo da mensagem
	private constructor() {
		// Evitar instância direta
	}

	static getInstance(): InstallationMessageService {
		if (!InstallationMessageService.instance) {
			InstallationMessageService.instance =
				new InstallationMessageService();
		}

		return InstallationMessageService.instance;
	}

	installMessage(msg: string): void {
		this.messages.push(msg);

		// Atualiza o comprimento máximo da mensagem
		if (msg.length >= this.maxLength) {
			this.maxLength = msg.length;
		}
	}

	public printMessages(): void {
		const topBottomLine = '#'.repeat(this.maxLength + 4);
		log(topBottomLine);
		this.messages.forEach((msg) => {
			const spaces = ' '.repeat(this.maxLength - msg.length);
			log(`# ${msg}${spaces} #`);
		});
		log(topBottomLine);
	}
}

class TokenService {
	private readonly alert = AlertService.getInstance();

	public getAllTokens() {
		const graphics = findObjs({ type: 'graphic' }) as Graphic[];
		return graphics.filter(this.filterTokens);
	}

	public getTokenByCharId(charId: string) {
		const tokens = this.getAllTokens();
		return tokens.find((token) => token.get('represents') === charId);
	}

	public setTokenMarkerByCharId(
		charId: string,
		action: string,
		value = true
	): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const token = this.getTokenByCharId(charId);

			if (!token) {
				this.alert.sysMessage(noTokenErroMsg);
				return resolve(false);
			}

			token.set({
				[`status_${TOKEN_MARKERS[action]}`]: value,
			});

			return resolve(true);
		});
	}

	private filterTokens(token: Graphic): boolean {
		return token.get('_subtype') === 'token';
	}
}

class TranslationService {
	public translate(value: string) {
		const { pt_br } = i18n;
		if (pt_br[value]) {
			return pt_br[value];
		}

		return value;
	}
}
/** SERVICES END */

/**
 * all classes must be in this section
 * ANCHOR CLASSES */

/**
 * Class designed to describe basic functions for all classes
 *
 * @abstract
 * @class BaseClass
 * @implements {IMod}
 */
abstract class BaseClass implements IMod {
	public classActions?: string[];
	public className?: string;

	protected readonly dmgModifSvc: DamageModifierService;
	protected readonly actionSvc: ActionService;
	protected readonly tokenSvc: TokenService;
	protected readonly charSvc: CharacterService;
	protected readonly classResSvc: ClassResourceService;
	protected readonly alert: AlertService;
	protected readonly tranlateSvc: TranslationService;
	constructor(className: string) {
		this.className = className;

		//auto init
		this.dmgModifSvc = new DamageModifierService();
		this.actionSvc = new ActionService();
		this.tokenSvc = new TokenService();
		this.charSvc = new CharacterService();
		this.classResSvc = new ClassResourceService();
		this.tranlateSvc = new TranslationService();
		this.alert = AlertService.getInstance();

		//check install
		this.checkInstall();
	}

	checkInstall() {
		const imsvc = InstallationMessageService.getInstance();
		const hasHandlers = typeof this.registerEventHandlers !== 'undefined';
		const msg = `Class actions for ${this.className} `;
		if (hasHandlers) {
			imsvc.installMessage(msg + 'initiated');
			return true;
		} else {
			imsvc.installMessage(msg + 'not initiated');
			return false;
		}
	}

	/**
	 * to be @override
	 *
	 * @memberof BaseClass
	 */
	abstract registerEventHandlers(): void;

	async handleChatMessage(
		msg: ChatEventDataExtended
	): Promise<ClassActionEvent | null> {
		return new Promise((resolve, reject) => {
			const { noTokenErroMsg } = ERROR_MESSAGES;
			const { content, rolledByCharacterId, rolltemplate } = msg;
			const char = this.charSvc.findPCById(rolledByCharacterId);

			if (content === noTokenErroMsg || rolltemplate !== 'traits') {
				return resolve(null);
			}

			if (!char) {
				return resolve(null);
			}

			const action = this.actionSvc.findAction(content);

			if (this.isAClassAction(action) === false) {
				return resolve(null);
			}

			const perfomed =
				this.classResSvc.decreaseClassResource(rolledByCharacterId);

			return resolve({
				perfomedAction: perfomed,
				char,
				action,
				rolledByCharacterId,
				rolltemplate,
			});
		});
	}

	private isAClassAction(action: string) {
		//if no classactions setted up
		if (!this.classActions || this.classActions.length == 0) {
			return false;
		}

		const tranlatedAction = this.tranlateSvc.translate(action);
		if (
			!this.classActions.includes(action) &&
			!this.classActions.includes(tranlatedAction)
		) {
			return false;
		}

		return true;
	}
}

/**
 * Class designed to describe basic functions for Barbarian and its subclasses
 * @class Barbarian
 * @extends {BaseClass}
 */
class Barbarian extends BaseClass {
	public classActions = ['rage'];

	constructor() {
		super('Barbarian');
	}

	public registerEventHandlers() {
		on('chat:message', (msg) => {
			this.mainActionHandler(msg);
		});
	}

	private async mainActionHandler(msg: ChatEventData) {
		if (!msg) {
			return;
		}

		const classActionEv = await this.handleChatMessage(
			msg as ChatEventDataExtended
		);

		if (!classActionEv) {
			return;
		}

		const { rolledByCharacterId, action, perfomedAction } = classActionEv;
		this.dmgModifSvc.toggleDmgModifier(
			rolledByCharacterId,
			action,
			perfomedAction
		);
		this.tokenSvc.setTokenMarkerByCharId(
			rolledByCharacterId,
			action,
			perfomedAction
		);
	}
}

/**
 * Class designed to describe basic functions for Fighter and its subclasses
 * @class Fighter
 * @extends {BaseClass}
 */
class Fighter extends BaseClass {
	public classActions = ['second wind', 'action surge'];

	constructor() {
		super('Fighter');
	}

	public registerEventHandlers() {
		on('chat:message', (msg) => {
			this.mainActionHandler(msg);
		});
	}

	private async mainActionHandler(msg: ChatEventData) {
		if (!msg) {
			return;
		}

		const classActionEv = await this.handleChatMessage(
			msg as ChatEventDataExtended
		);

		if (!classActionEv) {
			return;
		}

		const { char, action, perfomedAction } = classActionEv;

		if (!perfomedAction) {
			return;
		}

		switch (this.tranlateSvc.translate(action)) {
			case 'second wind':
				this.secondWindRoll(char);
				break;

			default:
				break;
		}
	}

	private secondWindRoll(char: Character) {
		const level = getAttrByName(char.id, 'level');
		let roll = '&{template:atk}';
		roll += '{{charname=' + char.get('name') + '}}';
		roll +=
			'{{desc=Recovered [[1d10+' + level + ']] of HP with Second Wind}}';
		this.alert.sysMessage(roll);
	}
}

/**
 * Class designed to describe basic functions for Paladin and its subclasses
 * @class Paladin
 * @extends {BaseClass}
 */
class Paladin extends BaseClass {
	public classActions = ['divine sense'];

	constructor() {
		super('Paladin');
	}

	public registerEventHandlers() {
		on('chat:message', (msg) => {
			this.mainActionHandler(msg);
		});
	}

	private async mainActionHandler(msg: ChatEventData) {
		if (!msg) {
			return;
		}

		const classActionEv = await this.handleChatMessage(
			msg as ChatEventDataExtended
		);

		if (!classActionEv) {
			return;
		}
	}
}
/** CLASSES END */

/**
 * ANCHOR INIT */
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

const classActionsMod = new ClassActionMod() || {};
on('ready', () => {
	if (classActionsMod) {
		classActionsMod.checkInstall();
		classActionsMod.registerEventHandlers();
	}
});
/** INIT END */

/** MOD ENDS */
