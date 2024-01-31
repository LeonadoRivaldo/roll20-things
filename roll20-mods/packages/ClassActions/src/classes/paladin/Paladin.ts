import { ChatEventDataExtended } from '../../../../../models';
import { BaseClass } from '../BaseClass';

export class Paladin extends BaseClass {
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
	}
}
