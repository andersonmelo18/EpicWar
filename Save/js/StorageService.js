/**
 * js/StorageService.js
 * Responsável APENAS por ler e gravar no LocalStorage do navegador.
 * (A inicialização de dados padrão agora é responsabilidade exclusiva do AdminService.js)
 */
const StorageService = (() => {

    const KEYS = {
        BUILDS: 'pvp_builds',
        MASTER_ATTRIBUTES: 'master_attributes',
        REQUIRED_ATTRIBUTES: 'required_attributes',
        SECONDARY_ATTRIBUTES: 'secondary_attributes', // Mantido
        RECOMMENDED_COMBOS: 'recommended_combos',
        GLOBAL_NOTES: 'global_pvp_notes', // Mantido
        ADMIN_PASS: 'app_admin_password'
    };

    // --- Helpers Genéricos ---
    const getData = (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    };

    const saveData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // --- BUILDS (Lógica mantida igual a sua) ---
    const loadAllBuilds = () => getData(KEYS.BUILDS);
    
    const loadBuildById = (id) => (loadAllBuilds().find(b => b.id.toString() === id.toString()) || null);

    const saveBuild = (build) => {
        const builds = loadAllBuilds();
        if (!build.id) { build.id = Date.now(); build.createdAt = new Date().toISOString(); }
        build.lastUpdated = new Date().toISOString();
        
        const index = builds.findIndex(b => b.id.toString() === build.id.toString());
        if (index >= 0) builds[index] = build;
        else builds.push(build);
        
        saveData(KEYS.BUILDS, builds);
        return build;
    };

    const deleteBuild = (id) => {
        let builds = loadAllBuilds();
        const initialLength = builds.length;
        // Conversão para string para garantir compatibilidade
        builds = builds.filter(b => b.id.toString() !== id.toString());
        saveData(KEYS.BUILDS, builds);
        return builds.length < initialLength;
    };

    // --- ATRIBUTOS E REGRAS (Apenas Getters/Setters, sem listas fixas) ---
    
    // Master
    const loadMasterAttributes = () => getData(KEYS.MASTER_ATTRIBUTES);
    const saveMasterAttributes = (data) => saveData(KEYS.MASTER_ATTRIBUTES, data);

    // Required (Essenciais)
    const loadRequiredAttributes = () => getData(KEYS.REQUIRED_ATTRIBUTES);
    const saveRequiredAttributes = (data) => saveData(KEYS.REQUIRED_ATTRIBUTES, data);

    // Secondary (Opcionais)
    const loadSecondaryAttributes = () => getData(KEYS.SECONDARY_ATTRIBUTES);
    const saveSecondaryAttributes = (data) => saveData(KEYS.SECONDARY_ATTRIBUTES, data);

    // Combos
    const loadRecommendedCombos = () => getData(KEYS.RECOMMENDED_COMBOS);
    const saveRecommendedCombos = (data) => saveData(KEYS.RECOMMENDED_COMBOS, data);

    // Notas Globais
    const loadGlobalNotes = () => localStorage.getItem(KEYS.GLOBAL_NOTES) || "Dicas gerais para PvP: Mantenha seus atributos essenciais em dia. Caso haja duplicatas, fique atento a troca procure sempre manter os atributos que estão em SSR, mais caso o seu duplicado esteja em um SS ou Inferior com Remodelação Mítica ele vai se destacar nos resultados, então deixe para troca-lo apenas quando seu atributo que virá a ser principal ficar Mítico !";
    const saveGlobalNotes = (text) => localStorage.setItem(KEYS.GLOBAL_NOTES, text);

    // --- SEGURANÇA ---
    const getAdminPassword = () => localStorage.getItem(KEYS.ADMIN_PASS) || 'admin';
    const setAdminPassword = (newPassword) => localStorage.setItem(KEYS.ADMIN_PASS, newPassword);

    // --- IMPORT/EXPORT/RESET ---
    
    const exportAllData = () => {
        return {
            builds: loadAllBuilds(),
            masterAttributes: loadMasterAttributes(),
            requiredAttributes: loadRequiredAttributes(),
            secondaryAttributes: loadSecondaryAttributes(),
            recommendedCombos: loadRecommendedCombos(),
            globalNotes: loadGlobalNotes(),
            exportedAt: new Date().toISOString()
        };
    };

    const importAllData = (jsonData) => {
        if (jsonData.builds) saveData(KEYS.BUILDS, jsonData.builds);
        if (jsonData.masterAttributes) saveData(KEYS.MASTER_ATTRIBUTES, jsonData.masterAttributes);
        if (jsonData.requiredAttributes) saveData(KEYS.REQUIRED_ATTRIBUTES, jsonData.requiredAttributes);
        if (jsonData.secondaryAttributes) saveData(KEYS.SECONDARY_ATTRIBUTES, jsonData.secondaryAttributes);
        if (jsonData.recommendedCombos) saveData(KEYS.RECOMMENDED_COMBOS, jsonData.recommendedCombos);
        if (jsonData.globalNotes) saveGlobalNotes(jsonData.globalNotes);
    };

    const clearAllData = () => {
        localStorage.clear();
        // A recriação dos dados agora acontecerá automaticamente
        // quando a página recarregar, graças ao AdminService.js
    };

    // --- FUNÇÃO VAZIA PARA COMPATIBILIDADE ---
    // Mantemos ela vazia para não quebrar códigos antigos que a chamem,
    // mas ela não faz nada porque o AdminService assumiu o controle.
    const initializeDefaultData = () => { };

    return {
        initializeDefaultData, // Mantido vazio para compatibilidade
        
        loadAllBuilds,
        loadBuildById,
        getBuildById: loadBuildById, // Alias que você pediu
        saveBuild,
        deleteBuild,
        
        loadMasterAttributes,
        saveMasterAttributes,
        
        loadRequiredAttributes,
        saveRequiredAttributes,
        
        loadSecondaryAttributes,
        saveSecondaryAttributes,
        
        loadRecommendedCombos,
        saveRecommendedCombos,
        
        loadGlobalNotes,
        saveGlobalNotes,
        
        getAdminPassword,
        setAdminPassword,
        
        exportAllData,
        importAllData,
        clearAllData
    };
})();