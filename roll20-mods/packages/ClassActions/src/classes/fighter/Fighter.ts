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

		log({ c: classActionEv?.char });
	}

	private secondWindRoll() {
		`&{template:atk} {{charname=Thorin Ungart}} {{desc=[[1d10]] HP of Lay on Hands}}`;
	}
}
