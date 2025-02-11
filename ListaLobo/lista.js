import { inicializarLocalStorage } from '../Arquivos e Imagens/script.js'

const pageOffset = 2;
const numberOfWolvesPerPage = 4;

const nullSearch = {
    searchFlag: false,
    searchContent: null,
    searchResult: null,
    searchResultFiltered: null
};

// Define o Primeiro Acesso sendo na Primeira Página
if (!localStorage.getItem('currentUserPage')) localStorage.setItem('currentUserPage', 1);

// Define o Valor Padrão para a Barra de Busca:
if (!localStorage.getItem('currentUserSearch')) localStorage.setItem('currentUserSearch', JSON.stringify(nullSearch));


async function saveToggleFilterCheckbox() {
    const checked = document.querySelector(".wolf-filter").checked;
    localStorage.setItem('checked', checked);
    localStorage.setItem('currentUserPage', 1);

    return;
}

async function clearFilters() {
    // Resetando Filtros de Busca:
    localStorage.setItem('currentUserSearch', JSON.stringify(nullSearch));
    localStorage.setItem('checked', false);
}


async function initLocalStorageWolfList() {
    // Chamada Assíncrona para Certificar a Existência do Local Storage dos Lobos:
    await inicializarLocalStorage();

    // Máximo de Páginas já Estabelecido => Early Return:
    if (localStorage.getItem('maxNumberPages')) return;
    
    // Máximo de Páginas Indefinido:
    let wolfArray = JSON.parse(localStorage.getItem('lobos'));
    let currentUserSearch = JSON.parse(localStorage.getItem('currentUserSearch'));
    
    let newMaxUserPages;
    if (currentUserSearch.searchFlag) {
        // Erro!
        if (currentUserSearch.searchContent === null) return;

        if (currentUserSearch.searchResult === null) {
            wolfArray = wolfArray.filter((wolf) => wolf.nome === currentUserSearch.searchContent);
            newMaxUserPages = Math.ceil(wolfArray.length / numberOfWolvesPerPage);

            // Armazena o Resultado da Pesquisa:
            currentUserSearch.searchResult = wolfArray;
            localStorage.setItem('currentUserSearch', JSON.stringify(currentUserSearch));
        } else {
            wolfArray = currentUserSearch.searchResult;
        }
    } else {
        newMaxUserPages = Math.ceil(wolfArray.length / numberOfWolvesPerPage);        
    }
    
    newMaxUserPages = Math.ceil(wolfArray.length / numberOfWolvesPerPage);
    localStorage.setItem('maxNumberPages', newMaxUserPages);
}


async function loadWolfPosts() {
    const wolfsPostContainer = document.querySelector(".wolf-posts-container");
    
    // Esvazia o Conteúdo Prévio:
    wolfsPostContainer.innerHTML = "";
    
    const wolfArray = await getCurrentWolfArray();
    
    // console.log("wolf retornado: ", wolfArray);
    
    // Atualiza o Número Máximo de Páginas:
    updateMaxNumberOfPages(wolfArray);

    let pageOffset = Number(localStorage.getItem('currentUserPage')) - 1;

    for (let index = 0; index < numberOfWolvesPerPage; index++) {
        let currentWolf = wolfArray[pageOffset * numberOfWolvesPerPage + index];
        
        // Limite Máximo Alcançado:
        if (currentWolf === undefined) break;

        wolfsPostContainer?.append(createWolfArticle(currentWolf));
    }

    // Elimina a Barra de Paginação Antiga, se Existir:
    const paginationSection = document.querySelector(".pagination-section");
    paginationSection?.remove();

    // Adiciona a Barra de Paginação da Página Atual:
    document.querySelector("main").append(createPaginationBar());

    return;
}


async function createFilteredWolfList() {
    const currentUserSearch = JSON.parse(localStorage.getItem('currentUserSearch'));
    let wolfSearchArray;

    if (currentUserSearch.searchFlag) {
        // Lista Filtrada de Pesquisa já Existe:
        if (currentUserSearch.searchResultFiltered !== null) return;

        // Criando Lista de Lobos Filtrada:
        wolfSearchArray = loadWolfSearchArray();

        wolfSearchArray = wolfSearchArray?.filter(elem => elem.adotado === true);

        currentUserSearch.searchResultFiltered = wolfSearchArray;

        // Armazena o Resultado da Filtragem no Local Storage:
        localStorage.setItem('currentUserSearch', JSON.stringify(currentUserSearch));
        
    } else {
        wolfSearchArray = JSON.parse(localStorage.getItem('lobos'));

        wolfSearchArray = wolfSearchArray?.filter(elem => elem.adotado === true);

        // Armazena o Resultado da Filtragem no Local Storage:
        localStorage.setItem('lobosAdotados', JSON.stringify(wolfSearchArray));
    }

    return;
}


