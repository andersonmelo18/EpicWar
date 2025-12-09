/**
 * Módulo responsável por aplicar as regras de negócio PvP e gerar a análise.
 * NÃO TOCA NO DOM NEM NO localStorage diretamente. Apenas processa dados.
 */
const AnalysisEngine = (() => {

    /**
     * Valida se a seleção de um atributo para uma gema é válida com base na exclusividade de elemento.
     * @param {number} attributeId - ID do atributo selecionado.
     * @param {string} gemElement - Elemento da gema (fogo, gelo, luz, veneno).
     * @param {Array} masterAttributes - Lista completa de atributos mestres.
     * @returns {boolean} True se válido, False se houver bloqueio.
     */
    const validateElementExclusivity = (attributeId, gemElement, masterAttributes) => {
        const attr = masterAttributes.find(a => a.id === attributeId);
        
        if (!attr || !attr.default_element) {
            // Atributo global ou não encontrado: sempre permitido.
            return true;
        }
        
        // Bloqueio: Atributo exclusivo selecionado em gema de elemento errado.
        // Ex: "Tirano (Fogo)" não pode entrar em uma gema de "Gelo".
        return attr.default_element === gemElement;
    };
    
    /**
     * Executa a análise completa da build do personagem.
     * @param {object} characterBuild - O objeto JSON da build (personagem e artefatos).
     * @param {Array} masterAttributes - Lista de atributos mestres.
     * @param {Array} requiredAttributes - Lista de atributos obrigatórios PvP.
     * @param {Array} recommendedCombos - Lista de combos recomendados.
     * @returns {object} O objeto de análise contendo status, faltantes, inúteis, etc.
     */
    const runAnalysis = (characterBuild, masterAttributes, requiredAttributes, recommendedCombos) => {
        
        // Mapeia IDs dos requisitos para verificação rápida
        const requiredIds = new Set(requiredAttributes.map(req => req.attribute_id));
        
        const analysisResult = {
            present_attributes: new Map(), // Map<Attribute ID, Array<Location>>
            missing_attributes: [],
            dispensable_gems: [],
            invalid_placements: [],
            combo_status: []
        };
        
        const allPresentIds = new Set();
        
        // 1. ITERAR SOBRE ARTEFATOS E GEMAS DA BUILD
        if (characterBuild.artifacts) {
            characterBuild.artifacts.forEach((artifact, aIndex) => {
                if (!artifact) return;
                
                artifact.gems.forEach((gem, gIndex) => {
                    if (!gem) return; // Slot vazio
                    
                    // AdminService deve estar disponível globalmente ou passamos elementos hardcoded
                    const elements = ["fogo", "gelo", "luz", "veneno"];
                    const gemElement = elements[gIndex];
                    let gemHasRequired = false;
                    
                    if (gem.attributes && gem.attributes.length > 0) {
                        
                        gem.attributes.forEach(gemAttr => {
                            const attrId = gemAttr.attribute_id;
                            const masterAttr = masterAttributes.find(a => a.id === attrId);
                            
                            if (!masterAttr) return; 
                            
                            const location = {
                                artifact_name: artifact.name || `Artefato ${artifact.position}`,
                                element: gemElement,
                                rarity: gem.rarity,
                                remodel: gemAttr.remodel,
                                position: `A${artifact.position}-${gemElement.toUpperCase().charAt(0)}`
                            };

                            // A) CHECAGEM DE EXCLUSIVIDADE (Auditoria)
                            if (!validateElementExclusivity(attrId, gemElement, masterAttributes)) {
                                analysisResult.invalid_placements.push({
                                    attribute: masterAttr.name,
                                    location: location
                                });
                                // Se inválido, optamos por não contar como "presente" para forçar correção
                                return; 
                            }
                            
                            // B) CHECAGEM DE OBRIGATORIEDADE
                            if (requiredIds.has(attrId)) {
                                gemHasRequired = true;
                                allPresentIds.add(attrId);
                                
                                if (!analysisResult.present_attributes.has(attrId)) {
                                    analysisResult.present_attributes.set(attrId, []);
                                }
                                analysisResult.present_attributes.get(attrId).push(location);
                            }
                        });
                    }
                    
                    // C) CHECAGEM DE GEMA INÚTIL
                    // Se a gema tem atributos, mas NENHUM deles está na lista de "Requeridos"
                    if (!gemHasRequired && gem.attributes && gem.attributes.length > 0) {
                        analysisResult.dispensable_gems.push({
                            element: gemElement,
                            location: {
                                artifact_name: artifact.name || `Artefato ${artifact.position}`,
                                position: `A${artifact.position}-${gemElement.toUpperCase().charAt(0)}`
                            },
                            reason: "Não contém nenhum atributo da lista 'Essencial'."
                        });
                    }
                });
            });
        }
        
        // 2. IDENTIFICAR ATRIBUTOS FALTANTES
        requiredAttributes.forEach(req => {
            if (!allPresentIds.has(req.attribute_id)) {
                const masterAttr = masterAttributes.find(a => a.id === req.attribute_id);
                if (masterAttr) {
                    analysisResult.missing_attributes.push({
                        attribute: masterAttr.name,
                        id: masterAttr.id,
                        required_element: masterAttr.default_element
                    });
                }
            }
        });
        
        // 3. CHECAGEM DE COMBOS
        recommendedCombos.forEach(combo => {
            let presentCount = 0;
            combo.attribute_ids.forEach(attrId => {
                if (allPresentIds.has(attrId)) {
                    presentCount++;
                }
            });
            
            const completeness = (presentCount / combo.attribute_ids.length) * 100;
            
            if (completeness > 0) {
                analysisResult.combo_status.push({
                    name: combo.name,
                    completeness: completeness,
                    missing_items: combo.attribute_ids.filter(id => !allPresentIds.has(id))
                });
            }
        });
        
        return analysisResult;
    };

    /**
     * Gera uma sugestão narrativa para um atributo faltante.
     */
    const generateSuggestion = (missingAttr, characterBuild) => {
        const elements = ["fogo", "gelo", "luz", "veneno"];
        
        // Procura um slot vazio que aceite este atributo
        let bestSlot = null;
        
        if (characterBuild.artifacts) {
            for (const artifact of characterBuild.artifacts) {
                if (!artifact) continue;
                for (let i = 0; i < 4; i++) { // 4 slots fixos
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
        generateSuggestion
    };
})();