export class ActionService {
	findAction(content: string): string {
		const findActionRegex = /{{name=(.*?)}}/;
		const result = content.match(findActionRegex);

		if (!result) {
			return '';
		}

		let action = result[1];

		return action.toLowerCase();
	}
}
