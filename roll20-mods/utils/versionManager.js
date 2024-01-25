const fs = require('fs');
const path = require('path');

module.exports = function () {
	const filename = 'version_history.json';

	const storeVersion = function (version, filePath) {
		const historyFilePath = path.resolve(filePath, filename);

		// Leitura do version_history.json (se existir)
		let versionHistory = getVersions(filePath);

		// Escrevendo o array atualizado de versões de volta no version_history.json
		versionHistory.push(version);

		fs.writeFileSync(
			historyFilePath,
			JSON.stringify(versionHistory, null, 2)
		);

		console.log(`Versão ${version} adicionada ao version_history.json`);
	};

	const getVersions = function (filePath) {
		const historyFilePath = path.resolve(filePath, filename);
		try {
			const versionHistoryContent = fs.readFileSync(
				historyFilePath,
				'utf8'
			);
			return JSON.parse(versionHistoryContent);
		} catch (error) {
			// Se o arquivo não existir ou estiver vazio, continuamos com um array vazio.
		}
	};

	return { getVersions, storeVersion };
};
