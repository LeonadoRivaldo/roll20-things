export class InstallationMessageService {
	private static instance: InstallationMessageService | null = null;
	private messages: string[] = [];
	private maxLength: number = 0; // Propriedade para armazenar o comprimento máximo da mensagem
	private constructor() {
		// Evitar instância direta
	}

	static getInstance(): InstallationMessageService {
		if (!InstallationMessageService.instance) {
			InstallationMessageService.instance =
				new InstallationMessageService();
		}

		return InstallationMessageService.instance;
	}

	installMessage(msg: string): void {
		this.messages.push(msg);

		// Atualiza o comprimento máximo da mensagem
		if (msg.length >= this.maxLength) {
			this.maxLength = msg.length;
		}
	}

	public printMessages(): void {
		const topBottomLine = '#'.repeat(this.maxLength + 4);
		log(topBottomLine);
		this.messages.forEach((msg) => {
			const spaces = ' '.repeat(this.maxLength - msg.length);
			log(`# ${msg}${spaces} #`);
		});
		log(topBottomLine);
	}
}
