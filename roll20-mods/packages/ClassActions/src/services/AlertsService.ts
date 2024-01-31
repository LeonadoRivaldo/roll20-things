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

	sysFeedBack(msg: string): void {
		sendChat('System', `&{template:desc} {{desc=${msg}}}`);
	}

	sysErrFeedBack(msg: string) {
		this.sysFeedBack(`<b style="color:red">${msg}</b>`);
	}

	sysMessage(msg: string): void {
		sendChat('System', msg, undefined, { noarchive: true });
	}

	consoleLog(msg: any): void {
		if (!this.dev) {
			return;
		}
		log(msg);
	}
}
