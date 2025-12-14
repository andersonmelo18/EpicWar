/**
 * Controlador de eventos e renderização para o Painel Admin.
 * Depende de: StorageService, AdminService, Renderer.
 */
const AdminController = (() => {

    const DOM = {
        adminView: document.getElementById('admin-view'),
        tabsContainer: document.querySelector('#admin-view .flex.border-b'),
        contentArea: document.getElementById('admin-content-area'),
        // Abas
        masterAttributesTab: document.getElementById('master-attributes-tab'),
        requiredAttributesTab: document.getElementById('required-attributes-tab'),
        secondaryAttributesTab: document.getElementById('secondary-attributes-tab'),
        recommendedCombosTab: document.getElementById('recommended-combos-tab'),
        toolsTab: document.getElementById('tools-tab'),
        // Botões de Adicionar
        addMasterAttributeBtn: document.getElementById('add-master-attribute-btn'),
        addRequiredAttributeBtn: document.getElementById('add-required-attribute-btn'),
        addSecondaryAttributeBtn: document.getElementById('add-secondary-attribute-btn'),
        addComboBtn: document.getElementById('add-combo-btn'),
        saveNotesBtn: document.getElementById('save-notes-btn'),
        // Listas (Containers)
        masterAttributesList: document.getElementById('master-attributes-list'),
        requiredAttributesList: document.getElementById('required-attributes-list'),
        secondaryAttributesList: document.getElementById('secondary-attributes-list'),
        recommendedCombosList: document.getElementById('recommended-combos-list'),
        // Ferramentas
        importDataFile: document.getElementById('import-data-file'),
        importDataBtn: document.getElementById('import-data-btn'),
        exportAllDataBtn: document.getElementById('export-all-data-btn'),
        clearAllDataBtn: document.getElementById('clear-all-data-btn'),
        globalNotesArea: document.getElementById('global-notes'),
        changePasswordBtn: document.getElementById('change-password-btn'),
        newPasswordInput: document.getElementById('new-admin-password')
    };

    let currentTab = 'master-attributes';

    // --- Lógica de Navegação das Abas (VISUAL MODERNO) ---

    const switchTab = (tabId) => {
        currentTab = tabId;

        // Esconde todos os conteúdos
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Reseta estilo de todos os botões (para o estado inativo)
        document.querySelectorAll('.admin-tab').forEach(btn => {
            // Remove classes ativas
            btn.classList.remove('text-indigo-600', 'border-indigo-600', 'bg-white', 'font-semibold');
            // Adiciona classes inativas
            btn.classList.add('text-slate-500', 'border-transparent', 'font-medium');
        });

        // Mostra o conteúdo selecionado
        const selectedContent = document.getElementById(`${tabId}-tab`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }

        // Ativa o botão selecionado
        const selectedBtn = document.querySelector(`.admin-tab[data-tab="${tabId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.remove('text-slate-500', 'border-transparent', 'font-medium');
            selectedBtn.classList.add('text-indigo-600', 'border-indigo-600', 'bg-white', 'font-semibold');
        }

        refreshAdminView();
    };

    // --- Renderização Geral ---

    const refreshAdminView = () => {
        const masterAttributes = StorageService.loadMasterAttributes();
        const requiredAttributes = StorageService.loadRequiredAttributes();
        const secondaryAttributes = StorageService.loadSecondaryAttributes();
        const combos = StorageService.loadRecommendedCombos();

        if (currentTab === 'master-attributes') {
            Renderer.renderMasterAttributesList(masterAttributes);
        } else if (currentTab === 'required-attributes') {
            Renderer.renderRequiredAttributesList(requiredAttributes, masterAttributes);
        } else if (currentTab === 'secondary-attributes') {
            Renderer.renderSecondaryAttributesList(secondaryAttributes, masterAttributes);
        } else if (currentTab === 'recommended-combos') {
            Renderer.renderRecommendedCombosList(combos, masterAttributes);
        }
    };

    const closeModal = (modalId = 'admin-modal') => {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    };

    // --- CRUD Atributos Mestres ---

    const handleSaveMasterAttribute = (e) => {
        e.preventDefault();
        const form = e.target;
        const id = form.querySelector('#master-attr-id').value;

        const attributeData = {
            id: id ? parseInt(id) : null,
            name: form.querySelector('#master-attr-name').value,
            tier: parseInt(form.querySelector('#master-attr-tier').value),
            default_element: form.querySelector('#master-attr-element').value || null,
        };

        AdminService.saveMasterAttribute(attributeData);
        closeModal();
        refreshAdminView();
    };

    const handleDeleteMasterAttribute = (id) => {
        if (confirm("Tem certeza que deseja deletar este Atributo Mestre? Isso pode afetar builds salvas.")) {
            AdminService.deleteMasterAttribute(id);
            refreshAdminView();
        }
    };

    // --- CRUD Atributos Requeridos ---

    const handleSaveRequiredAttribute = (e) => {
        e.preventDefault();
        const form = e.target;
        const attribute_id = parseInt(form.querySelector('#required-attr-id').value);

        // --- MUDANÇA AQUI: Captura se o checkbox "Urgente" está marcado ---
        const isUrgent = form.querySelector('#required-attr-urgent').checked;

        if (!attribute_id) {
            alert('Selecione um atributo mestre.');
            return;
        }

        // Passa o ID e a flag de Urgência para o serviço
        AdminService.addRequiredAttribute(attribute_id, isUrgent);

        closeModal();
        refreshAdminView();
    };

    const handleDeleteRequiredAttribute = (id) => {
        if (confirm("Tem certeza que deseja remover este atributo da lista de requisitos PvP?")) {
            AdminService.deleteRequiredAttribute(id);
            refreshAdminView();
        }
    };

    // --- CRUD Atributos Secundários ---

    const handleSaveSecondaryAttribute = (e) => {
        e.preventDefault();
        const form = e.target;
        const attribute_id = parseInt(form.querySelector('#secondary-attr-id').value);

        if (!attribute_id) {
            alert('Selecione um atributo mestre.');
            return;
        }

        AdminService.addSecondaryAttribute(attribute_id);
        closeModal();
        refreshAdminView();
    };

    const handleDeleteSecondaryAttribute = (id) => {
        if (confirm("Remover da lista de Secundários/Suporte?")) {
            AdminService.deleteSecondaryAttribute(id);
            refreshAdminView();
        }
    };

    // --- CRUD Combos Recomendados ---

    const handleSaveCombo = (e) => {
        e.preventDefault();
        const form = e.target;
        const id = form.querySelector('#combo-id').value;
        const attributeSelect = form.querySelector('#combo-attributes');

        const attribute_ids = Array.from(attributeSelect.options)
            .filter(option => option.selected)
            .map(option => parseInt(option.value));

        if (attribute_ids.length < 1) {
            alert('Selecione pelo menos um Atributo Mestre para o combo.');
            return;
        }

        const comboData = {
            id: id ? parseInt(id) : null,
            name: form.querySelector('#combo-name').value,
            rarity: form.querySelector('#combo-rarity').value,
            plus_level: parseInt(form.querySelector('#combo-plus-level').value),
            attribute_ids: attribute_ids
        };

        AdminService.saveRecommendedCombo(comboData);
        closeModal();
        refreshAdminView();
    };

    const handleDeleteCombo = (id) => {
        if (confirm("Tem certeza que deseja deletar este Combo Recomendado?")) {
            AdminService.deleteRecommendedCombo(id);
            refreshAdminView();
        }
    };

    // --- Ferramentas ---

    const handleExportData = () => {
        const data = StorageService.exportAllData();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "pvp_build_analyzer_data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        alert('Dados exportados com sucesso!');
    };

    const handleImportData = () => {
        const fileInput = DOM.importDataFile;
        const file = fileInput.files[0];

        if (!file) {
            alert('Selecione um arquivo JSON para importar.');
            return;
        }

        if (!confirm('ATENÇÃO: A importação irá SOBRESCREVER TODOS os dados. Deseja continuar?')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const importedData = JSON.parse(event.target.result);
                StorageService.importAllData(importedData);
                alert('Dados importados com sucesso! Recarregando painel.');
                refreshAdminView();
                if (DOM.globalNotesArea) DOM.globalNotesArea.value = StorageService.loadGlobalNotes();
                fileInput.value = '';
            } catch (e) {
                alert('Erro ao processar o arquivo JSON.');
                console.error('Erro de importação:', e);
            }
        };
        reader.readAsText(file);
    };

    const handleClearAllData = () => {
        if (confirm("ALERTA MÁXIMO: Limpar TUDO? Essa ação é irreversível.")) {
            StorageService.clearAllData();
            alert('Dados apagados. Recarregando.');
            refreshAdminView();
            if (DOM.globalNotesArea) DOM.globalNotesArea.value = StorageService.loadGlobalNotes();
        }
    };

    // --- Listeners ---

    const attachListeners = () => {
        if (!DOM.adminView) return;

        // 1. Navegação
        DOM.tabsContainer.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.admin-tab');
            if (tabBtn) {
                switchTab(tabBtn.dataset.tab);
            }
        });

        // 2. Master Attributes
        DOM.addMasterAttributeBtn.addEventListener('click', () => {
            Renderer.renderMasterAttributeModal();
            Renderer.attachModalCloseListeners();
            document.getElementById('master-attribute-form').addEventListener('submit', handleSaveMasterAttribute);
            document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
        });

        DOM.masterAttributesList.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (e.target.dataset.action === 'edit-master-attr') {
                const attr = StorageService.loadMasterAttributes().find(a => a.id === parseInt(id));
                Renderer.renderMasterAttributeModal(attr);
                Renderer.attachModalCloseListeners();
                document.getElementById('master-attribute-form').addEventListener('submit', handleSaveMasterAttribute);
                document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
            } else if (e.target.dataset.action === 'delete-master-attr') {
                handleDeleteMasterAttribute(parseInt(id));
            }
        });

        // 3. Required Attributes
        DOM.addRequiredAttributeBtn.addEventListener('click', () => {
            const masterAttributes = StorageService.loadMasterAttributes();
            Renderer.renderRequiredAttributeModal(masterAttributes);
            Renderer.attachModalCloseListeners();
            document.getElementById('required-attribute-form').addEventListener('submit', handleSaveRequiredAttribute);
            document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
        });

        DOM.requiredAttributesList.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'delete-required-attr') {
                handleDeleteRequiredAttribute(parseInt(e.target.dataset.id));
            }
        });

        // 4. Secondary Attributes
        if (DOM.addSecondaryAttributeBtn) {
            DOM.addSecondaryAttributeBtn.addEventListener('click', () => {
                const masterAttributes = StorageService.loadMasterAttributes();
                Renderer.renderSecondaryAttributeModal(masterAttributes);
                Renderer.attachModalCloseListeners();
                document.getElementById('secondary-attribute-form').addEventListener('submit', handleSaveSecondaryAttribute);
                document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
            });
        }

        if (DOM.secondaryAttributesList) {
            DOM.secondaryAttributesList.addEventListener('click', (e) => {
                if (e.target.dataset.action === 'delete-secondary-attr') {
                    handleDeleteSecondaryAttribute(parseInt(e.target.dataset.id));
                }
            });
        }

        // 5. Combos
        DOM.addComboBtn.addEventListener('click', () => {
            const masterAttributes = StorageService.loadMasterAttributes();
            Renderer.renderRecommendedComboModal(masterAttributes);
            Renderer.attachModalCloseListeners();
            document.getElementById('combo-form').addEventListener('submit', handleSaveCombo);
            document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
        });

        DOM.recommendedCombosList.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const masterAttributes = StorageService.loadMasterAttributes();

            if (e.target.dataset.action === 'edit-combo') {
                const combo = StorageService.loadRecommendedCombos().find(c => c.id === parseInt(id));
                Renderer.renderRecommendedComboModal(masterAttributes, combo);
                Renderer.attachModalCloseListeners();
                document.getElementById('combo-form').addEventListener('submit', handleSaveCombo);
                document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
            } else if (e.target.dataset.action === 'delete-combo') {
                handleDeleteCombo(parseInt(id));
            }
        });

        // 6. Ferramentas e Modal Close
        DOM.exportAllDataBtn.addEventListener('click', handleExportData);

        // Novo listener para o botão de upload customizado
        const mockImportBtn = document.getElementById('import-mock-btn');
        if (mockImportBtn) {
            mockImportBtn.addEventListener('click', () => DOM.importDataFile.click());
        }

        // Listener original do input file (caso mude)
        DOM.importDataFile.addEventListener('change', handleImportData);

        DOM.clearAllDataBtn.addEventListener('click', handleClearAllData);

        if (DOM.saveNotesBtn) {
            DOM.saveNotesBtn.addEventListener('click', () => {
                const text = DOM.globalNotesArea ? DOM.globalNotesArea.value : '';
                StorageService.saveGlobalNotes(text);
                alert("Observações atualizadas com sucesso!");
            });
        }

        // Listener para Trocar Senha (ADICIONADO)
        if (DOM.changePasswordBtn) {
            DOM.changePasswordBtn.addEventListener('click', () => {
                const newPass = DOM.newPasswordInput.value;
                if (newPass && newPass.length >= 3) {
                    StorageService.setAdminPassword(newPass);
                    alert("Senha de administrador alterada com sucesso!");
                    DOM.newPasswordInput.value = '';
                } else {
                    alert("A senha deve ter pelo menos 3 caracteres.");
                }
            });
        }

        document.getElementById('modals-container').addEventListener('click', (e) => {
            if (e.target.id === 'close-admin-modal-btn') {
                closeModal();
            }
        });
    };

    const initAdminView = () => {
        if (DOM.globalNotesArea && StorageService.loadGlobalNotes) {
            DOM.globalNotesArea.value = StorageService.loadGlobalNotes();
        }
        switchTab(currentTab);
        attachListeners();
    };

    return {
        initAdminView,
        refreshAdminView
    };
})();