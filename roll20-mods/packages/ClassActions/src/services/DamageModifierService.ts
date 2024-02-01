import { AttributesService } from './AttributesService';

export class DamageModifierService {
	private readonly baseName = 'repeating_damagemod';
	private readonly flagSuffix = 'global_damage_active_flag';
	private readonly attrSvc: AttributesService;

	constructor() {
		//init
		this.attrSvc = new AttributesService();
	}

	toggleDmgModifier(charId: string, action: string, value: boolean): void {
		const damageModObjs = this.findRepeatingDmgMods(charId);
		log({ damageModObjs });
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
			return `${obj.get('current')}`.toLowerCase() === type;
		};
	}

	private findRepeatingDmgMods(charId: string) {
		const mods = this.attrSvc.getAttributesByCharId(charId);
		return mods.filter((mod) => mod.get('name').includes(this.baseName));
	}
}
