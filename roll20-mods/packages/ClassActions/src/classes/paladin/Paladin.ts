import { BaseClass } from '../BaseClass';

export class Paladin extends BaseClass {
	public classActions = ['divine sense'];

	registerEventHandlers = () => {
		on('chat:message', () => {
			log('do something');
		});
	};

	constructor() {
		super('Paladin');
		this.checkInstall();
	}
}
