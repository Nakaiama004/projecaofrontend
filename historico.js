const STORAGE_HISTORY = 'dicio_translate_history'; // constante que define a chave para armazenar o historico
const listaHistorico = document.getElementById('listaHistorico');
const filtroHistorico = document.getElementById('filtroHistorico')

function getHistory(){ // função responsavel por ler o historico de traduções no localStorage
    const historyJSON = localStorage.getItem(STORAGE_HISTORY); // obtem a string JSON do historico
    return historyJSON ? JSON.parse(historyJSON) : []; // se o historyJSON existir, faz o parsing, caso contrario, retorna um array vazio
}

function saveHistory(history){ // função responsavel por guardar o historico na memoria do navegador
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history)); // converte o array 'history' para uma string JSON e armazena
}

// função responsavel por salvar a tradução no historico
function saveTranslationToHistory(original, translated, sourceLang) {
    const history = getHistory();

    // cria um objeto de entrada com os dados da tradução
    const newEntry = {
        original: original,
        translated: translated,
        sourceLang: sourceLang, // o idioma DE FATO usado (o valor do input)
    };
    
    // adiciona o novo item no INÍCIO do array
    history.unshift(newEntry);
    
    // limita numero de itens no histórico (exemplo: 20 itens)
    if (history.length > 20) {
        history.pop();
    }
    
    saveHistory(history); // salva o array atualizado no localStorage
}

function removeItem(index) { // função para limpar o item do historico
    let history = getHistory(); // pega o historico
    
    // confirma se o índice é válido
    if (index >= 0 && index < history.length) {
        history.splice(index, 1); // Remove 1 item a partir do índice
        saveHistory(history);
        renderLists(); // atualiza a visualização
    }
}

// função para limpar TODO o historico
function limparHistorico() {
    const history = getHistory();
    // validação para checar se o histórico está vazio 
    if (history.length === 0) {
        alert("O histórico de traduções já está vazio.");
        return; // sai da função, impedindo a confirmação
    }
    if (confirm("Tem certeza que deseja limpar todo o histórico de traduções?")) {
        localStorage.removeItem(STORAGE_HISTORY); // remove os dados armazenados no localStorage
        renderLists(); // chama a função para renderizar a lista
    }
}


// função principal que desenha os itens na tela
function renderLists() {
    const history = getHistory(); // pega o historico usando a função getHistory()
    
    // limpa a lista
    listaHistorico.innerHTML = '';

    // filtra o Histórico
    const filtroHistValue = filtroHistorico.value.toLowerCase();
    
    // se o histórico estiver vazio ou se o filtro não retornar nada, exibe mensagem
    if (history.length === 0) {
        // exibe uma mensagem caso o histórico estiver vazio
        listaHistorico.innerHTML = '<li>Você ainda não realizou nenhuma busca.</li>';
        return;
    }

    // filtra o array de histórico, incluindo apenas itens onde o texto original OU o texto traduzido
    // contenham o valor digitado no filtro.
    const filteredHistory = history.filter(item => 
        item.original.toLowerCase().includes(filtroHistValue) || 
        item.translated.toLowerCase().includes(filtroHistValue)
    );
    
    // tratamento para filtro vazio
    if (filteredHistory.length === 0) {
        // exibe uma mensagem caso o filtro não tenha encontrado resultados
        listaHistorico.innerHTML = '<li>Nenhuma tradução encontrada com este filtro.</li>';
        return;
    }

    // desenha o Histórico
    filteredHistory.forEach((entry, index) => {
        // cria o elemento <li> para cada item filtrado.
        // O index representa a posição do item no array de histórico FILTRADO.
        const li = createListItem(entry, index);
        listaHistorico.appendChild(li);
    });
}

// cria o elemento <li> para cada item
function createListItem(entry, index) {
    const li = document.createElement('li');
    
    const textSpan = document.createElement('span');
    // mostra a tradução no formato: Palavra Original (Idioma) -> Palavra Traduzida
    textSpan.textContent = `${entry.original} (${entry.sourceLang.toUpperCase()}) → ${entry.translated}`;
    
    const actionsDiv = document.createElement('div');
    
    // botão de Remover
    const removeButton = document.createElement('button');
    removeButton.className = 'btn-remover';
    removeButton.textContent = '✕';
    
    // Chama a função de remoção, passando o índice correto
    removeButton.onclick = () => removeItem(index); 
    
    actionsDiv.appendChild(removeButton);

    li.appendChild(textSpan);
    li.appendChild(actionsDiv);
    
    return li;
}

// função de evento de filtro (chama a renderização novamente)
function filtrarHistorico() {
    renderLists();
}
// Renderiza a lista ao carregar a página
document.addEventListener('DOMContentLoaded', renderLists);

// Exporta as funções para o escopo global para que o HTML possa chamá-las (oninput e onclick)
window.filtrarHistorico = filtrarHistorico;
window.limparHistorico = limparHistorico;