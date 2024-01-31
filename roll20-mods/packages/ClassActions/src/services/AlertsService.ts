export class AlertService {
	private static instance: AlertService | null = null;
	public dev = true;

	private constructor() {
		// Evitar instância direta
	}

	static getInstance(): AlertService {
		if (!AlertService.instance) {
			AlertService.instance = new AlertService();
		}

		return AlertService.instance;
	}

	systemFeedBack(msg: string): void {
		sendChat('System', `&{template:desc} {{desc=${msg}}}`);
	}

	consoleLog(msg: any): void {
		if (!this.dev) {
			return;
		}
		log(msg);
	}

	systemAlert(msg: string): void {
		sendChat('System', msg, undefined, { noarchive: true });
	}
}
