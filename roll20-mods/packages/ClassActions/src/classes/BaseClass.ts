import { ChatEventDataExtended, IMod } from '../../../../models';
import { ActionService } from '../services/ActionService';
import { InstallationMessageService } from '../services/InstallationMessageService';
import { DamageModifierService } from '../services/DamageModifierService';
import { TokenService } from '../services/TokenService';
import { ERROR_MESSAGES } from '../constants/ErrorMessages.enum';
import { CharacterService } from '../services/CharacterService';
import { ClassResourceService } from '../services/ClassResourceService';
import { TranslationService } from '../services/TranslationService';

export interface ClassActionEvent {
	rolledByCharacterId: string;
	rolltemplate: string;
	action: string;
	char: Character;
	perfomedAction: boolean;
	charToken?: Graphic;
}

export abstract class BaseClass implements IMod {
	public classActions?: string[];
	public className?: string;

	protected readonly dmgModifSvc: DamageModifierService;
	protected readonly actionSvc: ActionService;
	protected readonly tokenSvc: TokenService;
	protected readonly charSvc: CharacterService;
	protected readonly classResSvc: ClassResourceService;

	private readonly tranlateSvc: TranslationService;
	constructor(className: string) {
		this.className = className;

		//auto init
		this.dmgModifSvc = new DamageModifierService();
		this.actionSvc = new ActionService();
		this.tokenSvc = new TokenService();
		this.charSvc = new CharacterService();
		this.classResSvc = new ClassResourceService();
		this.tranlateSvc = new TranslationService();

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
		const { noTokenErroMsg } = ERROR_MESSAGES;
		const { content, rolledByCharacterId, rolltemplate } = msg;
		const char = this.charSvc.findPCById(rolledByCharacterId);

		if (content === noTokenErroMsg || rolltemplate !== 'traits') {
			return Promise.resolve(null);
		}

		if (!char) {
			return Promise.resolve(null);
		}

		const action = this.actionSvc.findAction(content);

		if (this.isAClassAction(action) === false) {
			return Promise.resolve(null);
		}

		const perfomed =
			this.classResSvc.decreaseClassResource(rolledByCharacterId);

		return Promise.resolve({
			perfomedAction: perfomed,
			char,
			action,
			rolledByCharacterId,
			rolltemplate,
		});

		// //set marker if its needed
		// if (setMarkerActions.includes(action)) {
		// 	if (!charToken) {
		// 		systemAlert(noTokenErroMsg);
		// 		return;
		// 	}
		// 	setMarker(charToken, action, perfomed);
		// }
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
