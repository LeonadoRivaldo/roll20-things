import { ChatEventDataExtended, IMod, GenericClass } from '../../../models';
import * as packageInfo from '../package.json';
import { BaseClass } from './classes/BaseClass';
import { Barbarian } from './classes/barbarian/Barbarian';
import { Fighter } from './classes/fighter/Fighter';
import { Paladin } from './classes/paladin/Paladin';
import { InstallationMessageService } from './services/InstallationMessageService';

/** MOD STARTS */
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

on('ready', () => {
	const classActionsMod = new ClassActionMod();
	if (classActionsMod) {
		classActionsMod.checkInstall();
		classActionsMod.registerEventHandlers();
	}
});

/** MOD ENDS */
