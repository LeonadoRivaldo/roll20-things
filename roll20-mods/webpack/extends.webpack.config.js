const path = require('path');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const { getVersions } = require('../utils/versionManager')();

module.exports = function (packgeInfo, scriptJsonObj, plugins = []) {
	if (!scriptJsonObj) {
		return;
	}

	//mod props
	const modName = packgeInfo.name.split('/')[1];
	const version = packgeInfo.version;

	//script
	scriptJsonObj.version = version;
	scriptJsonObj.description = packgeInfo.description;
	scriptJsonObj.script = `${modName}.js`;
	scriptJsonObj.previousversions = getVersions(`./packages/${modName}/`);

	return {
		extends: path.resolve(__dirname, './base.webpack.config.js'),
		entry: `./packages/${modName}/src/mod.ts`,
		output: {
			filename: `${modName}.js`,
			path: path.resolve(__dirname, `../dist/${modName}/${version}`),
		},
		plugins: [
			...plugins,
			new GenerateJsonPlugin('script.json', scriptJsonObj),
		],
	};
};