async function wolfListMain() {
    // Inicia o Local Storage para Certificar a Existência
    // da Limitação de Páginas e do Conteúdo dos Lobinhos:
    await initLocalStorageWolfList();

    let filterFlag = localStorage.getItem('checked');
    if (filterFlag === null) {
        filterFlag = "false";
        localStorage.setItem('checked', false);
    }

    // Recupera o Estado do Filtro:
    document.querySelector(".wolf-filter").checked = filterFlag === "true" ? true : false;

    // Carrega Todos os Posts de Lobo da Respectiva Página:
    await loadWolfPosts();
}


async function getCurrentWolfArray() {
    const currentUserSearch = JSON.parse(localStorage.getItem('currentUserSearch'));
    const filterCheckBox = localStorage.getItem('checked');

    if (currentUserSearch.searchFlag === true) {
        if (filterCheckBox === "true") {
            await createFilteredWolfList();
            console.log("retornou: ", currentUserSearch.searchResultFiltered);
            return currentUserSearch.searchResultFiltered;
        }
        console.log("retornou: ", currentUserSearch.searchResult);
        return currentUserSearch.searchResult;
    } else {
        if (filterCheckBox === "true") {
            await createFilteredWolfList();
            console.log("retornou: ", JSON.parse(localStorage.getItem('lobosAdotados')));
            return JSON.parse(localStorage.getItem('lobosAdotados'));
        }
        console.log("retornou: ", JSON.parse(localStorage.getItem('lobos')));
        return JSON.parse(localStorage.getItem('lobos'));
    }
}


async function saveWolfObject(wolfArticle) {
    const wolfPostsContainer = document.querySelector(".wolf-posts-container").children;
    const wolfArray = await getCurrentWolfArray();

    
    for (let index = 0; index < wolfPostsContainer.length; index++) {
        console.log(wolfArticle, wolfPostsContainer[index]);
        if (wolfPostsContainer[index] == wolfArticle) {
            const wolfIndex = (Number(localStorage.getItem('currentUserPage')) - 1) * numberOfWolvesPerPage + index;
            const selectedWolf = wolfArray[wolfIndex];
            
            localStorage.setItem('selectedWolfObject', JSON.stringify(selectedWolf));
            break;
        }
    }
    
    // Reinicia o Contador de Páginas:
    localStorage.setItem('currentUserPage', 1);

    // Limpa o Filtro de Busca:
    localStorage.setItem('currentUserSearch', JSON.stringify(nullSearch));
}


function loadWolfSearchArray() {
    const currentUserSearch = JSON.parse(localStorage.getItem('currentUserSearch'));

    // Erro!
    if (currentUserSearch.searchFlag === false ||
        currentUserSearch.searchContent === null) return null;

    // Array de Busca já Existe:
    if (currentUserSearch.searchResult !== null) return currentUserSearch.searchResult;

    let wolfArray = JSON.parse(localStorage.getItem('lobos'));

    wolfArray = wolfArray.filter((wolf) => wolf.nome.toLowerCase().startsWith(currentUserSearch.searchContent.toLowerCase()));

    // Armazena o Resultado da Pesquisa:
    currentUserSearch.searchResult = wolfArray;
    localStorage.setItem('currentUserSearch', JSON.stringify(currentUserSearch));
}


function updateMaxNumberOfPages(wolfArray) {
    localStorage.setItem('maxNumberPages',
        Math.ceil(wolfArray.length / numberOfWolvesPerPage));
    return;
}


