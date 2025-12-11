/**
 * js/StorageService.js
 * Gerencia o salvamento local e carrega os dados padrão (Seed) para novos usuários.
 */
const StorageService = (() => {

    const KEYS = {
        BUILDS: 'pvp_builds',
        MASTER_ATTRIBUTES: 'master_attributes',
        REQUIRED_ATTRIBUTES: 'required_attributes',
        SECONDARY_ATTRIBUTES: 'secondary_attributes', // <--- NOVO: Chave para secundários
        RECOMMENDED_COMBOS: 'recommended_combos',
        GLOBAL_NOTES: 'global_pvp_notes' // <--- NOVO: Chave para notas globais

    };

    // =================================================================
    // ÁREA DE DADOS PADRÃO (SEED DATA)
    // =================================================================

    const DEFAULT_MASTER_ATTRIBUTES = [
        // ============================
        // TIER 3 (já estavam corretos)
        // ============================
        { "id": 1765207358906, "name": "Tirano", "tier": 3, "default_element": "fogo" },
        { "id": 1765207381869, "name": "Benção de Deus", "tier": 3, "default_element": "luz" },
        { "id": 1765207392607, "name": "Enfraquecer Tirano", "tier": 3, "default_element": "gelo" },
        { "id": 1765207399175, "name": "Hades", "tier": 3, "default_element": "veneno" },
        { "id": 1765209396487, "name": "Redução de Dano de Tropas", "tier": 3, "default_element": null },
        { "id": 1765209408922, "name": "Dano de Tropas", "tier": 3, "default_element": null },
        { "id": 1765209428018, "name": "Capacidade de Herói", "tier": 3, "default_element": null },
        { "id": 1765209440788, "name": "Poder da Unidade", "tier": 3, "default_element": null },
        { "id": 1765209450240, "name": "Supressão", "tier": 3, "default_element": null },
        { "id": 1765209460385, "name": "Atenuar Supressão", "tier": 3, "default_element": null },
        { "id": 1765209473208, "name": "Taxa de Produção de Primavera", "tier": 3, "default_element": null },
        { "id": 1765209489771, "name": "Todo Poder das Gemas de Fogo", "tier": 3, "default_element": "fogo" },
        { "id": 1765209502309, "name": "Todo Poder das Gemas de Luz", "tier": 3, "default_element": "luz" },
        { "id": 1765209515940, "name": "Todo Poder das Gemas de Gelo", "tier": 3, "default_element": "gelo" },
        { "id": 1765209526407, "name": "Todo Poder das Gemas de Veneno", "tier": 3, "default_element": "veneno" },

        // ============================
        // TIER 2 — ORGANIZADO POR ELEMENTO
        // ============================

        // 🔥 FOGO
        { "id": 1765209574691, "name": "Dano de Contra Ataque", "tier": 2, "default_element": "fogo" },
        { "id": 1765241953547, "name": "Capacidade de Tropa do Héroi de Fogo", "tier": 2, "default_element": "fogo" },
        { "id": 1765241986990, "name": "Todo Poder das Tropas de Fogo", "tier": 2, "default_element": "fogo" },

        // ❄️ GELO
        { "id": 1765209594158, "name": "Dano de Contra Ataque Recebido", "tier": 2, "default_element": "gelo" },
        { "id": 1765242126023, "name": "Capacidade da Tropa do Herói de Gelo", "tier": 2, "default_element": "gelo" },
        { "id": 1765242162340, "name": "Todo Poder das Tropas de Gelo", "tier": 2, "default_element": "gelo" },

        // 🌟 LUZ
        { "id": 1765242269786, "name": "Todo Poder das Tropas de Luz", "tier": 2, "default_element": "luz" },
        { "id": 1765242365946, "name": "Capacidade da Tropa do Herói de Luz", "tier": 2, "default_element": "luz" },
        { "id": 1765242474029, "name": "Redução de Dano das Tropas de Guarnição", "tier": 2, "default_element": "luz" },

        // 🐍 VENENO
        { "id": 1765242279296, "name": "Todo Poder das Tropas de Veneno", "tier": 2, "default_element": "veneno" },
        { "id": 1765242373115, "name": "Capacidade da Tropa do Herói de Veneno", "tier": 2, "default_element": "veneno" },
        { "id": 1765242530809, "name": "Dano de Cerco das Tropas", "tier": 2, "default_element": "veneno" },

        // ⚪ SEM ELEMENTO
        { "id": 1765209543487, "name": "Guardião", "tier": 2, "default_element": null },
        { "id": 1765209555857, "name": "Sede de Sangue", "tier": 2, "default_element": null },
        { "id": 1765209628027, "name": "Capacidade dos mortos da Primavera", "tier": 2, "default_element": null },
        { "id": 1765209654779, "name": "Capacidade de Fonte de Renovação de Primavera", "tier": 2, "default_element": null },
        { "id": 1765241906546, "name": "Dano de Reunião de Tropas", "tier": 2, "default_element": null },

        // ============================
        // TIER 1 — ORGANIZADO POR ELEMENTO
        // ============================

        // 🔥 FOGO
        { "id": 1765209744548, "name": "Capacidade das Tropas De Fogo", "tier": 1, "default_element": "fogo" },
        { "id": 1765242804900, "name": "Todo Poder de Fogo do Herói", "tier": 1, "default_element": "fogo" },
        { "id": 1765242564023, "name": "Assalto do Herói de Fogo", "tier": 1, "default_element": "fogo" },
        { "id": 1765242640084, "name": "Hp do Herói de Fogo", "tier": 1, "default_element": "fogo" },

        // ❄️ GELO
        { "id": 1765209778637, "name": "Capacidade das Tropas De Gelo", "tier": 1, "default_element": "gelo" },
        { "id": 1765242199773, "name": "Todo Poder de Gelo do Herói", "tier": 1, "default_element": "gelo" },
        { "id": 1765242570170, "name": "Assalto do Herói de Gelo", "tier": 1, "default_element": "gelo" },
        { "id": 1765242645605, "name": "Hp do Herói de Gelo", "tier": 1, "default_element": "gelo" },

        // 🌟 LUZ
        { "id": 1765209798209, "name": "Capacidade das Tropas De Luz", "tier": 1, "default_element": "luz" },
        { "id": 1765242226305, "name": "Todo Poder de Luz do Herói", "tier": 1, "default_element": "luz" },
        { "id": 1765242611661, "name": "Assalto do Herói de Luz", "tier": 1, "default_element": "luz" },
        { "id": 1765242651617, "name": "Hp do Herói de Luz", "tier": 1, "default_element": "luz" },

        // 🐍 VENENO
        { "id": 1765209789078, "name": "Capacidade das Tropas De Veneno", "tier": 1, "default_element": "veneno" },
        { "id": 1765242247346, "name": "Todo Poder de Veneno do Herói", "tier": 1, "default_element": "veneno" },
        { "id": 1765242589125, "name": "Assalto do Herói de Veneno", "tier": 1, "default_element": "veneno" },
        { "id": 1765242657266, "name": "Hp do Herói de Veneno", "tier": 1, "default_element": "veneno" },

        // ⚪ SEM ELEMENTO
        { "id": 1765209673667, "name": "Revival", "tier": 1, "default_element": null },
        { "id": 1765209681040, "name": "Enfraquecer Revival", "tier": 1, "default_element": null },
        { "id": 1765209686619, "name": "Massacre", "tier": 1, "default_element": null },
        { "id": 1765209694646, "name": "Enfraquecer Massacre", "tier": 1, "default_element": null },
        { "id": 1765209705989, "name": "Recrutamento Rápido", "tier": 1, "default_element": null },
        { "id": 1765242702345, "name": "Ouro Adicional", "tier": 1, "default_element": null },
        { "id": 1765242708490, "name": "Madeira Adicional", "tier": 1, "default_element": null },
        { "id": 1765242713476, "name": "Cristal Adicional", "tier": 1, "default_element": null },
        { "id": 1765242717943, "name": "Comida Adicional", "tier": 1, "default_element": null },
        { "id": 1765243349367, "name": "Dano Garantido", "tier": 1, "default_element": null },
        { "id": 1765243357237, "name": "Redução Dano Garantido", "tier": 1, "default_element": null }
    ];

    const DEFAULT_REQUIRED_ATTRIBUTES = [
        { "id": 1765207363321, "attribute_id": 1765207358906 },
        { "id": 1765207403342, "attribute_id": 1765207381869 },
        { "id": 1765207408563, "attribute_id": 1765207392607 },
        { "id": 1765207411356, "attribute_id": 1765207399175 },
        { "id": 1765209833462, "attribute_id": 1765209396487 },
        { "id": 1765209839510, "attribute_id": 1765209408922 },
        { "id": 1765209844713, "attribute_id": 1765209428018 },
        { "id": 1765209849004, "attribute_id": 1765209440788 },
        { "id": 1765209852480, "attribute_id": 1765209450240 },
        { "id": 1765209858195, "attribute_id": 1765209460385 },
        { "id": 1765209868251, "attribute_id": 1765209489771 },
        { "id": 1765209873978, "attribute_id": 1765209502309 },
        { "id": 1765209896809, "attribute_id": 1765209515940 },
        { "id": 1765209902226, "attribute_id": 1765209526407 },
        { "id": 1765209911920, "attribute_id": 1765209543487 },
        { "id": 1765209916803, "attribute_id": 1765209555857 },
        { "id": 1765209924736, "attribute_id": 1765209574691 },
        { "id": 1765209935904, "attribute_id": 1765209594158 },
        { "id": 1765210027756, "attribute_id": 1765209673667 },
        { "id": 1765210038367, "attribute_id": 1765209681040 },
        { "id": 1765210048074, "attribute_id": 1765209686619 },
        { "id": 1765210056063, "attribute_id": 1765209694646 }
    ];

    // NOVO: Lista vazia por padrão para secundários (você poderá preencher via Admin depois)
    const DEFAULT_SECONDARY_ATTRIBUTES = [
        {
            "id": 1765329578326,
            "attribute_id": 1765243349367
        },
        {
            "id": 1765329585252,
            "attribute_id": 1765243357237
        },
        {
            "id": 1765329592693,
            "attribute_id": 1765209705989
        },
        {
            "id": 1765329607653,
            "attribute_id": 1765242247346
        },
        {
            "id": 1765329618025,
            "attribute_id": 1765209789078
        },
        {
            "id": 1765329626001,
            "attribute_id": 1765242226305
        },
        {
            "id": 1765329633078,
            "attribute_id": 1765209798209
        },
        {
            "id": 1765329640373,
            "attribute_id": 1765242162340
        },
        {
            "id": 1765329651351,
            "attribute_id": 1765209778637
        },
        {
            "id": 1765329658598,
            "attribute_id": 1765242804900
        },
        {
            "id": 1765329669206,
            "attribute_id": 1765209744548
        },
        {
            "id": 1765329681986,
            "attribute_id": 1765241906546
        },
        {
            "id": 1765329695218,
            "attribute_id": 1765209654779
        },
        {
            "id": 1765329699444,
            "attribute_id": 1765209628027
        },
        {
            "id": 1765329716523,
            "attribute_id": 1765242530809
        },
        {
            "id": 1765329729774,
            "attribute_id": 1765242373115
        },
        {
            "id": 1765329737719,
            "attribute_id": 1765242279296
        },
        {
            "id": 1765329750291,
            "attribute_id": 1765242474029
        },
        {
            "id": 1765329755550,
            "attribute_id": 1765242365946
        },
        {
            "id": 1765329775287,
            "attribute_id": 1765242269786
        },
        {
            "id": 1765329815245,
            "attribute_id": 1765242126023
        },
        {
            "id": 1765329902726,
            "attribute_id": 1765241986990
        },
        {
            "id": 1765329906485,
            "attribute_id": 1765241953547
        },
        {
            "id": 1765329913797,
            "attribute_id": 1765209473208
        },
        {
            "id": 1765330000569,
            "attribute_id": 1765242199773
        }
    ];

    const DEFAULT_RECOMMENDED_COMBOS = [];

    // =================================================================

    const getData = (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    };

    const saveData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    /**
     * Inicializa o localStorage com os DADOS PADRÃO se o usuário for novo.
     */
    const initializeDefaultData = () => {
        if (!localStorage.getItem(KEYS.BUILDS)) saveData(KEYS.BUILDS, []);

        if (!localStorage.getItem(KEYS.MASTER_ATTRIBUTES)) {
            console.log("Carregando Atributos Mestres Padrão...");
            saveData(KEYS.MASTER_ATTRIBUTES, DEFAULT_MASTER_ATTRIBUTES);
        }

        if (!localStorage.getItem(KEYS.REQUIRED_ATTRIBUTES)) {
            console.log("Carregando Requisitos Padrão...");
            saveData(KEYS.REQUIRED_ATTRIBUTES, DEFAULT_REQUIRED_ATTRIBUTES);
        }

        // NOVO: Inicializa Secundários
        if (!localStorage.getItem(KEYS.SECONDARY_ATTRIBUTES)) {
            console.log("Carregando Atributos Secundários Padrão...");
            saveData(KEYS.SECONDARY_ATTRIBUTES, DEFAULT_SECONDARY_ATTRIBUTES);
        }

        if (!localStorage.getItem(KEYS.RECOMMENDED_COMBOS)) {
            console.log("Carregando Combos Padrão...");
            saveData(KEYS.RECOMMENDED_COMBOS, DEFAULT_RECOMMENDED_COMBOS);
        }
    };

    // --- Funções Públicas (CRUD) ---

    const loadAllBuilds = () => getData(KEYS.BUILDS);
    const loadBuildById = (id) => (loadAllBuilds().find(b => b.id === id) || null);

    const saveBuild = (build) => {
        const builds = loadAllBuilds();
        if (!build.id) { build.id = Date.now(); build.createdAt = new Date().toISOString(); }
        build.lastUpdated = new Date().toISOString();
        const index = builds.findIndex(b => b.id === build.id);
        if (index >= 0) builds[index] = build;
        else builds.push(build);
        saveData(KEYS.BUILDS, builds);
        return build;
    };

    const deleteBuild = (id) => {
        let builds = loadAllBuilds();
        builds = builds.filter(b => b.id !== id);
        saveData(KEYS.BUILDS, builds);
    };

    const loadMasterAttributes = () => getData(KEYS.MASTER_ATTRIBUTES);
    const saveMasterAttributes = (attributes) => saveData(KEYS.MASTER_ATTRIBUTES, attributes);

    const loadRequiredAttributes = () => getData(KEYS.REQUIRED_ATTRIBUTES);
    const saveRequiredAttributes = (attributes) => saveData(KEYS.REQUIRED_ATTRIBUTES, attributes);

    // --- NOVAS FUNÇÕES PARA SECUNDÁRIOS ---
    const loadSecondaryAttributes = () => getData(KEYS.SECONDARY_ATTRIBUTES);
    const saveSecondaryAttributes = (attributes) => saveData(KEYS.SECONDARY_ATTRIBUTES, attributes);
    // --------------------------------------

    const loadRecommendedCombos = () => getData(KEYS.RECOMMENDED_COMBOS);
    const saveRecommendedCombos = (combos) => saveData(KEYS.RECOMMENDED_COMBOS, combos);

    // Ferramentas de Exportação/Importação
    const exportAllData = () => {
        return {
            builds: loadAllBuilds(),
            masterAttributes: loadMasterAttributes(),
            requiredAttributes: loadRequiredAttributes(),
            secondaryAttributes: loadSecondaryAttributes(),
            recommendedCombos: loadRecommendedCombos(),
            globalNotes: loadGlobalNotes(), // <--- VOCÊ ESQUECEU ESTA LINHA
            exportedAt: new Date().toISOString()
        };
    };

    const importAllData = (jsonData) => {
        if (jsonData.builds) saveData(KEYS.BUILDS, jsonData.builds);
        if (jsonData.masterAttributes) saveData(KEYS.MASTER_ATTRIBUTES, jsonData.masterAttributes);
        if (jsonData.requiredAttributes) saveData(KEYS.REQUIRED_ATTRIBUTES, jsonData.requiredAttributes);
        if (jsonData.secondaryAttributes) saveData(KEYS.SECONDARY_ATTRIBUTES, jsonData.secondaryAttributes);
        if (jsonData.recommendedCombos) saveData(KEYS.RECOMMENDED_COMBOS, jsonData.recommendedCombos);
        if (jsonData.globalNotes) saveGlobalNotes(jsonData.globalNotes); // <--- VOCÊ ESQUECEU ESTA LINHA
    };

    const clearAllData = () => {
        localStorage.clear();
        initializeDefaultData();
    };

    // 2. Adicione essas funções no final, antes do return:
    const loadGlobalNotes = () => localStorage.getItem(KEYS.GLOBAL_NOTES) || "Dicas gerais para PvP: Mantenha seus atributos essenciais em dia.";
    const saveGlobalNotes = (text) => localStorage.setItem(KEYS.GLOBAL_NOTES, text);

    // --- SEGURANÇA (NOVO) ---
    const getAdminPassword = () => {
        // Retorna a senha salva ou 'admin' como padrão
        return localStorage.getItem('app_admin_password') || 'admin';
    };

    const setAdminPassword = (newPassword) => {
        localStorage.setItem('app_admin_password', newPassword);
    };

    return {
        initializeDefaultData,
        loadAllBuilds,
        loadBuildById,
        saveBuild,
        deleteBuild,
        loadMasterAttributes,
        saveMasterAttributes,
        loadRequiredAttributes,
        saveRequiredAttributes,
        // Exportar novas funções
        loadSecondaryAttributes,
        saveSecondaryAttributes,
        loadRecommendedCombos,
        saveRecommendedCombos,
        exportAllData,
        importAllData,
        clearAllData,
        loadGlobalNotes,
        saveGlobalNotes,
        // Novos exports:
        getAdminPassword,
        setAdminPassword
    };
})();