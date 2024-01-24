function gerarMatrizChave(chave) {
	const matrizChave = [];
	const alfabeto = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
	const chaveSemDuplicatas = [
		...new Set(chave.toUpperCase().replace(/J/g, 'I').split('')),
	];

	let alfabetoRestante = alfabeto;

	for (let i = 0; i < chaveSemDuplicatas.length; i++) {
		const letra = chaveSemDuplicatas[i];
		alfabetoRestante = alfabetoRestante.replace(letra, '');
	}

	const matrizBase = (chaveSemDuplicatas.join('') + alfabetoRestante).split(
		''
	);

	for (let i = 0; i < 5; i++) {
		const linha = [];
		for (let j = 0; j < 5; j++) {
			linha.push(matrizBase[i * 5 + j]);
		}
		matrizChave.push(linha);
	}

	return matrizChave;
}

function encontrarPosicao(letra, matriz) {
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			if (matriz[i][j] === letra) {
				return { linha: i, coluna: j };
			}
		}
	}
}

function cifraPlayfair(texto, chave) {
	const matrizChave = gerarMatrizChave(chave);
	const textoFormatado = texto
		.toUpperCase()
		.replace(/J/g, 'I')
		.replace(/[^A-Z]/g, '');

	let resultado = '';

	for (let i = 0; i < textoFormatado.length; i += 2) {
		const parLetras = textoFormatado.slice(i, i + 2);
		const posicao1 = encontrarPosicao(parLetras[0], matrizChave);
		const posicao2 = encontrarPosicao(parLetras[1], matrizChave);

		let novaPosicao1, novaPosicao2;

		if (posicao1.linha === posicao2.linha) {
			novaPosicao1 = {
				linha: posicao1.linha,
				coluna: (posicao1.coluna + 1) % 5,
			};
			novaPosicao2 = {
				linha: posicao2.linha,
				coluna: (posicao2.coluna + 1) % 5,
			};
		} else if (posicao1.coluna === posicao2.coluna) {
			novaPosicao1 = {
				linha: (posicao1.linha + 1) % 5,
				coluna: posicao1.coluna,
			};
			novaPosicao2 = {
				linha: (posicao2.linha + 1) % 5,
				coluna: posicao2.coluna,
			};
		} else {
			novaPosicao1 = { linha: posicao1.linha, coluna: posicao2.coluna };
			novaPosicao2 = { linha: posicao2.linha, coluna: posicao1.coluna };
		}

		resultado +=
			matrizChave[novaPosicao1.linha][novaPosicao1.coluna] +
			matrizChave[novaPosicao2.linha][novaPosicao2.coluna];
	}

	return resultado;
}

// Exemplo de uso:
const textoOriginal = 'HELLO';
const chavePlayfair = 'KEYWORD';
const textoCifrado = cifraPlayfair(textoOriginal, chavePlayfair);

console.log('Texto Original:', textoOriginal);
console.log('Texto Cifrado:', textoCifrado);
