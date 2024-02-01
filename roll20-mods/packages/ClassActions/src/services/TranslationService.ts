import { GenericClass } from '../../../../models';
import * as ptBr from '../I18n/pt-br.json';
export class TranslationService {
	public translate(value: string) {
		const pt_br = ptBr as GenericClass;
		if (pt_br[value]) {
			return pt_br[value];
		}

		return value;
	}
}
