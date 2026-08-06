/**
 * js/App.js
 * Módulo principal que inicializa o aplicativo.
 * Inclui proteção contra perda de dados não salvos e suporte a i18n.
 */
const App = (() => {

    let VIEWS = {};
    let NAV_BUTTONS = {};
    let currentViewId = 'dashboard';

    // --- CONTROLE DE ALTERAÇÕES (Dirty State) ---
    let hasUnsavedChanges = false;

    // --- Helper para tradução (usa I18n se disponível, senão retorna fallback) ---
    const t = (key, fallback) => {
        if (typeof I18n !== 'undefined') return I18n.t(key, fallback);
        return fallback !== undefined ? fallback : key;
    };

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
        // --- PROTEÇÃO: Verifica se há dados não salvos antes de mudar de tela ---
        if (currentViewId === 'editor' && hasUnsavedChanges && viewId !== 'editor') {
            const confirmExit = confirm(t('alert.unsavedChanges', '⚠️ Alterações não salvas!\n\nVocê tem dados editados que serão perdidos se sair desta tela.\n\nDeseja realmente sair sem salvar?'));

            if (!confirmExit) {
                updateNavStyle('editor');
                return;
            }
            hasUnsavedChanges = false;
        }

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

    // --- Métodos de Controle de Estado (Dirty State Helpers) ---

    const markAsSaved = () => {
        hasUnsavedChanges = false;
    };

    const markAsUnsaved = () => {
        hasUnsavedChanges = true;
    };

    // Monitora inputs automaticamente na tela de editor
    const setupAutoSaveProtection = () => {
        const editorView = document.getElementById('build-editor-view');
        if (editorView) {
            editorView.addEventListener('input', () => { hasUnsavedChanges = true; });
            editorView.addEventListener('change', () => { hasUnsavedChanges = true; });
        }
    };

    // Proteção contra F5 ou Fechar Aba
    const setupBrowserProtection = () => {
        window.addEventListener('beforeunload', (e) => {
            if (currentViewId === 'editor' && hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    };

    // --- Métodos Públicos (A Ponte para o HTML) ---

    const loadBuild = (id) => {
        if (typeof BuildController !== 'undefined') {
            if (currentViewId === 'editor' && hasUnsavedChanges) {
                if (!confirm(t('alert.discardAndLoad', 'Deseja descartar as alterações atuais e carregar esta build?'))) return;
            }

            BuildController.loadBuildForEditing(id);
            markAsSaved();
            showView('editor');
        }
    };

    const deleteBuild = (id) => {
        const buildId = id.toString();
        if (confirm(t('alert.deleteBuild', 'Tem certeza que deseja excluir esta build permanentemente?'))) {
            if (typeof BuildController !== 'undefined') {
                BuildController.deleteBuild(buildId);
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
                    const name = importedBuild.name || 'Sem Nome';
                    alert(t('alert.importBuildLoaded', `Build "${name}" carregada para edição.`).replace('{name}', name));
                    window.history.replaceState(null, null, ' ');
                    hasUnsavedChanges = true;
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

    // --- Aplicar traduções nas views estáticas do DOM ---
    const applyTranslations = () => {
        if (typeof I18n === 'undefined') return;

        // Sidebar do editor
        const sidebarTitle = document.querySelector('#analysis-sidebar h3');
        if (sidebarTitle) sidebarTitle.innerHTML = t('editor.sidebar.title', '📊 Análise em Tempo Real');

        const sidebarPlaceholder = document.querySelector('#analysis-summary p.italic');
        if (sidebarPlaceholder) sidebarPlaceholder.textContent = t('editor.sidebar.placeholder', 'Adicione Gemas para iniciar...');

        const generateBtn = document.getElementById('run-full-analysis-btn');
        if (generateBtn && !generateBtn.disabled) generateBtn.textContent = t('editor.generateReport', 'Gerar Relatório Final');

        const saveCharBtn = document.getElementById('save-build-draft-btn');
        if (saveCharBtn) saveCharBtn.textContent = t('editor.saveChar', 'Salvar Personagem');

        const clearBtn = document.getElementById('clear-build-btn');
        if (clearBtn) clearBtn.textContent = t('editor.clearAll', 'Limpar Tudo');

        // Character Details
        const detailsTitle = document.querySelector('#build-editor-view .glass-panel h3');
        if (detailsTitle) detailsTitle.innerHTML = t('editor.charDetails', '👤 Detalhes do Personagem');

        const labelAvatar = document.querySelector('label[for="char-avatar"]');
        if (labelAvatar) labelAvatar.textContent = t('editor.icon', 'Ícone');

        const labelName = document.querySelector('label[for="char-name"]');
        if (labelName) labelName.textContent = t('editor.name', 'Nome');

        const inputName = document.getElementById('char-name');
        if (inputName) inputName.placeholder = t('editor.namePlaceholder', 'Ex: Eslayner');

        const labelPower = document.querySelector('label[for="char-power"]');
        if (labelPower) labelPower.textContent = t('editor.power', 'Poder');

        const inputPower = document.getElementById('char-power');
        if (inputPower) inputPower.placeholder = t('editor.powerPlaceholder', 'Ex: 15M');

        const labelArtifacts = document.querySelector('label[for="artifact-count"]');
        if (labelArtifacts) labelArtifacts.textContent = t('editor.artifacts', 'Artefatos');

        const avatarSelect = document.getElementById('char-avatar');
        if (avatarSelect) {
            const avatarKeys = [
                { val: '⚔️', key: 'avatar.warrior' },
                { val: '🏹', key: 'avatar.pvpAssist' },
                { val: '🔮', key: 'avatar.gemMage' },
                { val: '🛡️', key: 'avatar.castleDefense' },
                { val: '👑', key: 'avatar.king' },
                { val: '🐉', key: 'avatar.combatDragon' },
                { val: '💀', key: 'avatar.pvpManiac' },
                { val: '😇', key: 'avatar.farmer' }
            ];
            Array.from(avatarSelect.options).forEach(opt => {
                const mapObj = avatarKeys.find(k => k.val === opt.value);
                if (mapObj) opt.textContent = t(mapObj.key, opt.textContent);
            });
        }

        // Dashboard
        const dashTitle = document.querySelector('#dashboard-view h2');
        if (dashTitle) dashTitle.textContent = t('dashboard.title', 'Minhas Builds');

        const emptyTitle = document.querySelector('#no-builds-message h3');
        if (emptyTitle) emptyTitle.textContent = t('dashboard.empty.title', 'Comece sua Jornada!');

        const emptyDesc = document.querySelector('#no-builds-message p');
        if (emptyDesc) emptyDesc.textContent = t('dashboard.empty.desc', 'Você ainda não tem nenhuma build salva. Clique no botão abaixo ou no menu "+ Novo" para criar sua primeira estratégia.');

        const createFirstBtn = document.querySelector('#no-builds-message button[onclick]');
        if (createFirstBtn) createFirstBtn.textContent = t('dashboard.empty.createBtn', 'Criar Primeira Build');

        const dashImportBtn = document.getElementById('dash-import-btn');
        if (dashImportBtn) dashImportBtn.innerHTML = `<span>📥</span> ${t('dashboard.importBtn', 'Importar Backup').replace('📥 ', '')}`;

        // Admin
        const adminTitle = document.querySelector('#admin-view h2');
        if (adminTitle) adminTitle.innerHTML = t('admin.title', '🛠️ Painel Admin');

        const tabs = document.querySelectorAll('.admin-tab');
        const tabKeys = ['admin.tab.masterAttr', 'admin.tab.required', 'admin.tab.secondary', 'admin.tab.combos', 'admin.tab.tools'];
        tabs.forEach((tab, i) => {
            if (tabKeys[i]) tab.textContent = t(tabKeys[i], tab.textContent);
        });

        // Help
        const helpTitle = document.querySelector('#help-view h2');
        if (helpTitle) helpTitle.textContent = t('help.title', 'Guia Rápido');
        const helpSubtitle = document.querySelector('#help-view .text-center > p');
        if (helpSubtitle) helpSubtitle.textContent = t('help.subtitle', 'Domine a ferramenta em 3 passos.');

        // Footer
        const footer = document.querySelector('footer p');
        if (footer) footer.textContent = t('footer.text', '© 2025 PvP Build Analyzer. Desenvolvido para a comunidade.');

        // Se estiver no relatório, re-gera
        if (currentViewId === 'report') {
            if (typeof BuildController !== 'undefined' && BuildController.generateFinalReport) {
                BuildController.generateFinalReport();
            }
        }

        // Se estiver no dashboard, re-renderiza cards
        if (currentViewId === 'dashboard') {
            if (typeof BuildController !== 'undefined' && BuildController.refreshDashboard) {
                BuildController.refreshDashboard();
            }
        }

        // Se estiver no admin, re-renderiza as listas
        if (currentViewId === 'admin') {
            if (typeof AdminController !== 'undefined' && AdminController.initAdminView) {
                AdminController.initAdminView();
            }
        }

        // Se estiver no editor, re-renderiza a tela do editor
        if (currentViewId === 'editor') {
            if (typeof BuildController !== 'undefined' && BuildController.renderArtifactCards && BuildController.runRealTimeAnalysis) {
                BuildController.renderArtifactCards();
                BuildController.runRealTimeAnalysis();
            }
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
                        const pass = prompt(t('alert.login.placeholder', 'Digite a senha de administrador:'));
                        if (pass === StorageService.getAdminPassword()) {
                            sessionStorage.setItem('admin_session_active', 'true');
                            showView('admin');
                        } else {
                            alert(t('alert.login.wrong', 'Senha incorreta.'));
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
                    if (currentViewId === 'editor' && hasUnsavedChanges) {
                        if (!confirm(t('alert.discardAndNew', 'Deseja descartar as alterações não salvas e criar um novo?'))) return;
                    }
                    BuildController.initializeNewBuild();
                    markAsSaved();
                    showView('editor');
                }
            });
        }

        // --- 2. Botões Dashboard ---

        const dashNewBtn = document.getElementById('dash-new-build-btn');
        if (dashNewBtn) {
            dashNewBtn.addEventListener('click', () => {
                if (typeof BuildController !== 'undefined') {
                    BuildController.initializeNewBuild();
                    markAsSaved();
                    showView('editor');
                }
            });
        }

        // Botão "Importar Backup"
        const dashImportBtnEmpty = document.getElementById('dash-import-btn-empty');
        const dashImportBtnBottom = document.getElementById('dash-import-btn-bottom');
        const dashImportInput = document.getElementById('dash-import-input');

        if ((dashImportBtnEmpty || dashImportBtnBottom) && dashImportInput) {
            if (dashImportBtnEmpty) dashImportBtnEmpty.addEventListener('click', () => { dashImportInput.click(); });
            if (dashImportBtnBottom) dashImportBtnBottom.addEventListener('click', () => { dashImportInput.click(); });

            dashImportInput.addEventListener('change', (e) => {
                const file = e.target.files[0];

                if (!file) return;

                if (!file.name.toLowerCase().endsWith('.json')) {
                    alert(t('alert.importInvalidFile', '❌ Arquivo inválido!\n\nPor favor, selecione apenas o arquivo de backup com final .json'));
                    e.target.value = '';
                    return;
                }

                const reader = new FileReader();

                reader.onload = (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);

                        // Se não tiver builds, faz a importação direta
                        if (!jsonData.builds || !Array.isArray(jsonData.builds) || jsonData.builds.length === 0) {
                            if (confirm(t('alert.importConfirm', '⚠️ ATENÇÃO: Importar um backup substituirá TODAS as suas builds e configurações atuais.\n\nDeseja continuar?'))) {
                                StorageService.importAllData(jsonData);
                                alert(t('alert.importSuccess', '✅ Backup importado com sucesso! A página será recarregada.'));
                                location.reload();
                            }
                            return;
                        }

                        // Lógica Modal Avançado
                        const modal = document.getElementById('import-advanced-modal');
                        if (!modal) return;
                        
                        const listContainer = document.getElementById('import-characters-list');
                        const selectAll = document.getElementById('import-select-all');
                        const confirmBtn = document.getElementById('confirm-import-btn');
                        const closeBtns = modal.querySelectorAll('.close-import-btn');

                        // Preencher Lista
                        listContainer.innerHTML = '';
                        jsonData.builds.forEach((build, index) => {
                            const div = document.createElement('div');
                            div.className = 'flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors';
                            div.innerHTML = `
                                <input type="checkbox" id="import-char-${index}" value="${index}" class="import-char-checkbox w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" checked>
                                <label for="import-char-${index}" class="text-sm font-medium text-slate-700 cursor-pointer flex-1 select-none flex items-center gap-2">
                                    <span class="text-xl">${build.icon || '👤'}</span> 
                                    ${build.name || 'Sem Nome'} 
                                    <span class="text-xs text-slate-400">(${build.power || '0'} Poder)</span>
                                </label>
                            `;
                            listContainer.appendChild(div);
                        });

                        // Select All Event
                        selectAll.checked = true;
                        selectAll.onchange = (e) => {
                            const boxes = listContainer.querySelectorAll('.import-char-checkbox');
                            boxes.forEach(b => b.checked = e.target.checked);
                        };

                        // Fechar
                        const closeModal = () => {
                            modal.classList.add('hidden');
                        };
                        closeBtns.forEach(btn => btn.onclick = closeModal);

                        // Confirmar Importação
                        confirmBtn.onclick = () => {
                            const checkedIndexes = Array.from(listContainer.querySelectorAll('.import-char-checkbox:checked')).map(cb => parseInt(cb.value));
                            if (checkedIndexes.length === 0) {
                                alert("Selecione pelo menos um personagem para importar.");
                                return;
                            }

                            const mode = document.querySelector('input[name="import_mode"]:checked').value;
                            const buildsToImport = checkedIndexes.map(idx => jsonData.builds[idx]);

                            if (mode === 'sum') {
                                // Somar aos personagens atuais (Mesclar)
                                const currentBuilds = StorageService.loadAllBuilds();
                                
                                // Garantir IDs únicos gerando novos
                                buildsToImport.forEach(b => {
                                    b.id = Date.now() + Math.random().toString(36).substr(2, 5); // novo ID
                                    currentBuilds.push(b);
                                });
                                
                                StorageService.importAllData({ builds: currentBuilds }); // Apenas salva as builds, não toca nas regras (pois enviamos só 'builds')
                                
                            } else {
                                // Substituir Tudo
                                jsonData.builds = buildsToImport; // Filtra as builds
                                StorageService.importAllData(jsonData);
                            }

                            closeModal();
                            alert(t('alert.importSuccess', '✅ Backup importado com sucesso! A página será recarregada.'));
                            location.reload();
                        };

                        modal.classList.remove('hidden');
                    } catch (error) {
                        console.error("Erro na importação:", error);
                        alert(t('alert.importError', '❌ Erro ao ler o arquivo.\nO arquivo pode estar corrompido ou não ser um backup válido.'));
                    }
                };

                reader.readAsText(file);
                e.target.value = '';
            });
        }

        // --- 3. Ações de Análise e Editor ---

        const runBtn = document.getElementById('run-full-analysis-btn');
        if (runBtn) {
            runBtn.addEventListener('click', async () => {
                const originalText = runBtn.innerHTML;
                runBtn.innerText = t('alert.reportGenerating', 'Gerando Relatório... ⏳');
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
            if (confirm(t('alert.clearBuild', 'Limpar build atual?'))) {
                BuildController.initializeNewBuild();
                markAsSaved();
            }
        });

        const saveBtn = document.getElementById('save-build-draft-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => {
            BuildController.saveCurrentBuild(true);
            markAsSaved();
        });

        // --- 4. Listener de Mudança de Idioma ---
        document.addEventListener('languageChanged', () => {
            applyTranslations();
        });
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

        if (typeof AdminService !== 'undefined') {
            AdminService.initializeMasterData();
        }

        setupListeners();
        setupAutoSaveProtection();
        setupBrowserProtection();

        if (typeof BuildController !== 'undefined') BuildController.init();

        const isImporting = checkURLForImport();
        if (!isImporting) {
            showDashboard();
        }

        // Aplica traduções iniciais
        applyTranslations();
    };

    document.addEventListener('DOMContentLoaded', init);

    // EXPORTAÇÕES
    return {
        showView,
        loadBuild,
        deleteBuild,
        showDashboard,
        showReport,
        showEditor,
        showHelp,
        markAsSaved,
        markAsUnsaved,
        applyTranslations
    };
})();

window.App = App;