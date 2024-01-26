const fs = require('fs');
const path = require('path');

module.exports = function () {
	const filename = 'version_history.json';

	const storeVersion = function (version, filePath) {
		const historyFilePath = path.resolve(filePath, filename);

		// Read version_history.json if it exists
		let versionHistory = getVersions(filePath);

		// Write the updated array of versions back to version_history.json
		versionHistory.push(version);

		fs.writeFileSync(
			historyFilePath,
			JSON.stringify(versionHistory, null, 2)
		);

		console.log(`Version ${version} added to version_history.json`);
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
			// If the file doesn't exist or is empty, continue with an empty array.
		}
	};

	return { getVersions, storeVersion };
};
