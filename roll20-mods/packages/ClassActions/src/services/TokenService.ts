import { ERROR_MESSAGES } from '../constants/ErrorMessages.enum';
import { TOKEN_MARKERS } from '../constants/TokenMarkersByAction';
import { AlertService } from './AlertsService';

const { noTokenErroMsg } = ERROR_MESSAGES;
export class TokenService {
	private readonly alert = AlertService.getInstance();

	public getAllTokens() {
		const graphics = findObjs({ type: 'graphic' }) as Graphic[];
		return graphics.filter(this.filterTokens);
	}

	public getTokenByCharId(charId: string) {
		const tokens = this.getAllTokens();
		return tokens.find((token) => token.get('represents') === charId);
	}

	public setTokenMarkerByCharId(
		charId: string,
		action: string,
		value = true
	): Promise<boolean> {
		const token = this.getTokenByCharId(charId);

		if (!token) {
			this.alert.systemAlert(noTokenErroMsg);
			return Promise.resolve(false);
		}

		token.set({
			[`status_${TOKEN_MARKERS[action]}`]: value,
		});

		return Promise.resolve(true);
	}

	private filterTokens(token: Graphic): boolean {
		return token.get('_subtype') === 'token';
	}
}
