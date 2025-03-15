document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/list_sites');
        const data = await response.json();
        
        const sitesContainer = document.getElementById('sites');
        const browserInfoElement = document.getElementById('browser-info');
        
        if (data.error) {
            sitesContainer.innerHTML = `<div class="error">${data.error}</div>`;
            return;
        }
        
        // Informações sobre o ambiente
        const isCloud = data.browser_info?.is_cloud || false;
        const browserName = data.browser_info?.name || "navegador";
        
        // Mostra informação sobre qual navegador está sendo usado
        if (data.browser_info) {
            if (isCloud) {
                browserInfoElement.innerHTML = `<strong>Modo Web</strong> - Sites abrirão no seu navegador`;
                browserInfoElement.className = 'browser-cloud';
            } else {
                browserInfoElement.innerHTML = `Usando: <strong>${browserName}</strong>`;
                browserInfoElement.className = browserName.includes('Firefox') ? 'browser-firefox' : 'browser-edge';
            }
        }

        // Adiciona botão para abrir todos os sites
        const openAllSection = document.createElement('div');
        openAllSection.className = 'open-all-section';
        openAllSection.innerHTML = `
            <p class="open-all-info">Clique no botão abaixo para abrir todos os sites ${isCloud ? 'em novas abas' : 'no ' + browserName}</p>
            <button class="open-all-button" id="openAllButton">
                Abrir Todos os Sites
            </button>
        `;
        sitesContainer.appendChild(openAllSection);

        // Handler para o botão de abrir todos
// Função para abrir todos os sites
document.getElementById('openAllButton').addEventListener('click', async function() {
    const button = this;
    const originalText = button.textContent;
    
    try {
        // Desabilita o botão e mostra loading
        button.disabled = true;
        button.textContent = 'Abrindo todos os sites...';
        
        // Chama a API para abrir todos os sites
        const response = await fetch('/open_all_sites');
        const result = await response.json();
        
        if (result.success) {
            // Se estamos na nuvem ou se o navegador não abriu via backend
            if (!result.browser_opened && result.urls) {
                // Armazena as URLs para abrir com atraso
                const urlsToOpen = [...result.urls];
                
                // Informa o usuário sobre o bloqueador de pop-ups
                alert('Serão abertas múltiplas abas. Se algumas não abrirem, verifique se o bloqueador de pop-ups está ativo.');
                
                // Abre a primeira URL
                window.open(urlsToOpen[0], '_blank');
                
                // Abre as demais URLs com um pequeno atraso entre elas
                for (let i = 1; i < urlsToOpen.length; i++) {
                    // Usa uma IIFE com setTimeout para criar um closure para cada URL
                    (function(url, index) {
                        setTimeout(() => {
                            window.open(url, '_blank');
                            console.log(`Abrindo site ${index+1}: ${url}`);
                        }, index * 800); // 800ms de atraso entre cada abertura
                    })(urlsToOpen[i], i);
                }
            }
            
            button.textContent = 'Sites abertos!';
            // Aguarda um pouco antes de restaurar o texto original
            setTimeout(() => {
                button.disabled = false;
                button.textContent = originalText;
            }, 3000);
        } else {
            alert(`Erro: ${result.message}`);
            button.disabled = false;
            button.textContent = originalText;
        }
    } catch (error) {
        alert('Erro ao abrir os sites');
        console.error(error);
        button.disabled = false;
        button.textContent = originalText;
    }
});

        // Adiciona os sites
        const sitesGrid = document.createElement('div');
        sitesGrid.className = 'sites-grid';
        
        if (data.sites) {
            data.sites.forEach((site, index) => {
                const siteDiv = document.createElement('div');
                siteDiv.className = 'site';
                siteDiv.innerHTML = `
                    <div class="site-info">
                        <span class="site-name">${site.name}</span>
                        <span class="site-url">${site.url}</span>
                    </div>
                    <button class="open-button" onclick="openSite(${index}, '${site.url}')" data-url="${site.url}">
                        Abrir Site
                    </button>
                `;
                sitesGrid.appendChild(siteDiv);
            });
        }
        
        sitesContainer.appendChild(sitesGrid);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('sites').innerHTML = 
            `<div class="error">Erro ao carregar sites</div>`;
    }
});

async function openSite(siteId, fallbackUrl) {
    const button = event.target;
    const originalText = button.textContent;
    
    try {
        // Desabilita o botão e mostra loading
        button.disabled = true;
        button.textContent = 'Abrindo...';
        
        // Chama a API para tentar abrir o site via backend
        const response = await fetch(`/open_site/${siteId}`);
        const result = await response.json();
        
        if (result.success) {
            // Se o backend não conseguiu abrir o navegador, abrimos via JavaScript
            if (!result.browser_opened) {
                window.open(result.url, '_blank');
            }
        } else {
            // Se houve um erro na API, usamos o fallback
            if (fallbackUrl) {
                window.open(fallbackUrl, '_blank');
            } else {
                alert(`Erro: ${result.message}`);
            }
        }
    } catch (error) {
        // Em caso de erro, tentamos o fallback
        if (fallbackUrl) {
            window.open(fallbackUrl, '_blank');
        } else {
            alert('Erro ao abrir o site');
            console.error(error);
        }
    } finally {
        // Restaura o botão ao estado original
        button.disabled = false;
        button.textContent = originalText;
    }
}