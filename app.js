const wordInput = document.getElementById("wordInput"); // pega o valor do input do tipo "text" para inserir um termo
const originalWord = document.getElementById("originalWord"); // pega o valor da div responsavel por armazenar o valor da palavra original
const translatedWord = document.getElementById("translatedWord"); // pega o valor da div responsavel por armazenar o valor da palavra que será traduzida
const searchForm = document.getElementById("searchForm"); // pega o valor do form 
const fromLang = document.getElementById("fromLang"); // pega o valor do dropdown que armazena "Idioma de origem"
const dictionaryEntry = document.getElementById("dictionaryEntry"); // pega o valor da div responsavel pela seção do verbete

// Constantes da API do DEEPL e da DictionaryAPI
const DEEPL_API_KEY = "85fae25f-dd02-4e8e-aff3-bc7203b5a11a:fx";
const DEEPL_API_URL = 'https://corsproxy.io/?' + encodeURIComponent('https://api-free.deepl.com/v2/translate');
const DICT_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/';
const TARGET_LANG = 'PT';

async function translateWord(text, sourceLang){ // função ASSINCRONA para a tradução da palavra, recebe o parametro do texto e do idioma de origem
    // cria um objeto 'data' com o corpo da requisição
    const data = { 
        text: [text], // texto que vai ser traduzido dentro de um ARRAY
        target_lang: TARGET_LANG //TARGET_LANG (PT) é definido globalmente como o idioma de destino (Português).
    };

    // se o idioma for diferente de "Detecção automatica", envia o codigo do idioma de origem ao corpo da requisição (data)
    if (sourceLang !== 'auto') {
        data.source_lang = sourceLang.toUpperCase(); // toUpperCase() pois o DeepL exige o código em maísculas
    }

    // bloco "try/catch" para tratar possiveis erros 
    try {

        // cria uma constante para realizar a requisição à URL da API.
        // a URL utiliza um proxy (corsproxy.io) para evitar problemas de CORS localmente
        const response = await fetch(DEEPL_API_URL, { 
            method: 'POST', // a API exige um metodo POST para enviar os dados da tradução
            headers: {
                // autenticação: envia a API KEY para a requisição
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/json'
                // especifica que o conteudo está no formato JSON
            },
            body: JSON.stringify(data) // converte o objeto 'data' para uma string JSON
        });

        if (!response.ok){ // se a resposta for diferente de ok (200), trata os erros no console
            console.error('Erro da API DeepL. Status:', response.status)
            throw new Error(`Erro na tradução: ${response.statusText}`);
        }

        const result = await response.json(); // converte a resposta recebida em um JSON
        return result; // retorna o resultado

    } catch (error) { // captura qualquer erro que tenha ocorrido durante a tradução
        alert(`Não foi possivel traduzir: ${error.message}.`);
        return null; // retorna null para indicar que a tradução falhou
    }
}

// função ASSINCRONA responsavel por buscar o verbete de dicionario para uma palavra especifica
// utiliza a Free Dictionary API, que fornece verbetes **APENAS** para o inglês
async function fetchNewDictionaryEntry(text, sourceLang){
    const url = `${DICT_API_URL}${sourceLang}/${text}`;  // monta a URL da API concatenando com o idioma de origem e a palavra a ser buscada

    try {
        const response = await fetch(url); // realize a requisição HTTP CATCH

        // aqui não precisa de headers/proxy pois a API é publica e não requer KEYS

        // verifica o status da resposta
        if (!response.ok) {
            // registra um aviso no console e retorna null para caso tenha dado algo errado durante a tradução
            console.warn(`Verbete não encontrado para ${text} (${sourceLang}). Status: ${response.status}`)
            return null; 
        }
        
        const result = await response.json();
        return result[0]; 
        // a API para o verbete retorna uma array de resultados, mas queremos mostrar apenas o
        // primeiro item do array 
    } catch (error){
        console.log(`Erro ao buscar verbete:`, error.message);
        return null;
    }
}

