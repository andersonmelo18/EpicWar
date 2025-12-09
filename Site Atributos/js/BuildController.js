/**
 * Módulo para gerenciar a criação, edição e análise da build atual.
 */
const BuildController = (() => {

    // Variável para armazenar a build que está sendo editada (estado atual na memória)
    let currentBuild = null;
    let masterAttributes = [];
    let requiredAttributes = [];
    let recommendedCombos = [];

    let currentArtifactId = null;
    let currentSlotIndex = null;

    // --- Funções de Inicialização ---

    const loadDependencies = () => {
        masterAttributes = StorageService.loadMasterAttributes();
        requiredAttributes = StorageService.loadRequiredAttributes();
        recommendedCombos = StorageService.loadRecommendedCombos();
    };

    /**
     * Inicializa o controlador.
     */
    const init = (buildId) => {
        loadDependencies();
        if (buildId) {
            loadBuildForEditing(buildId);
        } else {
            initializeNewBuild();
        }
    };

    // --- Lógica do Dashboard (LISTAGEM) ---

    /**
     * Carrega todas as builds salvas e renderiza na tela inicial.
     * Essencial para que o botão "Salvar" mostre o resultado na hora.
     */
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

        // Usa o Renderer para criar o HTML de cada card
        const html = builds.map(build => Renderer.renderBuildCard(build)).join('');
        container.innerHTML = html;
    };

    const deleteBuild = (id) => {
        StorageService.deleteBuild(id);
        refreshDashboard(); // Atualiza a lista após deletar
    };

    // --- Lógica de Criação e Edição (EDITOR) ---

    const initializeNewBuild = () => {
        currentBuild = {
            id: null,
            name: '',
            class: '',
            artifacts: []
        };
        // Carrega 4 artefatos padrão para começar
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
            console.error("Build não encontrada.");
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

    // --- Manipulação de Artefatos ---

    const updateArtifactCount = (count) => {
        const currentLength = currentBuild.artifacts.length;

        if (count > currentLength) {
            // Adicionar novos artefatos
            for (let i = currentLength; i < count; i++) {
                currentBuild.artifacts.push({
                    id: Date.now() + i,
                    name: `Artefato ${i + 1}`,
                    level: 0,
                    position: i + 1,
                    gems: [null, null, null, null] // 4 slots fixos: Fogo, Gelo, Luz, Veneno
                });
            }
        } else if (count < currentLength) {
            // Remover artefatos
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

        // Listeners para slots de gema
        container.querySelectorAll('[data-action="edit-gem"]').forEach(slot => {
            slot.removeEventListener('click', handleGemSlotClick); // Evita duplicidade
            slot.addEventListener('click', handleGemSlotClick);
        });

        // Listeners para inputs de artefato
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
            if (field === 'level') {
                artifact.level = parseInt(value) || 0;
            } else if (field === 'name') {
                artifact.name = value;
            }
        }
        runRealTimeAnalysis();
    };

    // --- Análise em Tempo Real (Sidebar) ---

    const renderAnalysisSummary = (analysis) => {
        const summaryDiv = document.getElementById('analysis-summary');
        let html = '';

        const requiredCount = requiredAttributes.length;
        const presentCount = analysis.present_attributes.size;

        html += `<p class="font-bold text-lg border-b pb-2 mb-3">Progresso: <span class="${presentCount === requiredCount ? 'text-green-600' : 'text-orange-500'}">${presentCount}/${requiredCount}</span> Atributos Essenciais</p>`;

        if (analysis.missing_attributes.length > 0) {
            html += `<h4 class="font-semibold text-red-600 mt-2">❌ Faltando (${analysis.missing_attributes.length}):</h4>`;
            html += `<ul class="list-disc list-inside space-y-1 text-sm text-gray-700">`;
            analysis.missing_attributes.slice(0, 5).forEach(m => {
                const suggestion = AnalysisEngine.generateSuggestion(m, currentBuild);
                const elementText = m.required_element ? m.required_element.toUpperCase() : 'GLOBAL';
                html += `<li>${m.attribute} (${elementText}) <span class="text-xs text-gray-500 block">${suggestion}</span></li>`;
            });
            html += `</ul>`;
        }

        if (analysis.present_attributes.size > 0) {
            html += `<h4 class="font-semibold text-green-600 mt-4">✅ Presentes:</h4>`;
            html += `<ul class="list-disc list-inside space-y-1 text-sm text-gray-700">`;
            analysis.present_attributes.forEach((locations, id) => {
                const attr = masterAttributes.find(a => a.id === id);
                if (attr) {
                    const firstLoc = locations[0];
                    html += `<li>${attr.name} <span class="text-xs text-indigo-500 ml-1">(${firstLoc.position} - ${firstLoc.remodel})</span></li>`;
                }
            });
            html += `</ul>`;
        }

        if (analysis.dispensable_gems.length > 0) {
            html += `<h4 class="font-semibold text-yellow-600 mt-4">⚠️ Gemas Inúteis:</h4>`;
            html += `<ul class="list-disc list-inside space-y-1 text-sm text-gray-700">`;
            analysis.dispensable_gems.slice(0, 3).forEach(g => {
                html += `<li>${g.location.position} (${g.element})</li>`;
            });
            html += `</ul>`;
        }
        summaryDiv.innerHTML = html || '<p class="text-gray-500">Adicione Gemas para iniciar a análise...</p>';
    };

    const runRealTimeAnalysis = () => {
        if (!currentBuild || !currentBuild.artifacts || currentBuild.artifacts.length === 0) {
            document.getElementById('analysis-summary').innerHTML = '<p class="text-gray-500">Comece adicionando um artefato.</p>';
            return;
        }
        const analysis = AnalysisEngine.runAnalysis(currentBuild, masterAttributes, requiredAttributes, recommendedCombos);
        renderAnalysisSummary(analysis);
    };

    // --- Salvamento ---

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
        App.showDashboard(); // Retorna ao dashboard e atualiza a lista
    };

    // --- Lógica do Modal de Gema ---

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
            // Importante: Recarrega atributos (caso tenham sido criados no Admin recentemente)
            loadDependencies();
            
            Renderer.renderGemModal(artifact, currentSlotIndex, gem, masterAttributes);
            
            // Importante: Anexa listeners para fechar com ESC ou clique fora
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
        // Fallback click listener
        modal.addEventListener('click', (e) => { if (e.target.id === 'gem-edit-modal') closeModal(); });

        const removeBtn = modal.querySelector('#remove-gem-btn');
        if (removeBtn && existingGem) {
            removeBtn.addEventListener('click', handleRemoveGem);
        }

        modal.querySelector('#gem-form').addEventListener('submit', handleSaveGem);
        modal.querySelector('#add-attribute-row-btn').addEventListener('click', handleAddAttributeRow);

        // Delegação de eventos para remover linha
        modal.querySelector('#attributes-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-attribute-btn')) {
                e.target.closest('.attribute-row').remove();
                updateAddAttributeButton();
            }
        });

        // Delegação de eventos para mudança de Tier ou Atributo
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
                alert(`ERRO: O atributo selecionado é exclusivo do elemento ${masterAttributes.find(a => a.id === attrId)?.default_element} e não pode ser usado em uma gema de ${gemElement}.`);
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

            const attributeOptions = filteredAttributes.map(a =>
                `<option value="${a.id}" data-tier="${a.tier}">${a.name}</option>`
            ).join('');

            const remodelOptions = AdminService.REMODELS.map(r => `<option value="${r}">${r.charAt(0).toUpperCase() + r.slice(1)}</option>`).join('');
            const tierOptions = [1, 2, 3].map(t => `<option value="${t}" ${t === defaultTier ? 'selected' : ''}>Lv${t}</option>`).join('');

            newRow.innerHTML = `
                <h5 class="font-semibold text-gray-700 mb-2">Atributo ${newIndex + 1}</h5>
                <div class="grid grid-cols-3 gap-2">
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Tier</label>
                        <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm attribute-tier">
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
        let valid = true;

        form.querySelectorAll('.attribute-row').forEach(row => {
            const attrId = parseInt(row.querySelector('.attribute-id').value);
            const remodel = row.querySelector('.attribute-remodel').value;
            const tier = parseInt(row.querySelector('.attribute-tier').value);

            if (attrId) {
                gemAttributes.push({
                    attribute_id: attrId,
                    remodel: remodel,
                    tier: tier
                });
            }
        });

        if (gemAttributes.length === 0) {
            alert("A gema deve ter pelo menos 1 atributo selecionado.");
            valid = false;
        }

        if (!valid) return;

        const newGem = {
            element: AdminService.ELEMENTS[currentSlotIndex],
            rarity: form.querySelector('#gem-rarity').value,
            plus_level: parseInt(form.querySelector('#gem-plus-level').value),
            attributes: gemAttributes
        };

        const artifact = currentBuild.artifacts.find(a => a.id === currentArtifactId);
        if (artifact) {
            artifact.gems[currentSlotIndex] = newGem;
        }

        closeModal();
        renderArtifactCards();
        runRealTimeAnalysis();
    };

    const handleRemoveGem = () => {
        if (confirm("Tem certeza que deseja remover esta Gema?")) {
            const artifact = currentBuild.artifacts.find(a => a.id === currentArtifactId);
            if (artifact) {
                artifact.gems[currentSlotIndex] = null;
            }
            closeModal();
            renderArtifactCards();
            runRealTimeAnalysis();
        }
    };

    const closeModal = () => {
        if (Renderer.closeCurrentModal) {
            Renderer.closeCurrentModal();
        } else {
            document.getElementById('modals-container').innerHTML = '';
        }
    };

    // --- Lógica de Relatório e Exportação ---

    const generateFinalReport = () => {
        // --- Captura de dados ANTES de gerar ---
        const nameInput = document.getElementById('char-name');
        const classInput = document.getElementById('char-class');
        
        if (nameInput) currentBuild.name = nameInput.value;
        if (classInput) currentBuild.class = classInput.value;
        // ---------------------------------------

        const analysis = AnalysisEngine.runAnalysis(currentBuild, masterAttributes, requiredAttributes, recommendedCombos);

        App.showView('report');

        const reportView = document.getElementById('report-view');
        
        if (!reportView) {
            alert("View de relatório não encontrada.");
            return;
        }

        let html = `
            <div class="bg-white p-8 rounded-xl shadow-2xl">
                <h2 class="text-3xl font-bold text-indigo-700 mb-2">Relatório de Build - "${currentBuild.name || 'Sem Nome'}"</h2>
                <p class="text-gray-500 mb-6">Análise detalhada para otimização PvP.</p>

                <div class="grid md:grid-cols-3 gap-6 mb-8 border-b pb-4">
                    <div class="p-4 bg-indigo-50 rounded-lg">
                        <h4 class="font-bold text-lg text-indigo-800">Status PvP</h4>
                        <p class="text-3xl font-extrabold text-indigo-600">${analysis.present_attributes.size}/${requiredAttributes.length}</p>
                        <p class="text-sm text-gray-600">Atributos Essenciais Encontrados.</p>
                    </div>
                    <div class="p-4 bg-yellow-50 rounded-lg">
                        <h4 class="font-bold text-lg text-yellow-800">Gemas para Substituir</h4>
                        <p class="text-3xl font-extrabold text-yellow-600">${analysis.dispensable_gems.length}</p>
                        <p class="text-sm text-gray-600">Gemas com apenas atributos dispensáveis.</p>
                    </div>
                    <div class="p-4 bg-green-50 rounded-lg">
                        <h4 class="font-bold text-lg text-green-800">Melhor Combo</h4>
                        <p class="text-xl font-extrabold text-green-600">${analysis.combo_status.length > 0 ? `${analysis.combo_status[0].name} (${Math.round(analysis.combo_status[0].completeness)}%)` : 'Nenhum'}</p>
                        <p class="text-sm text-gray-600">Combo com maior progresso.</p>
                    </div>
                </div>

                <h3 class="text-2xl font-bold mb-4">🔎 Detalhes da Análise</h3>

                <div class="mb-6">
                    <h4 class="font-semibold text-red-600 text-xl border-b pb-1 mb-3">❌ Atributos Essenciais Faltando (${analysis.missing_attributes.length})</h4>
                    <ul class="space-y-3">
                        ${analysis.missing_attributes.map(m => `
                            <li class="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                                <span class="font-bold">${m.attribute}</span>
                                <p class="text-sm text-gray-700 mt-1">${AnalysisEngine.generateSuggestion(m, currentBuild)}</p>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="mb-6">
                    <h4 class="font-semibold text-green-600 text-xl border-b pb-1 mb-3">✅ Atributos Essenciais Presentes (${analysis.present_attributes.size})</h4>
                    <ul class="space-y-2">
                        ${Array.from(analysis.present_attributes).map(([id, locations]) => {
                            const attr = masterAttributes.find(a => a.id === id);
                            if (!attr) return '';
                            return `
                                <li class="text-sm text-gray-700">
                                    <span class="font-semibold">${attr.name}:</span>
                                    ${locations.map(loc => `
                                        <span class="inline-block bg-green-100 text-green-800 text-xs px-2 rounded-full mx-1">
                                            ${loc.position} (${loc.remodel})
                                        </span>
                                    `).join('')}
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </div>

                <div class="mb-6">
                    <h4 class="font-semibold text-yellow-600 text-xl border-b pb-1 mb-3">⚠️ Gemas Marcadas como Inúteis (${analysis.dispensable_gems.length})</h4>
                    <ul class="space-y-2">
                        ${analysis.dispensable_gems.map(g => `
                            <li class="bg-yellow-50 p-2 rounded-lg text-sm">
                                <span class="font-bold">${g.location.artifact_name} - Slot ${g.element.charAt(0).toUpperCase() + g.element.slice(1)}:</span>
                                ${g.reason}
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="flex justify-end space-x-4 mt-8 pt-4 border-t">
                    <button id="export-pdf-btn" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">Exportar PDF</button>
                    <button id="export-csv-btn" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Exportar CSV</button>
                    <button id="share-link-btn" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Compartilhar Link</button>
                </div>

                <p id="share-link-output" class="mt-4 text-center text-sm text-gray-600 hidden"></p>

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
        outputElement.textContent = `Link de Compartilhamento: ${shareUrl}`;
        outputElement.classList.remove('hidden');
        navigator.clipboard.writeText(shareUrl).then(() => {
            outputElement.textContent += " (Copiado!)";
        });
    };

    const handleExport = (type, analysis) => {
        if (!currentBuild.name) {
            alert("Por favor, nomeie a build antes de exportar.");
            return;
        }

        const buildName = currentBuild.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (type === 'pdf') {
            if (typeof window.jspdf === 'undefined') {
                alert("Erro: Biblioteca jsPDF não carregada.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            let y = 10;
            const lineHeight = 7;

            // Título
            doc.setFontSize(18);
            doc.text(`Relatório de Build: ${currentBuild.name}`, 10, y);
            y += lineHeight * 2;

            // Dados
            doc.setFontSize(10);
            doc.text(`Classe: ${currentBuild.class || 'N/A'}`, 10, y);
            y += lineHeight;
            doc.text(`Artefatos: ${currentBuild.artifacts.length}`, 10, y);
            y += lineHeight * 2;

            // Faltantes
            doc.setFontSize(14);
            doc.setTextColor(200, 0, 0);
            doc.text(`Faltando (${analysis.missing_attributes.length}):`, 10, y);
            y += lineHeight;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            analysis.missing_attributes.forEach(m => {
                doc.text(`- ${m.attribute}`, 15, y);
                y += lineHeight;
            });
            y += lineHeight;

            // Presentes
            doc.setFontSize(14);
            doc.setTextColor(0, 150, 0);
            doc.text(`Presentes (${analysis.present_attributes.size}):`, 10, y);
            y += lineHeight;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            analysis.present_attributes.forEach((locations, id) => {
                const attr = masterAttributes.find(a => a.id === id);
                if (attr) {
                    const locText = locations.map(loc => `${loc.position} (${loc.remodel})`).join(', ');
                    doc.text(`- ${attr.name}: ${locText}`, 15, y);
                    y += lineHeight;
                }
            });

            doc.save(`${buildName}_relatorio.pdf`);

        } else if (type === 'csv') {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `Nome,Classe\n${currentBuild.name},${currentBuild.class || 'N/A'}\n\n`;
            csvContent += "Artefato,Posição,Nível,Gema 1,Gema 2,Gema 3,Gema 4\n";

            currentBuild.artifacts.forEach(artifact => {
                const gemDetails = artifact.gems.map(gem => {
                    if (!gem) return 'VAZIO';
                    const attrs = gem.attributes.map(a => {
                        const attrName = masterAttributes.find(ma => ma.id === a.attribute_id)?.name || 'Desc';
                        return `${attrName}(Lv${a.tier})`;
                    }).join('/');
                    return `${gem.rarity} [${attrs}]`;
                }).join(',');
                csvContent += `${artifact.name},${artifact.position},${artifact.level},"${gemDetails}"\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${buildName}_detalhes.csv`);
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
        refreshDashboard, // <--- EXPORTADO PARA APP.JS USAR
        deleteBuild
    };
})();