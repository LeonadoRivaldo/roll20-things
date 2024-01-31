import { ChatEventDataExtended } from '../../../../../models';
import { BaseClass, ClassActionEvent } from '../BaseClass';

export class Barbarian extends BaseClass {
	public classActions = ['rage'];
	public createEventHandlers = (msg: string) => {
		if (msg) {
			this.handleChatMessage(msg as ChatEventDataExtended);
			if (classActionEv) {
				const { rolledByCharacterId, action, perfomedAction } =
					classActionEv;
				this.dmgModifSvc.toggleDmgModifier(
					rolledByCharacterId,
					action,
					perfomedAction
				);
			}
		}
	};

	public registerEventHandlers = () => {
		on('chat:message', async (msg: ChatEventData) => {});
	};

	constructor() {
		super('Barbarian');
		this.checkInstall();
	}
}