// função para renderizar a seção do verbete
function renderDictionaryEntry(dictionaryResult, originalWord){ 
    // limpa qualquer conteudo anterior na seção do verbete
    dictionaryEntry.innerHTML = '';

    // se não tiver encontrado nenhum resultado, exibe uma mensagem para o usuario
    if (!dictionaryResult) {
        dictionaryEntry.innerHTML = `<p class="mb-0">Não foi encontrado um verbete para **${originalWord}**.</p>`
        return;
    }

    const h4 = document.createElement('h4');
    h4.className = 'fw-bold';
    const phonetic = dictionaryResult.phonetic ? ` [${dictionaryResult.phonetic}]` : ''; // pega a fonética se existir, senão usa uma string vazia
    h4.innerHTML = `${originalWord}${phonetic}`; // insere no HTML a palavra original + fonetica
    dictionaryEntry.appendChild(h4); // adiciona o título <h4> ao container principal do verbete.

    // o resultado possui um array de "meanings" (significados)
    dictionaryResult.meanings.forEach(meaning => {
        // Cria um subtítulo para a classe gramatical (ex: Substantivo, Verbo)
        const partOfSpeech = document.createElement('h5');
        partOfSpeech.className = 'kv-label mt-3 mb-1';
        partOfSpeech.textContent = `— ${meaning.partOfSpeech.charAt(0).toUpperCase() + meaning.partOfSpeech.slice(1)}:`; // Capitaliza a primeira letra

        dictionaryEntry.appendChild(partOfSpeech);

        // lista de Definições
        const ul = document.createElement('ul');
        ul.className = 'dictionary-list';

        // pega as 3 primeiras definições (para não sobrecarregar a tela)
        meaning.definitions.slice(0, 3).forEach((def, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="fw-bold">${index + 1}.</span> ${def.definition}
            `;
            // adiciona um exemplo, se existir
            if (def.example) {
                li.innerHTML += `<br><em class="text-muted fst-italic">Exemplo: "${def.example}"</em>`;
            }
            ul.appendChild(li); // adiciona o item da lista ao ul 
        });

        dictionaryEntry.appendChild(ul);
    });
}

searchForm.addEventListener('submit', handleSubmit); // EventListener para a ação 'submit' do botão "Buscar"

async function handleSubmit(event){ // Função assíncrona para tratar o 'submit' do botão
    event.preventDefault(); // Evita o recarregamento da página ao clicar no botão

    const wordToTranslate = wordInput.value.trim(); // Armazena o valor da palavra que foi inserida no input e remove espaços em branco
    const sourceLanguage = fromLang.value; // Armazena o valor do idioma de origem pelo valor do dropdown

    if (!wordToTranslate) {
        alert('Por favor, digite uma palavra para traduzir.');
        return;
    } // Alert para caso nenhuma palavra tenha sido digitada

    if (wordToTranslate.length < 2) {
        alert('Por favor, digite uma palavra com pelo menos 2 letras.');
        dictionaryEntry.innerHTML = '<p class="mb-0">Aguardando busca...</p>';
        return;
    }

    const result = await translateWord(wordToTranslate, sourceLanguage); // armazena o resultado da função, e usa um await para aguardar a requisição

    if (result){
        const translatedText = result.translations[0].text; 
        // se existir um resultado, ele guarda o testo traduzido em um Array de traduções,
        // que depois é convertido para texto
        originalWord.textContent = wordToTranslate; // substitui no html o espaço em branco pela palavra traduzida
        translatedWord.textContent = translatedText; // substitui no html o espaço em branco pela palavra traduzida
        saveTranslationToHistory(wordToTranslate, translatedText, sourceLanguage);

        if (sourceLanguage !== 'auto') {
            dictionaryEntry.innerHTML = '<p class="mb-0">Buscando verbete...</p>';
            
            // chamada da busca do verbete na API do dicionário
            const dictionaryResult = await fetchNewDictionaryEntry(wordToTranslate, sourceLanguage);
            
            // renderização do verbete
            renderDictionaryEntry(dictionaryResult, wordToTranslate);
        } else {
            // exibe uma mensagem caso o usuário use "auto"
            dictionaryEntry.innerHTML = '<p class="mb-0">Verbetes de dicionário não estão disponíveis com a opção "Detectar automaticamente". Por favor, selecione um idioma de origem.</p>';
        }
    } else {
        originalWord.textContent = 'Erro na busca';
        translatedWord.textContent = "—";
        dictionaryEntry.innerHTML = '<p class="mb-0">Não foi possível buscar o verbete devido a um erro na tradução.</p>';
    }
}