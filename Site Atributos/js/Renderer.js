/**
 * Módulo responsável por gerar o HTML dinâmico.
 */
const Renderer = (() => {

    // --- ÍCONES SVG (Heroicons Style) ---
    // Usamos 'w-5 h-5' para tamanho e 'fill-current' para pegar a cor do texto (.text-fogo, etc)
    
    const ICONS = {
        fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
        </svg>`,
        
        ice: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M12 2.25c.414 0 .75.336.75.75v2.25l1.95-1.125a.75.75 0 01.75 1.3l-1.95 1.125 1.95 1.125a.75.75 0 01-.75 1.3l-1.95-1.125V10.5h2.25l1.125-1.95a.75.75 0 011.3.75l-1.125 1.95h2.25a.75.75 0 010 1.5h-2.25l1.125 1.95a.75.75 0 11-1.3.75l-1.125-1.95H12.75v2.625l1.95-1.125a.75.75 0 11.75 1.3l-1.95 1.125 1.95 1.125a.75.75 0 11-.75 1.3l-1.95-1.125V21a.75.75 0 01-1.5 0v-2.25l-1.95 1.125a.75.75 0 01-.75-1.3l1.95-1.125-1.95-1.125a.75.75 0 01.75-1.3l1.95 1.125V13.5H8.25l-1.125 1.95a.75.75 0 11-1.3-.75l1.125-1.95H4.5a.75.75 0 010-1.5h2.25L5.625 9.3a.75.75 0 011.3-.75l1.125 1.95H10.5V7.875L8.55 9a.75.75 0 01-.75-1.3l1.95-1.125-1.95-1.125a.75.75 0 01.75-1.3l1.95 1.125V3a.75.75 0 01.75-.75z" clip-rule="evenodd" />
        </svg>`,
        
        light: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>`,
        
        poison: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5zm8.25-3.75a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0v-2.25H7.5a.75.75 0 010-1.5h2.25V7.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
            <path d="M10.5 3.75c.507 0 1.002.046 1.482.133a.75.75 0 00.27-1.476 8.223 8.223 0 00-3.504 0 .75.75 0 00.27 1.476c.48-.087.975-.133 1.482-.133z" />
        </svg>`, // Usando um ícone similar a poção/biológico

        default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>`
    };

    // Definições de cores e elementos (devem ser consistentes com o index.html)
    const ELEMENT_CONFIG = {
        'fogo': { color: 'text-fogo', bg: 'bg-fogo-100', icon: ICONS.fire },
        'gelo': { color: 'text-gelo', bg: 'bg-gelo-100', icon: ICONS.ice },
        'luz': { color: 'text-luz', bg: 'bg-luz-100', icon: ICONS.light },
        'veneno': { color: 'text-veneno', bg: 'bg-veneno-100', icon: ICONS.poison }
    };
    const ELEMENTS = ['fogo', 'gelo', 'luz', 'veneno'];
    const REMODELS = AdminService.REMODELS; // 'comum', 'raro', 'epico'

    /**
     * Renderiza o card de uma build na Dashboard.
     * @param {object} build - O objeto da build.
     * @returns {string} HTML do card.
     */
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

    /**
     * Renderiza um único card de artefato no editor de build.
     * @param {object} artifact - O objeto do artefato.
     * @returns {string} HTML do card.
     */
    const renderArtifactCard = (artifact) => {
        const slotsHtml = ELEMENTS.map((element, index) => {
            const gem = artifact.gems[index];
            const config = ELEMENT_CONFIG[element];

            let content;
            if (gem) {
                const mainAttr = gem.attributes[0];
                const rarityColor = gem.rarity === 'Legendário' ? 'text-yellow-600' : 'text-gray-800';
                
                const attrName = (masterAttributes) => {
                    const attr = masterAttributes?.find(a => a.id === mainAttr.attribute_id);
                    return attr ? attr.name : 'Attr. Desconhecido';
                };

                content = `
                    <div class="flex flex-col items-start p-2">
                        <span class="text-xs font-bold ${rarityColor} truncate w-full">
                            ${gem.rarity.charAt(0)} +${gem.plus_level}
                        </span>
                        <span class="text-xs font-semibold text-gray-600 truncate w-full" title="${attrName(StorageService.loadMasterAttributes())}">
                            ${attrName(StorageService.loadMasterAttributes())} (Lv${mainAttr.tier})
                        </span>
                    </div>
                `;
            } else {
                content = `<span class="text-sm text-gray-500 italic">Vazio</span>`;
            }

            return `
                <div data-action="edit-gem" data-artifact-id="${artifact.id}" data-slot-index="${index}" 
                     class="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition duration-150 border-2 border-dashed ${gem ? 'border-gray-300 hover:border-indigo-500' : 'border-gray-200 hover:bg-gray-50'} ${config.bg}">
                    <span class="text-xs font-medium ${config.color}">${config.icon} ${element.toUpperCase()}</span>
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
                        <label for="artifact-name-${artifact.id}" class="block text-sm font-medium text-gray-700">Nome/Posição</label>
                        <input type="text" id="artifact-name-${artifact.id}" data-artifact-id="${artifact.id}" data-field="name" value="${artifact.name || ''}" 
                               class="artifact-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border" placeholder="Ex: Anel, Bota...">
                    </div>
                    <div>
                        <label for="artifact-level-${artifact.id}" class="block text-sm font-medium text-gray-700">Nível (+)</label>
                        <input type="number" id="artifact-level-${artifact.id}" data-artifact-id="${artifact.id}" data-field="level" value="${artifact.level}" min="0" 
                               class="artifact-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border">
                    </div>
                </div>

                <div class="grid grid-cols-4 gap-2 border-t pt-4">
                    ${slotsHtml}
                </div>
            </div>
        `;
    };

    /**
     * Renderiza o modal de edição/criação de Gema.
     * @param {object} artifact - Artefato pai.
     * @param {number} slotIndex - Índice do slot (0=Fogo, 1=Gelo...).
     * @param {object} gem - Objeto da gema (se houver).
     * @param {array} masterAttributes - Lista de atributos mestres.
     */
    const renderGemModal = (artifact, slotIndex, gem, masterAttributes) => {
        const element = ELEMENTS[slotIndex];
        const config = ELEMENT_CONFIG[element];

        const modalHtml = `
            <div id="modal-backdrop" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div id="gem-edit-modal" class="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                    <div class="p-6 border-b flex justify-between items-center ${config.bg}">
                        <h3 class="text-2xl font-bold ${config.color}">${config.icon} ${gem ? 'Editar Gema' : 'Adicionar Nova Gema'}</h3>
                        <button id="close-gem-modal-btn" class="text-gray-500 hover:text-gray-800">&times;</button>
                    </div>

                    <form id="gem-form" class="p-6">
                        <h4 class="font-semibold text-lg mb-4">Detalhes Básicos da Gema</h4>
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label for="gem-rarity" class="block text-sm font-medium text-gray-700">Raridade</label>
                                <select id="gem-rarity" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    <option value="B" ${gem?.rarity === 'B' ? 'selected' : ''}>B</option>
                                    <option value="A" ${gem?.rarity === 'A' ? 'selected' : ''}>A</option>
                                    <option value="S" ${gem?.rarity === 'S' ? 'selected' : ''}>S</option>
                                    <option value="SS" ${gem?.rarity === 'SS' ? 'selected' : ''}>SS</option>
                                    <option value="SSR" ${gem?.rarity === 'SSR' ? 'selected' : ''}>SSR</option>
                                </select>
                            </div>
                            <div>
                                <label for="gem-plus-level" class="block text-sm font-medium text-gray-700">Nível (+)</label>
                                <input type="number" id="gem-plus-level" value="${gem?.plus_level || 0}" min="0" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                            </div>
                        </div>

                        <h4 class="font-semibold text-lg mb-4 border-t pt-4">Atributos</h4>
                        <div id="attributes-container" class="space-y-4">
                            ${renderGemAttributes(gem, element, masterAttributes)}
                        </div>
                        
                        <button type="button" id="add-attribute-row-btn" class="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition duration-150">
                            + Adicionar Atributo (Max 3)
                        </button>

                        <div class="mt-6 flex justify-between">
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

    /**
     * Renderiza as linhas de atributos dentro do modal de gema.
     */
    const renderGemAttributes = (gem, gemElement, masterAttributes) => {
        if (!gem || gem.attributes.length === 0) return '';

        return gem.attributes.map((attr, index) => {
            
            // Filtra os atributos disponíveis por Tier e Exclusividade de Elemento
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
                                <option value="">Selecione um Atributo</option>
                                ${attributeOptions}
                            </select>
                        </div>
                    </div>
                    <div class="mt-3">
                        <label class="block text-xs font-medium text-gray-500">Remodelação/Qualidade</label>
                        <select required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm attribute-remodel">
                            ${remodelOptions}
                        </select>
                    </div>
                    <button type="button" class="mt-3 text-red-500 text-xs font-medium remove-attribute-btn">Remover</button>
                </div>
            `;
        }).join('');
    };

    // --- Renderização do Admin (Novas Funções) ---

    /**
     * Renderiza a lista de Atributos Mestres (e o formulário de adição/edição).
     */
    const renderMasterAttributesList = (attributes) => {
        const container = document.getElementById('master-attributes-list');
        if (!container) return;

        let html = '';
        if (attributes.length === 0) {
            html += '<p class="text-gray-500">Nenhum atributo mestre cadastrado.</p>';
        } else {
            attributes.forEach(attr => {
                const element = attr.default_element;
                const config = element ? ELEMENT_CONFIG[element] : { color: 'text-gray-500', bg: 'bg-gray-100', icon: ICONS.default };

                html += `
                    <div class="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition duration-100">
                        <div class="flex items-center space-x-3">
                            <span class="font-bold ${config.color}">${config.icon} ${attr.name}</span>
                            <span class="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Lv${attr.tier}</span>
                            ${element ? `<span class="text-xs font-semibold ${config.color} border border-current px-2 py-0.5 rounded-full">${element.toUpperCase()}</span>` : ''}
                        </div>
                        <div>
                            <button data-action="edit-master-attr" data-id="${attr.id}" class="text-indigo-600 hover:text-indigo-800 text-sm">Editar</button>
                            <button data-action="delete-master-attr" data-id="${attr.id}" class="text-red-600 hover:text-red-800 text-sm ml-3">Excluir</button>
                        </div>
                    </div>
                `;
            });
        }
        container.innerHTML = html;
    };

    /**
     * Renderiza o modal para criar/editar Atributo Mestre.
     */
    const renderMasterAttributeModal = (attr = null) => {
        const title = attr ? 'Editar Atributo Mestre' : 'Adicionar Novo Atributo Mestre';
        const isEditing = !!attr;

        const elementOptions = ELEMENTS.map(e => 
            `<option value="${e}" ${attr?.default_element === e ? 'selected' : ''}>${e.charAt(0).toUpperCase() + e.slice(1)}</option>`
        ).join('');

        const tierOptions = [1, 2, 3].map(t =>
            `<option value="${t}" ${attr?.tier === t ? 'selected' : ''}>Tier ${t}</option>`
        ).join('');

        const modalHtml = `
            <div id="modal-backdrop" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b">
                        <h3 class="text-xl font-bold text-indigo-700">${title}</h3>
                        <button id="close-admin-modal-btn" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
                    </div>

                    <form id="master-attribute-form" class="p-6">
                        <input type="hidden" id="master-attr-id" value="${attr?.id || ''}">
                        
                        <div class="mb-4">
                            <label for="master-attr-name" class="block text-sm font-medium text-gray-700">Nome do Atributo</label>
                            <input type="text" id="master-attr-name" value="${attr?.name || ''}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>

                        <div class="mb-4">
                            <label for="master-attr-tier" class="block text-sm font-medium text-gray-700">Tier (Nível da Gema)</label>
                            <select id="master-attr-tier" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                ${tierOptions}
                            </select>
                        </div>

                        <div class="mb-4">
                            <label for="master-attr-element" class="block text-sm font-medium text-gray-700">Elemento Exclusivo (Opcional)</label>
                            <select id="master-attr-element" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                <option value="">Nenhum (Pode ser usado em qualquer gema)</option>
                                ${elementOptions}
                            </select>
                            <p class="text-xs text-gray-500 mt-1">Se definido, o atributo só pode ser encontrado nesse tipo de gema.</p>
                        </div>

                        <div class="mt-6 flex justify-end">
                            <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md">
                                ${isEditing ? 'Salvar Alterações' : 'Adicionar Atributo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('modals-container').insertAdjacentHTML('beforeend', modalHtml);
    };

    /**
     * Renderiza a lista de Atributos Requeridos.
     */
    const renderRequiredAttributesList = (requiredAttributes, masterAttributes) => {
        const container = document.getElementById('required-attributes-list');
        if (!container) return;

        let html = '';
        if (requiredAttributes.length === 0) {
            html += '<p class="text-gray-500">Nenhum atributo essencial definido.</p>';
        } else {
            requiredAttributes.forEach(req => {
                const masterAttr = masterAttributes.find(a => a.id === req.attribute_id);
                const attrName = masterAttr ? masterAttr.name : 'Atributo Desconhecido';

                html += `
                    <div class="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition duration-100">
                        <div class="flex items-center space-x-3">
                            <span class="font-bold text-gray-800">${attrName}</span>
                            <span class="text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">REQUERIDO</span>
                        </div>
                        <div>
                            <button data-action="delete-required-attr" data-id="${req.id}" class="text-red-600 hover:text-red-800 text-sm">Excluir</button>
                        </div>
                    </div>
                `;
            });
        }
        container.innerHTML = html;
    };

    /**
     * Renderiza o modal para adicionar Atributo Requerido.
     * @param {array} masterAttributes - Lista de atributos mestres.
     */
    const renderRequiredAttributeModal = (masterAttributes) => {
        const attributeOptions = masterAttributes.map(a => 
            `<option value="${a.id}">${a.name} (Lv${a.tier} / ${a.default_element || 'Qualquer Elemento'})</option>`
        ).join('');

        const modalHtml = `
            <div id="modal-backdrop" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
                    <div class="p-6 border-b">
                        <h3 class="text-xl font-bold text-indigo-700">Adicionar Atributo Essencial</h3>
                        <button id="close-admin-modal-btn" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
                    </div>

                    <form id="required-attribute-form" class="p-6">
                        <div class="mb-4">
                            <label for="required-attr-id" class="block text-sm font-medium text-gray-700">Atributo Mestre</label>
                            <select id="required-attr-id" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                <option value="">Selecione um Atributo</option>
                                ${attributeOptions}
                            </select>
                        </div>
                        <div class="mt-6 flex justify-end">
                            <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow-md">
                                Adicionar Requisito
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('modals-container').insertAdjacentHTML('beforeend', modalHtml);
    };

    /**
     * Renderiza a lista de Combos Recomendados.
     */
    const renderRecommendedCombosList = (combos, masterAttributes) => {
        const container = document.getElementById('recommended-combos-list');
        if (!container) return;

        let html = '';
        if (combos.length === 0) {
            html += '<p class="text-gray-500">Nenhum combo recomendado cadastrado.</p>';
        } else {
            combos.forEach(combo => {
                const comboAttributes = combo.attribute_ids.map(id => {
                    const attr = masterAttributes.find(a => a.id === id);
                    return attr ? attr.name : 'Desconhecido';
                }).join(', ');

                html += `
                    <div class="p-4 border rounded-lg bg-indigo-50 mb-3">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-lg text-indigo-800">${combo.name} (${combo.rarity} +${combo.plus_level})</h4>
                            <div class="space-x-2">
                                <button data-action="edit-combo" data-id="${combo.id}" class="text-indigo-600 hover:text-indigo-800 text-sm">Editar</button>
                                <button data-action="delete-combo" data-id="${combo.id}" class="text-red-600 hover:text-red-800 text-sm">Excluir</button>
                            </div>
                        </div>
                        <p class="text-sm text-gray-700 mt-2">Atributos Necessários: ${comboAttributes}</p>
                    </div>
                `;
            });
        }
        container.innerHTML = html;
    };

    /**
     * Renderiza o modal para criar/editar Combo.
     */
    const renderRecommendedComboModal = (masterAttributes, combo = null) => {
        const title = combo ? 'Editar Combo Recomendado' : 'Adicionar Novo Combo';
        const isEditing = !!combo;

        const attributeOptions = masterAttributes.map(a => {
            const isSelected = combo?.attribute_ids.includes(a.id);
            return `<option value="${a.id}" ${isSelected ? 'selected' : ''}>${a.name} (Lv${a.tier})</option>`;
        }).join('');

        const rarityOptions = ['Comum', 'Raro', 'Épico', 'Legendário'].map(r => 
            `<option value="${r}" ${combo?.rarity === r ? 'selected' : ''}>${r}</option>`
        ).join('');

        const modalHtml = `
            <div id="modal-backdrop" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b">
                        <h3 class="text-xl font-bold text-indigo-700">${title}</h3>
                        <button id="close-admin-modal-btn" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
                    </div>

                    <form id="combo-form" class="p-6">
                        <input type="hidden" id="combo-id" value="${combo?.id || ''}">
                        
                        <div class="mb-4">
                            <label for="combo-name" class="block text-sm font-medium text-gray-700">Nome do Combo</label>
                            <input type="text" id="combo-name" value="${combo?.name || ''}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>

                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="combo-rarity" class="block text-sm font-medium text-gray-700">Raridade Mínima</label>
                                <select id="combo-rarity" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    ${rarityOptions}
                                </select>
                            </div>
                            <div>
                                <label for="combo-plus-level" class="block text-sm font-medium text-gray-700">Nível Mínimo (+)</label>
                                <input type="number" id="combo-plus-level" value="${combo?.plus_level || 0}" min="0" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="combo-attributes" class="block text-sm font-medium text-gray-700">Atributos Necessários (Selecione um ou mais)</label>
                            <select id="combo-attributes" multiple required size="6" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                ${attributeOptions}
                            </select>
                            <p class="text-xs text-gray-500 mt-1">Dica: Segure Ctrl/Cmd para selecionar múltiplos.</p>
                        </div>

                        <div class="mt-6 flex justify-end">
                            <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow-md">
                                ${isEditing ? 'Salvar Combo' : 'Adicionar Combo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('modals-container').insertAdjacentHTML('beforeend', modalHtml);
    };

    // --- FUNÇÕES DE GERENCIAMENTO DE MODAL ---

    // 1. Fecha o modal removendo o conteúdo do container
    const closeCurrentModal = () => {
        const container = document.getElementById('modals-container');
        container.innerHTML = '';
        
        // Remove o listener de teclado para não interferir após o fechamento
        document.removeEventListener('keydown', handleEscapeKey);
    };

    // 2. Manipula a tecla ESC
    const handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
            closeCurrentModal();
        }
    };

    // 3. Anexa os listeners de clique fora e ESC
    const attachModalCloseListeners = () => {
        const backdrop = document.getElementById('modal-backdrop');
        
        if (backdrop) {
            // Fechar ao Clicar no Backdrop (área escura fora do modal)
            backdrop.addEventListener('click', (event) => {
                // Garante que o clique foi no elemento externo do backdrop, e não no conteúdo interno
                if (event.target.id === 'modal-backdrop') { 
                    closeCurrentModal();
                }
            });

            // Fechar ao Pressionar a tecla ESC
            document.addEventListener('keydown', handleEscapeKey);
        }
    };

    return {
        renderBuildCard,
        renderArtifactCard,
        renderGemModal,
        // Funções do Admin
        renderMasterAttributesList,
        renderMasterAttributeModal,
        renderRequiredAttributesList,
        renderRequiredAttributeModal,
        renderRecommendedCombosList,
        renderRecommendedComboModal,
        // Funções de Gerenciamento de Modal
        closeCurrentModal,
        attachModalCloseListeners
    };
})();