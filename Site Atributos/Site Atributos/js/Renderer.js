/**
 * Módulo responsável por gerar o HTML dinâmico.
 */
const Renderer = (() => {

    // --- ÍCONES SVG (Estilo Heroicons) ---
    const ICONS = {
        fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" /></svg>`,
        ice: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M12 2.25c.414 0 .75.336.75.75v2.25l1.95-1.125a.75.75 0 01.75 1.3l-1.95 1.125 1.95 1.125a.75.75 0 01-.75 1.3l-1.95-1.125V10.5h2.25l1.125-1.95a.75.75 0 011.3.75l-1.125 1.95h2.25a.75.75 0 010 1.5h-2.25l1.125 1.95a.75.75 0 11-1.3.75l-1.125-1.95H12.75v2.625l1.95-1.125a.75.75 0 11.75 1.3l-1.95 1.125 1.95 1.125a.75.75 0 11-.75 1.3l-1.95-1.125V21a.75.75 0 01-1.5 0v-2.25l-1.95 1.125a.75.75 0 01-.75-1.3l1.95-1.125-1.95-1.125a.75.75 0 01.75-1.3l1.95 1.125V13.5H8.25l-1.125 1.95a.75.75 0 11-1.3-.75l1.125-1.95H4.5a.75.75 0 010-1.5h2.25L5.625 9.3a.75.75 0 011.3-.75l1.125 1.95H10.5V7.875L8.55 9a.75.75 0 01-.75-1.3l1.95-1.125-1.95-1.125a.75.75 0 01.75-1.3l1.95 1.125V3a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>`,
        light: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" /></svg>`,
        poison: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5zm8.25-3.75a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0v-2.25H7.5a.75.75 0 010-1.5h2.25V7.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /><path d="M10.5 3.75c.507 0 1.002.046 1.482.133a.75.75 0 00.27-1.476 8.223 8.223 0 00-3.504 0 .75.75 0 00.27 1.476c.48-.087.975-.133 1.482-.133z" /></svg>`,
        default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>`
    };

    const ELEMENT_CONFIG = {
        'fogo': { color: 'text-fogo', bg: 'bg-fogo-100', icon: ICONS.fire },
        'gelo': { color: 'text-gelo', bg: 'bg-gelo-100', icon: ICONS.ice },
        'luz': { color: 'text-luz', bg: 'bg-luz-100', icon: ICONS.light },
        'veneno': { color: 'text-veneno', bg: 'bg-veneno-100', icon: ICONS.poison }
    };

    // Pega as configurações do AdminService ou usa padrões
    const ELEMENTS = (typeof AdminService !== 'undefined' && AdminService.ELEMENTS) ? AdminService.ELEMENTS : ['fogo', 'gelo', 'luz', 'veneno'];
    const REMODELS = (typeof AdminService !== 'undefined' && AdminService.REMODELS) ? AdminService.REMODELS : ['comum', 'raro', 'épico', 'legendário', 'mítico'];

    // --- CARDS DA DASHBOARD & EDITOR ---

    const renderBuildCard = (build) => {
        const lastUpdated = build.lastUpdated ? new Date(build.lastUpdated).toLocaleDateString('pt-BR') : 'N/A';
        return `
            <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition duration-150">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${build.name || 'Build Sem Nome'}</h3>
                <p class="text-sm text-indigo-600 mb-3">Classe: ${build.class || 'N/A'}</p>
                <div class="text-sm text-gray-600 space-y-1">
                    <p>Artefatos: ${build.artifacts.length}</p>
                    <p>Última Edição: ${lastUpdated}</p>
                </div>
                <div class="mt-4 flex space-x-2">
                    <button data-action="edit-build" data-build-id="${build.id}" class="bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-600">Editar</button>
                    <button data-action="delete-build" data-build-id="${build.id}" class="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600">Excluir</button>
                </div>
            </div>
        `;
    };

    const renderArtifactCard = (artifact, buildId) => {
        const slotsHtml = ELEMENTS.map((element, index) => {
            const gem = artifact.gems[index];
            const config = ELEMENT_CONFIG[element];
            let content;
            
            if (gem) {
                const mainAttr = gem.attributes[0];
                const rarityColor = (gem.rarity === 'Legendário' || gem.rarity === 'Mítico') ? 'text-yellow-600' : 'text-gray-800';
                
                // Tenta carregar atributos para exibir o nome
                const masterAttributes = typeof StorageService !== 'undefined' ? StorageService.loadMasterAttributes() : [];
                const attrName = (masterAttributes) => {
                    const attr = masterAttributes?.find(a => a.id === mainAttr.attribute_id);
                    return attr ? attr.name : 'Desconhecido';
                };

                content = `
                    <div class="flex flex-col items-start p-2 w-full overflow-hidden">
                        <span class="text-xs font-bold ${rarityColor} truncate w-full">
                            ${gem.rarity.charAt(0)} +${gem.plus_level}
                        </span>
                        <span class="text-xs font-semibold text-gray-600 truncate w-full" title="${attrName(masterAttributes)}">
                            ${attrName(masterAttributes)} (Lv${mainAttr.tier})
                        </span>
                    </div>
                `;
            } else {
                content = `<span class="text-sm text-gray-500 italic">Vazio</span>`;
            }

            return `
                <div data-action="edit-gem" data-artifact-id="${artifact.id}" data-slot-index="${index}" 
                     class="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition duration-150 border-2 border-dashed ${gem ? 'border-gray-300 hover:border-indigo-500' : 'border-gray-200 hover:bg-gray-50'} ${config.bg}">
                    <span class="text-xs font-medium ${config.color} flex items-center gap-1">${config.icon} ${element.toUpperCase()}</span>
                    ${content}
                </div>
            `;
        }).join('');

        return `
            <div class="bg-white p-5 rounded-xl shadow-lg border-t-4 border-indigo-500">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-lg font-semibold text-gray-700">Artefato ${artifact.position}</h4>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Nome</label>
                        <input type="text" data-artifact-id="${artifact.id}" data-field="name" value="${artifact.name || ''}" 
                               class="artifact-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border" placeholder="Ex: Anel">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Nível (+)</label>
                        <input type="number" data-artifact-id="${artifact.id}" data-field="level" value="${artifact.level}" min="0" 
                               class="artifact-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border">
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-2 border-t pt-4">
                    ${slotsHtml}
                </div>
            </div>
        `;
    };

    // --- MODAL DE GEMAS (EDITOR) ---

    const renderGemModal = (artifact, slotIndex, gem, masterAttributes) => {
        const element = ELEMENTS[slotIndex];
        const config = ELEMENT_CONFIG[element];
        const initialAttributesHtml = renderGemAttributes(gem, element, masterAttributes);

        const modalHtml = `
            <div id="modal-backdrop" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div id="gem-edit-modal" class="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                    <div class="p-6 border-b flex justify-between items-center ${config.bg}">
                        <h3 class="text-2xl font-bold ${config.color} flex items-center gap-2">${config.icon} ${gem ? 'Editar Gema' : 'Nova Gema'} (${element.toUpperCase()})</h3>
                        <button id="close-gem-modal-btn" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                    </div>

                    <form id="gem-form" class="p-6">
                        <h4 class="font-semibold text-lg mb-4">Detalhes</h4>
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Raridade</label>
                                <select id="gem-rarity" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    <option value="Comum" ${gem?.rarity === 'Comum' ? 'selected' : ''}>Comum</option>
                                    <option value="Raro" ${gem?.rarity === 'Raro' ? 'selected' : ''}>Raro</option>
                                    <option value="Épico" ${gem?.rarity === 'Épico' ? 'selected' : ''}>Épico</option>
                                    <option value="Legendário" ${gem?.rarity === 'Legendário' ? 'selected' : ''}>Legendário</option>
                                    <option value="Mítico" ${gem?.rarity === 'Mítico' ? 'selected' : ''}>Mítico</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Nível (+)</label>
                                <input type="number" id="gem-plus-level" value="${gem?.plus_level || 0}" min="0" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                            </div>
                        </div>

                        <h4 class="font-semibold text-lg mb-4 border-t pt-4">Atributos</h4>
                        <div id="attributes-container" class="space-y-4">
                            ${initialAttributesHtml}
                        </div>
                        
                        <button type="button" id="add-attribute-row-btn" class="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition duration-150 w-full">
                            + Adicionar Atributo
                        </button>

                        <div class="mt-6 flex justify-between border-t pt-4">
                            <button type="button" id="remove-gem-btn" class="text-red-600 font-medium hover:text-red-800 transition duration-150" style="${gem ? '' : 'display: none;'}">
                                Remover Gema
                            </button>
                            <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md">
                                Salvar Gema
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('modals-container').innerHTML = modalHtml;
    };

    const renderGemAttributes = (gem, gemElement, masterAttributes) => {
        if (!gem || !gem.attributes || gem.attributes.length === 0) return '';

        return gem.attributes.map((attr, index) => {
            const filteredAttributes = masterAttributes.filter(a => 
                a.tier === attr.tier && (!a.default_element || a.default_element === gemElement)
            );

            const attributeOptions = filteredAttributes.map(a =>
                `<option value="${a.id}" data-tier="${a.tier}" ${a.id === attr.attribute_id ? 'selected' : ''}>${a.name}</option>`
            ).join('');

            const remodelOptions = REMODELS.map(r => 
                `<option value="${r}" ${r === attr.remodel ? 'selected' : ''}>${r.charAt(0).toUpperCase() + r.slice(1)}</option>`
            ).join('');
            
            const tierOptions = [1, 2, 3].map(t => 
                `<option value="${t}" ${t === attr.tier ? 'selected' : ''}>Lv${t}</option>`
            ).join('');

            return `
                <div class="attribute-row p-3 border rounded-lg bg-gray-50 mb-3" data-attr-index="${index}">
                    <h5 class="font-semibold text-gray-700 mb-2">Atributo ${index + 1}</h5>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-xs font-medium text-gray-500">Tier</label>
                            <select required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm attribute-tier">
                                ${tierOptions}
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-xs font-medium text-gray-500">Atributo</label>
                            <select required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm attribute-id">
                                <option value="">Selecione...</option>
                                ${attributeOptions}
                            </select>
                        </div>
                    </div>
                    <div class="mt-3">
                        <label class="block text-xs font-medium text-gray-500">Qualidade (Remodel)</label>
                        <select required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm attribute-remodel">
                            ${remodelOptions}
                        </select>
                    </div>
                    <button type="button" class="mt-3 text-red-500 text-xs font-medium remove-attribute-btn">Remover</button>
                </div>
            `;
        }).join('');
    };

    // --- RENDERIZAÇÃO DO PAINEL ADMIN ---

    const renderMasterAttributesList = (attributes) => {
        const container = document.getElementById('master-attributes-list');
        if (!container) return;
        if (attributes.length === 0) { container.innerHTML = '<p class="text-gray-500">Nenhum cadastrado.</p>'; return; }

        let html = '';
        attributes.forEach(attr => {
            const element = attr.default_element;
            const config = element ? ELEMENT_CONFIG[element] : { color: 'text-gray-500', bg: 'bg-gray-100', icon: ICONS.default };
            html += `
                <div class="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div class="flex items-center space-x-3">
                        <span class="font-bold ${config.color} flex items-center gap-1">${config.icon} ${attr.name}</span>
                        <span class="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Lv${attr.tier}</span>
                    </div>
                    <div>
                        <button data-action="edit-master-attr" data-id="${attr.id}" class="text-indigo-600 hover:text-indigo-800 text-sm">Editar</button>
                        <button data-action="delete-master-attr" data-id="${attr.id}" class="text-red-600 hover:text-red-800 text-sm ml-3">Excluir</button>
                    </div>
                </div>`;
        });
        container.innerHTML = html;
    };

    const renderRequiredAttributesList = (requiredAttributes, masterAttributes) => {
        const container = document.getElementById('required-attributes-list');
        if (!container) return;
        if (requiredAttributes.length === 0) { container.innerHTML = '<p class="text-gray-500">Nenhum requisito.</p>'; return; }

        let html = '';
        requiredAttributes.forEach(req => {
            const masterAttr = masterAttributes.find(a => a.id === req.attribute_id);
            const attrName = masterAttr ? masterAttr.name : 'Desconhecido';
            html += `
                <div class="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div class="flex items-center space-x-3">
                        <span class="font-bold text-gray-800">${attrName}</span>
                        <span class="text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">ESSENCIAL</span>
                    </div>
                    <button data-action="delete-required-attr" data-id="${req.id}" class="text-red-600 hover:text-red-800 text-sm">Excluir</button>
                </div>`;
        });
        container.innerHTML = html;
    };

    // --- NOVO: Lista de Secundários ---
    const renderSecondaryAttributesList = (secondaryAttributes, masterAttributes) => {
        // Verifica se a div da lista existe; se não, injeta o HTML da aba
        let tabContent = document.getElementById('secondary-attributes-tab');
        if (!tabContent) {
            const adminArea = document.getElementById('admin-content-area');
            const newTabDiv = document.createElement('div');
            newTabDiv.id = 'secondary-attributes-tab';
            newTabDiv.className = 'admin-tab-content hidden';
            newTabDiv.innerHTML = `
                <h3 class="text-xl font-semibold mb-4">Atributos Secundários (Suporte)</h3>
                <p class="text-sm text-gray-600 mb-3">Atributos úteis que não são obrigatórios, mas evitam que a gema seja marcada como "Inútil".</p>
                <button id="add-secondary-attribute-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 mb-4">+ Adicionar Secundário</button>
                <div id="secondary-attributes-list"></div>
            `;
            adminArea.appendChild(newTabDiv);
        }
        
        const container = document.getElementById('secondary-attributes-list');
        if (!container) return;

        if (secondaryAttributes.length === 0) { container.innerHTML = '<p class="text-gray-500">Nenhum secundário.</p>'; return; }

        let html = '';
        secondaryAttributes.forEach(sec => {
            const masterAttr = masterAttributes.find(a => a.id === sec.attribute_id);
            const attrName = masterAttr ? masterAttr.name : 'Desconhecido';
            html += `
                <div class="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div class="flex items-center space-x-3">
                        <span class="font-bold text-gray-800">${attrName}</span>
                        <span class="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">SECUNDÁRIO</span>
                    </div>
                    <button data-action="delete-secondary-attr" data-id="${sec.id}" class="text-red-600 hover:text-red-800 text-sm">Excluir</button>
                </div>`;
        });
        container.innerHTML = html;
    };

    const renderRecommendedCombosList = (combos, masterAttributes) => {
        const container = document.getElementById('recommended-combos-list');
        if (!container) return;
        if (combos.length === 0) { container.innerHTML = '<p class="text-gray-500">Nenhum combo.</p>'; return; }

        let html = '';
        combos.forEach(combo => {
            const comboAttributes = combo.attribute_ids.map(id => {
                const attr = masterAttributes.find(a => a.id === id);
                return attr ? attr.name : 'Desconhecido';
            }).join(', ');
            html += `
                <div class="p-4 border rounded-lg bg-indigo-50 mb-3">
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-lg text-indigo-800">${combo.name}</h4>
                        <div class="space-x-2">
                            <button data-action="edit-combo" data-id="${combo.id}" class="text-indigo-600 hover:text-indigo-800 text-sm">Editar</button>
                            <button data-action="delete-combo" data-id="${combo.id}" class="text-red-600 hover:text-red-800 text-sm">Excluir</button>
                        </div>
                    </div>
                    <p class="text-sm text-gray-700 mt-2">Requer: ${comboAttributes}</p>
                </div>`;
        });
        container.innerHTML = html;
    };

    // --- MODAIS DO ADMIN ---

    const renderMasterAttributeModal = (attr = null) => {
        const elementOptions = ELEMENTS.map(e => `<option value="${e}" ${attr?.default_element === e ? 'selected' : ''}>${e.toUpperCase()}</option>`).join('');
        const tierOptions = [1, 2, 3].map(t => `<option value="${t}" ${attr?.tier === t ? 'selected' : ''}>Tier ${t}</option>`).join('');
        
        const modalHtml = `
            <div id="admin-modal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
                    <div class="p-6 border-b flex justify-between">
                        <h3 class="text-xl font-bold text-indigo-700">${attr ? 'Editar' : 'Criar'} Atributo</h3>
                        <button id="close-admin-modal-btn" class="text-gray-500">&times;</button>
                    </div>
                    <form id="master-attribute-form" class="p-6">
                        <input type="hidden" id="master-attr-id" value="${attr?.id || ''}">
                        <div class="mb-4">
                            <label class="block text-sm font-medium">Nome</label>
                            <input type="text" id="master-attr-name" value="${attr?.name || ''}" required class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium">Tier</label>
                            <select id="master-attr-tier" class="mt-1 block w-full rounded border-gray-300 p-2 border">${tierOptions}</select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium">Elemento Exclusivo</label>
                            <select id="master-attr-element" class="mt-1 block w-full rounded border-gray-300 p-2 border">
                                <option value="">Nenhum (Global)</option>
                                ${elementOptions}
                            </select>
                        </div>
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 w-full">Salvar</button>
                    </form>
                </div>
            </div>`;
        document.getElementById('modals-container').innerHTML = modalHtml;
    };

    const renderRequiredAttributeModal = (masterAttributes) => {
        const opts = masterAttributes.map(a => `<option value="${a.id}">${a.name} (Lv${a.tier})</option>`).join('');
        const modalHtml = `
            <div id="admin-modal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
                    <div class="p-6 border-b flex justify-between">
                        <h3 class="text-xl font-bold text-indigo-700">Adicionar Requisito</h3>
                        <button id="close-admin-modal-btn" class="text-gray-500">&times;</button>
                    </div>
                    <form id="required-attribute-form" class="p-6">
                        <div class="mb-4">
                            <label class="block text-sm font-medium">Atributo Mestre</label>
                            <select id="required-attr-id" required class="mt-1 block w-full rounded border-gray-300 p-2 border">${opts}</select>
                        </div>
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded w-full">Adicionar</button>
                    </form>
                </div>
            </div>`;
        document.getElementById('modals-container').innerHTML = modalHtml;
    };

    // --- NOVO: Modal para Secundários ---
    const renderSecondaryAttributeModal = (masterAttributes) => {
        const opts = masterAttributes.map(a => `<option value="${a.id}">${a.name} (Lv${a.tier})</option>`).join('');
        const modalHtml = `
            <div id="admin-modal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
                    <div class="p-6 border-b flex justify-between">
                        <h3 class="text-xl font-bold text-blue-700">Adicionar Secundário</h3>
                        <button id="close-admin-modal-btn" class="text-gray-500">&times;</button>
                    </div>
                    <form id="secondary-attribute-form" class="p-6">
                        <div class="mb-4">
                            <label class="block text-sm font-medium">Atributo Mestre</label>
                            <select id="secondary-attr-id" required class="mt-1 block w-full rounded border-gray-300 p-2 border">${opts}</select>
                        </div>
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded w-full">Adicionar</button>
                    </form>
                </div>
            </div>`;
        document.getElementById('modals-container').innerHTML = modalHtml;
    };

    const renderRecommendedComboModal = (masterAttributes, combo = null) => {
        const opts = masterAttributes.map(a => {
            const sel = combo?.attribute_ids.includes(a.id) ? 'selected' : '';
            return `<option value="${a.id}" ${sel}>${a.name}</option>`;
        }).join('');
        
        const modalHtml = `
            <div id="admin-modal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
                    <div class="p-6 border-b flex justify-between">
                        <h3 class="text-xl font-bold text-indigo-700">${combo ? 'Editar' : 'Novo'} Combo</h3>
                        <button id="close-admin-modal-btn" class="text-gray-500">&times;</button>
                    </div>
                    <form id="combo-form" class="p-6">
                        <input type="hidden" id="combo-id" value="${combo?.id || ''}">
                        <div class="mb-4"><label class="block text-sm">Nome</label><input id="combo-name" value="${combo?.name || ''}" class="w-full border p-2 rounded"></div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div><label class="block text-sm">Raridade</label><select id="combo-rarity" class="w-full border p-2 rounded"><option>Comum</option><option>Raro</option><option>Épico</option><option>Legendário</option></select></div>
                            <div><label class="block text-sm">Nível (+)</label><input type="number" id="combo-plus-level" value="${combo?.plus_level || 0}" class="w-full border p-2 rounded"></div>
                        </div>
                        <div class="mb-4"><label class="block text-sm">Atributos (Ctrl+Click)</label><select id="combo-attributes" multiple size="5" class="w-full border p-2 rounded">${opts}</select></div>
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded w-full">Salvar</button>
                    </form>
                </div>
            </div>`;
        document.getElementById('modals-container').innerHTML = modalHtml;
    };

    // --- Modal Logic ---
    const closeCurrentModal = () => {
        document.getElementById('modals-container').innerHTML = '';
        document.removeEventListener('keydown', handleEscapeKey);
    };

    const handleEscapeKey = (event) => {
        if (event.key === 'Escape') closeCurrentModal();
    };

    const attachModalCloseListeners = () => {
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', (event) => {
                if (event.target.id === 'modal-backdrop') closeCurrentModal();
            });
            document.addEventListener('keydown', handleEscapeKey);
        }
    };

    return {
        renderBuildCard,
        renderArtifactCard,
        renderGemModal,
        // Admin
        renderMasterAttributesList,
        renderMasterAttributeModal,
        renderRequiredAttributesList,
        renderRequiredAttributeModal,
        renderSecondaryAttributesList, // <--- FUNÇÃO ADICIONADA
        renderSecondaryAttributeModal, // <--- FUNÇÃO ADICIONADA
        renderRecommendedCombosList,
        renderRecommendedComboModal,
        // Utils
        closeCurrentModal,
        attachModalCloseListeners
    };
})();