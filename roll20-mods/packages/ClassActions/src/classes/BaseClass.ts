import { ChatEventDataExtended, IMod } from '../../../../models';
import { ActionService } from '../services/ActionService';
import { InstallationMessageService } from '../services/InstallationMessageService';
import { DamageModifierService } from '../services/DamageModifierService';
import { TokenService } from '../services/TokenService';
import { ERROR_MESSAGES } from '../constants/ErrorMessages.enum';
import { CharacterService } from '../services/CharacterService';
import { ClassResourceService } from '../services/ClassResourceService';

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

	constructor(className: string) {
		this.className = className;

		//auto init
		this.dmgModifSvc = new DamageModifierService();
		this.actionSvc = new ActionService();
		this.tokenSvc = new TokenService();
		this.charSvc = new CharacterService();
		this.classResSvc = new ClassResourceService();

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

		if (!this.classActions || !this.classActions.includes(action)) {
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
}
