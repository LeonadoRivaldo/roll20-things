const fs = require('fs');

function modifyFile(fileName) {
	fs.readFile(fileName, 'utf8', (err, data) => {
		if (err) {
			console.error(`Error reading the file ${fileName}: ${err.message}`);
			return;
		}

		const startTag = '/** MOD STARTS */';
		const endTag = '/** MOD ENDS */';

		const startIndex = data.indexOf(startTag);
		const endIndex = data.indexOf(endTag, startIndex);

		if (startIndex !== -1 && endIndex !== -1) {
			let modifiedContent = data
				.substring(startIndex + startTag.length, endIndex)
				.trim();

			const stringToRemove = 'const MOD = null;';
			modifiedContent = modifiedContent.replace(
				stringToRemove,
				`/**
				* all models and must be in this section
				*  ANCHOR MODELS/CONSTS */`
			);

			fs.writeFile(fileName, modifiedContent, 'utf8', (err) => {
				if (err) {
					console.error(
						`Error writing to the file ${fileName}: ${err.message}`
					);
				} else {
					console.log(`Content successfully modified in ${fileName}`);
				}
			});
		} else {
			console.log('Tags not found in the file.');
		}
	});
}

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
	const filePath = `./dist/${modName}/${version}/${modName}.js`;
	modifyFile(filePath);
}

fileManager();
