import { ERROR_MESSAGES } from '../constants/ErrorMessages.enum';
import { AlertService } from './AlertsService';
import { AttributesService } from './AttributesService';

const { noMoreAvailableClassFeatures } = ERROR_MESSAGES;

export class ClassResourceService {
	private readonly alert: AlertService;
	private readonly attrSvc: AttributesService;
	constructor() {
		this.alert = AlertService.getInstance();
		this.attrSvc = new AttributesService();
	}

	decreaseClassResource(charId: string): boolean {
		const resource = this.attrSvc.getClassResourceByCharId(charId);
		const resource_name = this.attrSvc.getClassResourceNameByCharId(charId);

		let current = resource.get('current') as number;

		if (current <= 0) {
			this.alert.systemFeedBack(noMoreAvailableClassFeatures);
			return false;
		}

		resource.set('current', current - 1);

		current = resource.get('current') as number;
		const max = resource.get('max');
		const name = resource_name.get('current');
		let msg = `You have ${current} of ${max} on ${name}`;
		this.alert.systemFeedBack(msg);

		return true;
	}
}
