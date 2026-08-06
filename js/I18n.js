/**
 * js/I18n.js
 * Módulo central de internacionalização (PT <-> EN).
 * Uso: I18n.t('chave') retorna o texto no idioma atual.
 */
const I18n = (() => {

    const STORAGE_KEY = 'pvp_analyzer_lang';

    const translations = {
        pt: {
            // --- NAV ---
            'nav.dashboard': '🏠 Dashboard',
            'nav.formations': '⚔️ Marchas',
            'nav.armor': '🎨 Armadura SSR',
            'nav.events': '📅 Eventos',
            'nav.rebellions': '🔥 Rebeliões',
            'nav.admin': '🛠️ Admin',
            'nav.checklist': '📋 Checklist',
            'nav.help': 'Ajuda',
            'nav.new': '+ Novo',
            'nav.newChar': '+ Novo Personagem',
            'nav.langBtn': '🌐 EN',

            // --- DASHBOARD ---
            'dashboard.title': 'Minhas Builds',
            'dashboard.empty.title': 'Comece sua Jornada!',
            'dashboard.empty.desc': 'Você ainda não tem nenhuma build salva. Clique no botão abaixo ou no menu "+ Novo" para criar sua primeira estratégia.',
            'dashboard.empty.createBtn': 'Criar Primeira Build',
            'dashboard.importBtn': '📥 Importar Backup',

            // --- EDITOR ---
            'editor.newTitle': 'Criar Novo Personagem',
            'editor.editTitle': 'Editando',
            'editor.importedTitle': 'Importado',
            'editor.charDetails': '👤 Detalhes do Personagem',
            'editor.icon': 'Ícone',
            'editor.name': 'Nome',
            'editor.power': 'Poder',
            'editor.artifacts': 'Artefatos',
            'editor.namePlaceholder': 'Ex: Eslayner',
            'editor.powerPlaceholder': 'Ex: 15M',
            'editor.sidebar.title': '📊 Análise em Tempo Real',
            'editor.sidebar.placeholder': 'Adicione Gemas para iniciar...',
            'editor.generateReport': 'Gerar Relatório Final',
            'editor.saveChar': 'Salvar Personagem',
            'editor.clearAll': 'Limpar Tudo',

            // --- AVATAR OPTIONS ---
            'avatar.warrior': '⚔️ Guerreiro',
            'avatar.pvpAssist': '🏹 Assistência de PVP',
            'avatar.gemMage': '🔮 Mago das Gemas',
            'avatar.castleDefense': '🛡️ Defesa de Castelos',
            'avatar.king': '👑 Rei',
            'avatar.combatDragon': '🐉 Dragão de Combate',
            'avatar.pvpManiac': '💀 Maníaco do PVP',
            'avatar.farmer': '😇 Fazendeiro Nato',

            // --- ADMIN ---
            'admin.title': '🛠️ Painel Admin',
            'admin.tab.masterAttr': 'Atributos Mestres',
            'admin.tab.required': 'Requisitos',
            'admin.tab.secondary': 'Secundários',
            'admin.tab.combos': 'Combos',
            'admin.tab.tools': 'Ferramentas',
            'admin.masterAttr.title': 'Atributos Mestres (Gemas)',
            'admin.masterAttr.addBtn': '+ Novo Atributo',
            'admin.required.title': 'Atributos Essenciais',
            'admin.required.desc': 'A build só é aprovada se tiver estes atributos.',
            'admin.required.addBtn': '+ Adicionar Regra',
            'admin.secondary.title': 'Atributos de Suporte',
            'admin.secondary.desc': 'Úteis para complementar a build.',
            'admin.secondary.addBtn': '+ Adicionar Suporte',
            'admin.combos.title': 'Combos Recomendados',
            'admin.combos.addBtn': '+ Novo Combo',
            'admin.tools.notes': 'Observações do Relatório (PDF)',
            'admin.tools.saveNotes': 'Salvar Notas',
            'admin.tools.security': '🔒 Segurança',
            'admin.tools.newPass': 'Nova Senha',
            'admin.tools.changePass': 'Alterar Senha',
            'admin.tools.backup': 'Backup & Restauração',
            'admin.tools.export': '📥 Exportar Backup',
            'admin.tools.import': '📤 Importar Backup',
            'admin.tools.reset': 'Apagar Todos os Dados (Reset de Fábrica)',

            // --- HELP ---
            'help.title': 'Guia Rápido',
            'help.subtitle': 'Domine a ferramenta em 3 passos.',
            'help.step1.title': 'Configure',
            'help.step1.desc': 'Vá em <strong>Admin</strong> e cadastre os atributos mestres, essenciais e secundários.',
            'help.step2.title': 'Monte a Build',
            'help.step2.desc': 'Crie um personagem e preencha os slots de artefatos com as gemas.',
            'help.step3.title': 'Analise',
            'help.step3.desc': 'Veja o feedback em tempo real e exporte o relatório PDF para compartilhar.',
            'help.tip.title': '💡 Dica Pro: Backup de Dados',
            'help.tip.desc1': '"O sistema vem com uma lista padrão de atributos configurada pela <strong>administração</strong>. <strong>Você</strong> é livre para adicionar novos atributos na aba <strong>Admin</strong>. Ao usar a função <strong>Backup (Exportar JSON)</strong>, você salva TUDO: suas <strong>builds</strong>, suas personalizações e os novos atributos que criou."',
            'help.tip.desc2': 'Seus dados ficam salvos no navegador. Para não perder nada (ou para passar sua configuração para um amigo), vá em <strong>Admin > Ferramentas</strong> e use o botão <strong>Exportar Backup</strong>.',

            // --- FOOTER ---
            'footer.text': '© 2025 PvP Build Analyzer. Desenvolvido para a comunidade.',

            // --- REPORT VIEW ---
            'report.title': 'Relatório de Análise',
            'report.essentials': 'Essenciais',
            'report.support': 'Suporte',
            'report.duplicates': 'Duplicatas',
            'report.useless': 'Inúteis',
            'report.diagnosis': '🔍 Diagnóstico Detalhado',
            'report.missingEssentials': 'Faltam Atributos Essenciais',
            'report.approved.title': 'Build Aprovada!',
            'report.approved.desc': 'Todos os atributos essenciais foram encontrados.',
            'report.duplicatesToRemove': 'Duplicatas (Remover Piores)',
            'report.duplicatesToRemove.action': 'Trocar',
            'report.uselessGems': 'Atributos Inúteis/Inválidos',
            'report.inventory': '📋 Inventário Atual da Build',
            'report.inventory.essentials': 'Essenciais',
            'report.inventory.secondary': 'Secundários',
            'report.saveDraft': 'Salvar Rascunho',
            'report.exportCsv': 'Exportar CSV',
            'report.downloadPdf': 'Baixar PDF',
            'report.shareLink': 'Link',

            // --- ALERTS / CONFIRMS ---
            'alert.unsavedChanges': '⚠️ Alterações não salvas!\n\nVocê tem dados editados que serão perdidos se sair desta tela.\n\nDeseja realmente sair sem salvar?',
            'alert.discardAndLoad': 'Deseja descartar as alterações atuais e carregar esta build?',
            'alert.deleteBuild': 'Tem certeza que deseja excluir esta build permanentemente?',
            'alert.discardAndNew': 'Deseja descartar as alterações não salvas e criar um novo?',
            'alert.clearBuild': 'Limpar build atual?',
            'alert.draftSaved': 'Rascunho salvo!',
            'alert.buildSaved': 'Build "{name}" salva com sucesso!',
            'alert.noName': 'Por favor, dê um nome ao personagem.',
            'alert.importSuccess': '✅ Backup importado com sucesso! A página será recarregada.',
            'alert.importConfirm': '⚠️ ATENÇÃO: Importar um backup substituirá TODAS as suas builds e configurações atuais.\n\nDeseja continuar?',
            'alert.importInvalidFile': '❌ Arquivo inválido!\n\nPor favor, selecione apenas o arquivo de backup com final .json',
            'alert.importError': '❌ Erro ao ler o arquivo.\nO arquivo pode estar corrompido ou não ser um backup válido.',
            'alert.importBuildLoaded': 'Build "{name}" carregada para edição.',
            'alert.noExportBuild': 'Nenhuma build carregada para exportar.',
            'alert.pdfError': 'Erro: jsPDF não carregado.',
            'alert.reportGenerating': 'Gerando Relatório... ⏳',
            'alert.login.restricted': 'Acesso Restrito',
            'alert.login.desc': 'Esta área é reservada para administradores.',
            'alert.login.placeholder': 'Digite a senha...',
            'alert.login.unlock': 'Desbloquear',
            'alert.login.cancel': 'Cancelar',
            'alert.login.wrong': 'Senha Incorreta!',

            // --- MODAIS ---
            'modal.import.title': 'Importar Backup Avançado',
            'modal.import.subtitle': 'Selecione os personagens que deseja importar:',
            'modal.import.selectAll': 'Selecionar Todos',
            'modal.import.modeTitle': 'Modo de Importação:',
            'modal.import.modeSum': 'Somar aos meus personagens',
            'modal.import.modeSumDesc': 'Mantém as suas configurações locais e apenas adiciona os personagens do backup.',
            'modal.import.modeReplace': 'Substituir tudo',
            'modal.import.modeReplaceDesc': 'Apaga todas as suas builds e regras e carrega o backup inteiro.',
            'modal.import.confirmBtn': 'Importar Selecionados',
            'modal.import.cancelBtn': 'Cancelar',

            // --- MODAIS ---
            'modal.gem.title.edit': 'Editar Gema',
            'modal.gem.title.new': 'Adicionar Gema',
            'modal.gem.rarity': 'Raridade',
            'modal.gem.element': 'Elemento',
            'modal.gem.plusLevel': 'Nível (+)',
            'modal.gem.attributes': 'Atributos',
            'modal.gem.maxAttr': 'Máx: 3',
            'modal.gem.addLine': '+ Adicionar Linha',
            'modal.gem.remove': 'Remover',
            'modal.gem.save': 'Salvar Alterações',
            'modal.attr.tier': 'Tier',
            'modal.attr.attribute': 'Atributo',
            'modal.attr.select': 'Selecione...',
            'modal.attr.quality': 'Qualidade (Remodel)',
            'modal.masterAttr.create': 'Criar Atributo',
            'modal.masterAttr.edit': 'Editar Atributo',
            'modal.masterAttr.name': 'Nome',
            'modal.masterAttr.tier': 'Tier',
            'modal.masterAttr.element': 'Elemento',
            'modal.masterAttr.save': 'Salvar',
            'modal.required.add': 'Adicionar Requisito',
            'modal.required.edit': 'Editar Requisito',
            'modal.required.attr': 'Atributo',
            'modal.required.urgent': 'Marcar como Prioridade/Urgente? 🔥',
            'modal.required.addBtn': 'Adicionar',
            'modal.required.saveBtn': 'Salvar Alterações',
            'modal.secondary.add': 'Adicionar Secundário',
            'modal.secondary.attr': 'Atributo',
            'modal.secondary.addBtn': 'Adicionar',
            'modal.combo.new': 'Novo Combo',
            'modal.combo.edit': 'Editar Combo',
            'modal.combo.name': 'Nome',
            'modal.combo.quality': 'Qualidade',
            'modal.combo.level': 'Nível (+)',
            'modal.combo.attributes': 'Atributos (Ctrl+Click)',
            'modal.combo.save': 'Salvar',
            'modal.admin.delete': 'Remover',
            'modal.admin.edit': '✏️ Editar',

            // --- PDF ---
            'pdf.title': 'Relatório:',
            'pdf.summary': 'Resumo da Análise:',
            'pdf.essentials': 'Essenciais:',
            'pdf.secondary': 'Secundários Presentes:',
            'pdf.duplicates': 'Duplicatas Ruins:',
            'pdf.useless': 'Inúteis:',
            'pdf.urgentMissing': '!! ATENCAO: REQUISITOS URGENTES FALTANDO !!',
            'pdf.missingEssentials': 'FALTANDO ESSENCIAIS (Comum):',
            'pdf.missingSecondary': 'FALTANDO SECUNDARIAS (Opcional/Melhoria):',
            'pdf.removeDuplicates': 'REMOVER DUPLICATAS:',
            'pdf.uselessGems': 'GEMS INUTEIS/INVALIDAS (Trocar):',
            'pdf.presentEssentials': 'ATRIBUTOS ESSENCIAIS EQUIPADOS:',
            'pdf.presentSecondary': 'ATRIBUTOS SECUNDARIOS EQUIPADOS:',
            'pdf.notes': 'Observacoes & Dicas:',
            'pdf.noNotes': 'Sem observações.',
            'pdf.reason': 'Motivo:',

            // --- ARTIFACT CARDS ---
            'artifact.level': 'Nível',
            'artifact.name': 'Nome do Artefato',
            'artifact.gemSlot': 'Slot',
            'artifact.addGem': 'Clique para adicionar gema',
            'artifact.loading': 'Carregando...',
            'artifact.noAttr': 'Nenhum atributo cadastrado.',
            'artifact.emptyList': 'Lista vazia.',
            'artifact.noCombo': 'Nenhum combo.',

            // --- MISC ---
            'misc.global': 'Global',
            'misc.loading': 'Carregando...',
            'misc.at': 'em',

            // --- ELEMENTS ---
            'element.fogo': 'FOGO',
            'element.gelo': 'GELO',
            'element.luz': 'LUZ',
            'element.veneno': 'VENENO',

            // --- ARTIFACT EXTRAS ---
            'artifact.levelPlus': 'Nível (+)',
            'editor.artifactPrefix': 'Artefato',
            'editor.gemOf': 'Gema de',
            'editor.emptyGem': 'Gema Vazia',
            'editor.emptySlot': 'Vazio',
            'editor.rarity': 'Raridade',
            'editor.rarityGem': 'Raridade (Gema)',

            // --- REPORT EXTRAS ---
            'report.essentialProgress': 'Progresso Essencial',
            'report.completed': 'Concluídos',
            'report.plusMore': '+ {count} mais...',
            'report.duplicatesTitle': 'Duplicatas',
            'report.uselessTitle': 'Inúteis/Inválidos',
            'report.essentialsBadge': 'Essenciais',
            'report.supportBadge': 'Suporte',
        },

        en: {
            // --- NAV ---
            'nav.dashboard': '🏠 Dashboard',
            'nav.formations': '⚔️ Formations',
            'nav.armor': '🎨 SSR Armor',
            'nav.events': '📅 Events',
            'nav.rebellions': '🔥 Rebellions',
            'nav.admin': '🛠️ Admin',
            'nav.checklist': '📋 Checklist',
            'nav.help': 'Help',
            'nav.new': '+ New',
            'nav.newChar': '+ New Character',
            'nav.langBtn': '🌐 PT',

            // --- DASHBOARD ---
            'dashboard.title': 'My Builds',
            'dashboard.empty.title': 'Start Your Journey!',
            'dashboard.empty.desc': 'You have no saved builds yet. Click the button below or the "+ New" menu to create your first strategy.',
            'dashboard.empty.createBtn': 'Create First Build',
            'dashboard.importBtn': '📥 Import Backup',

            // --- EDITOR ---
            'editor.newTitle': 'Create New Character',
            'editor.editTitle': 'Editing',
            'editor.importedTitle': 'Imported',
            'editor.charDetails': '👤 Character Details',
            'editor.icon': 'Icon',
            'editor.name': 'Name',
            'editor.power': 'Power',
            'editor.artifacts': 'Artifacts',
            'editor.namePlaceholder': 'Ex: Eslayner',
            'editor.powerPlaceholder': 'Ex: 15M',
            'editor.sidebar.title': '📊 Real-Time Analysis',
            'editor.sidebar.placeholder': 'Add Gems to start...',
            'editor.generateReport': 'Generate Final Report',
            'editor.saveChar': 'Save Character',
            'editor.clearAll': 'Clear All',

            // --- AVATAR OPTIONS ---
            'avatar.warrior': '⚔️ Warrior',
            'avatar.pvpAssist': '🏹 PVP Assistance',
            'avatar.gemMage': '🔮 Gem Mage',
            'avatar.castleDefense': '🛡️ Castle Defense',
            'avatar.king': '👑 King',
            'avatar.combatDragon': '🐉 Combat Dragon',
            'avatar.pvpManiac': '💀 PVP Maniac',
            'avatar.farmer': '😇 Born Farmer',

            'editor.artifactPrefix': 'Artifact',
            'editor.gemOf': 'Gem of',
            'editor.emptyGem': 'Empty Gem',
            'editor.emptySlot': 'Empty',
            'editor.rarity': 'Rarity',
            'editor.rarityGem': 'Rarity (Gem)',
            'artifact.level': 'Level',
            'artifact.levelPlus': 'Level (+)',
            'element.fogo': 'FIRE',
            'element.gelo': 'ICE',
            'element.luz': 'LIGHT',
            'element.veneno': 'POISON',

            // --- ADMIN ---
            'admin.title': '🛠️ Admin Panel',
            'admin.tab.masterAttr': 'Master Attributes',
            'admin.tab.required': 'Requirements',
            'admin.tab.secondary': 'Secondary',
            'admin.tab.combos': 'Combos',
            'admin.tab.tools': 'Tools',
            'admin.masterAttr.title': 'Master Attributes (Gems)',
            'admin.masterAttr.addBtn': '+ New Attribute',
            'admin.required.title': 'Essential Attributes',
            'admin.required.desc': 'The build is only approved if it has these attributes.',
            'admin.required.addBtn': '+ Add Rule',
            'admin.secondary.title': 'Support Attributes',
            'admin.secondary.desc': 'Useful to complement the build.',
            'admin.secondary.addBtn': '+ Add Support',
            'admin.combos.title': 'Recommended Combos',
            'admin.combos.addBtn': '+ New Combo',
            'admin.tools.notes': 'Report Notes (PDF)',
            'admin.tools.saveNotes': 'Save Notes',
            'admin.tools.security': '🔒 Security',
            'admin.tools.newPass': 'New Password',
            'admin.tools.changePass': 'Change Password',
            'admin.tools.backup': 'Backup & Restore',
            'admin.tools.export': '📥 Export Backup',
            'admin.tools.import': '📤 Import Backup',
            'admin.tools.reset': 'Delete All Data (Factory Reset)',

            // --- HELP ---
            'help.title': 'Quick Guide',
            'help.subtitle': 'Master the tool in 3 steps.',
            'help.step1.title': 'Configure',
            'help.step1.desc': 'Go to <strong>Admin</strong> and register master, essential and secondary attributes.',
            'help.step2.title': 'Build Your Setup',
            'help.step2.desc': 'Create a character and fill the artifact slots with gems.',
            'help.step3.title': 'Analyze',
            'help.step3.desc': 'See real-time feedback and export the PDF report to share.',
            'help.tip.title': '💡 Pro Tip: Data Backup',
            'help.tip.desc1': '"The system comes with a default list of attributes configured by the <strong>administration</strong>. <strong>You</strong> are free to add new attributes in the <strong>Admin</strong> tab. Using the <strong>Backup (Export JSON)</strong> function saves EVERYTHING: your <strong>builds</strong>, your customizations and the new attributes you created."',
            'help.tip.desc2': 'Your data is saved in the browser. To avoid losing anything (or to share your setup with a friend), go to <strong>Admin > Tools</strong> and use the <strong>Export Backup</strong> button.',

            // --- FOOTER ---
            'footer.text': '© 2025 PvP Build Analyzer. Built for the community.',

            // --- REPORT VIEW ---
            'report.title': 'Analysis Report',
            'report.essentials': 'Essentials',
            'report.support': 'Support',
            'report.duplicates': 'Duplicates',
            'report.useless': 'Useless',
            'report.diagnosis': '🔍 Detailed Diagnosis',
            'report.missingEssentials': 'Missing Essential Attributes',
            'report.approved.title': 'Build Approved!',
            'report.approved.desc': 'All essential attributes were found.',
            'report.duplicatesToRemove': 'Duplicates (Remove Worst)',
            'report.duplicatesToRemove.action': 'Swap',
            'report.uselessGems': 'Useless/Invalid Attributes',
            'report.inventory': '📋 Current Build Inventory',
            'report.inventory.essentials': 'Essentials',
            'report.inventory.secondary': 'Secondary',
            'report.saveDraft': 'Save Draft',
            'report.exportCsv': 'Export CSV',
            'report.downloadPdf': 'Download PDF',
            'report.shareLink': 'Link',
            'report.essentialProgress': 'Essential Progress',
            'report.completed': 'Completed',
            'report.plusMore': '+ {count} more...',
            'report.duplicatesTitle': 'Duplicates',
            'report.uselessTitle': 'Useless/Invalid',
            'report.essentialsBadge': 'Essentials',
            'report.supportBadge': 'Support',

            // --- ALERTS / CONFIRMS ---
            'alert.unsavedChanges': '⚠️ Unsaved changes!\n\nYou have edited data that will be lost if you leave this screen.\n\nDo you really want to leave without saving?',
            'alert.discardAndLoad': 'Do you want to discard current changes and load this build?',
            'alert.deleteBuild': 'Are you sure you want to permanently delete this build?',
            'alert.discardAndNew': 'Do you want to discard unsaved changes and create a new one?',
            'alert.clearBuild': 'Clear current build?',
            'alert.draftSaved': 'Draft saved!',
            'alert.buildSaved': 'Build "{name}" saved successfully!',
            'alert.noName': 'Please give the character a name.',
            'alert.importSuccess': '✅ Backup imported successfully! The page will reload.',
            'alert.importConfirm': '⚠️ WARNING: Importing a backup will replace ALL your current builds and settings.\n\nDo you want to continue?',
            'alert.importInvalidFile': '❌ Invalid file!\n\nPlease select only the backup file with the .json extension.',
            'alert.importError': '❌ Error reading the file.\nThe file may be corrupted or not a valid backup.',
            'alert.importBuildLoaded': 'Build "{name}" loaded for editing.',
            'alert.noExportBuild': 'No build loaded for export.',
            'alert.pdfError': 'Error: jsPDF not loaded.',
            'alert.reportGenerating': 'Generating Report... ⏳',
            'alert.login.restricted': 'Restricted Access',
            'alert.login.desc': 'This area is reserved for administrators.',
            'alert.login.placeholder': 'Enter password...',
            'alert.login.unlock': 'Unlock',
            'alert.login.cancel': 'Cancel',
            'alert.login.wrong': 'Wrong Password!',

            // --- MODALS ---
            'modal.import.title': 'Advanced Backup Import',
            'modal.import.subtitle': 'Select characters to import:',
            'modal.import.selectAll': 'Select All',
            'modal.import.modeTitle': 'Import Mode:',
            'modal.import.modeSum': 'Append to my characters',
            'modal.import.modeSumDesc': 'Keeps your local settings and appends the backup characters.',
            'modal.import.modeReplace': 'Replace everything',
            'modal.import.modeReplaceDesc': 'Deletes all current builds and rules and loads the whole backup.',
            'modal.import.confirmBtn': 'Import Selected',
            'modal.import.cancelBtn': 'Cancel',

            // --- MODALS ---
            'modal.gem.title.edit': 'Edit Gem',
            'modal.gem.title.new': 'Add Gem',
            'modal.gem.rarity': 'Rarity',
            'modal.gem.element': 'Element',
            'modal.gem.plusLevel': 'Level (+)',
            'modal.gem.attributes': 'Attributes',
            'modal.gem.maxAttr': 'Max: 3',
            'modal.gem.addLine': '+ Add Line',
            'modal.gem.remove': 'Remove',
            'modal.gem.save': 'Save Changes',
            'modal.attr.tier': 'Tier',
            'modal.attr.attribute': 'Attribute',
            'modal.attr.select': 'Select...',
            'modal.attr.quality': 'Quality (Remodel)',
            'modal.masterAttr.create': 'Create Attribute',
            'modal.masterAttr.edit': 'Edit Attribute',
            'modal.masterAttr.name': 'Name',
            'modal.masterAttr.tier': 'Tier',
            'modal.masterAttr.element': 'Element',
            'modal.masterAttr.save': 'Save',
            'modal.required.add': 'Add Requirement',
            'modal.required.edit': 'Edit Requirement',
            'modal.required.attr': 'Attribute',
            'modal.required.urgent': 'Mark as Priority/Urgent? 🔥',
            'modal.required.addBtn': 'Add',
            'modal.required.saveBtn': 'Save Changes',
            'modal.secondary.add': 'Add Secondary',
            'modal.secondary.attr': 'Attribute',
            'modal.secondary.addBtn': 'Add',
            'modal.combo.new': 'New Combo',
            'modal.combo.edit': 'Edit Combo',
            'modal.combo.name': 'Name',
            'modal.combo.quality': 'Quality',
            'modal.combo.level': 'Level (+)',
            'modal.combo.attributes': 'Attributes (Ctrl+Click)',
            'modal.combo.save': 'Save',
            'modal.admin.delete': 'Remove',
            'modal.admin.edit': '✏️ Edit',

            // --- PDF ---
            'pdf.title': 'Report:',
            'pdf.summary': 'Analysis Summary:',
            'pdf.essentials': 'Essentials:',
            'pdf.secondary': 'Secondary Present:',
            'pdf.duplicates': 'Bad Duplicates:',
            'pdf.useless': 'Useless:',
            'pdf.urgentMissing': '!! ATTENTION: URGENT REQUIREMENTS MISSING !!',
            'pdf.missingEssentials': 'MISSING ESSENTIALS (Common):',
            'pdf.missingSecondary': 'MISSING SECONDARY (Optional/Improvement):',
            'pdf.removeDuplicates': 'REMOVE DUPLICATES:',
            'pdf.uselessGems': 'USELESS/INVALID GEMS (Replace):',
            'pdf.presentEssentials': 'ESSENTIAL ATTRIBUTES EQUIPPED:',
            'pdf.presentSecondary': 'SECONDARY ATTRIBUTES EQUIPPED:',
            'pdf.notes': 'Notes & Tips:',
            'pdf.noNotes': 'No notes.',
            'pdf.reason': 'Reason:',

            // --- ARTIFACT CARDS ---
            'artifact.level': 'Level',
            'artifact.name': 'Artifact Name',
            'artifact.gemSlot': 'Slot',
            'artifact.addGem': 'Click to add gem',
            'artifact.loading': 'Loading...',
            'artifact.noAttr': 'No attributes registered.',
            'artifact.emptyList': 'Empty list.',
            'artifact.noCombo': 'No combos.',

            // --- MISC ---
            'misc.global': 'Global',
            'misc.loading': 'Loading...',
            'misc.at': 'in',

            // --- MASTER ATTRIBUTES (DYNAMIC SEED) ---
            'Tirano': 'Tyrant',
            'Benção de Deus': 'God\'s Blessing',
            'Enfraquecer Tirano': 'Weaken Tyrant',
            'Hades': 'Hades',
            'Redução de Dano de Tropas': 'Troop Damage Reduction',
            'Dano de Tropas': 'Troop Damage',
            'Capacidade de Herói': 'Hero Capacity',
            'Poder da Unidade': 'Unit Power',
            'Supressão': 'Suppression',
            'Atenuar Supressão': 'Mitigate Suppression',
            'Taxa de Produção de Primavera': 'Spring Production Rate',
            'Todo Poder das Gemas de Fogo': 'All Fire Gem Power',
            'Todo Poder das Gemas de Luz': 'All Light Gem Power',
            'Todo Poder das Gemas de Gelo': 'All Ice Gem Power',
            'Todo Poder das Gemas de Veneno': 'All Poison Gem Power',
            'Dano de Contra Ataque': 'Counter Attack Damage',
            'Capacidade de Tropa do Héroi de Fogo': 'Fire Hero Troop Capacity',
            'Todo Poder das Tropas de Fogo': 'All Fire Troop Power',
            'Redução de Dano de Contra Ataque Recebido': 'Received Counter Attack Damage Reduction',
            'Capacidade da Tropa do Herói de Gelo': 'Ice Hero Troop Capacity',
            'Todo Poder das Tropas de Gelo': 'All Ice Troop Power',
            'Todo Poder das Tropas de Luz': 'All Light Troop Power',
            'Capacidade da Tropa do Herói de Luz': 'Light Hero Troop Capacity',
            'Redução de Dano das Tropas de Guarnição': 'Garrison Troop Damage Reduction',
            'Todo Poder das Tropas de Veneno': 'All Poison Troop Power',
            'Capacidade da Tropa do Herói de Veneno': 'Poison Hero Troop Capacity',
            'Dano de Cerco das Tropas': 'Siege Troop Damage',
            'Guardião': 'Guardian',
            'Sede de Sangue': 'Bloodthirst',
            'Capacidade dos mortos da Primavera': 'Spring Dead Capacity',
            'Capacidade de Fonte de Renovação de Primavera': 'Spring Renewal Font Capacity',
            'Dano de Reunião de Tropas': 'Rally Troop Damage',
            'Todo Poder de Fogo do Herói': 'All Hero Fire Power',
            'Assalto do Herói de Fogo': 'Fire Hero Assault',
            'Hp do Herói de Fogo': 'Fire Hero HP',
            'Todo Poder de Gelo do Herói': 'All Hero Ice Power',
            'Assalto do Herói de Gelo': 'Ice Hero Assault',
            'Hp do Herói de Gelo': 'Ice Hero HP',
            'Todo Poder de Luz do Herói': 'All Hero Light Power',
            'Assalto do Herói de Luz': 'Light Hero Assault',
            'Hp do Herói de Luz': 'Light Hero HP',
            'Todo Poder de Veneno do Herói': 'All Hero Poison Power',
            'Assalto do Herói de Veneno': 'Poison Hero Assault',
            'Hp do Herói de Veneno': 'Poison Hero HP',
            'Revival': 'Revival',
            'Enfraquecer Revival': 'Weaken Revival',
            'Massacre': 'Massacre',
            'Enfraquecer Massacre': 'Weaken Massacre',
            'Recrutamento Rápido': 'Fast Recruitment',
            'Ouro Adicional': 'Additional Gold',
            'Madeira Adicional': 'Additional Wood',
            'Cristal Adicional': 'Additional Crystal',
            'Comida Adicional': 'Additional Food',
            'Dano Garantido': 'Guaranteed Damage',
            'Redução Dano Garantido': 'Guaranteed Damage Reduction',
            'Execução de Harolds': 'Harold Execution',
            'Execução de Monstros': 'Monster Execution',
            'Execução de Titans': 'Titan Execution',
            'Executar ( Estágios )': 'Execute (Stages)',
        }
    };

    // -----------------------------------------------
    // Pega o idioma atual do localStorage (padrão: 'pt')
    // -----------------------------------------------
    const getCurrentLang = () => {
        return localStorage.getItem(STORAGE_KEY) || 'pt';
    };

    // -----------------------------------------------
    // Traduz uma chave no idioma atual
    // -----------------------------------------------
    const t = (key, fallback) => {
        const lang = getCurrentLang();
        const dict = translations[lang] || translations['pt'];
        // 1. Tenta encontrar no dicionário do idioma atual
        if (dict[key] !== undefined) return dict[key];
        // 2. Tenta encontrar no dicionário PT como fallback de sistema
        if (translations['pt'][key] !== undefined) return translations['pt'][key];
        // 3. Usa o fallback explícito passado pelo chamador (ex: t('element.fogo', element))
        if (fallback !== undefined && fallback !== null) return fallback;
        // 4. Retorna a chave como último recurso
        return key;
    };

    // -----------------------------------------------
    // Muda o idioma e dispara evento customizado
    // -----------------------------------------------
    const setLanguage = (lang) => {
        if (!translations[lang]) return;
        localStorage.setItem(STORAGE_KEY, lang);
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    };

    // -----------------------------------------------
    // Toggle conveniente PT <-> EN
    // -----------------------------------------------
    const toggle = () => {
        const current = getCurrentLang();
        setLanguage(current === 'pt' ? 'en' : 'pt');
    };

    return { t, setLanguage, toggle, getCurrentLang };
})();

window.I18n = I18n;


// --- Auto-Translate Feature for All Pages ---
const autoTranslateDOM = () => {
    if (typeof window.I18n === 'undefined') return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = window.I18n.t(key);
        if (text && text !== key) {
            el.innerHTML = text;
        }
    });
};

document.addEventListener('DOMContentLoaded', autoTranslateDOM);
document.addEventListener('languageChanged', autoTranslateDOM);
