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
        const noBuildsMessage = document.getElementById('no-builds-message');

        if (!container) return;

        if (builds.length === 0) {
            container.innerHTML = '';
            if (noBuildsMessage) noBuildsMessage.classList.remove('hidden');
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
        // 1. Reseta o objeto em memória com os novos campos
        currentBuild = {
            id: null,
            name: '',
            class: 'Custom',
            avatar: '⚔️', // Valor padrão do ícone
            power: '',    // Valor padrão do poder
            artifacts: []
        };

        // 2. Limpa os campos visuais (Inputs)
        if (document.getElementById('char-name')) {
            document.getElementById('char-name').value = '';
        }

        // Reseta o Avatar para o primeiro da lista
        if (document.getElementById('char-avatar')) {
            document.getElementById('char-avatar').value = '⚔️';
        }

        // Limpa o campo de Poder
        if (document.getElementById('char-power')) {
            document.getElementById('char-power').value = '';
        }

        // Reseta quantidade de artefatos
        if (document.getElementById('artifact-count')) {
            document.getElementById('artifact-count').value = '4';
        }

        // Reseta o Título da página (caso tenha editado antes)
        if (document.getElementById('editor-title')) {
            document.getElementById('editor-title').textContent = 'Criar Novo Personagem';
        }

        // 3. Renderiza a tela
        // (Mantive sua chamada original updateArtifactCount e renderBuildEditor)
        if (typeof updateArtifactCount === 'function') {
            updateArtifactCount(4);
        }

        renderBuildEditor();

        // Se houver barra lateral de análise, limpa ela também
        if (typeof updateAnalysis === 'function') {
            updateAnalysis();
        }
    };

    const loadBuildForEditing = (buildId) => {
        // --- CORREÇÃO DO ERRO ---
        // Em vez de tentar adivinhar o nome da função (getBuildById ou loadBuildById),
        // carregamos todas as builds e filtramos a correta. Isso nunca falha.
        const allBuilds = StorageService.loadAllBuilds();
        const savedBuild = allBuilds.find(b => b.id.toString() === buildId.toString());
        // ------------------------

        if (savedBuild) {
            currentBuild = savedBuild;

            // Atualiza Título
            const titleEl = document.getElementById('editor-title');
            if (titleEl) titleEl.textContent = `Editando: ${currentBuild.name || 'Sem Nome'}`;

            // Troca a visualização para o Editor
            if (document.getElementById('dashboard-view')) {
                document.getElementById('dashboard-view').classList.add('hidden');
                document.getElementById('build-editor-view').classList.remove('hidden');
            }

            // Preenche Nome
            document.getElementById('char-name').value = currentBuild.name || '';

            // --- PREENCHE AVATAR E PODER ---
            const avatarInput = document.getElementById('char-avatar');
            if (avatarInput) {
                avatarInput.value = currentBuild.avatar || '⚔️';
            }

            const powerInput = document.getElementById('char-power');
            if (powerInput) {
                powerInput.value = currentBuild.power || '';
            }

            // Preenche Quantidade de Artefatos
            const countInput = document.getElementById('artifact-count');
            const artCount = currentBuild.artifactCount || (currentBuild.artifacts ? currentBuild.artifacts.length : 4);

            if (countInput) {
                countInput.value = artCount;
            }

            // Renderiza a tela (cria os slots de artefatos)
            // Se a sua função se chama renderBuildEditor, use ela.
            if (typeof renderArtifactSlots === 'function') {
                renderArtifactSlots(parseInt(artCount));
            } else if (typeof renderBuildEditor === 'function') {
                renderBuildEditor();
            }

            // Preenche os detalhes internos dos artefatos (Nível e Nome específico do artefato)
            setTimeout(() => {
                if (currentBuild.artifacts) {
                    currentBuild.artifacts.forEach((savedArt, index) => {
                        // Tenta buscar por ID ou por índice (fallback)
                        let nameField = document.querySelector(`.artifact-input[data-field="name"][data-artifact-id="${savedArt.id}"]`);
                        let levelField = document.querySelector(`.artifact-input[data-field="level"][data-artifact-id="${savedArt.id}"]`);

                        // Se não achar pelo ID, tenta pegar pelo índice da tela
                        if (!nameField) {
                            const allNames = document.querySelectorAll('.artifact-input[data-field="name"]');
                            if (allNames[index]) nameField = allNames[index];
                        }
                        if (!levelField) {
                            const allLevels = document.querySelectorAll('.artifact-input[data-field="level"]');
                            if (allLevels[index]) levelField = allLevels[index];
                        }

                        // Aplica valores
                        if (nameField) {
                            nameField.value = savedArt.name || '';
                            nameField.dataset.artifactId = savedArt.id; // Atualiza ID
                        }
                        if (levelField) {
                            levelField.value = savedArt.level || '';
                            levelField.dataset.artifactId = savedArt.id; // Atualiza ID
                        }

                        // --- RECARREGA AS GEMAS VISUALMENTE ---
                        // Encontra o container do artefato atual
                        let container = null;
                        if (levelField) {
                            container = levelField.closest('.glass-panel') || levelField.parentElement.parentElement;
                        }

                        if (container && savedArt.gems) {
                            const gemSlots = container.querySelectorAll('.gem-slot');
                            savedArt.gems.forEach((gem, gIndex) => {
                                if (gem && gemSlots[gIndex]) {
                                    const slot = gemSlots[gIndex];
                                    slot.classList.remove('empty');
                                    slot.innerHTML = `<div class="text-2xl">${gem.icon}</div>`;

                                    // Aplica cor da raridade
                                    const rarityClass = `gem-rarity-${gem.rarity || 'common'}`;
                                    slot.className = `gem-slot filled w-10 h-10 rounded-lg border bg-white flex items-center justify-center cursor-pointer shadow-sm relative group ${rarityClass}`;

                                    // Adiciona tooltip
                                    if (gem.value) slot.title = `${gem.name} (${gem.value})`;

                                    // Adiciona bolinha vermelha se tiver valor
                                    if (gem.value && !slot.querySelector('.absolute')) {
                                        slot.innerHTML += '<div class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>';
                                    }
                                }
                            });
                        }
                    });
                }

                if (typeof updateAnalysis === 'function') updateAnalysis();
            }, 100);

        } else {
            console.error("Build não encontrada no Storage");
            initializeNewBuild();
        }
    };

    const setImportedBuild = (buildData) => {
        currentBuild = buildData;
        document.getElementById('editor-title').textContent = `Importado: ${currentBuild.name || 'Sem Nome'}`;
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
        document.getElementById('editor-title').textContent = currentBuild.name ? `Editando: ${currentBuild.name}` : 'Criar Novo Personagem';
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

    const normalizeRemodel = (value) => {
        if (!value) return 'Comum';

        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/^./, c => c.toUpperCase());
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
                    remodel: normalizeRemodel(remodel),
                    tier: tier
                });
            }
        });

        if (gemAttributes.length === 0) {
            if (!confirm("Salvar gema sem atributos?")) return;
        }

        const rarity = document.getElementById('gem-rarity').value;
        const plusLevel = parseInt(document.getElementById('gem-plus-level').value) || 0;
        const hasAttributes = gemAttributes.length > 0;

        const firstAttr = hasAttributes
            ? masterAttributes.find(a => a.id === gemAttributes[0].attribute_id)
            : null;

        const newGem = {
            element: AdminService.ELEMENTS[currentSlotIndex],
            rarity: rarity,
            plus_level: plusLevel,
            attributes: gemAttributes,

            name: hasAttributes ? `Gema de ${firstAttr?.name}` : 'Gema Vazia',

            icon: firstAttr?.type === 'fire' ? '🔥'
                : firstAttr?.type === 'ice' ? '🧊'
                    : firstAttr?.type === 'lightning' ? '⚡'
                        : firstAttr?.type === 'veneno' ? '☠️'
                            : '💎'
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
        if (confirm("Remover gema?")) {
            const artifactIndex = currentBuild.artifacts.findIndex(a => a.id === currentArtifactId);
            if (artifactIndex !== -1) {
                currentBuild.artifacts[artifactIndex].gems[currentSlotIndex] = null;
                renderArtifactCards();
                runRealTimeAnalysis();
                Renderer.closeCurrentModal();
            }
        }
    };

    const closeModal = () => {
        if (Renderer.closeCurrentModal) Renderer.closeCurrentModal();
        else document.getElementById('modals-container').innerHTML = '';
    };

    const saveCurrentBuild = (isDraft = false) => {
        const nameInput = document.getElementById('char-name');
        const classInput = document.getElementById('char-class');

        // NOVOS CAMPOS
        const avatarInput = document.getElementById('char-avatar');
        const powerInput = document.getElementById('char-power');
        const artifactCountInput = document.getElementById('artifact-count');

        if (!nameInput.value && !isDraft) {
            alert("Por favor, dê um nome ao personagem.");
            return;
        }

        // Atualiza o objeto currentBuild com os novos dados
        currentBuild.name = nameInput.value || 'Rascunho Sem Nome';
        currentBuild.class = classInput ? classInput.value : 'Custom';
        currentBuild.avatar = avatarInput ? avatarInput.value : '⚔️'; // Salva Ícone
        currentBuild.power = powerInput ? powerInput.value : '';      // Salva Poder

        // Se a contagem de artefatos mudou no input, salva também
        if (artifactCountInput) {
            currentBuild.artifactCount = parseInt(artifactCountInput.value);
        }

        // Atualiza data de modificação para o card mostrar
        currentBuild.lastUpdated = new Date().toISOString();
        if (!currentBuild.date) currentBuild.date = new Date().toLocaleDateString('pt-BR');

        // Mantém a lógica original dos artefatos
        document.querySelectorAll('.artifact-input[data-field="level"]').forEach(input => {
            const id = parseInt(input.dataset.artifactId);
            const art = currentBuild.artifacts.find(a => a.id === id);
            if (art) art.level = parseInt(input.value) || 0;
        });

        document.querySelectorAll('.artifact-input[data-field="name"]').forEach(input => {
            const id = parseInt(input.dataset.artifactId);
            const art = currentBuild.artifacts.find(a => a.id === id);
            if (art) art.name = input.value;
        });

        const saved = StorageService.saveBuild(currentBuild);
        currentBuild = saved;

        if (isDraft) {
            alert("Rascunho salvo!");
        } else {
            alert(`Build "${currentBuild.name}" salva com sucesso!`);
            App.showView('dashboard');
        }
    };

    const handleShareLink = () => {
        const json = JSON.stringify(currentBuild);
        const b64 = btoa(unescape(encodeURIComponent(json)));
        const url = `${window.location.origin}${window.location.pathname}#import=${b64}`;

        navigator.clipboard.writeText(url).then(() => {
            alert("Link copiado para a área de transferência!");
        }, () => {
            const output = document.getElementById('share-link-output');
            output.textContent = url;
            output.classList.remove('hidden');
        });
    };

    // --- RELATÓRIO FINAL E EXPORTAÇÃO ---

    const generateFinalReport = () => {
        const nameInput = document.getElementById('char-name');
        const classInput = document.getElementById('char-class');
        if (nameInput) currentBuild.name = nameInput.value;
        if (classInput) currentBuild.class = classInput.value;

        const analysis = AnalysisEngine.runAnalysis(currentBuild, masterAttributes, requiredAttributes, secondaryAttributes, recommendedCombos);

        App.showView('report');
        const reportView = document.getElementById('report-view');

        if (!reportView) { alert("View de relatório não encontrada."); return; }

        let html = `
            <div class="glass-panel p-8 rounded-2xl shadow-xl max-w-5xl mx-auto border-t-8 border-indigo-600">
                <div class="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
                    <div>
                        <h2 class="text-3xl font-extrabold text-slate-800">Relatório de Análise</h2>
                        <p class="text-indigo-600 font-medium text-lg">${currentBuild.name || 'Sem Nome'} <span class="text-slate-400 text-sm">(${currentBuild.class || 'Sem Classe'})</span></p>
                    </div>
                    <div class="text-4xl">📊</div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div class="bg-white p-5 rounded-xl shadow-sm border-b-4 border-indigo-500 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                        <span class="text-3xl mb-2">🛡️</span>
                        <span class="text-xs text-slate-500 uppercase font-bold tracking-wider">Essenciais</span>
                        <span class="text-2xl font-black text-indigo-600">${analysis.present_attributes.size}/${requiredAttributes.length}</span>
                    </div>
                    <div class="bg-white p-5 rounded-xl shadow-sm border-b-4 border-blue-400 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                        <span class="text-3xl mb-2">💎</span>
                        <span class="text-xs text-slate-500 uppercase font-bold tracking-wider">Suporte</span>
                        <span class="text-2xl font-black text-blue-500">${analysis.secondary_present.length}/${secondaryAttributes.length}</span>
                    </div>
                    <div class="bg-white p-5 rounded-xl shadow-sm border-b-4 border-orange-400 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                        <span class="text-3xl mb-2">⚠️</span>
                        <span class="text-xs text-slate-500 uppercase font-bold tracking-wider">Duplicatas</span>
                        <span class="text-2xl font-black text-orange-500">${analysis.duplicates_to_remove.length}</span>
                    </div>
                    <div class="bg-white p-5 rounded-xl shadow-sm border-b-4 border-red-500 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                        <span class="text-3xl mb-2">🗑️</span>
                        <span class="text-xs text-slate-500 uppercase font-bold tracking-wider">Inúteis</span>
                        <span class="text-2xl font-black text-red-600">${analysis.useless_gems.length}</span>
                    </div>
                </div>
                
                <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">🔍 Diagnóstico Detalhado</h3>

                ${analysis.missing_attributes.length > 0 ? `
                    <div class="mb-8">
                        <h4 class="font-bold text-red-600 mb-3 flex items-center gap-2">
                            <span class="bg-red-100 p-1 rounded">❌</span> Faltam Atributos Essenciais
                        </h4>
                        <div class="grid md:grid-cols-2 gap-3">
                            ${analysis.missing_attributes.map(m => `
                                <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                                    <span class="font-bold text-red-900 block">${m.attribute}</span>
                                    <p class="text-xs text-red-700 mt-1 flex gap-1 items-start">
                                        <span>💡</span> ${AnalysisEngine.generateSuggestion(m, currentBuild)}
                                    </p>
                                </div>`).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="bg-green-50 p-4 rounded-xl border border-green-200 mb-8 flex items-center gap-3">
                        <span class="text-2xl">🎉</span>
                        <div>
                            <h4 class="font-bold text-green-800">Build Aprovada!</h4>
                            <p class="text-sm text-green-700">Todos os atributos essenciais foram encontrados.</p>
                        </div>
                    </div>
                `}

                ${analysis.duplicates_to_remove.length > 0 ? `
                    <div class="mb-8">
                        <h4 class="font-bold text-orange-600 mb-3 flex items-center gap-2">
                            <span class="bg-orange-100 p-1 rounded">⚠️</span> Duplicatas (Remover Piores)
                        </h4>
                        <ul class="space-y-2">
                            ${analysis.duplicates_to_remove.map(d => `
                                <li class="bg-orange-50 p-3 rounded-lg border border-orange-200 text-sm text-orange-900 flex justify-between items-center">
                                    <span><strong>${d.attr_name}</strong> em ${d.location.position} (${d.remodel})</span>
                                    <span class="text-xs bg-white px-2 py-1 rounded text-orange-600 border border-orange-100 font-medium">Trocar</span>
                                </li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${analysis.useless_gems.length > 0 ? `
                    <div class="mb-8">
                        <h4 class="font-bold text-yellow-600 mb-3 flex items-center gap-2">
                            <span class="bg-yellow-100 p-1 rounded">♻️</span> Atributos Inúteis/Inválidos
                        </h4>
                        <ul class="space-y-2">
                            ${analysis.useless_gems.map(u => `
                                <li class="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-900 flex justify-between items-center">
                                    <span><strong>${u.attr_name}</strong> em ${u.location.position}</span>
                                    <span class="text-xs italic text-yellow-600">${u.reason}</span>
                                </li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="mt-10 pt-6 border-t border-slate-200">
                    <h4 class="font-bold text-slate-700 mb-4">📋 Inventário Atual da Build</h4>
                    <div class="grid md:grid-cols-2 gap-8">
                        <div class="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                            <h5 class="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Essenciais (${analysis.present_attributes.size})
                            </h5>
                            <ul class="text-sm space-y-2 text-slate-700">
                                ${Array.from(analysis.present_attributes).map(([id, locations]) => {
            const attr = masterAttributes.find(a => a.id === id);
            return attr ? `<li class="flex justify-between border-b border-indigo-100 pb-1"><span>${attr.name}</span> <span class="font-mono text-xs text-indigo-500 bg-white px-1 rounded">${locations[0].remodel}</span></li>` : '';
        }).join('')}
                            </ul>
                        </div>
                        <div class="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h5 class="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span> Secundários (${analysis.secondary_present.length})
                            </h5>
                            <ul class="text-sm space-y-2 text-slate-700">
                                ${analysis.secondary_present.map(s => `<li class="flex justify-between border-b border-blue-100 pb-1"><span>${s.attr_name}</span> <span class="font-mono text-xs text-blue-500 bg-white px-1 rounded">${s.remodel}</span></li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap justify-end gap-4 mt-10 pt-6 border-t border-slate-200">
                    <button id="save-report-draft-btn" class="btn-hover bg-white border border-slate-300 text-slate-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50">Salvar Rascunho</button>
                    <button id="export-csv-btn" class="btn-hover bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700">Exportar CSV</button>
                    <button id="export-pdf-btn" class="btn-hover bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:to-red-600 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                        Baixar PDF
                    </button>
                    <button id="share-link-btn" class="btn-hover bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700">Link</button>
                </div>
                <p id="share-link-output" class="mt-4 text-center text-xs text-slate-400 hidden bg-slate-100 p-2 rounded select-all"></p>
            </div>
        `;
        reportView.innerHTML = html;

        document.getElementById('save-report-draft-btn').addEventListener('click', () => saveCurrentBuild(true));
        document.getElementById('export-pdf-btn').addEventListener('click', () => handleExport('pdf', analysis));
        document.getElementById('export-csv-btn').addEventListener('click', () => handleExport('csv', analysis));
        document.getElementById('share-link-btn').addEventListener('click', handleShareLink);
    };

    const handleExport = (type, analysisData) => {
        // Verifica se tem build
        if (!currentBuild) {
            alert("Nenhuma build carregada para exportar.");
            return;
        }

        const buildName = currentBuild.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // 1. Carrega dados do banco (com proteção se vier nulo)
        const masterAttributes = StorageService.loadMasterAttributes() || [];
        const requiredAttributes = StorageService.loadRequiredAttributes() || [];
        const secondaryAttributes = StorageService.loadSecondaryAttributes() || [];

        // =================================================================
        // --- BLINDAGEM CONTRA ERROS (AQUI ESTÁ A CORREÇÃO) ---
        // =================================================================
        let analysis = analysisData;

        // Se não veio dados, tenta calcular
        if (!analysis && typeof AnalysisEngine !== 'undefined') {
            try {
                analysis = AnalysisEngine.analyze(currentBuild);
            } catch (e) {
                console.error("Erro ao calcular análise:", e);
            }
        }

        // SE AINDA ASSIM ESTIVER VAZIO (ou se AnalysisEngine não existir),
        // CRIA UM OBJETO VAZIO PARA NÃO TRAVAR O PDF
        if (!analysis || !analysis.present_attributes) {
            console.warn("⚠️ Análise vazia ou inválida. Gerando objeto de fallback.");
            analysis = {
                missing_attributes: [],
                present_attributes: new Map(), // O erro acontecia aqui (esperava um Map)
                secondary_present: [],
                duplicates_to_remove: [],
                useless_gems: [],
                missing_secondaries: []
            };
        }
        // =================================================================

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

            // --- TÍTULO ---
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text(`Relatório: ${currentBuild.name}`, 10, y);
            y += 10;

            // --- RESUMO ---
            doc.setFontSize(12);
            doc.text("Resumo da Análise:", 10, y);
            y += 8;

            doc.setFontSize(10);

            // Contagens (Agora protegidas porque 'analysis' e 'present_attributes' GARANTIDAMENTE existem)
            const reqTotal = requiredAttributes.length;

            // Verifica se é Map ou Array (para evitar erro de .size vs .length)
            const presTotal = (analysis.present_attributes instanceof Map)
                ? analysis.present_attributes.size
                : (Object.keys(analysis.present_attributes || {}).length);

            const secTotal = secondaryAttributes.length;
            const secPres = analysis.secondary_present ? analysis.secondary_present.length : 0;

            doc.text(`Essenciais: ${presTotal}/${reqTotal}`, 10, y);
            y += 5;

            doc.text(`Secundários Presentes: ${secPres}/${secTotal}`, 10, y);
            y += 5;

            doc.text(`Duplicatas Ruins: ${analysis.duplicates_to_remove ? analysis.duplicates_to_remove.length : 0}`, 10, y);
            y += 5;
            doc.text(`Inúteis: ${analysis.useless_gems ? analysis.useless_gems.length : 0}`, 10, y);
            y += 10;

            // --- 1. FALTANDO ESSENCIAIS (COM LÓGICA DE URGÊNCIA) ---
            if (analysis.missing_attributes && analysis.missing_attributes.length > 0) {
                const missingUrgent = [];
                const missingNormal = [];

                analysis.missing_attributes.forEach(m => {
                    const reqDef = requiredAttributes.find(r => r.attribute_id === m.id);
                    if (reqDef && reqDef.isUrgent) {
                        missingUrgent.push(m);
                    } else {
                        missingNormal.push(m);
                    }
                });

                // A. URGENTES
                if (missingUrgent.length > 0) {
                    checkPageBreak(missingUrgent.length * 6 + 20);
                    doc.setFillColor(254, 226, 226);
                    doc.setDrawColor(220, 38, 38);
                    doc.rect(10, y, 190, 8 + (missingUrgent.length * 6), 'FD');

                    y += 6;
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(220, 38, 38);

                    // CORREÇÃO 1: Removido o emoji e os acentos para compatibilidade com a fonte do PDF.
                    doc.text("!! ATENCAO: REQUISITOS URGENTES FALTANDO !!", 15, y);

                    y += 6;

                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0, 0, 0);

                    missingUrgent.forEach(m => {
                        const attrInfo = masterAttributes.find(a => a.id === m.id);
                        const tierInfo = attrInfo ? `(Lv${attrInfo.tier})` : '';
                        // CORREÇÃO 2: Garantindo que o bullet point também não cause problemas.
                        doc.text(`* ${m.attribute} ${tierInfo}`, 15, y);
                        y += 6;
                    });
                    y += 5;
                }

                // B. NORMAIS
                if (missingNormal.length > 0) {
                    checkPageBreak();
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(200, 0, 0);
                    doc.text("FALTANDO ESSENCIAIS (Comum):", 10, y);
                    y += 6;

                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0, 0, 0);

                    missingNormal.forEach(m => {
                        checkPageBreak();
                        const attrInfo = masterAttributes.find(a => a.id === m.id);
                        const tierInfo = attrInfo ? `(Lv${attrInfo.tier})` : '';
                        doc.text(`- ${m.attribute} ${tierInfo}`, 15, y);
                        y += 5;
                    });
                    y += 5;
                }
            }

            // --- 2. FALTANDO SECUNDÁRIAS ---
            if (analysis.missing_secondaries && analysis.missing_secondaries.length > 0) {
                checkPageBreak();
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(0, 0, 150);
                doc.text("FALTANDO SECUNDÁRIAS (Opcional/Melhoria):", 10, y);
                y += 6;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                analysis.missing_secondaries.forEach(m => {
                    checkPageBreak();
                    const attrInfo = masterAttributes.find(a => a.id === m.id);
                    const tierInfo = attrInfo ? `(Lv${attrInfo.tier})` : '';
                    doc.text(`- ${m.attribute} ${tierInfo}`, 15, y);
                    y += 5;
                });
                y += 5;
            }

            // --- 3. DUPLICATAS ---
            if (analysis.duplicates_to_remove && analysis.duplicates_to_remove.length > 0) {
                checkPageBreak();
                doc.setFontSize(12);
                doc.setTextColor(200, 100, 0);
                doc.text("REMOVER DUPLICATAS:", 10, y);
                y += 6;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                analysis.duplicates_to_remove.forEach(d => {
                    checkPageBreak();
                    const attrInfo = masterAttributes.find(a => a.id === d.attr_id);
                    const tierInfo = attrInfo ? `(Lv${attrInfo.tier})` : '';
                    doc.text(`- ${d.attr_name} ${tierInfo} em ${d.location.position}`, 15, y);
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    y += 4;
                    doc.text(`  Motivo: ${d.reason}`, 15, y);
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                    y += 5;
                });
                y += 5;
            }

            // --- 4. INÚTEIS ---
            if (analysis.useless_gems && analysis.useless_gems.length > 0) {
                checkPageBreak();
                doc.setFontSize(12);
                doc.setTextColor(180, 180, 0);
                doc.text("GEMS INÚTEIS/INVÁLIDAS (Trocar):", 10, y);
                y += 6;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                analysis.useless_gems.forEach(u => {
                    checkPageBreak();
                    const attrInfo = masterAttributes.find(a => a.id === u.attr_id);
                    const tierInfo = attrInfo ? `(Lv${attrInfo.tier})` : '';
                    doc.text(`- ${u.attr_name} ${tierInfo} em ${u.location.position}`, 15, y);
                    y += 5;
                });
                y += 5;
            }

            // --- 5. INVENTÁRIO (ESSENCIAIS) ---
            if (analysis.present_attributes && (
                (analysis.present_attributes instanceof Map && analysis.present_attributes.size > 0) ||
                (typeof analysis.present_attributes === 'object' && Object.keys(analysis.present_attributes).length > 0)
            )) {
                checkPageBreak();
                doc.setFontSize(12);
                doc.setTextColor(0, 100, 0);
                doc.text("ATRIBUTOS ESSENCIAIS EQUIPADOS:", 10, y);
                y += 6;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                // Normaliza para loop (se for Map usa forEach, se for Obj usa entries)
                const loopFunc = (val, id) => {
                    checkPageBreak();
                    const attr = masterAttributes.find(a => a.id.toString() === id.toString());
                    if (attr) {
                        // Verifica se locations[0] existe
                        const locInfo = (val && val[0]) ? val[0].remodel : 'N/A';
                        doc.text(`- ${attr.name} (Lv${attr.tier}): ${locInfo}`, 15, y);
                        y += 5;
                    }
                };

                if (analysis.present_attributes instanceof Map) {
                    analysis.present_attributes.forEach(loopFunc);
                } else {
                    Object.entries(analysis.present_attributes).forEach(([id, val]) => loopFunc(val, id));
                }
                y += 5;
            }

            // --- 5.1. INVENTÁRIO (SECUNDÁRIOS) ---
            if (analysis.secondary_present && analysis.secondary_present.length > 0) {
                checkPageBreak();
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 150);
                doc.text("ATRIBUTOS SECUNDÁRIOS EQUIPADOS:", 10, y);
                y += 6;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                analysis.secondary_present.forEach(s => {
                    checkPageBreak();
                    doc.text(`- ${s.attr_name} (Lv${s.tier}): ${s.remodel} [${s.location.position}]`, 15, y);
                    y += 5;
                });
                y += 5;
            }

            // --- 6. OBSERVAÇÕES ---
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

            const globalNotes = StorageService.loadGlobalNotes();
            const splitNotes = doc.splitTextToSize(globalNotes || "Sem observações.", 180);
            doc.text(splitNotes, 10, y);

            doc.save(`${buildName}.pdf`);

        } else if (type === 'csv') {
            let csv = `Nome,Classe\n${currentBuild.name},${currentBuild.class}\n\nArtefato,Gema\n`;
            currentBuild.artifacts.forEach(a => {
                a.gems.forEach((g, i) => {
                    if (g) csv += `${a.name},Slot ${i + 1},${g.rarity}\n`;
                });
            });
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
        generateFinalReport, // Essa deve ser a antiga
        setImportedBuild,
        loadBuildForEditing,
        refreshDashboard,
        deleteBuild,

        // --- CORREÇÃO AQUI ---
        // Mantemos o handleExport original
        handleExport,

        // E criamos o 'generateReport' apontando para 'handleExport'
        // Assim o App.js encontra a função que procura!
        generateReport: handleExport
    };
})();