import { GenericClass, IMod, ChatEventDataExtended } from '../../../models';

/** MOD STARTS */

const MOD = null;

/**
 * utility classes
 * SECTION - UTILS */

class Observable<T> {
	private observers: Subscriber<T>[] = [];

	constructor() {}

	subscribe(subscriber: Subscriber<T>): number {
		this.observers.push(subscriber);
		return this.observers.length - 1;
	}

	unsubscribe(index: number): void {
		if (index !== -1) {
			this.observers.splice(index, 1);
		}
	}

	next(data: T): void {
		this.observers.forEach((subscription) => subscription(data));
	}
}

/** !SECTION UTILS END */

/**
 * all models and must be in this section
 * SECTION - MODELS/CONSTS */
type Subscriber<T> = (data: T) => void;
interface IEvent<T> {
	name: string;
	data?: T;
}

interface IClassActionEventProps {
	rolledByCharacterId: string;
	rolltemplate: string;
	action: string;
	char: Character;
	perfomedAction: boolean;
	charToken?: Graphic;
	isSubClassAction?: boolean;
}

interface IClassActionEvent extends IEvent<IClassActionEventProps> {}
interface I18n {
	pt_br: GenericClass;
}

class ClassResource {
	constructor(
		public resource: Attribute,
		public resourceName: Attribute
	) {}

	public get name() {
		return this.resourceName?.get('current').toString();
	}

	public isResource(name: string) {
		return this.name?.toLowerCase() === name;
	}
}

class Translation {
	constructor(public values: GenericClass) {}

	translation(value: string): string {
		const key = this.findKey(value);

		if (!key) {
			return '';
		}

		return this.values[key];
	}

	knownValue(value: string): boolean {
		return !!this.findKey(value);
	}

	private findKey(value: string): string {
		if (!this.values) {
			return '';
		}

		const keys = Object.keys(this.values);
		const key = keys.find((k) => k.toLowerCase() === value);

		if (!key) {
			return '';
		}

		return key;
	}
}

const ERROR_MESSAGES: GenericClass = {
	oops: `oops Something went wrong!`,
	noTokenErroMsg: 'Your token is not on the table',
	noMoreAvailableClassFeatures:
		'You have no more available <br /> class features today',
	noClassResourceAvailable: 'You have no available <br /> resources for: ',
};

const TOKEN_MARKERS: GenericClass = {
	rage: 'strong',
};

const i18n: I18n = {
	pt_br: {
		fúria: 'rage',
		'sentido divino': 'divine sense',
		'retomar o fôlego': 'second wind',
		'surto de ação': 'action surge',
		'flecha de banimento': 'banishing arrow',
		'flecha encantadora': 'beguiling arrow',
		'flecha explosiva': 'bursting arrow',
		'flecha enfraquecedora': 'enfeebling arrow',
		'flecha agarradora': 'grasping arrow',
		'flecha perfurante': 'piercing arrow',
		'flecha buscadora': 'seeking arrow',
		'flecha das sombras': 'shadow arrow',
	},
};

/** !SECTION MODELS/CONSTS END */

/** SECTION - loose vars */
const {
	noTokenErroMsg,
	noMoreAvailableClassFeatures,
	noClassResourceAvailable,
} = ERROR_MESSAGES;
const packageInfo = {
	version: '2.1.0',
};
/** !SECTION loose vars ends */

/**
 * all services must be in this section
 *  SECTION - SERVICES */
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

class ActionEventService {
	private static observable: Observable<IClassActionEvent> = new Observable();

	constructor() {}

	public listen(sub: Subscriber<IClassActionEvent>) {
		return ActionEventService.observable.subscribe(sub);
	}

