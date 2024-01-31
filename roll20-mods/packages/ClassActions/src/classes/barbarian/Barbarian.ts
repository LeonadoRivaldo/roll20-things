import { ChatEventDataExtended } from '../../../../../models';
import { BaseClass, ClassActionEvent } from '../BaseClass';

export class Barbarian extends BaseClass {
	public classActions = ['rage'];

	constructor() {
		super('Barbarian');
		this.checkInstall();
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
