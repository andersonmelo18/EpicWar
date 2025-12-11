/**
 * js/App.js
 * Módulo principal que inicializa o aplicativo, gerencia a navegação
 * e coordena os outros controladores.
 * Depende de: StorageService, BuildController, AdminController.
 */
const App = (() => {
    
    // Declaramos as variáveis, mas só buscamos os elementos no init()
    let VIEWS = {};
    let NAV_BUTTONS = {};
    let currentViewId = 'dashboard';

    // --- Lógica de Navegação ---

    /**
     * Atualiza o estado visual dos botões de navegação.
     */
    const updateNavStyle = (activeView) => {
        // 1. Resetar estilos
        Object.values(NAV_BUTTONS).forEach(btn => {
            if (btn) { // Verificação de segurança
                btn.classList.remove('text-indigo-800', 'font-bold', 'bg-indigo-700');
                if (btn.id === 'nav-new-char') {
                     btn.classList.add('bg-indigo-600');
                } else {
                     btn.classList.add('text-gray-600', 'font-medium');
                }
            }
        });

        // 2. Aplicar estilo da view ativa
        if (activeView === 'dashboard' && NAV_BUTTONS['dashboard']) {
            NAV_BUTTONS['dashboard'].classList.add('text-indigo-800', 'font-bold');
            NAV_BUTTONS['dashboard'].classList.remove('text-gray-600');
        } 
        else if (activeView === 'admin' && NAV_BUTTONS['admin']) {
            NAV_BUTTONS['admin'].classList.add('text-indigo-800', 'font-bold');
            NAV_BUTTONS['admin'].classList.remove('text-gray-600');
        } 
        else if (activeView === 'help' && NAV_BUTTONS['help']) { // Novo: Estilo para botão Ajuda
            NAV_BUTTONS['help'].classList.add('text-indigo-800', 'font-bold');
            NAV_BUTTONS['help'].classList.remove('text-gray-600');
        }
        else if ((activeView === 'editor' || activeView === 'report') && NAV_BUTTONS['newChar']) {
            NAV_BUTTONS['newChar'].classList.remove('bg-indigo-600');
            NAV_BUTTONS['newChar'].classList.add('bg-indigo-700');
            // Mantém dashboard destacado levemente
            if (NAV_BUTTONS['dashboard']) {
                NAV_BUTTONS['dashboard'].classList.remove('text-gray-600');
                NAV_BUTTONS['dashboard'].classList.add('text-indigo-600');
            }
        }
    };
    
    /**
     * Alterna a visualização principal da aplicação.
     */
    const showView = (viewId) => {
        currentViewId = viewId;

        // Oculta todas as views com verificação de segurança
        Object.keys(VIEWS).forEach(key => {
            const el = VIEWS[key];
            if (el) {
                el.classList.add('hidden');
            } else {
                console.warn(`Elemento da view '${key}' não encontrado no DOM.`);
            }
        });
        
        // Mostra a view solicitada
        if (VIEWS[viewId]) {
            VIEWS[viewId].classList.remove('hidden');
            updateNavStyle(viewId);
        } else {
            console.error(`Tentativa de exibir view inexistente: ${viewId}`);
        }

        // Chamadas específicas de inicialização/refresh
        if (viewId === 'dashboard') {
            // CORREÇÃO: Chama o refreshDashboard para atualizar a lista
            if (typeof BuildController !== 'undefined') {
                if (BuildController.refreshDashboard) {
                    BuildController.refreshDashboard();
                } else {
                    // Fallback se refreshDashboard não existir (compatibilidade)
                    BuildController.init(); 
                }
            }
        } else if (viewId === 'admin') {
            if (typeof AdminController !== 'undefined') AdminController.initAdminView();
        }
    };
    
    const showDashboard = () => showView('dashboard');
    const showReport = () => showView('report');
    const showEditor = () => showView('editor');
    const showHelp = () => showView('help'); // Nova função para mostrar Ajuda

    // --- Lógica de Importação ---

    const checkURLForImport = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#import=')) {
            try {
                const base64Payload = hash.substring('#import='.length);
                const jsonString = atob(base64Payload);
                const importedBuild = JSON.parse(jsonString);

                if (importedBuild) {
                    importedBuild.id = null; 
                    BuildController.setImportedBuild(importedBuild); 
                    showView('editor');
                    alert(`Build "${importedBuild.name || 'Sem Nome'}" carregada para edição.`);
                    window.history.replaceState(null, null, ' ');
                    return true;
                }
            } catch (error) {
                console.error("Erro ao importar build:", error);
            }
        }
        return false;
    };

    // --- Setup de Listeners Globais ---

    const setupListeners = () => {
        if (NAV_BUTTONS['dashboard']) NAV_BUTTONS['dashboard'].addEventListener('click', showDashboard);
        if (NAV_BUTTONS['admin']) NAV_BUTTONS['admin'].addEventListener('click', () => showView('admin'));
        if (NAV_BUTTONS['help']) NAV_BUTTONS['help'].addEventListener('click', showHelp); // Listener do botão Ajuda
        
        if (NAV_BUTTONS['newChar']) {
            NAV_BUTTONS['newChar'].addEventListener('click', () => { 
                BuildController.initializeNewBuild(); 
                showView('editor'); 
            });
        }

        if (VIEWS['dashboard']) {
            VIEWS['dashboard'].addEventListener('click', (e) => {
                const editBtn = e.target.closest('[data-action="edit-build"]');
                const deleteBtn = e.target.closest('[data-action="delete-build"]');
                const buildId = editBtn?.dataset.buildId || deleteBtn?.dataset.buildId;

                if (buildId) {
                    if (editBtn) {
                        BuildController.loadBuildForEditing(parseInt(buildId));
                        showView('editor');
                    } else if (deleteBtn) {
                        const buildName = StorageService.loadBuildById(parseInt(buildId))?.name || 'esta build';
                        if (confirm(`Tem certeza que deseja excluir a build "${buildName}"?`)) {
                            // Chama o método de delete do BuildController, que já cuida do refresh
                            if (typeof BuildController !== 'undefined' && BuildController.deleteBuild) {
                                BuildController.deleteBuild(parseInt(buildId));
                            } else {
                                // Fallback
                                StorageService.deleteBuild(parseInt(buildId));
                                showDashboard();
                            }
                        }
                    }
                }
            });
        }
        
        // Listeners do Editor (Verificando existência)
        const artCount = document.getElementById('artifact-count');
        if (artCount) artCount.addEventListener('change', (e) => BuildController.updateArtifactCount(parseInt(e.target.value)));
        
        const saveBtn = document.getElementById('save-build-draft-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => BuildController.saveCurrentBuild(true));
        
        // --- LOADING STATE (ALTERADO AQUI) ---
        const runBtn = document.getElementById('run-full-analysis-btn');
        if (runBtn) {
            runBtn.addEventListener('click', async () => {
                // 1. Muda estado visual para "Carregando"
                const originalText = runBtn.innerHTML; // Guarda o texto original
                runBtn.innerText = 'Gerando Relatório... ⏳';
                runBtn.disabled = true;
                runBtn.classList.add('opacity-75', 'cursor-wait'); // Estilos visuais de espera

                // 2. Pequeno delay simulado para a UX (1000ms)
                await new Promise(resolve => setTimeout(resolve, 1000));

                // 3. Executa a ação real
                BuildController.generateFinalReport();

                // 4. Restaura estado (caso o usuário volte para esta tela)
                runBtn.innerHTML = originalText;
                runBtn.disabled = false;
                runBtn.classList.remove('opacity-75', 'cursor-wait');
            });
        }
        // -------------------------------------
        
        const clearBtn = document.getElementById('clear-build-btn');
        if (clearBtn) clearBtn.addEventListener('click', () => {
            if (confirm("Limpar build atual?")) BuildController.initializeNewBuild();
        });
    };

    /**
     * Ponto de entrada do aplicativo.
     */
    const init = () => {
        console.log("💎 PvP Build Analyzer: Inicializando...");
        
        // 1. CAPTURA DOS ELEMENTOS DOM (Aqui garantimos que o HTML já existe)
        VIEWS = {
            'dashboard': document.getElementById('dashboard-view'),
            'editor': document.getElementById('build-editor-view'),
            'admin': document.getElementById('admin-view'),
            'report': document.getElementById('report-view'),
            'help': document.getElementById('help-view') // Registrando a nova view
        };

        NAV_BUTTONS = {
            'dashboard': document.getElementById('nav-dashboard'),
            'admin': document.getElementById('nav-admin'),
            'help': document.getElementById('nav-help'), // Registrando o botão de ajuda
            'newChar': document.getElementById('nav-new-char')
        };

        // Verificação inicial
        if (!VIEWS['dashboard']) console.error("ERRO CRÍTICO: View 'dashboard-view' não encontrada no HTML.");

        // 2. Inicializa serviços
        StorageService.initializeDefaultData(); 
        
        // 3. Configura listeners
        setupListeners();
        
        // 4. Inicializa controladores
        if (typeof BuildController !== 'undefined') BuildController.init(); 

        // 5. Verifica importação ou mostra dashboard
        const isImporting = checkURLForImport(); 
        if (!isImporting) {
            showDashboard();
        }
        
        console.log("💎 PvP Build Analyzer: Inicialização concluída.");
    };

    // Inicializa a aplicação quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', init);
    
    return {
        showView,
        showDashboard,
        showReport,
        showEditor,
        showHelp
    };
})();