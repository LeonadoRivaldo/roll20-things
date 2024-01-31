import { ChatEventDataExtended } from '../../../../../models';
import { BaseClass } from '../BaseClass';

export class Fighter extends BaseClass {
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
	}
}
