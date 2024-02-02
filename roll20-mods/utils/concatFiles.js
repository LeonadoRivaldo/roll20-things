const fs = require('fs');
const path = require('path');

function concatenateTsFiles(directoryPath, outputFilePath) {
	// Verifica se o caminho do diretório de entrada é válido
	if (
		!fs.existsSync(directoryPath) ||
		!fs.lstatSync(directoryPath).isDirectory()
	) {
		console.error('O caminho do diretório de entrada não é válido.');
		return;
	}

	// Obtém todos os arquivos .ts no diretório e subdiretórios
	const tsFiles = getAllTsFiles(directoryPath);

	// Concatena os conteúdos dos arquivos .ts
	const concatenatedContent = tsFiles
		.map((filePath) => fs.readFileSync(filePath, 'utf8'))
		.join('\n\n');

	// Remove todos os imports do arquivo concatenado
	const contentWithoutImports = removeImports(concatenatedContent);

	// Escreve o conteúdo sem imports no arquivo de saída
	fs.writeFileSync(outputFilePath, contentWithoutImports, 'utf8');

	console.log('Arquivos .ts concatenados e imports removidos com sucesso!');
}

function getAllTsFiles(directoryPath) {
	let tsFiles = [];

	// Função recursiva para percorrer o diretório e subdiretórios
	function traverseDirectory(currentPath) {
		const files = fs.readdirSync(currentPath);

		files.forEach((file) => {
			const filePath = path.join(currentPath, file);
			const stats = fs.statSync(filePath);

			if (stats.isDirectory()) {
				traverseDirectory(filePath); // Chamada recursiva se for um diretório
			} else if (path.extname(file) === '.ts') {
				tsFiles.push(filePath); // Adiciona o caminho do arquivo .ts
			}
		});
	}

	traverseDirectory(directoryPath); // Inicia a travessia pelo diretório de entrada
	return tsFiles;
}

function removeImports(content) {
	// Expressão regular para encontrar e remover imports
	const importRegex = /import\s+.*\s+from\s+['"].*['"]\s*;?/g;
	return content.replace(importRegex, ''); // Remove todos os imports do conteúdo
}

const inputDirectory = './packages/ClassActions/src';
const outputFile = './dist/ClassActions/concatenado_sem_imports.ts';

concatenateTsFiles(inputDirectory, outputFile);
