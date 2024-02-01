export class AttributesService {
	public getAttrsByCharId(charId: string) {
		return findObjs({ characterid: charId });
	}

	public getClassResourceByCharId(charId: string) {
		return this.getAttributeByCharId(charId, 'class_resource');
	}

	public getClassResourceNameByCharId(charId: string) {
		return this.getAttributeByCharId(charId, 'class_resource_name');
	}

	public getAttributeByCharId(charId: string, attrName: string) {
		return findObjs({
			characterid: charId,
			type: 'attribute',
			name: attrName,
		})[0] as Attribute;
	}

	public getAttributesByCharId(charId: string): Attribute[] {
		return findObjs({
			characterid: charId,
			type: 'attribute',
		}) as Attribute[];
	}
}
