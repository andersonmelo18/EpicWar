/**
 * js/AdminService.js
 * Camada de Regra de Negócio para o Painel Admin.
 * Intermedia as ações do Controller com a persistência do StorageService.
 */
const AdminService = (() => {

    // --- Constantes Globais (Usadas pelo Renderer e Controllers) ---
    const ELEMENTS = ['fogo', 'gelo', 'luz', 'veneno'];
    
    // Raridades de Gema (conforme usado no Renderer)
    const RARITIES = ['Comum', 'Raro', 'Épico', 'Legendário']; 
    
    // Níveis de Remodelação/Qualidade de atributo
    const REMODELS = ['normal', 'raro', 'perfeito', 'epico', 'lendario', 'mitico'];

    // --- Inicialização ---

    const initializeMasterData = () => {
        // Apenas garante que o StorageService preparou o terreno
        // Se quiser adicionar dados de exemplo (seed), faria aqui.
        StorageService.initializeDefaultData();
    };

    // --- Lógica: Atributos Mestres ---

    const saveMasterAttribute = (attrData) => {
        const attributes = StorageService.loadMasterAttributes();
        
        if (attrData.id) {
            // Edição: Encontra e substitui
            const index = attributes.findIndex(a => a.id === attrData.id);
            if (index !== -1) {
                attributes[index] = attrData;
            }
        } else {
            // Criação: Gera ID novo e adiciona
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
        
        // Opcional: Limpar também dos Requisitos se for deletado
        // (Isso mantém a integridade dos dados)
        let required = StorageService.loadRequiredAttributes();
        const initialReqLength = required.length;
        required = required.filter(r => r.attribute_id !== id);
        if (required.length !== initialReqLength) {
            StorageService.saveRequiredAttributes(required);
        }
    };

    // --- Lógica: Atributos Requeridos ---

    const addRequiredAttribute = (attributeId) => {
        const required = StorageService.loadRequiredAttributes();
        
        // Evita duplicatas
        if (required.some(r => r.attribute_id === attributeId)) {
            alert("Este atributo já está na lista de requisitos.");
            return;
        }

        const newReq = {
            id: Date.now(),
            attribute_id: attributeId
        };
        
        required.push(newReq);
        StorageService.saveRequiredAttributes(required);
    };

    const deleteRequiredAttribute = (reqId) => {
        let required = StorageService.loadRequiredAttributes();
        required = required.filter(r => r.id !== reqId);
        StorageService.saveRequiredAttributes(required);
    };

    // --- Lógica: Combos Recomendados ---

    const saveRecommendedCombo = (comboData) => {
        const combos = StorageService.loadRecommendedCombos();

        if (comboData.id) {
            // Edição
            const index = combos.findIndex(c => c.id === comboData.id);
            if (index !== -1) {
                combos[index] = comboData;
            }
        } else {
            // Criação
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

    // --- Exportação Pública ---

    return {
        // Constantes
        ELEMENTS,
        RARITIES,
        REMODELS,
        
        // Inicialização
        initializeMasterData,

        // Atributos Mestres
        saveMasterAttribute, // <--- A função que estava faltando!
        deleteMasterAttribute,

        // Atributos Requeridos
        addRequiredAttribute,
        deleteRequiredAttribute,

        // Combos
        saveRecommendedCombo,
        deleteRecommendedCombo
    };
})();