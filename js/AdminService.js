/**
 * js/AdminService.js
 * Camada de Regra de Negócio para o Painel Admin.
 * Intermedia as ações do Controller com a persistência do StorageService.
 */
const AdminService = (() => {

    // --- Constantes Globais ---
    const ELEMENTS = ['fogo', 'gelo', 'luz', 'veneno'];
    const RARITIES = [
        'Comum',
        'Raro',
        'Extra',
        'Perfeito',
        'Epico',
        'Lendario',
        'Mitico'
    ];


    // Níveis de Remodelação/Qualidade de atributo
    const REMODELS = [
        'comum',
        'raro',
        'extra',
        'perfeito',
        'epico',
        'lendario',
        'mitico'
    ];

    // --- Inicialização ---

    const initializeMasterData = () => {
        StorageService.initializeDefaultData();
    };

    // --- Lógica: Atributos Mestres ---

    const saveMasterAttribute = (attrData) => {
        let attributes = StorageService.loadMasterAttributes();

        if (attrData.id) {
            // Edição
            const index = attributes.findIndex(a => a.id === attrData.id);
            if (index !== -1) attributes[index] = attrData;
        } else {
            // Criação
            attrData.id = Date.now();
            attributes.push(attrData);
        }

        StorageService.saveMasterAttributes(attributes);
        return attrData;
    };

    const deleteMasterAttribute = (id) => {
        let attributes = StorageService.loadMasterAttributes();
        attributes = attributes.filter(a => a.id !== id);
        StorageService.saveMasterAttributes(attributes);

        // Limpeza em cascata (remove de requeridos e secundários)
        cleanUpDeletedAttribute(id);
    };

    /**
     * Remove referências a um atributo mestre deletado de outras listas.
     */
    const cleanUpDeletedAttribute = (masterId) => {
        // Remove dos requeridos
        let required = StorageService.loadRequiredAttributes();
        const initialReqLength = required.length;
        required = required.filter(r => r.attribute_id !== masterId);
        if (required.length !== initialReqLength) StorageService.saveRequiredAttributes(required);

        // Remove dos secundários
        let secondary = StorageService.loadSecondaryAttributes();
        const initialSecLength = secondary.length;
        secondary = secondary.filter(s => s.attribute_id !== masterId);
        if (secondary.length !== initialSecLength) StorageService.saveSecondaryAttributes(secondary);
    };

    // --- Lógica: Atributos Requeridos ---

    const addRequiredAttribute = (attributeId, isUrgent = false) => {
        // 1. Carrega a lista completa
        const required = StorageService.loadRequiredAttributes();

        // 2. Verifica duplicatas
        if (required.some(r => r.attribute_id === attributeId)) {
            alert("Este atributo já está na lista de requisitos.");
            return;
        }

        // 3. Verifica conflito com Secundários e remove se necessário
        const secondary = StorageService.loadSecondaryAttributes();
        if (secondary.some(s => s.attribute_id === attributeId)) {
            if (!confirm("Este atributo está na lista de Secundários. Deseja movê-lo para Essencial?")) return;

            // LÓGICA SIMPLIFICADA: Remove direto, sem depender de função externa
            const newSecondary = secondary.filter(s => s.attribute_id !== attributeId);
            StorageService.saveSecondaryAttributes(newSecondary);
        }

        // 4. Adiciona o novo requisito com a flag URGENTE
        required.push({
            id: Date.now(),
            attribute_id: attributeId,
            isUrgent: isUrgent // <--- Salva a urgência
        });

        // 5. Salva a lista toda
        StorageService.saveRequiredAttributes(required);
    };

    const deleteRequiredAttribute = (reqId) => {
        let required = StorageService.loadRequiredAttributes();
        required = required.filter(r => r.id !== reqId);
        StorageService.saveRequiredAttributes(required);
    };

    // --- Lógica: Atributos Secundários (NOVO) ---

    const addSecondaryAttribute = (attributeId) => {
        const secondary = StorageService.loadSecondaryAttributes();

        // Validação 1: Duplicata
        if (secondary.some(s => s.attribute_id === attributeId)) {
            alert("Este atributo já está na lista de secundários.");
            return;
        }

        // Validação 2: Conflito com Essencial
        const required = StorageService.loadRequiredAttributes();
        if (required.some(r => r.attribute_id === attributeId)) {
            alert("Este atributo já é um Requisito Essencial. Remova-o de lá primeiro.");
            return;
        }

        secondary.push({
            id: Date.now(),
            attribute_id: attributeId
        });

        StorageService.saveSecondaryAttributes(secondary);
    };

    const deleteSecondaryAttribute = (id) => {
        let secondary = StorageService.loadSecondaryAttributes();
        secondary = secondary.filter(s => s.id !== id);
        StorageService.saveSecondaryAttributes(secondary);
    };

    // Helper interno para mover de lista
    const deleteSecondaryAttributeByAttrId = (attrId) => {
        let secondary = StorageService.loadSecondaryAttributes();
        secondary = secondary.filter(s => s.attribute_id !== attrId);
        StorageService.saveSecondaryAttributes(secondary);
    };

    // --- Lógica: Combos Recomendados ---

    const saveRecommendedCombo = (comboData) => {
        let combos = StorageService.loadRecommendedCombos();

        if (comboData.id) {
            const index = combos.findIndex(c => c.id === comboData.id);
            if (index !== -1) combos[index] = comboData;
        } else {
            comboData.id = Date.now();
            combos.push(comboData);
        }

        StorageService.saveRecommendedCombos(combos);
    };

    const deleteRecommendedCombo = (id) => {
        let combos = StorageService.loadRecommendedCombos();
        combos = combos.filter(c => c.id !== id);
        StorageService.saveRecommendedCombos(combos);
    };

    return {
        ELEMENTS,
        RARITIES,
        REMODELS,
        initializeMasterData,
        saveMasterAttribute,
        deleteMasterAttribute,
        addRequiredAttribute,
        deleteRequiredAttribute,
        addSecondaryAttribute,    // <--- Função Exportada
        deleteSecondaryAttribute, // <--- Função Exportada
        saveRecommendedCombo,
        deleteRecommendedCombo
    };
})();