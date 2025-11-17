const wordInput = document.getElementById("wordInput");
const originalWord = document.getElementById("originalWord");
const translatedWord = document.getElementById("translatedWord");
const searchForm = document.getElementById("searchForm");
const fromLang = document.getElementById("fromLang")

// Constantes da API
const DEEPL_API_KEY = "039b9547-968c-421f-8890-0e24c81f0854:fx";
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const TARGET_LANG = 'PT';

async function translateWord(text, sourceLang){
// código a ser implementado
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

    const result = await translateWord(wordToTranslate, sourceLanguage); // armazena o resultado da função, e usa um await para aguardar a requisição

    if (result){
        const translatedText = result.translations[0].text;

        originalWord.textContent = wordToTranslate;
        translateWord.textContent = translatedText;
    } else {
        originalWord.textContent = 'Erro na busca';
        translatedWord.textContent = "—";
    }
}