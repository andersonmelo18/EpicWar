/**
 * Módulo para gerenciar a criação, edição e análise da build atual.
 */
const BuildController = (() => {

    let currentBuild = null;
    let masterAttributes = [];
    let requiredAttributes = [];
    let secondaryAttributes = [];
    let recommendedCombos = [];

    let currentArtifactId = null;
    let currentSlotIndex = null;

    // --- Helpers de Visual (ATUALIZADO PARA GRADES E QUALIDADE) ---
    
    // Define a cor do TEXTO baseado na REMODELAÇÃO (Qualidade)
    const getQualityColorClass = (remodel) => {
        switch (remodel?.toLowerCase()) {
            case 'comum': return 'text-slate-500'; // Cinza
            case 'raro': return 'text-green-600 font-medium'; // Verde
            case 'épico': return 'text-orange-500 font-bold'; // Laranja
            case 'legendário': return 'text-red-600 font-bold'; // Vermelho
            case 'mítico': return 'text-yellow-500 font-extrabold uppercase drop-shadow-sm'; // Amarelo
            default: return 'text-slate-700';
        }
    };

    // Define o BADGE visual baseado na RARIDADE (Grade)
    const getGradeBadgeHTML = (rarity) => {
        const gradeMap = {
            'B': 'bg-blue-100 text-blue-800 border border-blue-200',
            'A': 'bg-purple-100 text-purple-800 border border-purple-200',
            'S': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            'SS': 'bg-red-100 text-red-800 border border-red-200',
            'SSR': 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 text-white border-transparent'
        };
        const style = gradeMap[rarity] || 'bg-slate-100 text-slate-500';
        return `<span class="px-1.5 py-0.5 rounded text-[10px] font-black ${style}">${rarity}</span>`;
    };

    // --- Funções de Inicialização ---

    const loadDependencies = () => {
        masterAttributes = StorageService.loadMasterAttributes();
        requiredAttributes = StorageService.loadRequiredAttributes();
        secondaryAttributes = StorageService.loadSecondaryAttributes();
        recommendedCombos = StorageService.loadRecommendedCombos();
    };

    const init = (buildId) => {
        loadDependencies();
        if (buildId) {
            loadBuildForEditing(buildId);
        } else {
            initializeNewBuild();
        }
    };

    // --- Lógica do Dashboard ---

    const refreshDashboard = () => {
        const builds = StorageService.loadAllBuilds();
        const container = document.getElementById('builds-list');
        // Usamos uma abordagem híbrida: se o elemento no-builds-message existir, usamos ele (legado),
        // senão, renderizamos o Hero Empty State moderno.
        const noBuildsMessage = document.getElementById('no-builds-message');

        if (!container) return;

        if (builds.length === 0) {
            // HERO EMPTY STATE (Visual Moderno)
            container.innerHTML = `
                <div class="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
                    <div class="w-32 h-32 bg-gradient-to-tr from-indigo-50 to-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-50">
                        <span class="text-6xl filter drop-shadow-sm">⚔️</span>
                    </div>
                    <h3 class="text-2xl font-extrabold text-slate-800 mb-2">Sua jornada começa aqui!</h3>
                    <p class="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">Você ainda não tem builds salvas. Crie seu primeiro personagem, planeje seus artefatos e domine o PvP.</p>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button onclick="document.getElementById('nav-new-char').click()" class="btn-hover bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group">
                            <span>✨</span> Criar Primeira Build
                        </button>
                        <button onclick="document.getElementById('nav-admin').click()" class="btn-hover bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-xl font-bold shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                            <span>⚙️</span> Configurar
                        </button>
                    </div>
                </div>
            `;
            if (noBuildsMessage) noBuildsMessage.classList.add('hidden'); // Garante que o antigo suma
            return;
        }

        if (noBuildsMessage) noBuildsMessage.classList.add('hidden');
        const html = builds.map(build => Renderer.renderBuildCard(build)).join('');
        container.innerHTML = html;
    };

    const deleteBuild = (id) => {
        StorageService.deleteBuild(id);
        refreshDashboard();
    };

    // --- Lógica do Editor ---

    const initializeNewBuild = () => {
        currentBuild = {
            id: null,
            name: '',
            class: '',
            artifacts: []
        };
        updateArtifactCount(4);
        renderBuildEditor();
    };

    const loadBuildForEditing = (buildId) => {
        const savedBuild = StorageService.loadBuildById(buildId);
        if (savedBuild) {
            currentBuild = savedBuild;
            const editorTitle = document.getElementById('editor-title');
            if(editorTitle) editorTitle.textContent = `Editando: ${currentBuild.name || 'Sem Nome'}`;
            
            document.getElementById('char-name').value = currentBuild.name;
            document.getElementById('char-class').value = currentBuild.class || '';
            document.getElementById('artifact-count').value = currentBuild.artifacts.length;
            renderBuildEditor();
        } else {
            initializeNewBuild();
        }
    };

    const setImportedBuild = (buildData) => {
        currentBuild = buildData;
        const editorTitle = document.getElementById('editor-title');
        if(editorTitle) editorTitle.textContent = `Importado: ${currentBuild.name || 'Sem Nome'}`;
        
        document.getElementById('char-name').value = currentBuild.name || '';
        document.getElementById('char-class').value = currentBuild.class || '';
        document.getElementById('artifact-count').value = currentBuild.artifacts.length;
        renderBuildEditor(); 
    };

    const updateArtifactCount = (count) => {
        const currentLength = currentBuild.artifacts.length;
        if (count > currentLength) {
            for (let i = currentLength; i < count; i++) {
                currentBuild.artifacts.push({
                    id: Date.now() + i,
                    name: `Artefato ${i + 1}`,
                    level: 0,
                    position: i + 1,
                    gems: [null, null, null, null]
                });
            }
        } else if (count < currentLength) {
            currentBuild.artifacts = currentBuild.artifacts.slice(0, count);
        }
        renderArtifactCards();
        runRealTimeAnalysis();
    };

    const renderBuildEditor = () => {
        const editorTitle = document.getElementById('editor-title');
        if(editorTitle) editorTitle.textContent = currentBuild.name ? `Editando: ${currentBuild.name}` : 'Criar Novo Personagem';
        
        document.getElementById('char-name').value = currentBuild.name || '';
        document.getElementById('char-class').value = currentBuild.class || '';
        document.getElementById('artifact-count').value = currentBuild.artifacts.length;
        renderArtifactCards();
        runRealTimeAnalysis();
    };

    const renderArtifactCards = () => {
        const container = document.getElementById('artifact-slots-container');
        if (!container) return;

        let html = '';
        currentBuild.artifacts.forEach(artifact => {
            if (artifact) {
                html += Renderer.renderArtifactCard(artifact, currentBuild.id);
            }
        });
        container.innerHTML = html;

        container.querySelectorAll('[data-action="edit-gem"]').forEach(slot => {
            slot.removeEventListener('click', handleGemSlotClick);
            slot.addEventListener('click', handleGemSlotClick);
        });

        container.querySelectorAll('.artifact-input').forEach(input => {
            input.removeEventListener('change', handleArtifactInputUpdate);
            input.addEventListener('change', handleArtifactInputUpdate);
        });
    };

    const handleArtifactInputUpdate = (e) => {
        const artifactId = parseInt(e.target.dataset.artifactId);
        const field = e.target.dataset.field;
        const value = e.target.value;
        const artifact = currentBuild.artifacts.find(a => a.id === artifactId);
        if (artifact) {
            if (field === 'level') artifact.level = parseInt(value) || 0;
            else if (field === 'name') artifact.name = value;
        }
        runRealTimeAnalysis();
    };

    // --- ANÁLISE EM TEMPO REAL ---

    const runRealTimeAnalysis = () => {
        if (!currentBuild || !currentBuild.artifacts || currentBuild.artifacts.length === 0) {
            document.getElementById('analysis-summary').innerHTML = '<p class="text-slate-500 italic text-center py-4">Comece adicionando um artefato.</p>';
            return;
        }
        const analysis = AnalysisEngine.runAnalysis(currentBuild, masterAttributes, requiredAttributes, secondaryAttributes, recommendedCombos);
        renderAnalysisSummary(analysis);
    };

    const renderAnalysisSummary = (analysis) => {
        const summaryDiv = document.getElementById('analysis-summary');
        let html = '';

        const requiredCount = requiredAttributes.length;
        const presentCount = analysis.present_attributes.size;
        
        // Barra de Progresso Visual
        const percent = requiredCount > 0 ? Math.round((presentCount / requiredCount) * 100) : 0;
        const barColor = percent === 100 ? 'bg-green-500' : (percent > 50 ? 'bg-indigo-500' : 'bg-orange-500');

        html += `
            <div class="mb-6">
                <div class="flex justify-between items-end mb-2">
                    <span class="font-bold text-slate-700 text-sm uppercase tracking-wide">Progresso Essencial</span>
                    <span class="text-sm font-bold ${percent === 100 ? 'text-green-600' : 'text-slate-600'}">${percent}%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div class="${barColor} h-3 rounded-full transition-all duration-700 ease-out shadow-sm" style="width: ${percent}%"></div>
                </div>
                <p class="text-xs text-slate-500 mt-1 text-right font-medium">${presentCount}/${requiredCount} Concluídos</p>
            </div>
        `;

        if (analysis.missing_attributes.length > 0) {
            html += `<div class="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                <h4 class="font-bold text-red-700 text-xs uppercase mb-2 flex items-center gap-1">❌ Faltam Essenciais (${analysis.missing_attributes.length})</h4>
                <ul class="space-y-1">`;
            analysis.missing_attributes.slice(0, 3).forEach(m => {
                const elementText = m.required_element ? m.required_element.toUpperCase() : 'GLOBAL';
                html += `<li class="text-xs text-red-600 truncate">• ${m.attribute} <span class="opacity-75">(${elementText})</span></li>`;
            });
            if (analysis.missing_attributes.length > 3) html += `<li class="text-xs text-red-500 italic ml-2">+ mais ${analysis.missing_attributes.length - 3}...</li>`;
            html += `</ul></div>`;
        }

        if (analysis.duplicates_to_remove.length > 0) {
            html += `<div class="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3">
                <h4 class="font-bold text-orange-700 text-xs uppercase mb-2 flex items-center gap-1">⚠️ Duplicatas (${analysis.duplicates_to_remove.length})</h4>
                <ul class="space-y-1">`;
            analysis.duplicates_to_remove.slice(0, 2).forEach(d => {
                html += `<li class="text-xs text-orange-800 truncate">• ${d.attr_name} em ${d.location.position}</li>`;
            });
            html += `</ul></div>`;
        }

        if (analysis.useless_gems.length > 0) {
            html += `<div class="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-3">
                <h4 class="font-bold text-yellow-700 text-xs uppercase mb-2 flex items-center gap-1">♻️ Inúteis/Inválidos (${analysis.useless_gems.length})</h4>
                <ul class="space-y-1">`;
            analysis.useless_gems.slice(0, 2).forEach(u => {
                html += `<li class="text-xs text-yellow-800 truncate">• ${u.attr_name} em ${u.location.position}</li>`;
            });
            html += `</ul></div>`;
        }

        if (analysis.present_attributes.size > 0 || analysis.secondary_present.length > 0) {
            html += `<div class="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-semibold">`;
            html += `<span class="text-green-600 flex items-center gap-1">✅ ${analysis.present_attributes.size} Essenciais</span>`;
            html += `<span class="text-blue-600 flex items-center gap-1">💎 ${analysis.secondary_present.length} Suporte</span>`;
            html += `</div>`;
        }

        summaryDiv.innerHTML = html;
    };

    // --- Modal e Gemas ---

    const findArtifactAndGem = (artifactId, slotIndex) => {
        const artifact = currentBuild.artifacts.find(a => a.id === artifactId);
        const gem = artifact ? artifact.gems[slotIndex] : null;
        return { artifact, gem };
    };

    const handleGemSlotClick = (e) => {
        const slot = e.currentTarget;
        currentArtifactId = parseInt(slot.dataset.artifactId);
        currentSlotIndex = parseInt(slot.dataset.slotIndex);
        const { artifact, gem } = findArtifactAndGem(currentArtifactId, currentSlotIndex);

        if (artifact) {
            loadDependencies();
            Renderer.renderGemModal(artifact, currentSlotIndex, gem, masterAttributes);
            Renderer.attachModalCloseListeners(); 
            setupGemModalListeners(artifact.gems[currentSlotIndex]);
        }
    };

    const updateAttributeOptionsByTier = (container) => {
        const tierSelect = container.querySelector('.attribute-tier');
        const attrSelect = container.querySelector('.attribute-id');
        const selectedTier = parseInt(tierSelect.value);
        const element = AdminService.ELEMENTS[currentSlotIndex];

        const filteredAttributes = masterAttributes.filter(a => {
            const matchesTier = (a.tier === selectedTier);
            const matchesElement = !a.default_element || a.default_element === element;
            return matchesTier && matchesElement;
        });

        const attributeOptions = filteredAttributes.map(a =>
            `<option value="${a.id}" data-tier="${a.tier}">${a.name}</option>`
        ).join('');

        attrSelect.innerHTML = `<option value="">Selecione...</option>` + attributeOptions;
    };

    const setupGemModalListeners = (existingGem) => {
        const modal = document.getElementById('gem-edit-modal');
        if (!modal) return;

        modal.querySelector('#close-gem-modal-btn').addEventListener('click', Renderer.closeCurrentModal);
        
        const removeBtn = modal.querySelector('#remove-gem-btn');
        if (removeBtn && existingGem) {
            removeBtn.addEventListener('click', handleRemoveGem);
        }

        modal.querySelector('#gem-form').addEventListener('submit', handleSaveGem);
        modal.querySelector('#add-attribute-row-btn').addEventListener('click', handleAddAttributeRow);

        const attrsContainer = modal.querySelector('#attributes-container');
        
        attrsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-attribute-btn')) {
                e.target.closest('.attribute-row').remove();
                updateAddAttributeButton();
            }
        });

        attrsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('attribute-tier')) {
                const container = e.target.closest('.attribute-row');
                updateAttributeOptionsByTier(container);
                container.querySelector('.attribute-id').value = '';
            }
            if (e.target.classList.contains('attribute-id')) {
                handleAttributeSelectChange(e);
            }
        });
        
        updateAddAttributeButton();
    };

    const handleAttributeSelectChange = (e) => {
        const select = e.target.closest('.attribute-row')?.querySelector('.attribute-id');
        if (!select || select !== e.target) return;
        const gemElement = AdminService.ELEMENTS[currentSlotIndex];
        const attrId = parseInt(select.value);
        if (attrId) {
            if (!AnalysisEngine.validateElementExclusivity(attrId, gemElement, masterAttributes)) {
                alert(`ERRO: Elemento incompatível.`);
                select.value = '';
            }
        }
    };

    const handleAddAttributeRow = () => {
        const container = document.getElementById('attributes-container');
        const currentRows = container.querySelectorAll('.attribute-row').length;
        if (currentRows < 3) {
            const newIndex = currentRows;
            const element = AdminService.ELEMENTS[currentSlotIndex];
            const defaultTier = 3;
            
            const filteredAttributes = masterAttributes.filter(a =>
                (!a.default_element || a.default_element === element) && a.tier === defaultTier
            );
            
            const attributeOptions = filteredAttributes.map(a => `<option value="${a.id}" data-tier="${a.tier}">${a.name}</option>`).join('');
            const remodelOptions = AdminService.REMODELS.map(r => `<option value="${r}">${r.charAt(0).toUpperCase() + r.slice(1)}</option>`).join('');
            const tierOptions = [1, 2, 3].map(t => `<option value="${t}" ${t === defaultTier ? 'selected' : ''}>Lv${t}</option>`).join('');

            const newRowHtml = `
                <div class="attribute-row p-3 rounded-lg bg-slate-50 border border-slate-200 relative group" data-attr-index="${newIndex}">
                    <button type="button" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 remove-attribute-btn transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </button>
                    <div class="grid grid-cols-12 gap-2 mb-2">
                        <div class="col-span-3">
                            <label class="block text-[10px] font-bold text-slate-400 uppercase">Tier</label>
                            <select class="w-full text-xs rounded border-slate-300 py-1 attribute-tier">${tierOptions}</select>
                        </div>
                        <div class="col-span-9">
                            <label class="block text-[10px] font-bold text-slate-400 uppercase">Atributo</label>
                            <select required class="w-full text-xs rounded border-slate-300 py-1 attribute-id"><option value="">Selecione...</option>${attributeOptions}</select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase">Qualidade</label>
                        <select required class="w-full text-xs rounded border-slate-300 py-1 attribute-remodel">${remodelOptions}</select>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', newRowHtml);
            updateAddAttributeButton();
        }
    };

    const updateAddAttributeButton = () => {
        const container = document.getElementById('attributes-container');
        const button = document.getElementById('add-attribute-row-btn');
        if (!container || !button) return;
        const currentRows = container.querySelectorAll('.attribute-row').length;
        if (currentRows >= 3) {
            button.setAttribute('disabled', 'true');
            button.textContent = "Máximo atingido (3)";
            button.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            button.removeAttribute('disabled');
            button.textContent = "+ Adicionar Atributo";
            button.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    };

    const handleSaveGem = (e) => {
        e.preventDefault();
        const form = e.target;
        const gemAttributes = [];
        
        form.querySelectorAll('.attribute-row').forEach(row => {
            const attrId = parseInt(row.querySelector('.attribute-id').value);
            const remodel = row.querySelector('.attribute-remodel').value;
            const tier = parseInt(row.querySelector('.attribute-tier').value);

            if (attrId && remodel) {
                const attrObj = masterAttributes.find(a => a.id === attrId);
                gemAttributes.push({
                    attribute_id: attrId,
                    name: attrObj ? attrObj.name : 'Unknown',
                    remodel: remodel,
                    tier: tier
                });
            }
        });

        if (gemAttributes.length === 0) {
            if(!confirm("Salvar gema sem atributos?")) return;
        }

        const rarity = document.getElementById('gem-rarity').value;
        const plusLevel = parseInt(document.getElementById('gem-plus-level').value) || 0;

        const newGem = {
            element: AdminService.ELEMENTS[currentSlotIndex],
            rarity: rarity,
            plus_level: plusLevel,
            attributes: gemAttributes
        };

        const artifactIndex = currentBuild.artifacts.findIndex(a => a.id === currentArtifactId);
        if (artifactIndex !== -1) {
            currentBuild.artifacts[artifactIndex].gems[currentSlotIndex] = newGem;
            renderArtifactCards();
            runRealTimeAnalysis();
            Renderer.closeCurrentModal();
        }
    };

    const handleRemoveGem = () => {
        if(confirm("Remover gema?")) {
            const artifactIndex = currentBuild.artifacts.findIndex(a => a.id === currentArtifactId);
            if (artifactIndex !== -1) {
                currentBuild.artifacts[artifactIndex].gems[currentSlotIndex] = null;
                renderArtifactCards();
                runRealTimeAnalysis();
                Renderer.closeCurrentModal();
            }
        }
    };

    const saveCurrentBuild = (isDraft = false) => {
        const nameInput = document.getElementById('char-name');
        if (!nameInput.value && !isDraft) {
            alert("Por favor, dê um nome ao personagem.");
            return;
        }
        
        currentBuild.name = nameInput.value || 'Rascunho Sem Nome';
        currentBuild.class = document.getElementById('char-class').value;
        
        document.querySelectorAll('.artifact-input[data-field="level"]').forEach(input => {
            const id = parseInt(input.dataset.artifactId);
            const art = currentBuild.artifacts.find(a => a.id === id);
            if(art) art.level = parseInt(input.value) || 0;
        });

        document.querySelectorAll('.artifact-input[data-field="name"]').forEach(input => {
            const id = parseInt(input.dataset.artifactId);
            const art = currentBuild.artifacts.find(a => a.id === id);
            if(art) art.name = input.value;
        });

        if (!currentBuild.id) {
            currentBuild.id = Date.now();
        }
        
        currentBuild.lastUpdated = new Date().toISOString();
        const saved = StorageService.saveBuild(currentBuild);
        currentBuild = saved;
        
        if (isDraft) {
            alert("Rascunho salvo!");
        } else {
            alert(`Build "${currentBuild.name}" salva com sucesso!`);
            App.showView('dashboard');
        }
    };

    // --- RELATÓRIO FINAL E EXPORTAÇÃO (ATUALIZADO COM CORES E PDF) ---

    const generateFinalReport = () => {
        const nameInput = document.getElementById('char-name');
        const classInput = document.getElementById('char-class');
        if (nameInput) currentBuild.name = nameInput.value;
        if (classInput) currentBuild.class = classInput.value;

        const analysis = AnalysisEngine.runAnalysis(currentBuild, masterAttributes, requiredAttributes, secondaryAttributes, recommendedCombos);
        
        App.showView('report');
        const reportView = document.getElementById('report-view');
        
        if (!reportView) { alert("View de relatório não encontrada."); return; }

        // Helper interno para nome do atributo
        const getNm = (id) => {
            const a = masterAttributes.find(x => x.id === id);
            return a ? a.name : 'Desconhecido';
        };

        const renderAttrList = (list) => {
            if (list.length === 0) return '<p class="text-slate-400 italic text-sm">Nada encontrado.</p>';
            return list.map(item => `
                <li class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span class="text-slate-700 font-medium">${getNm(item.attribute_id)}</span>
                    <span class="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
                        ${item.count > 1 ? item.count + 'x' : ''}
                    </span>
                </li>
            `).join('');
        };

        const renderMissingList = (list) => {
            if (list.length === 0) return '<p class="text-green-500 font-bold text-sm">✨ Tudo completo!</p>';
            return list.map(m => `
                <li class="flex items-center gap-2 py-1 text-red-500 font-medium text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    ${getNm(m.id)}
                </li>
            `).join('');
        };

        const globalNotes = StorageService.loadGlobalNotes() || "Sem observações.";

        let html = `
            <div class="max-w-5xl mx-auto space-y-8 animate-fade-in">
                
                <div class="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div class="mb-4 md:mb-0 text-center md:text-left">
                        <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Relatório de Build
                        </h1>
                        <p class="text-slate-500 mt-2 text-lg">Personagem: <strong class="text-slate-800">${currentBuild.name || 'Sem Nome'}</strong></p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="App.showEditor()" class="btn-hover bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold">
                            Voltar
                        </button>
                        <button id="download-pdf-btn" class="btn-hover bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Baixar PDF
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="glass-panel p-6 rounded-xl border-t-4 border-green-500">
                        <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">✅ Atributos Essenciais</h3>
                        <ul class="space-y-1">${renderAttrList(Array.from(analysis.present_attributes).map(([id, items]) => ({ attribute_id: id, count: items.length })))}</ul>
                        <div class="mt-4 pt-4 border-t border-slate-100">
                            <h4 class="text-xs font-bold text-slate-400 uppercase mb-2">Faltam:</h4>
                            <ul class="space-y-1">${renderMissingList(analysis.missing_attributes)}</ul>
                        </div>
                    </div>

                    <div class="glass-panel p-6 rounded-xl border-t-4 border-blue-500">
                        <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">💎 Suporte & Secundários</h3>
                        <ul class="space-y-1">${renderAttrList(analysis.secondary_present.map(s => ({ attribute_id: s.attr_id, count: 1 })))}</ul>
                    </div>
                </div>

                <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h3 class="text-2xl font-bold text-slate-800 mb-6">Detalhamento dos Artefatos</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${currentBuild.artifacts.map((art, i) => `
                            <div class="border rounded-xl p-4 bg-slate-50">
                                <h4 class="font-bold text-slate-700 mb-3 border-b pb-2">Artefato ${art.position}: ${art.name || 'Sem nome'} <span class="text-xs font-normal bg-white px-2 py-1 rounded border ml-2">Lv ${art.level}</span></h4>
                                <div class="space-y-2">
                                    ${art.gems.map((gem, idx) => {
                                        if(!gem) return `<div class="text-xs text-slate-300 italic pl-2 border-l-2 border-slate-200">Slot ${AdminService.ELEMENTS[idx].toUpperCase()} Vazio</div>`;
                                        
                                        // Gera atributos com cores baseadas na Qualidade (Remodel)
                                        const attrsHtml = gem.attributes.map(a => {
                                            const colorClass = getQualityColorClass(a.remodel);
                                            return `<span class="${colorClass} mr-2">• ${getNm(a.attribute_id)}</span>`;
                                        }).join('');

                                        return `
                                            <div class="bg-white p-2 rounded border border-slate-200 text-xs">
                                                <div class="flex justify-between mb-1">
                                                    <span class="font-bold uppercase text-slate-500">${AdminService.ELEMENTS[idx]}</span>
                                                    ${getGradeBadgeHTML(gem.rarity)}
                                                </div>
                                                <div class="flex flex-wrap gap-y-1">${attrsHtml}</div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-amber-50 p-6 rounded-xl border border-amber-100">
                    <h3 class="text-lg font-bold text-amber-800 mb-2">📌 Observações Gerais</h3>
                    <p class="text-amber-900 text-sm whitespace-pre-line leading-relaxed">${globalNotes}</p>
                </div>
            </div>
        `;
        
        reportView.innerHTML = html;

        // Listener do PDF
        const pdfBtn = document.getElementById('download-pdf-btn');
        if(pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                handleExport('pdf', analysis);
            });
        }
    };

    const handleExport = (type, analysis) => {
        const buildName = currentBuild.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        if (type === 'pdf') {
            if (typeof window.jspdf === 'undefined') { alert("Erro: jsPDF não carregado."); return; }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            let y = 10;

            const checkPageBreak = (spaceNeeded = 20) => {
                if (y + spaceNeeded > 280) {
                    doc.addPage();
                    y = 10;
                }
            };

            // Helper de cor para PDF (RGB) baseado na Qualidade (Remodel)
            const setQualityColor = (remodel) => {
                switch (remodel?.toLowerCase()) {
                    case 'comum': doc.setTextColor(100, 116, 139); break; // Slate-500
                    case 'raro': doc.setTextColor(22, 163, 74); break;    // Green-600
                    case 'épico': doc.setTextColor(249, 115, 22); break;  // Orange-500
                    case 'legendário': doc.setTextColor(220, 38, 38); break; // Red-600
                    case 'mítico': doc.setTextColor(234, 179, 8); break;  // Yellow-500
                    default: doc.setTextColor(51, 65, 85); 
                }
            };

            const getNm = (id) => { const a = masterAttributes.find(x => x.id === id); return a ? a.name : '-'; };

            // --- TÍTULO ---
            doc.setFontSize(22);
            doc.setTextColor(79, 70, 229); // Indigo
            doc.text(`Relatório: ${currentBuild.name}`, 15, 20);
            
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Classe: ${currentBuild.class || 'N/A'} | Data: ${new Date().toLocaleDateString()}`, 15, 28);

            y = 40;

            // --- RESUMO ---
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Resumo de Atributos", 15, y);
            y += 10;
            
            doc.setFontSize(10);
            doc.text("Essenciais Encontrados:", 15, y);
            y += 7;
            
            analysis.present_attributes.forEach((locations, id) => {
                doc.setTextColor(50);
                doc.text(`• ${getNm(id)} (${locations.length}x)`, 20, y);
                y += 6;
            });

            y += 5;
            doc.setTextColor(220, 38, 38); // Vermelho
            doc.text("Faltam:", 15, y);
            doc.setTextColor(0);
            y += 7;
            
            analysis.missing_attributes.forEach(m => {
                doc.text(`- ${getNm(m.id)}`, 20, y);
                y += 6;
            });

            // --- DETALHAMENTO DE GEMAS ---
            y += 15;
            checkPageBreak();
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Detalhes dos Artefatos", 15, y);
            y += 10;
            doc.setFontSize(10);

            currentBuild.artifacts.forEach(art => {
                checkPageBreak(30); 
                doc.setTextColor(0, 0, 0);
                doc.setFont(undefined, 'bold');
                doc.text(`Artefato ${art.position}: ${art.name || 'Sem nome'}`, 15, y);
                doc.setFont(undefined, 'normal');
                y += 6;

                art.gems.forEach((gem, idx) => {
                    if (gem) {
                        checkPageBreak();
                        const elName = AdminService.ELEMENTS[idx].toUpperCase();
                        doc.setTextColor(70);
                        doc.text(`  [${elName}] - Grade: ${gem.rarity}`, 15, y);
                        y += 5;

                        gem.attributes.forEach(attr => {
                            checkPageBreak();
                            setQualityColor(attr.remodel);
                            doc.text(`    • ${getNm(attr.attribute_id)} (${attr.remodel})`, 15, y);
                            y += 5;
                        });
                        y += 2;
                    }
                });
                y += 5;
            });

            // --- OBSERVAÇÕES ---
            checkPageBreak(40);
            doc.setDrawColor(200, 200, 200);
            doc.line(10, y, 200, y);
            y += 8;
            
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("Observações & Dicas:", 10, y);
            y += 6;
            
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            
            const globalNotes = StorageService.loadGlobalNotes() || "Sem observações.";
            const splitNotes = doc.splitTextToSize(globalNotes, 180);
            doc.text(splitNotes, 15, y);

            doc.save(`${buildName}.pdf`);

        } else if (type === 'csv') {
            let csv = `Nome,Classe\n${currentBuild.name},${currentBuild.class}\n\nArtefato,Gema\n`;
            currentBuild.artifacts.forEach(a => { csv += `${a.name},${a.gems.map(g => g ? g.rarity : 'Vazio').join('|')}\n`; });
            const link = document.createElement("a");
            link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURI(csv));
            link.setAttribute("download", `${buildName}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return {
        init,
        loadDependencies,
        initializeNewBuild,
        updateArtifactCount,
        renderArtifactCards,
        saveCurrentBuild,
        generateFinalReport,
        setImportedBuild,
        loadBuildForEditing,
        handleExport,
        refreshDashboard,
        deleteBuild
    };
})();