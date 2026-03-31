document.getElementById("btnDesordenar").addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {acao: "desordenar"});
    });
});

document.getElementById("btnOrdenar").addEventListener("click", () => {
    const listaTexto = document.getElementById("listaOs").value;
    
    // Limpa a string e cria um array separando por vírgula OU quebra de linha (útil se colar do Excel)
    const listaArray = listaTexto.split(/[\n,]+/).map(item => item.trim()).filter(item => item !== "");
    
    if (listaArray.length === 0) {
        alert("Por favor, insira pelo menos uma OS na lista.");
        return;
    }

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {acao: "ordenar", lista: listaArray});
    });
});

document.getElementById("btnLimpar").addEventListener("click", () => {
    document.getElementById("listaOs").value = "";
    document.getElementById("listaOs").focus();
});