function createWolfArticle({nome, idade, descricao, imagem, adotado, nomeDono}) {
    // Criando o Elemento Article:
    const wolfArticle = document.createElement("article");
    wolfArticle.classList.add("wolf-post");

    const wolfLink = adotado === false ? "..\\ShowLobo\\show.html" : "#";

    // ---------- Criando o Container da Imagem ---------- //
    const wolfImageContainer = document.createElement("div");
    wolfImageContainer.classList.add("wolf-image-container");

    const backgroundWolfImage = document.createElement("div");
    backgroundWolfImage.classList.add("background-wolf-image");

    // Colocando o Background da Imagem de Lobo dentro do Container:
    wolfImageContainer.append(backgroundWolfImage);

    const wolfPageLink = document.createElement("a");
    wolfPageLink.href = wolfLink;
    
    // Evita que a página recarregue:
    if (adotado === true) {
        wolfPageLink.addEventListener("click", (event) => {
            event.preventDefault();
        });
    } else {
        wolfPageLink.addEventListener("click", async (event) => {
            let articleClicked = event.target.parentElement.parentElement.parentElement;
            await saveWolfObject(articleClicked);
            await clearFilters();
        });
    }

    const wolfImage = document.createElement("img");
    wolfImage.src = imagem;
    wolfImage.alt = "Imagem de perfil do lobinho";

    // Colocando a Imagem de Lobo dentro da Tag Âncora:
    wolfPageLink.append(wolfImage);

    // Colocando a Tag de Página do Lobo dentro do Contêiner:
    wolfImageContainer.append(wolfPageLink);

    // Coloca o Contêiner de Imagem dentro do Article:
    wolfArticle.append(wolfImageContainer);

    // ---------- Fim do Container da Imagem ---------- //

    // ---------- Criando a Caixa de Informações do Lobo ---------- //
    const wolfInformationBox = document.createElement("div");
    wolfInformationBox.classList.add("wolf-information-box");

    const wolfTitleBox = document.createElement("div");
    wolfTitleBox.classList.add("wolf-title-box");

    const wolfNameBox = document.createElement("div");
    wolfNameBox.classList.add("wolf-name-box");

    const wolfPageLink_2 = document.createElement("a");
    wolfPageLink_2.href = wolfLink;

    // Evita que a Página Recarregue:
    if (adotado === true) {
        wolfPageLink_2.addEventListener("click", (event) => {
            event.preventDefault();
        });
    } else {
        wolfPageLink_2.addEventListener("click", async (event) => {
            let articleClicked = event.target.parentElement.parentElement.parentElement.parentElement.parentElement;
            await saveWolfObject(articleClicked);
            await clearFilters();
        });
    }

    const wolfName = document.createElement("h2");
    wolfName.classList.add("wolf-name");
    wolfName.innerText = nome;

    // Insere o Nome do Lobo na Tag Âncora:
    wolfPageLink_2.append(wolfName);

    // Insere a Âncora no Wolf Name Box:
    wolfNameBox.append(wolfPageLink_2);

    const wolfAge = document.createElement("p");
    wolfAge.innerText = `Idade: ${idade} anos`;

    // Insere a Idade do Lobo no Wolf Name Box:
    wolfNameBox.append(wolfAge);

    // Insere o Wolf Name Box no Wolf Title Box:
    wolfTitleBox.append(wolfNameBox);

    const adoptButtonLink = document.createElement("a");
    adoptButtonLink.href = wolfLink;
    adoptButtonLink.classList.add("adopt-link");

    // Evita que a Página Recarregue:
    if (adotado === true) {
        adoptButtonLink.addEventListener("click", (event) => {
            event.preventDefault();
        });
    } else {
        adoptButtonLink.addEventListener("click", async (event) => {
            let articleClicked = event.target.parentElement.parentElement.parentElement.parentElement;
            await saveWolfObject(articleClicked);
            await clearFilters();
        });
    }

    const adoptButton = document.createElement("button");
    adoptButton.classList.add("adopt-button");
    adoptButton.classList.add(adotado ? "adopted" : "adopt");
    adoptButton.innerText = adotado ? "Adotado" : "Adotar";

    // Insere o Botão de Adoção Dentro da Tag Âncora:
    adoptButtonLink.append(adoptButton);

    // Insere o Link de Adoção no Wolf Title Box:
    wolfTitleBox.append(adoptButtonLink);

    // Insere o Wolf Title Box no Wolf Information Box:
    wolfInformationBox.append(wolfTitleBox);


    const wolfInfo = document.createElement("div");
    wolfInfo.classList.add("wolf-info");

    const wolfDescription = document.createElement("p");
    wolfDescription.classList.add("wolf-description");
    wolfDescription.innerText = descricao;

    // Adiciona o Wolf Description ao Wold Info:
    wolfInfo.append(wolfDescription);

    if (nomeDono !== null) {
        const adopterName = document.createElement("p");
        adopterName.classList.add("adopter-name");
        adopterName.innerText = `Adotado por: ${nomeDono}`;

        // Adiciona o Nome do Adotador ao Wolf Info:
        wolfInfo.append(adopterName);
    }

    wolfInformationBox.append(wolfInfo);

    wolfArticle.append(wolfInformationBox);

    return wolfArticle;
}


