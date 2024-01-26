const versionManager = require('./versionManager');

async function fileManager() {
	let modName;
	process.argv.forEach(function (val, index, array) {
		if (val.includes('modName=')) {
			modName = val.split('=')[1];
			return;
		}
	});

	if (!modName) {
		console.log('No mod selected');
		return;
	}

	const packagePath = `../packages/${modName}/package.json`;
	const packageInfo = require(`${packagePath}`);
	const version = packageInfo.version;
	versionManager().storeVersion(version, `./packages/${modName}/`);
}

fileManager();
