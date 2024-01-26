const packgeInfo = require('../packages/ClassActions/package.json');
const extendedConfig = require('./extends.webpack.config');
const modScript = require('../base.script.json');

modScript.name = 'ClassActions';

module.exports = extendedConfig(packgeInfo, modScript);
