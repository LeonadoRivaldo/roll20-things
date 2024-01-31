import { GenericClass } from '../../../../models';
import * as ptBr from '../I18n/pt-br.json';

export class ActionService {
	findAction(content: string): string {
		const findActionRegex = /{{name=(.*?)}}/;
		const result = content.match(findActionRegex);

		if (!result) {
			return '';
		}

		let action = result[1].toLowerCase();

		const i18nAction = this.findMapping(action);

		//check other languages
		if (i18nAction) {
			action = i18nAction;
		}

		return action.toLowerCase();
	}

	private findMapping(action: string) {
		const pt_br = ptBr as GenericClass;
		if (pt_br[action]) {
			return pt_br[action];
		}
	}
}
