/**
 * js/App.js
 * Módulo principal que inicializa o aplicativo.
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
                btn.classList.remove('text-indigo-600', 'bg-indigo-50', 'text-white', 'bg-indigo-700');

                if (btn.id === 'nav-new-char') {
                    btn.classList.add('text-white', 'bg-gradient-to-r', 'from-indigo-600', 'to-indigo-700');
                } else {
                    btn.classList.add('text-slate-600');
                }
            }
        });

        // Aplicar estilo ativo
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
                el.classList.remove('animate-fade-in');
            }
        });

        // Mostra a selecionada
        if (VIEWS[viewId]) {
            VIEWS[viewId].classList.remove('hidden');
            VIEWS[viewId].classList.add('animate-fade-in');
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

    const showDashboard = () => showView('dashboard');
    const showReport = () => showView('report');
    const showEditor = () => showView('editor');
    const showHelp = () => showView('help');

    // --- Métodos Públicos (A Ponte para o HTML) ---

    const loadBuild = (id) => {
        if (typeof BuildController !== 'undefined') {
            BuildController.loadBuildForEditing(id);
        }
    };

    const deleteBuild = (id) => {
        const buildId = id.toString();

        if (confirm("Tem certeza que deseja excluir esta build permanentemente?")) {
            if (typeof BuildController !== 'undefined') {
                BuildController.deleteBuild(buildId);
            } else {
                console.error("BuildController não encontrado!");
            }
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
                .cursor-wait { cursor: wait; }
            `;
            document.head.appendChild(style);
        }
    };

    // --- Setup Listeners ---

    const setupListeners = () => {
        // --- 1. Navegação Principal ---
        if (NAV_BUTTONS['dashboard']) NAV_BUTTONS['dashboard'].addEventListener('click', showDashboard);

        if (NAV_BUTTONS['admin']) {
            NAV_BUTTONS['admin'].addEventListener('click', () => {
                const isLogged = sessionStorage.getItem('admin_session_active');

                if (isLogged === 'true') {
                    if (typeof AdminController !== 'undefined') AdminController.initAdminView();
                    showView('admin');
                } else {
                    if (typeof Renderer !== 'undefined' && Renderer.renderLoginModal) {
                        Renderer.renderLoginModal(() => {
                            sessionStorage.setItem('admin_session_active', 'true');
                            if (typeof AdminController !== 'undefined') AdminController.initAdminView();
                            showView('admin');
                        });
                    } else {
                        const pass = prompt("Digite a senha de administrador:");
                        if (pass === StorageService.getAdminPassword()) {
                            sessionStorage.setItem('admin_session_active', 'true');
                            showView('admin');
                        } else {
                            alert("Senha incorreta.");
                        }
                    }
                }
            });
        }

        if (NAV_BUTTONS['help']) NAV_BUTTONS['help'].addEventListener('click', showHelp);

        // Botão "Novo Personagem" da Barra Lateral
        if (NAV_BUTTONS['newChar']) {
            NAV_BUTTONS['newChar'].addEventListener('click', () => {
                if (typeof BuildController !== 'undefined') {
                    BuildController.initializeNewBuild();
                    showView('editor');
                }
            });
        }

        // --- 2. Botões Específicos do Dashboard (NOVOS) ---

        // Botão "Criar Nova Build" (o grande no centro do Dashboard)
        const dashNewBtn = document.getElementById('dash-new-build-btn');
        if (dashNewBtn) {
            dashNewBtn.addEventListener('click', () => {
                if (typeof BuildController !== 'undefined') {
                    BuildController.initializeNewBuild();
                    showView('editor');
                }
            });
        }

        // Botão "Importar Backup" (o branco ao lado)
        const dashImportBtn = document.getElementById('dash-import-btn');
        const dashImportInput = document.getElementById('dash-import-input');

        if (dashImportBtn && dashImportInput) {
            // Quando clica no botão visível, aciona o input invisível
            dashImportBtn.addEventListener('click', () => {
                dashImportInput.click();
            });

            // Quando o arquivo é selecionado
            dashImportInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);

                        // Pergunta de segurança para evitar perdas acidentais
                        if (confirm("⚠️ ATENÇÃO: Importar um backup substituirá TODAS as suas builds e configurações atuais.\n\nDeseja continuar?")) {
                            StorageService.importAllData(jsonData);
                            alert("✅ Backup importado com sucesso! A página será recarregada.");
                            location.reload(); // Recarrega para aplicar as mudanças
                        }
                    } catch (error) {
                        console.error("Erro na importação:", error);
                        alert("❌ Erro ao ler o arquivo. Verifique se é um backup JSON válido.");
                    }
                };
                reader.readAsText(file);
                e.target.value = ''; // Limpa o input para permitir selecionar o mesmo arquivo novamente
            });
        }

        // --- 3. Ações de Análise e Editor ---

        const runBtn = document.getElementById('run-full-analysis-btn');
        if (runBtn) {
            runBtn.addEventListener('click', async () => {
                const originalText = runBtn.innerHTML;
                runBtn.innerText = 'Gerando Relatório... ⏳';
                runBtn.disabled = true;
                runBtn.classList.add('opacity-75', 'cursor-wait');

                await new Promise(resolve => setTimeout(resolve, 600));

                BuildController.generateReport('pdf');

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

        addGlobalAnimationStyles();

        // --- CORREÇÃO IMPORTANTE AQUI ---
        // Removemos a chamada para StorageService.initializeDefaultData() (que agora é vazia)
        // E chamamos o AdminService para garantir a injeção dos dados Hardcore
        if (typeof AdminService !== 'undefined') {
            AdminService.initializeMasterData();
        }
        // --------------------------------

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
        loadBuild,
        deleteBuild,
        showDashboard,
        showReport,
        showEditor,
        showHelp
    };
})();

window.App = App;