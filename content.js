// Escuta as mensagens enviadas pelo popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.acao === "desordenar") {
        desordenarEmMassa();
    } else if (request.acao === "ordenar") {
        ordenarEmMassa(request.lista);
    }
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function forcarClique(elemento) {
    elemento.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    await wait(20); 
    elemento.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    elemento.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
    elemento.click();
}

async function esperarCarregamentoDoServidor() {
    const classeDoLoading = '.loading-block'; 
    await wait(200); 
    let loadingNaTela = document.querySelector(classeDoLoading);
    
    while (loadingNaTela && loadingNaTela.style.display !== 'none') {
        await wait(50); 
        loadingNaTela = document.querySelector(classeDoLoading); 
    }
    await wait(300); 
}

async function esperarMenuAbrir(classeAlvo) {
    let maxTentativas = 20; 
    for(let i = 0; i < maxTentativas; i++) {
        const btn = document.querySelector(classeAlvo + ':not(.inactive)');
        if (btn && btn.offsetWidth > 0) return btn;
        await wait(50); 
    }
    return null; 
}

async function desordenarEmMassa() {
    console.log("🚀 Iniciando desordenação Automática (Motor 1.3.1)...");
    
    let botoesIniciais = document.querySelectorAll('.activity-hamburger-button');
    let listaAutomaticaOS = [];

    for (let btn of botoesIniciais) {
        if (btn.offsetWidth === 0) continue; 
        let pai = btn.parentElement;
        
        for(let i = 0; i < 15; i++) {
            if (!pai) break;
            if (pai.querySelectorAll('.activity-hamburger-button').length > 1) break;

            let match = pai.textContent.match(/[A-Za-z]?\d{6,}/);
            if (match) {
                let osNum = match[0];
                if (!listaAutomaticaOS.includes(osNum)) {
                    listaAutomaticaOS.push(osNum);
                }
                break;
            }
            pai = pai.parentElement;
        }
    }

    if(listaAutomaticaOS.length === 0) {
        alert("Nenhuma OS identificada para desordenar.");
        return;
    }

    console.log("📋 Lista mapeada para desordenar:", listaAutomaticaOS);

    for (let idOS of listaAutomaticaOS) {
        console.log(`🔍 Caçando OS fresca: ${idOS}`);
        let botoesFrescos = document.querySelectorAll('.activity-hamburger-button');
        let btnAlvo = null;

        for (let btn of botoesFrescos) {
            if (btn.offsetWidth === 0) continue;
            let pai = btn.parentElement;
            let encontrou = false;
            
            for(let i = 0; i < 15; i++) {
                if (!pai) break;
                if (pai.querySelectorAll('.activity-hamburger-button').length > 1) break;
                if (pai.textContent && pai.textContent.includes(idOS)) {
                    encontrou = true;
                    break;
                }
                pai = pai.parentElement;
            }
            if(encontrou) { btnAlvo = btn; break; }
        }

        if (btnAlvo) {
            await forcarClique(btnAlvo);
            const btnNaoOrdenada = await esperarMenuAbrir('.layer-not-ordered');
            
            if (btnNaoOrdenada) {
                console.log(`Desordenando ${idOS}...`);
                await forcarClique(btnNaoOrdenada);
                await esperarCarregamentoDoServidor(); 
            } else {
                console.log(`${idOS} bloqueada ou já desordenada.`);
                btnAlvo.click(); 
                await wait(100);
            }
        }
    }
    alert("Processo concluído! Desordenou todas com sucesso.");
}

async function ordenarEmMassa(listaDeOs) {
    console.log("🚀 Iniciando reordenação The Flash com auditoria...", listaDeOs);
    
    let osFalhas = []; // Variável de auditoria isolada
    
    for (let numeroOs of listaDeOs) {
        numeroOs = numeroOs.trim(); 
        if (!numeroOs) continue; 
        
        console.log(`🔍 Buscando OS: ${numeroOs}`);
        
        const nodeListBotoes = document.querySelectorAll('.activity-hamburger-button');
        const botoesMenu = Array.from(nodeListBotoes).reverse(); 

        let btnAlvo = null;

        for (let btn of botoesMenu) {
            let elementoPai = btn.parentElement;
            let encontrou = false;
            
            for(let i = 0; i < 15; i++) {
                if (!elementoPai) break;
                if (elementoPai.querySelectorAll('.activity-hamburger-button').length > 1) break;

                if (elementoPai.textContent && elementoPai.textContent.includes(numeroOs)) {
                    encontrou = true;
                    break;
                }
                elementoPai = elementoPai.parentElement;
            }
            
            if (encontrou) {
                btnAlvo = btn;
                break;
            }
        }

        if (btnAlvo) {
            console.log(`✅ OS ${numeroOs} encontrada! Abrindo menu...`);
            await forcarClique(btnAlvo);
            const btnDefinirOrdenadas = await esperarMenuAbrir('.layer-ordered');

            if (btnDefinirOrdenadas) {
                console.log(`🚀 Ordenando OS ${numeroOs}...`);
                await forcarClique(btnDefinirOrdenadas);
                await esperarCarregamentoDoServidor();
            } else {
                console.error(`❌ Botão não carregou para a OS ${numeroOs}.`);
                osFalhas.push(`${numeroOs} (Bloqueada/Erro)`); // Registra na lista de falhas
                await forcarClique(btnAlvo); 
                await wait(100);
            }
        } else {
            console.warn(`⚠️ Aviso: OS ${numeroOs} não encontrada.`);
            osFalhas.push(numeroOs); // Registra na lista de falhas
        }
    }
    
    console.log("------------------------- </enviando para o ofs> -----------------------------");
    
    // Alerta de Auditoria Final
    if (osFalhas.length > 0) {
        alert(`⚠️ Atenção! As seguintes OS não foram processadas:\n\n${osFalhas.join('\n')}\n\nVerifique se estão na tela ou bloqueadas. O restante foi processado.`);
    } else {
        alert("✅ Lista processada 100%! Rota pronta e sem falhas.");
    }
}