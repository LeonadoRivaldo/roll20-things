export class TokenService {
	public getAllTokens() {
		const graphics = findObjs({ type: 'graphic' }) as Graphic[];
		return graphics.filter(this.filterTokens);
	}

	public getTokenByCharId(charId: string) {
		const tokens = this.getAllTokens();
		return tokens.find((token) => token.get('represents') === charId);
	}

	private filterTokens(token: Graphic): boolean {
		return token.get('_subtype') === 'token';
	}
}