	public comunicate(event: IClassActionEvent) {
		ActionEventService.observable.next(event);
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

	public getOtherResourceByCharId(charId: string) {
		return this.getAttributeByCharId(charId, 'other_resource');
	}

	public getOtherResourceNameByCharId(charId: string) {
		return this.getAttributeByCharId(charId, 'other_resource_name');
	}

	public getOtherRepeatingResourcesByCharId(charId: string) {
		const suffix = 'repeating_resource';

		const attrs = this.getAttrsByCharId(charId) as Attribute[];
		return attrs.filter((attr) => attr.get('name').includes(suffix));
	}

	public getOtherRepeatingResourcesByCharIdAndResName(
		charId: string,
		resName: string
	): ClassResource | null {
		const regex = /^repeating_resource_(.*?)_resource_(left|right)(.*?)$/;
		const repeatingResources =
			this.getOtherRepeatingResourcesByCharId(charId);
		const resourceName = repeatingResources.find(
			(res) => res.get('current').toString().toLowerCase() === resName
		);

		//check if resource exists if not return null
		if (!resourceName) {
			return null;
		}

		const match = resourceName.get('name').match(regex);

		if (match) {
			const name = `repeating_resource_${match[1]}_resource_${match[2]}`;
			const resource = repeatingResources.find(
				(res) => res.get('name') === name
			);

			if (!resource) {
				return null;
			}

			const repeatingResource = new ClassResource(resource, resourceName);

			return repeatingResource;
		}

		return null;
	}

	public getCharResourceByCharIdAndResourceName(
		charId: string,
		resourceName: string
	): ClassResource | null {
		const mainResource = new ClassResource(
			this.getClassResourceByCharId(charId),
			this.getClassResourceNameByCharId(charId)
		);

		//check if its main resource return it if true
		if (mainResource.isResource(resourceName)) {
			return mainResource;
		}

		const otherResource = new ClassResource(
			this.getOtherResourceByCharId(charId),
			this.getOtherResourceNameByCharId(charId)
		);

		//check if its other main resource return it if true
		if (otherResource.isResource(resourceName)) {
			return otherResource;
		}

		const repeatingResource =
			this.getOtherRepeatingResourcesByCharIdAndResName(
				charId,
				resourceName
			);

		//last check, has a repeating resource || has and it is not it
		const isRes = repeatingResource?.isResource(resourceName);
		if (!repeatingResource || (repeatingResource && !isRes)) {
			return null;
		}

		//found the repeating one
		return repeatingResource;
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

	decreaseClassResource(charId: string, action: string): boolean {
		const classResource =
			this.attrSvc.getCharResourceByCharIdAndResourceName(charId, action);

		if (!classResource) {
			this.alert.sysErrFeedBack(`${noClassResourceAvailable} ${action}`);
			return false;
		}

		const { resource, resourceName } = classResource;

		if (!resource || !resourceName) {
			this.alert.sysErrFeedBack(ERROR_MESSAGES.oops);
			return false;
		}

		let current = resource.get('current') as number;

		if (current <= 0) {
			this.alert.sysErrFeedBack(noMoreAvailableClassFeatures);
			return false;
		}

		resource.set('current', current - 1);

		current = resource.get('current') as number;
		const max = resource.get('max');
		const name = resourceName.get('current');
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
			return obj.get('current').toString().toLowerCase() === type;
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
		const ptBr = new Translation(i18n.pt_br);

		if (ptBr.knownValue(value)) {
			return ptBr.translation(value);
		}

		return value;
	}
}
/** !SECTION SERVICES END */

/**
 * all classes must be in this section
 * SECTION - CLASSES */

/**
 * Class designed to describe basic functions for all classes
 *
 * @abstract
 * @class BaseClass
 * @implements {IMod}
 */
abstract class BaseClass implements IMod {
	private static initialized = false;

	public actions?: string[];
	public className?: string;
	public isSubClass?: boolean;

	protected readonly dmgModifSvc: DamageModifierService;
	protected readonly actionSvc: ActionService;
	protected readonly tokenSvc: TokenService;
	protected readonly charSvc: CharacterService;
	protected readonly classResSvc: ClassResourceService;
	protected readonly alert: AlertService;
	protected readonly tranlateSvc: TranslationService;
	protected readonly actionEventService: ActionEventService;
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
		this.actionEventService = new ActionEventService();
		//check install
		this.checkInstall();

		//start
		this.init();
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
	public abstract registerEventHandlers(): void;

	public addClassActions(actions: string[]) {
		if (!this.actions) {
			return;
		}

		this.actions = [...this.actions, ...actions];
	}

	private init() {
		on('chat:message', async (msg: ChatEventData) => {
			const response = await this.handleChatMessage(
				msg as ChatEventDataExtended
			);
			if (response?.perfomedAction) {
				this.actionEventService.comunicate({
					name: 'action:perfomed',
					data: response,
				});
				return;
			}

			this.actionEventService.comunicate({ name: 'no:action' });
		});
		BaseClass.initialized = true;
	}

	private async handleChatMessage(
		msg: ChatEventDataExtended
	): Promise<IClassActionEventProps | null> {
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

			const perfomed = this.classResSvc.decreaseClassResource(
				rolledByCharacterId,
				action
			);

			let isSubClassAction = false;

			const actionEvent = {
				perfomedAction: perfomed,
				char,
				action,
				rolledByCharacterId,
				rolltemplate,
				isSubClassAction,
			};
			return resolve(actionEvent);
		});
	}

