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
            document.getElementById('editor-title').textContent = `Editando: ${currentBuild.name || 'Sem Nome'}`;
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
            document.getElementById('analysis-summary').innerHTML = '<p class="text-gray-500">Comece adicionando um artefato.</p>';
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

        html += `<p class="font-bold text-lg border-b pb-2 mb-3">Progresso: <span class="${presentCount === requiredCount ? 'text-green-600' : 'text-orange-500'}">${presentCount}/${requiredCount}</span> Essenciais</p>`;

        if (analysis.missing_attributes.length > 0) {
            html += `<h4 class="font-semibold text-red-600 mt-2 text-sm">❌ Faltam Essenciais (${analysis.missing_attributes.length}):</h4>`;
            html += `<ul class="list-disc list-inside space-y-1 text-xs text-gray-700">`;
            analysis.missing_attributes.slice(0, 5).forEach(m => {
                const elementText = m.required_element ? m.required_element.toUpperCase() : 'GLOBAL';
                html += `<li>${m.attribute} (${elementText})</li>`;
            });
            html += `</ul>`;
        }

        if (analysis.duplicates_to_remove.length > 0) {
            html += `<h4 class="font-semibold text-orange-600 mt-3 text-sm">⚠️ Duplicatas Ruins (${analysis.duplicates_to_remove.length}):</h4>`;
            html += `<ul class="list-disc list-inside space-y-1 text-xs text-gray-700">`;
            analysis.duplicates_to_remove.slice(0, 3).forEach(d => {
                html += `<li>${d.attr_name} em ${d.location.position} (${d.remodel})</li>`;
            });
            html += `</ul>`;
        }

        if (analysis.useless_gems.length > 0) {
            html += `<h4 class="font-semibold text-yellow-600 mt-3 text-sm">♻️ Inúteis/Inválidos (${analysis.useless_gems.length}):</h4>`;
            html += `<ul class="list-disc list-inside space-y-1 text-xs text-gray-700">`;
            analysis.useless_gems.slice(0, 3).forEach(u => {
                html += `<li>${u.attr_name} em ${u.location.position}</li>`;
            });
            html += `</ul>`;
        }

        if (analysis.present_attributes.size > 0 || analysis.secondary_present.length > 0) {
            html += `<div class="mt-4 pt-2 border-t border-gray-100">`;
            html += `<span class="text-xs font-semibold text-green-600">✅ ${analysis.present_attributes.size} Essenciais</span> | `;
            html += `<span class="text-xs font-semibold text-blue-600">🔹 ${analysis.secondary_present.length} Secundários</span>`;
            html += `</div>`;
        }

        summaryDiv.innerHTML = html || '<p class="text-gray-500">Adicione Gemas...</p>';
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

        attrSelect.innerHTML = `<option value="">Selecione um Atributo</option>` + attributeOptions;
    };

    const setupGemModalListeners = (existingGem) => {
        const modal = document.getElementById('gem-edit-modal');
        if (!modal) return;

        modal.querySelector('#close-gem-modal-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target.id === 'gem-edit-modal') closeModal(); });

        const removeBtn = modal.querySelector('#remove-gem-btn');
        if (removeBtn && existingGem) {
            removeBtn.addEventListener('click', handleRemoveGem);
        }

        modal.querySelector('#gem-form').addEventListener('submit', handleSaveGem);
        modal.querySelector('#add-attribute-row-btn').addEventListener('click', handleAddAttributeRow);

        modal.querySelector('#attributes-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-attribute-btn')) {
                e.target.closest('.attribute-row').remove();
                updateAddAttributeButton();
            }
        });

        modal.querySelector('#attributes-container').addEventListener('change', (e) => {
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
            const newRow = document.createElement('div');
            newRow.className = 'attribute-row p-3 border rounded-lg bg-gray-50 mb-3';
            newRow.setAttribute('data-attr-index', newIndex);
            const element = AdminService.ELEMENTS[currentSlotIndex];
            const defaultTier = 3;
            const filteredAttributes = masterAttributes.filter(a =>
                (!a.default_element || a.default_element === element) && a.tier === defaultTier
            );
            const attributeOptions = filteredAttributes.map(a => `<option value="${a.id}" data-tier="${a.tier}">${a.name}</option>`).join('');
            const remodelOptions = AdminService.REMODELS.map(r => `<option value="${r}">${r.charAt(0).toUpperCase() + r.slice(1)}</option>`).join('');
            const tierOptions = [1, 2, 3].map(t => `<option value="${t}" ${t === defaultTier ? 'selected' : ''}>Lv${t}</option>`).join('');

            newRow.innerHTML = `
                <h5 class="font-semibold text-gray-700 mb-2">Atributo ${newIndex + 1}</h5>
                <div class="grid grid-cols-3 gap-2">
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Tier</label>
                        <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm attribute-tier">${tierOptions}</select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-xs font-medium text-gray-500">Atributo</label>
                        <select required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm attribute-id"><option value="">Selecione um Atributo</option>${attributeOptions}</select>
                    </div>
                </div>
                <div class="mt-3">
                    <label class="block text-xs font-medium text-gray-500">Remodelação/Qualidade</label>
                    <select required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm attribute-remodel">${remodelOptions}</select>
                </div>
                <button type="button" class="mt-3 text-red-500 text-xs font-medium remove-attribute-btn">Remover</button>
            `;
            container.appendChild(newRow);
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
            button.textContent = "Máximo de 3 Atributos atingido";
        } else {
            button.removeAttribute('disabled');
            button.textContent = "+ Adicionar Atributo (Max 3)";
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
            if (attrId) gemAttributes.push({ attribute_id: attrId, remodel: remodel, tier: tier });
        });
        if (gemAttributes.length === 0) { alert("Selecione pelo menos 1 atributo."); return; }
        
        const newGem = {
            element: AdminService.ELEMENTS[currentSlotIndex],
            rarity: form.querySelector('#gem-rarity').value,
            plus_level: parseInt(form.querySelector('#gem-plus-level').value),
            attributes: gemAttributes
        };
        const artifact = currentBuild.artifacts.find(a => a.id === currentArtifactId);
        if (artifact) artifact.gems[currentSlotIndex] = newGem;
        closeModal();
        renderArtifactCards();
        runRealTimeAnalysis();
    };

    const handleRemoveGem = () => {
        if (confirm("Remover gema?")) {
            const artifact = currentBuild.artifacts.find(a => a.id === currentArtifactId);
            if (artifact) artifact.gems[currentSlotIndex] = null;
            closeModal();
            renderArtifactCards();
            runRealTimeAnalysis();
        }
    };

    const closeModal = () => {
        if (Renderer.closeCurrentModal) Renderer.closeCurrentModal();
        else document.getElementById('modals-container').innerHTML = '';
    };

    const saveCurrentBuild = (isDraft = false) => {
        currentBuild.name = document.getElementById('char-name').value;
        currentBuild.class = document.getElementById('char-class').value;

        if (!currentBuild.name && !isDraft) {
            alert("O nome do personagem é obrigatório para salvar a build.");
            return;
        }

        const savedBuild = StorageService.saveBuild(currentBuild);
        currentBuild.id = savedBuild.id;

        alert(`Build "${currentBuild.name}" salva com sucesso!`);
        App.showDashboard(); 
    };

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
            <div class="bg-white p-8 rounded-xl shadow-2xl">
                <h2 class="text-3xl font-bold text-indigo-700 mb-2">Relatório: "${currentBuild.name || 'Sem Nome'}"</h2>
                
                <div class="grid md:grid-cols-4 gap-4 mb-8 border-b pb-4">
                    <div class="p-4 bg-indigo-50 rounded-lg">
                        <h4 class="font-bold text-indigo-800 text-sm">Essenciais</h4>
                        <p class="text-2xl font-extrabold text-indigo-600">${analysis.present_attributes.size}/${requiredAttributes.length}</p>
                    </div>
                    <div class="p-4 bg-blue-50 rounded-lg">
                        <h4 class="font-bold text-blue-800 text-sm">Secundários</h4>
                        <p class="text-2xl font-extrabold text-blue-600">${analysis.secondary_present.length}</p>
                    </div>
                    <div class="p-4 bg-orange-50 rounded-lg">
                        <h4 class="font-bold text-orange-800 text-sm">Duplicatas</h4>
                        <p class="text-2xl font-extrabold text-orange-600">${analysis.duplicates_to_remove.length}</p>
                    </div>
                    <div class="p-4 bg-red-50 rounded-lg">
                        <h4 class="font-bold text-red-800 text-sm">Inúteis</h4>
                        <p class="text-2xl font-extrabold text-red-600">${analysis.useless_gems.length}</p>
                    </div>
                </div>
                
                <h3 class="text-xl font-bold mb-4 mt-6">Ações Recomendadas</h3>

                ${analysis.missing_attributes.length > 0 ? `
                    <div class="mb-6">
                        <h4 class="font-semibold text-red-600 mb-2">❌ Atributos Essenciais Faltando:</h4>
                        <ul class="space-y-2">
                            ${analysis.missing_attributes.map(m => `
                                <li class="bg-red-50 p-3 rounded border-l-4 border-red-500">
                                    <span class="font-bold">${m.attribute}</span>
                                    <p class="text-sm mt-1">${AnalysisEngine.generateSuggestion(m, currentBuild)}</p>
                                </li>`).join('')}
                        </ul>
                    </div>
                ` : '<p class="text-green-600 font-bold mb-4">✅ Todos os atributos essenciais encontrados!</p>'}

                ${analysis.duplicates_to_remove.length > 0 ? `
                    <div class="mb-6">
                        <h4 class="font-semibold text-orange-600 mb-2">⚠️ Duplicatas (Remover Piores):</h4>
                        <ul class="space-y-2">
                            ${analysis.duplicates_to_remove.map(d => `
                                <li class="bg-orange-50 p-3 rounded border-l-4 border-orange-500 text-sm">
                                    <span class="font-bold">Remover:</span> ${d.attr_name} em ${d.location.position} (${d.remodel}) <br>
                                    <span class="italic text-gray-600">${d.reason}</span>
                                </li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${analysis.useless_gems.length > 0 ? `
                    <div class="mb-6">
                        <h4 class="font-semibold text-yellow-600 mb-2">♻️ Atributos Inúteis/Inválidos:</h4>
                        <ul class="space-y-2">
                            ${analysis.useless_gems.map(u => `
                                <li class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500 text-sm">
                                    <span class="font-bold">${u.attr_name}</span> em ${u.location.position} <br>
                                    <span class="italic text-gray-600">${u.reason}</span>
                                </li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="mt-8 pt-4 border-t">
                    <h4 class="font-bold text-gray-700 mb-2">Inventário da Build</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <h5 class="font-semibold text-indigo-600">Essenciais (${analysis.present_attributes.size})</h5>
                            <ul class="list-disc list-inside text-gray-600">
                                ${Array.from(analysis.present_attributes).map(([id, locations]) => { 
                                    const attr = masterAttributes.find(a => a.id === id); 
                                    return attr ? `<li>${attr.name} (${locations[0].remodel})</li>` : ''; 
                                }).join('')}
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-semibold text-blue-600">Secundários (${analysis.secondary_present.length})</h5>
                            <ul class="list-disc list-inside text-gray-600">
                                ${analysis.secondary_present.map(s => `<li>${s.attr_name} (${s.remodel})</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end space-x-4 mt-8 pt-4 border-t">
                    <button id="export-pdf-btn" class="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700">PDF</button>
                    <button id="export-csv-btn" class="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">CSV</button>
                    <button id="share-link-btn" class="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700">Link</button>
                </div>
                <p id="share-link-output" class="mt-4 text-center text-sm hidden"></p>
            </div>
        `;
        reportView.innerHTML = html;

        document.getElementById('export-pdf-btn').addEventListener('click', () => handleExport('pdf', analysis));
        document.getElementById('export-csv-btn').addEventListener('click', () => handleExport('csv', analysis));
        document.getElementById('share-link-btn').addEventListener('click', handleShareLink);
    };

    const handleShareLink = () => {
        const buildJsonString = JSON.stringify(currentBuild);
        const base64Payload = btoa(buildJsonString);
        const shareUrl = `${window.location.origin}/#import=${base64Payload}`;
        const outputElement = document.getElementById('share-link-output');
        outputElement.textContent = `Link: ${shareUrl}`;
        outputElement.classList.remove('hidden');
        navigator.clipboard.writeText(shareUrl);
    };

    const handleExport = (type, analysis) => {
        const buildName = currentBuild.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        if (type === 'pdf') {
            if (typeof window.jspdf === 'undefined') { alert("Erro: jsPDF não carregado."); return; }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            let y = 10;

            doc.setFontSize(18);
            doc.text(`Relatório: ${currentBuild.name}`, 10, y);
            y += 10;
            
            // --- RESUMO ---
            doc.setFontSize(12);
            doc.text("Resumo:", 10, y);
            y += 7;
            doc.setFontSize(10);
            doc.text(`Essenciais: ${analysis.present_attributes.size}/${requiredAttributes.length}`, 10, y);
            y += 5;
            doc.text(`Secundários: ${analysis.secondary_present.length}`, 10, y);
            y += 5;
            doc.text(`Duplicatas Ruins: ${analysis.duplicates_to_remove.length}`, 10, y);
            y += 5;
            doc.text(`Inúteis: ${analysis.useless_gems.length}`, 10, y);
            y += 10;

            // --- FALTANTES ---
            if (analysis.missing_attributes.length > 0) {
                doc.setTextColor(200,0,0); // Red
                doc.text("FALTANDO (ESSENCIAIS):", 10, y);
                y += 5;
                doc.setTextColor(0,0,0);
                analysis.missing_attributes.forEach(m => {
                    doc.text(`- ${m.attribute}`, 15, y);
                    y += 5;
                });
                y += 5;
            }

            // --- DUPLICATAS (REMOVER) ---
            if (analysis.duplicates_to_remove.length > 0) {
                doc.setTextColor(200,100,0); // Orange
                doc.text("REMOVER DUPLICATAS:", 10, y);
                y += 5;
                doc.setTextColor(0,0,0);
                analysis.duplicates_to_remove.forEach(d => {
                    doc.text(`- ${d.attr_name} (${d.location.position}) -> ${d.reason}`, 15, y);
                    y += 5;
                });
                y += 5;
            }

            // --- INÚTEIS (REMOVER) ---
            if (analysis.useless_gems.length > 0) {
                doc.setTextColor(180,180,0); // Dark Yellow
                doc.text("GEMS INÚTEIS/INVÁLIDAS:", 10, y);
                y += 5;
                doc.setTextColor(0,0,0);
                analysis.useless_gems.forEach(u => {
                    doc.text(`- ${u.attr_name} em ${u.location.position}`, 15, y);
                    y += 5;
                });
                y += 5;
            }

            // --- INVENTÁRIO (PRESENTES) ---
            doc.setTextColor(0,100,0); // Green
            doc.text("INVENTÁRIO (ESSENCIAIS):", 10, y);
            y += 5;
            doc.setTextColor(0,0,0);
            
            analysis.present_attributes.forEach((locations, id) => {
                const attr = masterAttributes.find(a => a.id === id);
                if (attr) {
                    doc.text(`- ${attr.name} (${locations[0].remodel})`, 15, y);
                    y += 5;
                }
            });
            y += 5;

            if (analysis.secondary_present.length > 0) {
                doc.setTextColor(0,0,150); // Blue
                doc.text("INVENTÁRIO (SECUNDÁRIOS):", 10, y);
                y += 5;
                doc.setTextColor(0,0,0);
                analysis.secondary_present.forEach(s => {
                    doc.text(`- ${s.attr_name} (${s.remodel})`, 15, y);
                    y += 5;
                });
            }

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