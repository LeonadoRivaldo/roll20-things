export class DamageModifierService {
	private readonly baseName = 'repeating_damagemod';
	private readonly flagSuffix = 'global_damage_active_flag';

	toggleDmgModifier(charId: string, action: string, value: boolean): void {
		const filter = this.findDmgModifType(action);

		const damageModObjs = findObjs({
			characterid: charId,
			type: 'attribute',
		}).filter((obj) =>
			(obj as Attribute).get('name').includes(this.baseName)
		) as Attribute[];

		const dmgModTypeObject = damageModObjs.find(filter);

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
}