	private isAClassAction(action: string) {
		const { actions } = this;
		//if no classactions setted up
		if (!actions || actions.length == 0) {
			return false;
		}

		const tranlatedAction = this.tranlateSvc.translate(action);
		if (!actions.includes(action) && !actions.includes(tranlatedAction)) {
			return false;
		}

		return true;
	}
}

/**
 * SECTION Barbarian
 * Class designed to describe basic functions for Barbarian and its subclasses
 * @class Barbarian
 * @extends {BaseClass}
 */
class Barbarian extends BaseClass {
	public actions = ['rage'];

	constructor(className = 'Barbarian') {
		super(className);
	}

	public registerEventHandlers() {
		this.actionEventService.listen((event: IClassActionEvent) => {
			if (event.data) {
				this.actionsHandler(event.data);
			}
		});
	}

	private async actionsHandler(classActionEv: IClassActionEventProps) {
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

/** !SECTION */

/**
 * SECTION Fighter
 * Class designed to describe basic functions for Fighter and its subclasses
 * @class Fighter
 * @extends {BaseClass}
 */
class Fighter extends BaseClass {
	public actions = ['second wind', 'action surge'];

	constructor(className = 'Fighter') {
		super(className);
	}

	public registerEventHandlers() {
		this.actionEventService.listen((event: IClassActionEvent) => {
			if (event.data) {
				this.actionsHandler(event.data);
			}
		});
	}

	private async actionsHandler(classActionEv: IClassActionEventProps) {
		if (!classActionEv) {
			return;
		}

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
 * Class designed to describe basic functions for Arcane Archer Fighter
 *
 * @class ArcaneArcherFighter
 * @extends {BaseClass}
 */
class ArcaneArcherFighter extends BaseClass {
	private resourceName = '';
	public actions = [
		'banishing arrow',
		'beguiling arrow',
		'bursting arrow',
		'enfeebling arrow',
		'grasping arrow',
		'piercing arrow',
		'seeking arrow',
		'shadow arrow',
	];

	constructor() {
		super('Fighter: Arcane Archer');
		this.isSubClass = true;
	}

	/** @override */
	public registerEventHandlers() {
		this.actionEventService.listen((event: IClassActionEvent) => {
			if (event.data) {
				this.actionsHandler(event.data);
			}
		});
	}

	private async actionsHandler(classActionEv: IClassActionEventProps) {
		if (!classActionEv) {
			return;
		}

		const { rolledByCharacterId, action, perfomedAction } = classActionEv;
		this.dmgModifSvc.toggleDmgModifier(
			rolledByCharacterId,
			action,
			perfomedAction
		);
	}
}
/** !SECTION */

/**
 * SECTION Paladin
 * Class designed to describe basic functions for Paladin and its subclasses
 * @class Paladin
 * @extends {BaseClass}
 */
class Paladin extends BaseClass {
	public actions = ['divine sense'];

	constructor(className = 'Paladin') {
		super(className);
	}

	public registerEventHandlers() {
		this.actionEventService.listen((event: IClassActionEvent) => {
			if (event.data) {
				this.actionsHandler(event.data);
			}
		});
	}

	private async actionsHandler(classActionEv: IClassActionEventProps) {
		if (!classActionEv) {
			return;
		}

		if (!classActionEv) {
			return;
		}
	}
}
/** !SECTION */

/** !SECTION CLASSES END */

/**
 * SECTION - INIT */
class ClassActionMod implements IMod {
	private readonly imSvc: InstallationMessageService;
	private classList: BaseClass[] = [
		new Barbarian(),
		new Paladin(),
		new Fighter(),
		new ArcaneArcherFighter(),
	];

	constructor() {
		this.imSvc = InstallationMessageService.getInstance();
	}
	registerEventHandlers() {
		this.classList.forEach((klass) => klass.registerEventHandlers());
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
/** !SECTION INIT END */

/** MOD ENDS */
