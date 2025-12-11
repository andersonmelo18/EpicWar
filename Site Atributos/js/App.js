/**
 * js/App.js
 * Módulo principal que inicializa o aplicativo, gerencia a navegação
 * e coordena os outros controladores.
 * Depende de: StorageService, BuildController, AdminController.
 */
const App = (() => {
    
    let VIEWS = {};
    let NAV_BUTTONS = {};
    let currentViewId = 'dashboard';

    // --- Lógica de Navegação ---

    const updateNavStyle = (activeView) => {
        // Resetar estilos
        Object.values(NAV_BUTTONS).forEach(btn => {
            if (btn) {
                // Remove estilos ativos antigos
                btn.classList.remove('text-indigo-600', 'bg-indigo-50', 'text-white', 'bg-indigo-700');
                
                if (btn.id === 'nav-new-char') {
                    // Estilo padrão do botão CTA
                    btn.classList.add('text-white', 'bg-gradient-to-r', 'from-indigo-600', 'to-indigo-700');
                } else {
                    // Estilo padrão dos links
                    btn.classList.add('text-slate-600');
                }
            }
        });

        // Aplicar estilo ativo (Visual Moderno)
        if (activeView === 'dashboard' && NAV_BUTTONS['dashboard']) {
            NAV_BUTTONS['dashboard'].classList.add('text-indigo-600', 'bg-indigo-50');
            NAV_BUTTONS['dashboard'].classList.remove('text-slate-600');
        } 
        else if (activeView === 'admin' && NAV_BUTTONS['admin']) {
            NAV_BUTTONS['admin'].classList.add('text-indigo-600', 'bg-indigo-50');
            NAV_BUTTONS['admin'].classList.remove('text-slate-600');
        } 
        else if (activeView === 'help' && NAV_BUTTONS['help']) {
            NAV_BUTTONS['help'].classList.add('text-indigo-600', 'bg-indigo-50');
            NAV_BUTTONS['help'].classList.remove('text-slate-600');
        }
    };
    
    const showView = (viewId) => {
        currentViewId = viewId;

        // Oculta todas
        Object.keys(VIEWS).forEach(key => {
            const el = VIEWS[key];
            if (el) {
                el.classList.add('hidden');
                el.classList.remove('animate-fade-in'); // Reseta animação para poder tocar de novo
            }
        });
        
        // Mostra a selecionada com Animação
        if (VIEWS[viewId]) {
            VIEWS[viewId].classList.remove('hidden');
            VIEWS[viewId].classList.add('animate-fade-in'); // <--- Animação aqui
            updateNavStyle(viewId);
        }

        // Chamadas específicas
        if (viewId === 'dashboard') {
            if (typeof BuildController !== 'undefined' && BuildController.refreshDashboard) {
                BuildController.refreshDashboard();
            }
        } else if (viewId === 'admin') {
            if (typeof AdminController !== 'undefined') AdminController.initAdminView();
        }
    };
    
    // Funções públicas de navegação
    const showDashboard = () => showView('dashboard');
    const showReport = () => showView('report');
    const showEditor = () => showView('editor');
    const showHelp = () => showView('help');

    // --- Métodos Públicos para onclick no HTML (Renderer.js) ---
    // Esses métodos precisam ser expostos no return para que "onclick='App.loadBuild(1)'" funcione
    const loadBuild = (id) => {
        BuildController.loadBuildForEditing(id);
        showView('editor');
    };

    const deleteBuild = (id) => {
        if(confirm("Tem certeza que deseja excluir esta build permanentemente?")) {
            BuildController.deleteBuild(id);
        }
    };

    // --- Importação ---

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
                console.error("Erro ao importar:", error);
            }
        }
        return false;
    };

    // --- Configuração Visual ---

    // Injeta CSS de animação dinamicamente
    const addGlobalAnimationStyles = () => {
        if (!document.getElementById('app-animations')) {
            const style = document.createElement('style');
            style.id = 'app-animations';
            style.innerHTML = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `;
            document.head.appendChild(style);
        }
    };

    // --- Setup Listeners ---

    const setupListeners = () => {
        if (NAV_BUTTONS['dashboard']) NAV_BUTTONS['dashboard'].addEventListener('click', showDashboard);
        if (NAV_BUTTONS['admin']) NAV_BUTTONS['admin'].addEventListener('click', () => showView('admin'));
        if (NAV_BUTTONS['help']) NAV_BUTTONS['help'].addEventListener('click', showHelp);
        
        if (NAV_BUTTONS['newChar']) {
            NAV_BUTTONS['newChar'].addEventListener('click', () => { 
                BuildController.initializeNewBuild(); 
                showView('editor'); 
            });
        }

        // Listener Global para botões no Dashboard (Event Delegation)
        // Isso é necessário porque os cards são criados dinamicamente pelo Renderer.js
        /* NOTA: Como adicionamos métodos públicos 'loadBuild' e 'deleteBuild' no return,
           os onclicks diretos no HTML gerado pelo Renderer (onclick="App.loadBuild(...)")
           vão funcionar nativamente, tornando este listener redundante mas seguro manter.
        */
        
        // Listeners do Editor
        const runBtn = document.getElementById('run-full-analysis-btn');
        if (runBtn) {
            runBtn.addEventListener('click', async () => {
                const originalText = runBtn.innerHTML;
                runBtn.innerText = 'Gerando Relatório... ⏳';
                runBtn.disabled = true;
                runBtn.classList.add('opacity-75', 'cursor-wait');

                await new Promise(resolve => setTimeout(resolve, 600)); // Pequeno delay visual

                BuildController.generateFinalReport();

                runBtn.innerHTML = originalText;
                runBtn.disabled = false;
                runBtn.classList.remove('opacity-75', 'cursor-wait');
            });
        }
        
        const clearBtn = document.getElementById('clear-build-btn');
        if (clearBtn) clearBtn.addEventListener('click', () => {
            if (confirm("Limpar build atual?")) BuildController.initializeNewBuild();
        });

        const saveBtn = document.getElementById('save-build-draft-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => BuildController.saveCurrentBuild(true));
    };

    const init = () => {
        console.log("💎 PvP Build Analyzer: Inicializando...");
        
        VIEWS = {
            'dashboard': document.getElementById('dashboard-view'),
            'editor': document.getElementById('build-editor-view'),
            'admin': document.getElementById('admin-view'),
            'report': document.getElementById('report-view'),
            'help': document.getElementById('help-view')
        };

        NAV_BUTTONS = {
            'dashboard': document.getElementById('nav-dashboard'),
            'admin': document.getElementById('nav-admin'),
            'help': document.getElementById('nav-help'),
            'newChar': document.getElementById('nav-new-char')
        };

        addGlobalAnimationStyles(); // Injeta CSS de animação
        StorageService.initializeDefaultData(); 
        setupListeners();
        
        if (typeof BuildController !== 'undefined') BuildController.init(); 

        const isImporting = checkURLForImport(); 
        if (!isImporting) {
            showDashboard();
        }
    };

    document.addEventListener('DOMContentLoaded', init);
    
    return {
        showView,
        loadBuild,   // Exposto para uso no HTML (Renderer.js)
        deleteBuild, // Exposto para uso no HTML (Renderer.js)
        showDashboard,
        showReport,
        showEditor,
        showHelp
    };
})();