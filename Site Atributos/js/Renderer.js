/**
 * Módulo responsável por gerar o HTML dinâmico com visual moderno.
 */
const Renderer = (() => {

    // --- ÍCONES SVG ---
    const ICONS = {
        fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" /></svg>`,
        ice: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M12 2.25c.414 0 .75.336.75.75v2.25l1.95-1.125a.75.75 0 01.75 1.3l-1.95 1.125 1.95 1.125a.75.75 0 01-.75 1.3l-1.95-1.125V10.5h2.25l1.125-1.95a.75.75 0 011.3.75l-1.125 1.95h2.25a.75.75 0 010 1.5h-2.25l1.125 1.95a.75.75 0 11-1.3.75l-1.125-1.95H12.75v2.625l1.95-1.125a.75.75 0 11.75 1.3l-1.95 1.125 1.95 1.125a.75.75 0 11-.75 1.3l-1.95-1.125V21a.75.75 0 01-1.5 0v-2.25l-1.95 1.125a.75.75 0 01-.75-1.3l1.95-1.125-1.95-1.125a.75.75 0 01.75-1.3l1.95 1.125V13.5H8.25l-1.125 1.95a.75.75 0 11-1.3-.75l1.125-1.95H4.5a.75.75 0 010-1.5h2.25L5.625 9.3a.75.75 0 011.3-.75l1.125 1.95H10.5V7.875L8.55 9a.75.75 0 01-.75-1.3l1.95-1.125-1.95-1.125a.75.75 0 01.75-1.3l1.95 1.125V3a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>`,
        light: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" /></svg>`,
        poison: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5zm8.25-3.75a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0v-2.25H7.5a.75.75 0 010-1.5h2.25V7.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /><path d="M10.5 3.75c.507 0 1.002.046 1.482.133a.75.75 0 00.27-1.476 8.223 8.223 0 00-3.504 0 .75.75 0 00.27 1.476c.48-.087.975-.133 1.482-.133z" /></svg>`,
        default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>`
    };

    const ELEMENT_CONFIG = {
        'fogo': { color: 'text-red-700', bg: 'bg-red-50', icon: ICONS.fire, badge: 'badge-fogo' },
        'gelo': { color: 'text-blue-700', bg: 'bg-blue-50', icon: ICONS.ice, badge: 'badge-gelo' },
        'luz': { color: 'text-amber-700', bg: 'bg-amber-50', icon: ICONS.light, badge: 'badge-luz' },
        'veneno': { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: ICONS.poison, badge: 'badge-veneno' }
    };

    // Configurações padrão
    const ELEMENTS = ['fogo', 'gelo', 'luz', 'veneno'];
    const REMODELS = ['comum', 'raro', 'épico', 'legendário', 'mítico'];

    // --- HELPER FUNCTIONS ---

    const getElementBadge = (element) => {
        if (!element) return '<span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Global</span>';
        const normalized = element.toLowerCase();
        const config = ELEMENT_CONFIG[normalized] || { badge: 'bg-gray-100 text-gray-600', icon: '' };
        return `<span class="badge-element ${config.badge} gap-1">${config.icon} ${element}</span>`;
    };

    const getRarityColor = (rarity) => {
        switch (rarity?.toLowerCase()) {
            case 'comum': return 'text-slate-500';
            case 'raro': return 'text-blue-500 font-medium';
            case 'épico': return 'text-purple-600 font-medium';
            case 'legendário': return 'text-orange-500 font-bold';
            case 'mítico': return 'text-red-600 font-extrabold';
            default: return 'text-slate-600';
        }
    };

    // --- CARDS DA DASHBOARD ---

    const renderBuildCard = (build) => {
        const lastUpdated = build.lastUpdated ? new Date(build.lastUpdated).toLocaleDateString('pt-BR') : 'Hoje';
        const artifactCount = build.artifacts ? build.artifacts.length : 0;

        // Conta gemas
        let gemCount = 0;
        if (build.artifacts) build.artifacts.forEach(a => a.gems.forEach(g => { if (g) gemCount++ }));

        return `
            <div class="card-modern p-5 flex flex-col justify-between h-full relative overflow-hidden group">
                <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
                
                <div>
                    <div class="flex justify-between items-start mb-3 pl-3">
                        <div>
                            <h3 class="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">${build.name || 'Sem Nome'}</h3>
                            <p class="text-xs text-slate-500 font-bold uppercase tracking-wide">${build.class || 'Classe Indefinida'}</p>
                        </div>
                        <div class="p-2 bg-indigo-50 rounded-full text-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" /></svg>
                        </div>
                    </div>
                    
                    <div class="space-y-2 mb-6 pl-3">
                        <div class="flex items-center text-sm text-slate-600">
                            <span class="w-6 text-center mr-2">🏺</span> ${artifactCount} / 4 Artefatos
                        </div>
                        <div class="flex items-center text-sm text-slate-600">
                            <span class="w-6 text-center mr-2">💎</span> ${gemCount} Gemas
                        </div>
                        <div class="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ${lastUpdated}
                        </div>
                    </div>
                </div>

                <div class="flex justify-end space-x-2 pl-3">
                    <button onclick="App.loadBuild(${build.id})" class="btn-hover bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-indigo-200">
                        Editar
                    </button>
                    <button onclick="App.deleteBuild(${build.id})" class="btn-hover bg-white border border-slate-200 text-red-500 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-50 hover:border-red-100">
                        Excluir
                    </button>
                </div>
            </div>
        `;
    };

    // --- EDITOR DE ARTEFATOS ---

    const renderArtifactCard = (artifact, buildId) => {
        // Lógica visual: Artefato cheio ganha destaque verde
        const gemsFilled = artifact.gems.filter(g => g).length;
        const isComplete = gemsFilled === 4;
        const statusBorder = isComplete ? 'border-green-500' : 'border-slate-200';
        const progressDot = isComplete ? 'bg-green-500' : 'bg-slate-300';

        const slotsHtml = ELEMENTS.map((element, index) => {
            const gem = artifact.gems[index];
            const config = ELEMENT_CONFIG[element];
            let content;

            if (gem) {
                const mainAttr = gem.attributes[0];
                const rarityClass = getRarityColor(gem.rarity);

                // Busca nome do atributo (requer acesso ao StorageService se disponível)
                const masterAttributes = typeof StorageService !== 'undefined' ? StorageService.loadMasterAttributes() : [];
                const attrObj = masterAttributes.find(a => a.id === mainAttr.attribute_id);
                const attrName = attrObj ? attrObj.name : 'Desconhecido';

                content = `
                    <div class="w-full text-left overflow-hidden">
                        <div class="flex justify-between items-center w-full mb-1">
                            <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tier ${mainAttr.tier}</span>
                            <span class="text-[10px] font-bold ${rarityClass} bg-slate-50 px-1 rounded border border-slate-100">+${gem.plus_level}</span>
                        </div>
                        <div class="text-xs font-semibold text-slate-700 truncate" title="${attrName}">
                            ${attrName}
                        </div>
                        <div class="text-[10px] text-slate-400 truncate">
                            ${gem.rarity}
                        </div>
                    </div>
                `;
            } else {
                content = `
                    <div class="flex flex-col items-center justify-center h-16 text-slate-300 group-hover:text-indigo-400 transition-colors">
                        <span class="text-2xl font-light mb-1">+</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest">Vazio</span>
                    </div>
                `;
            }

            return `
                <div data-action="edit-gem" data-artifact-id="${artifact.id}" data-slot-index="${index}" 
                     class="relative cursor-pointer bg-white border ${gem ? 'border-slate-300' : 'border-dashed border-slate-200'} rounded-lg p-2 hover:border-indigo-400 hover:shadow-md transition-all group">
                    
                    <div class="absolute -top-2 left-2 px-1 bg-white">
                        ${getElementBadge(element)}
                    </div>
                    
                    <div class="mt-2">
                        ${content}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="glass-panel p-6 rounded-xl border-l-4 ${statusBorder} shadow-sm transition-all hover:shadow-md">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    
                    <div class="flex-grow w-full md:w-auto">
                        <div class="flex items-center gap-2 mb-2">
                            <div class="h-2.5 w-2.5 rounded-full ${progressDot}"></div>
                            <h4 class="font-bold text-slate-700 text-lg">Artefato ${artifact.position}</h4>
                        </div>
                        <input type="text" value="${artifact.name}" data-field="name" data-artifact-id="${artifact.id}" 
                               class="artifact-input w-full md:w-64 text-sm bg-slate-50 border-slate-200 rounded-md focus:border-indigo-500 focus:ring-indigo-500 px-3 py-1.5 text-slate-700 placeholder-slate-400 transition-colors" 
                               placeholder="Nome do Item (Ex: Bota)">
                    </div>
                    
                    <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Nível</span>
                        <input type="number" value="${artifact.level}" data-field="level" data-artifact-id="${artifact.id}" 
                               class="artifact-input w-16 text-center text-sm font-bold bg-white border-slate-200 rounded focus:border-indigo-500 focus:ring-indigo-500 p-1">
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    ${slotsHtml}
                </div>
            </div>
        `;
    };

    // --- MODAIS ---

    const renderGemModal = (artifact, slotIndex, gem, masterAttributes) => {
        const element = ELEMENTS[slotIndex];
        const config = ELEMENT_CONFIG[element];
        const initialAttributesHtml = renderGemAttributes(gem, element, masterAttributes);

        const modalHtml = `
            <div id="modal-backdrop" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
                <div id="gem-edit-modal" class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out]">
                    
                    <div class="p-6 border-b flex justify-between items-center ${config.bg}">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-widest ${config.color} opacity-70">Editor de Gema</span>
                            <h3 class="text-2xl font-extrabold ${config.color} flex items-center gap-2">
                                ${config.icon} ${element.toUpperCase()}
                            </h3>
                        </div>
                        <button id="close-gem-modal-btn" class="p-2 rounded-full hover:bg-white/50 text-slate-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div class="overflow-y-auto p-6 space-y-6">
                        <form id="gem-form">
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Raridade</label>
                                    <select id="gem-rarity" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 text-sm">
                                        ${REMODELS.map(r => `<option value="${r.charAt(0).toUpperCase() + r.slice(1)}" ${gem?.rarity === (r.charAt(0).toUpperCase() + r.slice(1)) ? 'selected' : ''}>${r.charAt(0).toUpperCase() + r.slice(1)}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nível (+)</label>
                                    <input type="number" id="gem-plus-level" value="${gem?.plus_level || 0}" min="0" required class="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 text-sm">
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between items-end mb-2 mt-6">
                                    <h4 class="font-bold text-slate-700">Atributos</h4>
                                    <span class="text-xs text-slate-400">Máx: 3</span>
                                </div>
                                <div id="attributes-container" class="space-y-3">
                                    ${initialAttributesHtml}
                                </div>
                                <button type="button" id="add-attribute-row-btn" class="mt-3 w-full btn-hover bg-slate-100 text-slate-600 font-bold py-2 rounded-lg text-xs border border-slate-200 hover:bg-slate-200 hover:text-slate-800">
                                    + Adicionar Linha
                                </button>
                            </div>

                            <div class="mt-8 flex gap-3 pt-6 border-t border-slate-100">
                                <button type="button" id="remove-gem-btn" class="flex-1 btn-hover bg-white border border-red-200 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50" style="${gem ? '' : 'display: none;'}">
                                    Remover
                                </button>
                                <button type="submit" class="flex-[2] btn-hover bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700">
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
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
                <div class="attribute-row p-3 rounded-lg bg-slate-50 border border-slate-200 relative group" data-attr-index="${index}">
                    <button type="button" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 remove-attribute-btn transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </button>
                    
                    <div class="grid grid-cols-12 gap-2 mb-2">
                        <div class="col-span-3">
                            <label class="block text-[10px] font-bold text-slate-400 uppercase">Tier</label>
                            <select required class="w-full text-xs rounded border-slate-300 py-1 attribute-tier">${tierOptions}</select>
                        </div>
                        <div class="col-span-9">
                            <label class="block text-[10px] font-bold text-slate-400 uppercase">Atributo</label>
                            <select required class="w-full text-xs rounded border-slate-300 py-1 attribute-id">
                                <option value="">Selecione...</option>
                                ${attributeOptions}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase">Qualidade (Remodel)</label>
                        <select required class="w-full text-xs rounded border-slate-300 py-1 attribute-remodel">${remodelOptions}</select>
                    </div>
                </div>
            `;
        }).join('');
    };

    // --- ADMIN ---

    const renderMasterAttributesList = (attributes) => {
        const container = document.getElementById('master-attributes-list');
        if (!container) return;
        if (attributes.length === 0) { container.innerHTML = '<p class="text-slate-400 text-sm text-center py-4">Nenhum atributo cadastrado.</p>'; return; }

        // Ordena
        const sorted = [...attributes].sort((a, b) => b.tier - a.tier || a.name.localeCompare(b.name));

        const html = sorted.map(attr => `
            <div class="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg hover:border-indigo-200 transition-colors group mb-2">
                <div class="flex items-center gap-3">
                    <span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">Lv${attr.tier}</span>
                    <span class="font-medium text-slate-700 text-sm">${attr.name}</span>
                    ${getElementBadge(attr.default_element)}
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button data-action="edit-master-attr" data-id="${attr.id}" class="p-1 text-indigo-400 hover:text-indigo-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                    <button data-action="delete-master-attr" data-id="${attr.id}" class="p-1 text-red-400 hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    };

    // (As funções renderRequiredAttributesList, renderSecondaryAttributesList, renderRecommendedCombosList 
    // seguem a mesma lógica visual moderna acima. O código ficaria muito extenso se repetisse tudo, 
    // mas a lógica é usar as classes 'bg-white', 'border', 'rounded-lg' e ícones SVG.)

    const renderRequiredAttributesList = (requiredAttributes, masterAttributes) => {
        const container = document.getElementById('required-attributes-list');
        if (!container) return;
        if (requiredAttributes.length === 0) { container.innerHTML = '<p class="text-slate-400 text-sm italic">Lista vazia.</p>'; return; }

        let html = '';
        requiredAttributes.forEach(req => {
            const masterAttr = masterAttributes.find(a => a.id === req.attribute_id);
            if (!masterAttr) return;
            html += `
                <div class="flex justify-between items-center p-3 bg-white border border-green-100 rounded-lg mb-2 shadow-sm">
                    <div class="flex items-center gap-2">
                        <span class="text-green-500 bg-green-50 p-1 rounded">✅</span>
                        <span class="font-bold text-slate-700 text-sm">${masterAttr.name}</span>
                        <span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 rounded border">Lv${masterAttr.tier}</span>
                    </div>
                    <button data-action="delete-required-attr" data-id="${req.id}" class="text-red-400 hover:text-red-600 text-xs font-bold uppercase hover:bg-red-50 px-2 py-1 rounded transition-colors">Remover</button>
                </div>`;
        });
        container.innerHTML = html;
    };

    const renderSecondaryAttributesList = (secondaryAttributes, masterAttributes) => {
        // (Lógica de criação da aba se não existir mantida do passo anterior)
        let tabContent = document.getElementById('secondary-attributes-tab');
        if (!tabContent) {
            const adminArea = document.getElementById('admin-content-area');
            const newTabDiv = document.createElement('div');
            newTabDiv.id = 'secondary-attributes-tab';
            newTabDiv.className = 'admin-tab-content hidden';
            newTabDiv.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-slate-700">Atributos Secundários</h3>
                        <p class="text-sm text-slate-500">Opcionais para suporte.</p>
                    </div>
                    <button id="add-secondary-attribute-btn" class="btn-hover bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md">+ Adicionar</button>
                </div>
                <div id="secondary-attributes-list" class="space-y-2"></div>
            `;
            adminArea.appendChild(newTabDiv);
        }

        const container = document.getElementById('secondary-attributes-list');
        if (!container) return;
        if (secondaryAttributes.length === 0) { container.innerHTML = '<p class="text-slate-400 text-sm italic">Lista vazia.</p>'; return; }

        let html = '';
        secondaryAttributes.forEach(sec => {
            const masterAttr = masterAttributes.find(a => a.id === sec.attribute_id);
            if (!masterAttr) return;
            html += `
                <div class="flex justify-between items-center p-3 bg-white border border-blue-100 rounded-lg mb-2 shadow-sm">
                    <div class="flex items-center gap-2">
                        <span class="text-blue-500 bg-blue-50 p-1 rounded">💎</span>
                        <span class="font-bold text-slate-700 text-sm">${masterAttr.name}</span>
                        <span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 rounded border">Lv${masterAttr.tier}</span>
                    </div>
                    <button data-action="delete-secondary-attr" data-id="${sec.id}" class="text-red-400 hover:text-red-600 text-xs font-bold uppercase hover:bg-red-50 px-2 py-1 rounded transition-colors">Remover</button>
                </div>`;
        });
        container.innerHTML = html;
    };

    const renderRecommendedCombosList = (combos, masterAttributes) => {
        const container = document.getElementById('recommended-combos-list');
        if (!container) return;
        if (combos.length === 0) { container.innerHTML = '<p class="text-slate-400 text-sm italic">Nenhum combo.</p>'; return; }

        let html = '';
        combos.forEach(combo => {
            const attrNames = combo.attribute_ids.map(id => {
                const a = masterAttributes.find(m => m.id === id);
                return a ? a.name : '?';
            }).join(', ');

            html += `
                <div class="p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 mb-3 hover:bg-indigo-50 transition-colors">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-indigo-900">${combo.name} <span class="text-xs font-normal text-indigo-500 bg-white px-2 py-0.5 rounded border border-indigo-100 ml-2">${combo.rarity} +${combo.plus_level}</span></h4>
                        <div class="flex gap-2">
                            <button data-action="edit-combo" data-id="${combo.id}" class="text-indigo-400 hover:text-indigo-600 text-xs uppercase font-bold">Editar</button>
                            <button data-action="delete-combo" data-id="${combo.id}" class="text-red-400 hover:text-red-600 text-xs uppercase font-bold">Excluir</button>
                        </div>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">${attrNames}</p>
                </div>
            `;
        }).join('');
        container.innerHTML = html;
    };

    // --- MODAIS GERAIS (Estrutura compartilhada) ---
    // (As funções renderMasterAttributeModal, renderRequiredAttributeModal, etc. 
    // usam a mesma estrutura HTML do 'renderGemModal' acima, apenas mudando o form.
    // Para economizar espaço, a lógica é a mesma: 
    // container: fixed inset-0 bg-slate-900/60 backdrop-blur-sm 
    // card: bg-white rounded-2xl shadow-2xl)

    // ... (Mantém as funções de modal do Admin com a nova estrutura de classes CSS) ...
    // Vou incluir uma genérica para garantir que funcione se você copiar tudo:

    const renderMasterAttributeModal = (attr = null) => {
        const elementOptions = ELEMENTS.map(e => `<option value="${e}" ${attr?.default_element === e ? 'selected' : ''}>${e.toUpperCase()}</option>`).join('');
        const tierOptions = [1, 2, 3].map(t => `<option value="${t}" ${attr?.tier === t ? 'selected' : ''}>Tier ${t}</option>`).join('');

        const modalHtml = `
            <div id="admin-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div class="p-6 border-b bg-indigo-50 flex justify-between items-center">
                        <h3 class="text-lg font-bold text-indigo-900">${attr ? 'Editar' : 'Criar'} Atributo</h3>
                        <button id="close-admin-modal-btn" class="text-slate-400 hover:text-slate-600">&times;</button>
                    </div>
                    <form id="master-attribute-form" class="p-6 space-y-4">
                        <input type="hidden" id="master-attr-id" value="${attr?.id || ''}">
                        <div><label class="text-xs font-bold text-slate-500 uppercase">Nome</label><input type="text" id="master-attr-name" value="${attr?.name || ''}" class="w-full border-slate-300 rounded-lg text-sm mt-1"></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="text-xs font-bold text-slate-500 uppercase">Tier</label><select id="master-attr-tier" class="w-full border-slate-300 rounded-lg text-sm mt-1">${tierOptions}</select></div>
                            <div><label class="text-xs font-bold text-slate-500 uppercase">Elemento</label><select id="master-attr-element" class="w-full border-slate-300 rounded-lg text-sm mt-1"><option value="">Global</option>${elementOptions}</select></div>
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">Salvar</button>
                    </form>
                </div>
            </div>`;
        document.getElementById('modals-container').innerHTML = modalHtml;
    };

    // (Repita a estrutura de modal moderna para Required, Secondary e Combo)
    const renderRequiredAttributeModal = (masterAttributes) => {
        const opts = masterAttributes.map(a => `<option value="${a.id}">${a.name} (Lv${a.tier})</option>`).join('');
        const modalHtml = `
            <div id="admin-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div class="p-6 border-b bg-green-50 flex justify-between items-center">
                        <h3 class="text-lg font-bold text-green-900">Adicionar Requisito</h3>
                        <button id="close-admin-modal-btn" class="text-slate-400 hover:text-slate-600">&times;</button>
                    </div>
                    <form id="required-attribute-form" class="p-6 space-y-4">
                        <div><label class="text-xs font-bold text-slate-500 uppercase">Atributo</label><select id="required-attr-id" class="w-full border-slate-300 rounded-lg text-sm mt-1">${opts}</select></div>
                        <button type="submit" class="w-full bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors">Adicionar</button>
                    </form>
                </div>
            </div>`;
        document.getElementById('modals-container').innerHTML = modalHtml;
    };

    const renderSecondaryAttributeModal = (masterAttributes) => {
        const opts = masterAttributes.map(a => `<option value="${a.id}">${a.name} (Lv${a.tier})</option>`).join('');
        const modalHtml = `
            <div id="admin-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div class="p-6 border-b bg-blue-50 flex justify-between items-center">
                        <h3 class="text-lg font-bold text-blue-900">Adicionar Secundário</h3>
                        <button id="close-admin-modal-btn" class="text-slate-400 hover:text-slate-600">&times;</button>
                    </div>
                    <form id="secondary-attribute-form" class="p-6 space-y-4">
                        <div><label class="text-xs font-bold text-slate-500 uppercase">Atributo</label><select id="secondary-attr-id" class="w-full border-slate-300 rounded-lg text-sm mt-1">${opts}</select></div>
                        <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Adicionar</button>
                    </form>
                </div>
            </div>`;
        document.getElementById('modals-container').innerHTML = modalHtml;
    };

    const renderRecommendedComboModal = (masterAttributes, combo = null) => {
        const opts = masterAttributes.map(a => `<option value="${a.id}" ${combo?.attribute_ids.includes(a.id) ? 'selected' : ''}>${a.name}</option>`).join('');
        const modalHtml = `
            <div id="admin-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div class="p-6 border-b bg-indigo-50 flex justify-between items-center">
                        <h3 class="text-lg font-bold text-indigo-900">${combo ? 'Editar' : 'Novo'} Combo</h3>
                        <button id="close-admin-modal-btn" class="text-slate-400 hover:text-slate-600">&times;</button>
                    </div>
                    <form id="combo-form" class="p-6 space-y-4">
                        <input type="hidden" id="combo-id" value="${combo?.id || ''}">
                        <div><label class="text-xs font-bold text-slate-500 uppercase">Nome</label><input id="combo-name" value="${combo?.name || ''}" class="w-full border-slate-300 rounded-lg text-sm mt-1"></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="text-xs font-bold text-slate-500 uppercase">Raridade</label><select id="combo-rarity" class="w-full border-slate-300 rounded-lg text-sm mt-1"><option>Comum</option><option>Raro</option><option>Épico</option><option>Legendário</option></select></div>
                            <div><label class="text-xs font-bold text-slate-500 uppercase">Nível (+)</label><input type="number" id="combo-plus-level" value="${combo?.plus_level || 0}" class="w-full border-slate-300 rounded-lg text-sm mt-1"></div>
                        </div>
                        <div><label class="text-xs font-bold text-slate-500 uppercase">Atributos (Ctrl+Click)</label><select id="combo-attributes" multiple size="5" class="w-full border-slate-300 rounded-lg text-sm mt-1">${opts}</select></div>
                        <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">Salvar</button>
                    </form>
                </div>
            </div>`;
        document.getElementById('modals-container').innerHTML = modalHtml;
    };

    // --- UTILS DO MODAL ---
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

    // --- MODAL DE LOGIN (NOVO) ---

    const renderLoginModal = (onSuccess) => {
        const modalHtml = `
            <div id="modal-backdrop" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center border border-slate-200">
                    <div class="mb-6 bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl">
                        🔒
                    </div>
                    <h3 class="text-2xl font-extrabold text-slate-800 mb-2">Acesso Restrito</h3>
                    <p class="text-slate-500 text-sm mb-6">Esta área é reservada para administradores.</p>
                    
                    <form id="login-form" class="space-y-4">
                        <div>
                            <input type="password" id="login-password" placeholder="Digite a senha..." class="w-full text-center text-lg tracking-widest rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors" autofocus>
                        </div>
                        <p id="login-error" class="text-red-500 text-xs font-bold hidden animate-bounce">Senha Incorreta!</p>
                        
                        <button type="submit" class="w-full btn-hover bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                            Desbloquear
                        </button>
                    </form>
                    <button id="cancel-login-btn" class="mt-4 text-slate-400 text-sm hover:text-slate-600 underline">Cancelar</button>
                </div>
            </div>
        `;
        document.getElementById('modals-container').innerHTML = modalHtml;

        // Lógica do Modal
        const form = document.getElementById('login-form');
        const input = document.getElementById('login-password');
        const errorMsg = document.getElementById('login-error');

        input.focus();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const typed = input.value;
            const correct = StorageService.getAdminPassword(); // Pega a senha real

            if (typed === correct) {
                // Sucesso!
                document.getElementById('modals-container').innerHTML = ''; // Fecha modal
                onSuccess(); // Executa a função de liberar acesso
            } else {
                // Erro
                errorMsg.classList.remove('hidden');
                input.value = '';
                input.classList.add('border-red-500', 'ring-1', 'ring-red-500');
                input.focus();
            }
        });

        document.getElementById('cancel-login-btn').addEventListener('click', () => {
            document.getElementById('modals-container').innerHTML = '';
        });
    };

    return {
        renderBuildCard,
        renderArtifactCard,
        renderGemModal,
        renderMasterAttributesList,
        renderMasterAttributeModal,
        renderRequiredAttributesList,
        renderRequiredAttributeModal,
        renderSecondaryAttributesList,
        renderSecondaryAttributeModal,
        renderRecommendedCombosList,
        renderRecommendedComboModal,
        renderLoginModal,
        closeCurrentModal,
        attachModalCloseListeners
    };
})();