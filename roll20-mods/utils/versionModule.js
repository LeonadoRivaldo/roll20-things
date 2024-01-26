// versionModule.js

const { execSync } = require('child_process');

const args = process.argv.slice(2);
const modNameArg = args.find((arg) => arg.startsWith('modName='));
const modName = modNameArg ? modNameArg.split('=')[1] : '';
const versionTypeArg = args.find((arg) => arg.startsWith('versionType='));
const versionType = versionTypeArg ? versionTypeArg.split('=')[1] : 'patch';

// Execute o npm version para o módulo específico
execSync(`cd packages/${modName} && npm version ${versionType}`, {
	stdio: 'inherit',
});