function createPaginationBar() {
    const currentUserPage = Number(localStorage.getItem('currentUserPage'));
    const maxNumberPages = Number(localStorage.getItem('maxNumberPages'));

    const minPageNumber = Math.max(1, currentUserPage - pageOffset);
    const maxPageNumber = Math.min(maxNumberPages, currentUserPage + pageOffset);

    const paginationSection = document.createElement("section");
    paginationSection.classList.add("pagination-section");

    // Cria o Slider para a Esquerda Somente Quando Necessário:
    if (currentUserPage > 1) {
        const leftPageShift = document.createElement("a");
        leftPageShift.href = "./lista.html";
        leftPageShift.classList.add("page-number-link");
        leftPageShift.innerText = "<<";
        leftPageShift.addEventListener("click", () => {
            localStorage.setItem('currentUserPage', Math.max(1, currentUserPage - 1));
        });
    
        // Adiciona o Ícone de "<<" à Barra de Paginação:
        paginationSection.append(leftPageShift);
    }


    // Se a página atual está distante pelo menos pageOffset da primeira página:
    if (minPageNumber > 1) {
        const leftEllipsis = document.createElement("a");
        leftEllipsis.href = "./lista.html";
        leftEllipsis.classList.add("page-number-link");
        leftEllipsis.addEventListener("click", () => {
            // Retorna para a Primeira Página quando o Usuário Clicar nas Reticências da Esquerda:
            localStorage.setItem('currentUserPage', 1);
        });
        leftEllipsis.innerText = "...";

        // Adiciona o Ícone de "..." esquerdo à Barra de Paginação:
        paginationSection.append(leftEllipsis);
    }
    
    for (let pag = minPageNumber; pag <= maxPageNumber; pag++) {
        let currentPageNumber = document.createElement("a");
        currentPageNumber.href = "./lista.html";
        currentPageNumber.classList.add("page-number-link");

        // Adiciona o Marcador de Página Atual
        if (currentUserPage === pag) {
            currentPageNumber.classList.add("current-page");
        }

        currentPageNumber.innerText = pag;
        currentPageNumber.addEventListener("click", (event) => {
            // Marca a Nova Página a ser Carregada:
            localStorage.setItem('currentUserPage', event.target.innerText);
        });

        paginationSection.append(currentPageNumber);
    }
    
    if (maxPageNumber < maxNumberPages) {
        const rightEllipsis = document.createElement("a");
        rightEllipsis.href = "./lista.html";
        rightEllipsis.classList.add("page-number-link");
        rightEllipsis.addEventListener("click", () => {
            // Retorna para a Última Página quando o Usuário Clicar nas Reticências da Direita:
            localStorage.setItem('currentUserPage', maxNumberPages);
        });
        rightEllipsis.innerText = "...";

        // Adiciona o Ícone de "..." esquerdo à Barra de Paginação:
        paginationSection.append(rightEllipsis);
    }
    
    // Cria o Slider para a Direita Somente Quando Necessário:
    if (currentUserPage < maxNumberPages) {
        const rightPageShift = document.createElement("a");
        rightPageShift.href = "./lista.html";
        rightPageShift.classList.add("page-number-link");
        rightPageShift.innerText = ">>";
        rightPageShift.addEventListener("click", () => {
            localStorage.setItem('currentUserPage', Math.min(maxNumberPages, currentUserPage + 1));
        });
    
        // Adiciona o Ícone de "<<" à Barra de Paginação:
        paginationSection.append(rightPageShift);
    }

    return paginationSection;
}

// Inicializa os Dados dos Lobos:
wolfListMain();

document.querySelector(".wolf-filter").addEventListener("click", async () => {
    await saveToggleFilterCheckbox();
    await createFilteredWolfList();
    await loadWolfPosts();
});
