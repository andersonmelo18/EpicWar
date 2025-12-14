/**
 * js/AdminService.js
 * Camada de Regra de Negócio para o Painel Admin.
 * Intermedia as ações do Controller com a persistência do StorageService.
 */
const AdminService = (() => {

    // --- Constantes Globais ---
    const ELEMENTS = ['fogo', 'gelo', 'luz', 'veneno'];
    const RARITIES = ['Comum', 'Raro', 'Extra', 'Perfeito', 'Epico', 'Lendario', 'Mitico'];
    const REMODELS = ['comum', 'raro', 'extra', 'perfeito', 'epico', 'lendario', 'mitico'];

    // --- Inicialização (HARDCORE MODE) ---

    const initializeMasterData = () => {
        // 1. Verifica se o usuário já tem dados (para não apagar o progresso de quem já usa)
        const existing = StorageService.loadMasterAttributes();

        // Se já tiver dados, paramos por aqui (Opcional: remova este IF se quiser forçar a atualização para todos)
        if (existing && existing.length > 0) {
            console.log("Dados locais encontrados. Inicialização padrão pulada.");
            return;
        }

        console.log("Iniciando banco de dados com Regras Padrão (Hardcoded)...");

        // ==============================================================================
        // 1. ATRIBUTOS MESTRES (A lista completa de nomes e tiers)
        // ==============================================================================
        const defaultMasters =
            // [ ... APAGUE ESTA LINHA E COLE A LISTA "masters" DO CONSOLE AQUI ... ]
            [{
                "id": 1765207358906,
                "name": "Tirano",
                "tier": 3,
                "default_element": "fogo"
            },
            {
                "id": 1765207381869,
                "name": "Benção de Deus",
                "tier": 3,
                "default_element": "luz"
            },
            {
                "id": 1765207392607,
                "name": "Enfraquecer Tirano",
                "tier": 3,
                "default_element": "gelo"
            },
            {
                "id": 1765207399175,
                "name": "Hades",
                "tier": 3,
                "default_element": "veneno"
            },
            {
                "id": 1765209396487,
                "name": "Redução de Dano de Tropas",
                "tier": 3,
                "default_element": null
            },
            {
                "id": 1765209408922,
                "name": "Dano de Tropas",
                "tier": 3,
                "default_element": null
            },
            {
                "id": 1765209428018,
                "name": "Capacidade de Herói",
                "tier": 3,
                "default_element": null
            },
            {
                "id": 1765209440788,
                "name": "Poder da Unidade",
                "tier": 3,
                "default_element": null
            },
            {
                "id": 1765209450240,
                "name": "Supressão",
                "tier": 3,
                "default_element": null
            },
            {
                "id": 1765209460385,
                "name": "Atenuar Supressão",
                "tier": 3,
                "default_element": null
            },
            {
                "id": 1765209473208,
                "name": "Taxa de Produção de Primavera",
                "tier": 3,
                "default_element": null
            },
            {
                "id": 1765209489771,
                "name": "Todo Poder das Gemas de Fogo",
                "tier": 3,
                "default_element": "fogo"
            },
            {
                "id": 1765209502309,
                "name": "Todo Poder das Gemas de Luz",
                "tier": 3,
                "default_element": "luz"
            },
            {
                "id": 1765209515940,
                "name": "Todo Poder das Gemas de Gelo",
                "tier": 3,
                "default_element": "gelo"
            },
            {
                "id": 1765209526407,
                "name": "Todo Poder das Gemas de Veneno",
                "tier": 3,
                "default_element": "veneno"
            },
            {
                "id": 1765209574691,
                "name": "Dano de Contra Ataque",
                "tier": 2,
                "default_element": "fogo"
            },
            {
                "id": 1765241953547,
                "name": "Capacidade de Tropa do Héroi de Fogo",
                "tier": 2,
                "default_element": "fogo"
            },
            {
                "id": 1765241986990,
                "name": "Todo Poder das Tropas de Fogo",
                "tier": 2,
                "default_element": "fogo"
            },
            {
                "id": 1765209594158,
                "name": "Redução de Dano de Contra Ataque Recebido",
                "tier": 2,
                "default_element": "gelo"
            },
            {
                "id": 1765242126023,
                "name": "Capacidade da Tropa do Herói de Gelo",
                "tier": 2,
                "default_element": "gelo"
            },
            {
                "id": 1765242162340,
                "name": "Todo Poder das Tropas de Gelo",
                "tier": 2,
                "default_element": "gelo"
            },
            {
                "id": 1765242269786,
                "name": "Todo Poder das Tropas de Luz",
                "tier": 2,
                "default_element": "luz"
            },
            {
                "id": 1765242365946,
                "name": "Capacidade da Tropa do Herói de Luz",
                "tier": 2,
                "default_element": "luz"
            },
            {
                "id": 1765242474029,
                "name": "Redução de Dano das Tropas de Guarnição",
                "tier": 2,
                "default_element": "luz"
            },
            {
                "id": 1765242279296,
                "name": "Todo Poder das Tropas de Veneno",
                "tier": 2,
                "default_element": "veneno"
            },
            {
                "id": 1765242373115,
                "name": "Capacidade da Tropa do Herói de Veneno",
                "tier": 2,
                "default_element": "veneno"
            },
            {
                "id": 1765242530809,
                "name": "Dano de Cerco das Tropas",
                "tier": 2,
                "default_element": "veneno"
            },
            {
                "id": 1765209543487,
                "name": "Guardião",
                "tier": 2,
                "default_element": null
            },
            {
                "id": 1765209555857,
                "name": "Sede de Sangue",
                "tier": 2,
                "default_element": null
            },
            {
                "id": 1765209628027,
                "name": "Capacidade dos mortos da Primavera",
                "tier": 2,
                "default_element": null
            },
            {
                "id": 1765209654779,
                "name": "Capacidade de Fonte de Renovação de Primavera",
                "tier": 2,
                "default_element": null
            },
            {
                "id": 1765241906546,
                "name": "Dano de Reunião de Tropas",
                "tier": 2,
                "default_element": null
            },
            {
                "id": 1765209744548,
                "name": "Capacidade das Tropas De Fogo",
                "tier": 1,
                "default_element": "fogo"
            },
            {
                "id": 1765242804900,
                "name": "Todo Poder de Fogo do Herói",
                "tier": 1,
                "default_element": "fogo"
            },
            {
                "id": 1765242564023,
                "name": "Assalto do Herói de Fogo",
                "tier": 1,
                "default_element": "fogo"
            },
            {
                "id": 1765242640084,
                "name": "Hp do Herói de Fogo",
                "tier": 1,
                "default_element": "fogo"
            },
            {
                "id": 1765209778637,
                "name": "Capacidade das Tropas De Gelo",
                "tier": 1,
                "default_element": "gelo"
            },
            {
                "id": 1765242199773,
                "name": "Todo Poder de Gelo do Herói",
                "tier": 1,
                "default_element": "gelo"
            },
            {
                "id": 1765242570170,
                "name": "Assalto do Herói de Gelo",
                "tier": 1,
                "default_element": "gelo"
            },
            {
                "id": 1765242645605,
                "name": "Hp do Herói de Gelo",
                "tier": 1,
                "default_element": "gelo"
            },
            {
                "id": 1765209798209,
                "name": "Capacidade das Tropas De Luz",
                "tier": 1,
                "default_element": "luz"
            },
            {
                "id": 1765242226305,
                "name": "Todo Poder de Luz do Herói",
                "tier": 1,
                "default_element": "luz"
            },
            {
                "id": 1765242611661,
                "name": "Assalto do Herói de Luz",
                "tier": 1,
                "default_element": "luz"
            },
            {
                "id": 1765242651617,
                "name": "Hp do Herói de Luz",
                "tier": 1,
                "default_element": "luz"
            },
            {
                "id": 1765209789078,
                "name": "Capacidade das Tropas De Veneno",
                "tier": 1,
                "default_element": "veneno"
            },
            {
                "id": 1765242247346,
                "name": "Todo Poder de Veneno do Herói",
                "tier": 1,
                "default_element": "veneno"
            },
            {
                "id": 1765242589125,
                "name": "Assalto do Herói de Veneno",
                "tier": 1,
                "default_element": "veneno"
            },
            {
                "id": 1765242657266,
                "name": "Hp do Herói de Veneno",
                "tier": 1,
                "default_element": "veneno"
            },
            {
                "id": 1765209673667,
                "name": "Revival",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765209681040,
                "name": "Enfraquecer Revival",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765209686619,
                "name": "Massacre",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765209694646,
                "name": "Enfraquecer Massacre",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765209705989,
                "name": "Recrutamento Rápido",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765242702345,
                "name": "Ouro Adicional",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765242708490,
                "name": "Madeira Adicional",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765242713476,
                "name": "Cristal Adicional",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765242717943,
                "name": "Comida Adicional",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765243349367,
                "name": "Dano Garantido",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765243357237,
                "name": "Redução Dano Garantido",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765749314725,
                "name": "Execução de Harolds",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765749320349,
                "name": "Execução de Monstros",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765749326344,
                "name": "Execução de Titans",
                "tier": 1,
                "default_element": null
            },
            {
                "id": 1765749331379,
                "name": "Executar ( Estágios )",
                "tier": 1,
                "default_element": null
            }] // <- Se colar dentro, apague estes colchetes vazios
            ;

        StorageService.saveMasterAttributes(defaultMasters);

        // ==============================================================================
        // 2. REQUISITOS (O que é Essencial e o que é URGENTE)
        // ==============================================================================
        const defaultRequired =
            // [ ... APAGUE ESTA LINHA E COLE A LISTA "required" DO CONSOLE AQUI ... ]
            [{
                "id": 1765207363321,
                "attribute_id": 1765207358906,
                "isUrgent": true
            },
            {
                "id": 1765207403342,
                "attribute_id": 1765207381869,
                "isUrgent": true
            },
            {
                "id": 1765207408563,
                "attribute_id": 1765207392607,
                "isUrgent": true
            },
            {
                "id": 1765207411356,
                "attribute_id": 1765207399175
            },
            {
                "id": 1765209833462,
                "attribute_id": 1765209396487,
                "isUrgent": true
            },
            {
                "id": 1765209839510,
                "attribute_id": 1765209408922,
                "isUrgent": true
            },
            {
                "id": 1765209844713,
                "attribute_id": 1765209428018
            },
            {
                "id": 1765209849004,
                "attribute_id": 1765209440788
            },
            {
                "id": 1765209852480,
                "attribute_id": 1765209450240
            },
            {
                "id": 1765209858195,
                "attribute_id": 1765209460385
            },
            {
                "id": 1765209868251,
                "attribute_id": 1765209489771
            },
            {
                "id": 1765209873978,
                "attribute_id": 1765209502309
            },
            {
                "id": 1765209896809,
                "attribute_id": 1765209515940
            },
            {
                "id": 1765209902226,
                "attribute_id": 1765209526407
            },
            {
                "id": 1765209911920,
                "attribute_id": 1765209543487,
                "isUrgent": true
            },
            {
                "id": 1765209916803,
                "attribute_id": 1765209555857,
                "isUrgent": true
            },
            {
                "id": 1765209924736,
                "attribute_id": 1765209574691,
                "isUrgent": true
            },
            {
                "id": 1765209935904,
                "attribute_id": 1765209594158,
                "isUrgent": true
            },
            {
                "id": 1765210027756,
                "attribute_id": 1765209673667,
                "isUrgent": true
            },
            {
                "id": 1765210038367,
                "attribute_id": 1765209681040,
                "isUrgent": true
            },
            {
                "id": 1765210048074,
                "attribute_id": 1765209686619,
                "isUrgent": true
            },
            {
                "id": 1765210056063,
                "attribute_id": 1765209694646,
                "isUrgent": true
            },
            {
                "id": 1765329913797,
                "attribute_id": 1765209473208
            }] // <- Se colar dentro, apague estes colchetes vazios
            ;

        StorageService.saveRequiredAttributes(defaultRequired);

        // ==============================================================================
        // 3. SECUNDÁRIOS (Opcionais)
        // ==============================================================================
        const defaultSecondary =
            // [ ... APAGUE ESTA LINHA E COLE A LISTA "secondary" DO CONSOLE AQUI ... ]
            [{
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
                "id": 1765330000569,
                "attribute_id": 1765242199773
            }] // <- Se colar dentro, apague estes colchetes vazios
            ;

        StorageService.saveSecondaryAttributes(defaultSecondary);

        console.log("Regras padrão aplicadas com sucesso! 🚀");
    };

    // --- Lógica: Atributos Mestres ---

    const saveMasterAttribute = (attrData) => {
        let attributes = StorageService.loadMasterAttributes();

        if (attrData.id) {
            const index = attributes.findIndex(a => a.id === attrData.id);
            if (index !== -1) attributes[index] = attrData;
        } else {
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
        cleanUpDeletedAttribute(id);
    };

    const cleanUpDeletedAttribute = (masterId) => {
        let required = StorageService.loadRequiredAttributes();
        const initialReqLength = required.length;
        required = required.filter(r => r.attribute_id !== masterId);
        if (required.length !== initialReqLength) StorageService.saveRequiredAttributes(required);

        let secondary = StorageService.loadSecondaryAttributes();
        const initialSecLength = secondary.length;
        secondary = secondary.filter(s => s.attribute_id !== masterId);
        if (secondary.length !== initialSecLength) StorageService.saveSecondaryAttributes(secondary);
    };

    // --- Lógica: Atributos Requeridos ---

    const addRequiredAttribute = (attributeId, isUrgent = false) => {
        const required = StorageService.loadRequiredAttributes();

        if (required.some(r => r.attribute_id === attributeId)) {
            alert("Este atributo já está na lista de requisitos.");
            return;
        }

        const secondary = StorageService.loadSecondaryAttributes();
        if (secondary.some(s => s.attribute_id === attributeId)) {
            if (!confirm("Este atributo está na lista de Secundários. Deseja movê-lo para Essencial?")) return;
            const newSecondary = secondary.filter(s => s.attribute_id !== attributeId);
            StorageService.saveSecondaryAttributes(newSecondary);
        }

        required.push({
            id: Date.now(),
            attribute_id: attributeId,
            isUrgent: isUrgent
        });

        StorageService.saveRequiredAttributes(required);
    };

    const updateRequiredAttribute = (id, isUrgent) => {
        const required = StorageService.loadRequiredAttributes();
        const itemIndex = required.findIndex(r => r.id.toString() === id.toString());

        if (itemIndex > -1) {
            required[itemIndex].isUrgent = isUrgent;
            StorageService.saveRequiredAttributes(required);
        }
    };

    const deleteRequiredAttribute = (reqId) => {
        let required = StorageService.loadRequiredAttributes();
        required = required.filter(r => r.id !== reqId);
        StorageService.saveRequiredAttributes(required);
    };

    // --- Lógica: Atributos Secundários ---

    const addSecondaryAttribute = (attributeId) => {
        const secondary = StorageService.loadSecondaryAttributes();

        if (secondary.some(s => s.attribute_id === attributeId)) {
            alert("Este atributo já está na lista de secundários.");
            return;
        }

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
        updateRequiredAttribute,
        deleteRequiredAttribute,
        addSecondaryAttribute,
        deleteSecondaryAttribute,
        saveRecommendedCombo,
        deleteRecommendedCombo
    };
})();