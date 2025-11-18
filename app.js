const wordInput = document.getElementById("wordInput");
const originalWord = document.getElementById("originalWord");
const translatedWord = document.getElementById("translatedWord");
const searchForm = document.getElementById("searchForm");
const fromLang = document.getElementById("fromLang")

// Constantes da API
const DEEPL_API_KEY = "85fae25f-dd02-4e8e-aff3-bc7203b5a11a:fx";
const DEEPL_API_URL = 'https://corsproxy.io/?' + encodeURIComponent('https://api-free.deepl.com/v2/translate');
const TARGET_LANG = 'PT';

async function translateWord(text, sourceLang){
    const data = {
        text: [text],
        source_lang: sourceLang,
        target_lang: TARGET_LANG,
    };

    try {
        const response = await fetch(DEEPL_API_URL, {
            method: 'POST', 
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok){
            console.error('Erro da API DeepL. Status:', response.status)
            throw new Error(`Erro na tradução: ${response.statusText}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        alert(`Não foi possivel traduzir: ${error.message}.`);
        return null;
    }
}

searchForm.addEventListener('submit', handleSubmit); // EventListener para a ação 'submit' do botão "Buscar"

async function handleSubmit(e){ // Função assíncrona para tratar o 'submit' do botão
    e.preventDefault(); // Evita o recarregamento da página ao clicar no botão

    const wordToTranslate = wordInput.value.trim(); // Armazena o valor da palavra que foi inserida no input e remove espaços em branco
    const sourceLanguage = fromLang.value; // Armazena o valor do idioma de origem pelo valor do dropdown

    if (!wordToTranslate) {
        alert('Por favor, digite uma palavra para traduzir.');
        return;
    } // Alert para caso nenhuma palavra tenha sido digitada

    const result = await translateWord(wordToTranslate, sourceLanguage); // armazena o resultado da função, e usa um await para aguardar a requisição

    if (result){
        const translatedText = result.translations[0].text; 
        // se existir um resultado, ele guarda o testo traduzido em um Array de traduções
        // que depois é convertido para texto
        originalWord.textContent = wordToTranslate; // substitui no html o espaço em branco pela palavra traduzida
        translatedWord.textContent = translatedText; // substitui no html o espaço em branco pela palavra traduzida
    } else {
        originalWord.textContent = 'Erro na busca';
        translatedWord.textContent = "—";
    }
}