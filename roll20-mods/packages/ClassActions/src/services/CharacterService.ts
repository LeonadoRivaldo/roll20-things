export class CharacterService {
	findPCById(pcId: string): Character {
		return getObj('character', pcId) as Character;
	}
}
