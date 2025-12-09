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
        recommendedCombosTab: document.getElementById('recommended-combos-tab'),
        toolsTab: document.getElementById('tools-tab'),
        // Botões
        addMasterAttributeBtn: document.getElementById('add-master-attribute-btn'),
        addRequiredAttributeBtn: document.getElementById('add-required-attribute-btn'),
        addComboBtn: document.getElementById('add-combo-btn'),
        // Listas
        masterAttributesList: document.getElementById('master-attributes-list'),
        requiredAttributesList: document.getElementById('required-attributes-list'),
        recommendedCombosList: document.getElementById('recommended-combos-list'),
        // Ferramentas
        importDataFile: document.getElementById('import-data-file'),
        importDataBtn: document.getElementById('import-data-btn'),
        exportAllDataBtn: document.getElementById('export-all-data-btn'),
        clearAllDataBtn: document.getElementById('clear-all-data-btn'),
    };

    let currentTab = 'master-attributes';

    // --- Lógica de Navegação das Abas ---

    /**
     * Alterna a aba ativa no painel admin.
     * @param {string} tabId - O ID da aba (ex: 'master-attributes').
     */
    const switchTab = (tabId) => {
        currentTab = tabId;
        
        // 1. Esconde todo o conteúdo e desativa todos os botões da aba
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.querySelectorAll('.admin-tab').forEach(btn => {
            btn.classList.remove('bg-indigo-50', 'text-indigo-700');
            btn.classList.add('text-gray-600', 'hover:bg-gray-50');
        });

        // 2. Mostra o conteúdo da aba selecionada e ativa o botão
        const selectedContent = document.getElementById(`${tabId}-tab`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }

        const selectedBtn = document.querySelector(`.admin-tab[data-tab="${tabId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('bg-indigo-50', 'text-indigo-700');
            selectedBtn.classList.remove('text-gray-600', 'hover:bg-gray-50');
        }

        // 3. Atualiza a renderização específica da aba
        refreshAdminView();
    };

    // --- Renderização Geral ---

    /**
     * Recarrega os dados e renderiza as listas na aba ativa.
     */
    const refreshAdminView = () => {
        const masterAttributes = StorageService.loadMasterAttributes();
        const requiredAttributes = StorageService.loadRequiredAttributes();
        const combos = StorageService.loadRecommendedCombos();

        if (currentTab === 'master-attributes') {
            Renderer.renderMasterAttributesList(masterAttributes);
        } else if (currentTab === 'required-attributes') {
            Renderer.renderRequiredAttributesList(requiredAttributes, masterAttributes);
        } else if (currentTab === 'recommended-combos') {
            Renderer.renderRecommendedCombosList(combos, masterAttributes);
        }
    };
    
    // --- Funções Auxiliares de Modal ---
    
    const closeModal = (modalId = 'admin-modal') => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
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

        if (!attribute_id) {
            alert('Selecione um atributo mestre.');
            return;
        }

        AdminService.addRequiredAttribute(attribute_id);
        closeModal();
        refreshAdminView();
    };

    const handleDeleteRequiredAttribute = (id) => {
        if (confirm("Tem certeza que deseja remover este atributo da lista de requisitos PvP?")) {
            AdminService.deleteRequiredAttribute(id);
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

    // --- Funções de Ferramentas (Import/Export/Clear) ---

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

        if (!confirm('ATENÇÃO: A importação irá SOBRESCREVER TODOS os dados mestres e builds salvas. Deseja continuar?')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                StorageService.importAllData(importedData);
                alert('Dados importados com sucesso! Recarregando painel.');
                refreshAdminView();
                // Limpa o input de arquivo para permitir nova importação do mesmo arquivo
                fileInput.value = ''; 
            } catch (e) {
                alert('Erro ao processar o arquivo JSON. Verifique o formato.');
                console.error('Erro de importação:', e);
            }
        };
        reader.readAsText(file);
    };

    const handleClearAllData = () => {
        if (confirm("ALERTA MÁXIMO: Você está prestes a limpar TODAS as builds, atributos e configurações. ESTA AÇÃO É IRREVERSÍVEL. Deseja prosseguir?")) {
            StorageService.clearAllData();
            alert('Todos os dados foram apagados. Recarregando o painel.');
            refreshAdminView();
        }
    };

    // --- Inicialização (Adição de Listeners) ---

    const attachListeners = () => {
        if (!DOM.adminView) return;

        // 1. Navegação por Abas
        DOM.tabsContainer.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.admin-tab');
            if (tabBtn) {
                switchTab(tabBtn.dataset.tab);
            }
        });

        // 2. CRUD Master Attributes (ADICIONAR)
        DOM.addMasterAttributeBtn.addEventListener('click', () => {
            Renderer.renderMasterAttributeModal();
            Renderer.attachModalCloseListeners(); // <--- ADICIONADO AQUI
            document.getElementById('master-attribute-form').addEventListener('submit', handleSaveMasterAttribute);
            document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
        });

        // CRUD Master Attributes (EDITAR)
        DOM.masterAttributesList.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (e.target.dataset.action === 'edit-master-attr') {
                const attr = StorageService.loadMasterAttributes().find(a => a.id === parseInt(id));
                Renderer.renderMasterAttributeModal(attr);
                Renderer.attachModalCloseListeners(); // <--- ADICIONADO AQUI
                document.getElementById('master-attribute-form').addEventListener('submit', handleSaveMasterAttribute);
                document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
            } else if (e.target.dataset.action === 'delete-master-attr') {
                handleDeleteMasterAttribute(parseInt(id));
            }
        });
        
        // 3. CRUD Required Attributes (ADICIONAR)
        DOM.addRequiredAttributeBtn.addEventListener('click', () => {
            const masterAttributes = StorageService.loadMasterAttributes();
            Renderer.renderRequiredAttributeModal(masterAttributes);
            Renderer.attachModalCloseListeners(); // <--- ADICIONADO AQUI
            document.getElementById('required-attribute-form').addEventListener('submit', handleSaveRequiredAttribute);
            document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
        });

        DOM.requiredAttributesList.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'delete-required-attr') {
                handleDeleteRequiredAttribute(parseInt(e.target.dataset.id));
            }
        });

        // 4. CRUD Recommended Combos (ADICIONAR)
        DOM.addComboBtn.addEventListener('click', () => {
            const masterAttributes = StorageService.loadMasterAttributes();
            Renderer.renderRecommendedComboModal(masterAttributes);
            Renderer.attachModalCloseListeners(); // <--- ADICIONADO AQUI
            document.getElementById('combo-form').addEventListener('submit', handleSaveCombo);
            document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
        });
        
        // CRUD Recommended Combos (EDITAR)
        DOM.recommendedCombosList.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const masterAttributes = StorageService.loadMasterAttributes();

            if (e.target.dataset.action === 'edit-combo') {
                const combo = StorageService.loadRecommendedCombos().find(c => c.id === parseInt(id));
                Renderer.renderRecommendedComboModal(masterAttributes, combo);
                Renderer.attachModalCloseListeners(); // <--- ADICIONADO AQUI
                document.getElementById('combo-form').addEventListener('submit', handleSaveCombo);
                document.getElementById('close-admin-modal-btn').addEventListener('click', closeModal);
            } else if (e.target.dataset.action === 'delete-combo') {
                handleDeleteCombo(parseInt(id));
            }
        });

        // 5. Ferramentas
        DOM.exportAllDataBtn.addEventListener('click', handleExportData);
        DOM.importDataBtn.addEventListener('click', handleImportData);
        DOM.clearAllDataBtn.addEventListener('click', handleClearAllData);

        // Listener global para fechar modais se clicado no botão de fechar (X)
        document.getElementById('modals-container').addEventListener('click', (e) => {
            if (e.target.id === 'close-admin-modal-btn') {
                closeModal();
            }
        });
    };

    /**
     * Ponto de entrada para a view admin.
     */
    const initAdminView = () => {
        // Garante que a primeira aba esteja ativa e renderizada
        switchTab(currentTab); 
        attachListeners();
    };

    return {
        initAdminView,
        refreshAdminView
    };
})();