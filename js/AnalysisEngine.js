/**
 * js/AnalysisEngine.js
 * Módulo responsável por aplicar as regras de negócio PvP e gerar a análise.
 * NÃO TOCA NO DOM NEM NO localStorage diretamente. Apenas processa dados.
 */
const AnalysisEngine = (() => {

    // Define a hierarquia de qualidade para desempate de duplicatas
    const REMODEL_WEIGHTS = {
        comum: 1,
        raro: 2,
        extra: 3,
        perfeito: 4,
        epico: 5,
        lendario: 6,
        mitico: 7
    };

    // NOVO: Define a hierarquia de raridade da Gema/Slot (SSR é melhor)
    const RARITY_RANKS = {
        b: 1,
        a: 2,
        s: 3,
        sr: 4,
        ssr: 5
        // Adicione outras se necessário
    };

    /**
     * Retorna o peso numérico da remodelação.
     */
    const getRemodelWeight = (remodelString) => {
        if (!remodelString) return 0;
        const key = remodelString.toLowerCase().trim();
        return REMODEL_WEIGHTS[key] || 0;
    };

    /**
     * NOVO: Retorna o peso numérico da raridade da gema/slot.
     */
    const getRarityWeight = (rarityString) => {
        if (!rarityString) return 0;
        const key = rarityString.toLowerCase().trim();
        return RARITY_RANKS[key] || 0;
    };

    /**
     * NOVO: Compara dois atributos duplicados para determinar qual slot deve ser mantido.
     * PRIORIDADE: RAREZA DO SLOT (Potencial) > QUALIDADE DO REMODEL (Atual).
     */
    const compareDuplicateSlots = (dupA, dupB) => {
        // 1. PRIORIDADE 1: RAREZA DO SLOT (SSR vs S)
        // b - a: Ordena do maior (melhor) para o menor
        if (dupA.rarity_weight !== dupB.rarity_weight) {
            return dupB.rarity_weight - dupA.rarity_weight;
        }

        // 2. PRIORIDADE 2: QUALIDADE DO REMODEL (Mítico vs Épico)
        // Se a raridade do slot for igual, priorizamos a qualidade atual.
        if (dupA.weight !== dupB.weight) {
            return dupB.weight - dupA.weight;
        }

        // 3. Desempate final (Tudo igual)
        return 0;
    };

    /**
     * Valida se a seleção de um atributo para uma gema é válida com base na exclusividade de elemento.
     */
    const validateElementExclusivity = (attributeId, gemElement, masterAttributes) => {
        const attr = masterAttributes.find(a => a.id === attributeId);
        if (!attr || !attr.default_element) {
            // Atributo global ou não encontrado: sempre permitido.
            return true;
        }
        // Bloqueio: Atributo exclusivo selecionado em gema de elemento errado.
        return attr.default_element === gemElement;
    };

    /**
     * Executa a análise completa da build do personagem.
     * Agora suporta atributos secundários e lógica de duplicatas baseada em Raridade.
     */
    const runAnalysis = (characterBuild, masterAttributes = null, requiredAttributes = null, secondaryAttributes = null, recommendedCombos = null) => {

        // --- AUTO-CARREGAMENTO (Fallback) ---
        if (!masterAttributes) masterAttributes = StorageService.loadMasterAttributes();
        if (!requiredAttributes) requiredAttributes = StorageService.loadRequiredAttributes();
        if (!secondaryAttributes) secondaryAttributes = StorageService.loadSecondaryAttributes();
        if (!recommendedCombos) recommendedCombos = StorageService.loadRecommendedCombos();

        // Mapeia IDs dos requisitos para verificação rápida
        const requiredIds = new Set(requiredAttributes.map(req => req.attribute_id));
        // Mapeia IDs dos secundários (se a lista for fornecida)
        const secondaryIds = new Set(secondaryAttributes ? secondaryAttributes.map(sec => sec.attribute_id) : []);

        const analysisResult = {
            present_attributes: new Map(), // Map<Attribute ID, Array<Location>> (Válidos e Únicos)
            missing_attributes: [],        // Requeridos que faltam
            missing_secondaries: [],       // Secundários que faltam
            secondary_present: [],         // Secundários presentes (Válidos e Únicos)
            duplicates_to_remove: [],      // Duplicatas Piores (Troca Urgente)
            useless_gems: [],              // Inúteis (Troca Urgente) ou Inválidos
            invalid_placements: [],        // (Opcional)
            combo_status: []
        };

        // Mapa temporário para agrupar ocorrências por ID de atributo
        const equippedMap = new Map();

        // 1. ITERAR SOBRE ARTEFATOS E GEMAS DA BUILD
        if (characterBuild.artifacts) {
            characterBuild.artifacts.forEach((artifact) => {
                if (!artifact) return;

                artifact.gems.forEach((gem, gIndex) => {
                    if (!gem) return; // Slot vazio

                    const elements = ["fogo", "gelo", "luz", "veneno"];
                    const gemElement = elements[gIndex];

                    if (gem.attributes && gem.attributes.length > 0) {
                        gem.attributes.forEach(gemAttr => {
                            const attrId = gemAttr.attribute_id;
                            const masterAttr = masterAttributes.find(a => a.id === attrId);

                            if (!masterAttr) return;

                            const occurrence = {
                                attr_id: attrId,
                                attr_name: masterAttr.name,
                                // Checagem de elemento
                                element_valid: validateElementExclusivity(attrId, gemElement, masterAttributes),
                                remodel: gemAttr.remodel,
                                weight: getRemodelWeight(gemAttr.remodel), // Peso do status atual
                                // NOVO: Captura dados de raridade para o desempate
                                gem_rarity: gem.rarity,
                                rarity_weight: getRarityWeight(gem.rarity),
                                tier: gemAttr.tier,
                                location: {
                                    artifact_name: artifact.name || `Artefato ${artifact.position}`,
                                    element: gemElement,
                                    position: `A${artifact.position}-${gemElement.toUpperCase().charAt(0)}`
                                }
                            };

                            if (!equippedMap.has(attrId)) {
                                equippedMap.set(attrId, []);
                            }
                            equippedMap.get(attrId).push(occurrence);
                        });
                    }
                });
            });
        }

        // 2. PROCESSAR OCORRÊNCIAS (DETECTAR DUPLICATAS E CLASSIFICAR)
        const allValidPresentIds = new Set();

        equippedMap.forEach((occurrences, attrId) => {
            // ALTERADO: Usa a nova função de comparação (Raridade > Remodel)
            occurrences.sort(compareDuplicateSlots);

            // O primeiro da lista é o "Melhor" (Keeper)
            const keeper = occurrences[0];

            // Verifica se o Keeper é válido (elemento correto)
            if (keeper.element_valid) {
                // Classifica o Keeper
                if (requiredIds.has(attrId)) {
                    // É Requerido
                    if (!analysisResult.present_attributes.has(attrId)) {
                        analysisResult.present_attributes.set(attrId, []);
                    }

                    analysisResult.present_attributes.get(attrId).push({
                        ...keeper.location,
                        remodel: keeper.remodel
                    });

                    allValidPresentIds.add(attrId);
                } else if (secondaryIds.has(attrId)) {
                    // É Secundário
                    analysisResult.secondary_present.push(keeper);
                    allValidPresentIds.add(attrId);
                } else {
                    // É Válido, mas inútil
                    analysisResult.useless_gems.push({
                        ...keeper,
                        reason: "Atributo não listado como Essencial ou Suporte."
                    });
                }
            } else {
                // Keeper inválido por elemento
                analysisResult.useless_gems.push({
                    ...keeper,
                    reason: "Elemento Incompatível (Bloqueado)."
                });
            }

            // Todos os outros (índice 1 em diante) são Duplicatas que devem ser removidas
            for (let i = 1; i < occurrences.length; i++) {
                const duplicate = occurrences[i];

                // --- ALTERAÇÃO AQUI ---
                // Verifica se existe raridade para montar a string bonitinha (Ex: "SSR - Mitico")
                const rarityLabel = keeper.gem_rarity ? `${keeper.gem_rarity.toUpperCase()} - ` : '';

                // Adiciona à lista de remoção com uma dica de quem ficou no lugar
                analysisResult.duplicates_to_remove.push({
                    ...duplicate,
                    keeper_location: keeper.location.position,
                    keeper_remodel: keeper.remodel,
                    // MUDANÇA NA MENSAGEM: Adicionamos o rarityLabel
                    reason: `Duplicado. Mantenha o de ${keeper.location.position} (${rarityLabel}${keeper.remodel}).`
                });
            }
        });

        // 3. IDENTIFICAR ATRIBUTOS FALTANTES (REQUERIDOS)
        requiredAttributes.forEach(req => {
            if (!allValidPresentIds.has(req.attribute_id)) {
                const masterAttr = masterAttributes.find(a => a.id === req.attribute_id);
                if (masterAttr) {
                    analysisResult.missing_attributes.push({
                        attribute: masterAttr.name,
                        id: masterAttr.id,
                        tier: masterAttr.tier,
                        required_element: masterAttr.default_element
                    });
                }
            }
        });

        // 5. IDENTIFICAR SECUNDÁRIOS FALTANTES
        if (secondaryAttributes) {
            secondaryAttributes.forEach(sec => {
                if (!allValidPresentIds.has(sec.attribute_id)) {
                    const masterAttr = masterAttributes.find(a => a.id === sec.attribute_id);
                    if (masterAttr) {
                        analysisResult.missing_secondaries.push({
                            attribute: masterAttr.name,
                            id: masterAttr.id,
                            tier: masterAttr.tier,
                            required_element: masterAttr.default_element
                        });
                    }
                }
            });
        }

        // 4. CHECAGEM DE COMBOS
        if (recommendedCombos) {
            recommendedCombos.forEach(combo => {
                let presentCount = 0;
                combo.attribute_ids.forEach(attrId => {
                    if (allValidPresentIds.has(attrId)) {
                        presentCount++;
                    }
                });

                const completeness = (presentCount / combo.attribute_ids.length) * 100;

                if (completeness > 0) {
                    analysisResult.combo_status.push({
                        name: combo.name,
                        completeness: completeness,
                        missing_items: combo.attribute_ids.filter(id => !allValidPresentIds.has(id))
                    });
                }
            });
        }

        return analysisResult;
    };

    /**
     * Gera uma sugestão narrativa para um atributo faltante.
     */
    const generateSuggestion = (missingAttr, characterBuild) => {
        const elements = ["fogo", "gelo", "luz", "veneno"];
        let bestSlot = null;

        if (characterBuild.artifacts) {
            for (const artifact of characterBuild.artifacts) {
                if (!artifact) continue;
                for (let i = 0; i < 4; i++) {
                    const gem = artifact.gems[i];
                    const element = elements[i];

                    // 1. O slot aceita o atributo (por elemento)
                    const elementMatches = !missingAttr.required_element || missingAttr.required_element === element;

                    // 2. O slot está vazio?
                    let isSlotAvailable = !gem;

                    if (elementMatches && isSlotAvailable) {
                        bestSlot = {
                            position: `Artefato ${artifact.position}`,
                            element: element.charAt(0).toUpperCase() + element.slice(1)
                        };
                        break;
                    }
                }
                if (bestSlot) break;
            }
        }

        if (bestSlot) {
            return `Sugestão: Adicione no slot de **${bestSlot.element}** do **${bestSlot.position}**.`;
        } else {
            return `Sugestão: Substitua uma gema não essencial de ${missingAttr.required_element ? missingAttr.required_element : 'qualquer elemento'}.`;
        }
    };

    return {
        validateElementExclusivity,
        runAnalysis,
        generateSuggestion,
        analyze: runAnalysis
    };
})();