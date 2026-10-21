// Execute com: node --test tests/regression.test.cjs (Node 18+).
// Todos os testes usam armazenamento e DOM simulados; não acessam o navegador do usuário.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));
const fixture = () => JSON.parse(read('SaveBuild.json'));

function environment(initial = {}) {
    const data = new Map(Object.entries(initial));
    const writes = [];
    const storage = {
        getItem: key => data.get(key) ?? null,
        setItem(key, value) { data.set(key, String(value)); writes.push(key); },
        removeItem(key) { data.delete(key); writes.push(key); }
    };
    class Element {
        constructor(tag = 'div') {
            this.tagName = tag; this.children = []; this.listeners = {}; this.style = {};
            this.value = ''; this.options = []; this.dataset = {}; this.textContent = '';
            this.innerHTML = ''; this.classList = { add() {}, remove() {}, toggle() {} };
        }
        append(...children) { children.forEach(child => this.appendChild(child)); }
        appendChild(child) { child.parent = this; this.children.push(child); return child; }
        remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); }
        setAttribute(key, value) { this[key] = value; }
        addEventListener(event, callback) { (this.listeners[event] ??= []).push(callback); }
        removeEventListener() {}
        dispatch(event, payload = {}) { for (const cb of this.listeners[event] || []) cb({ target: this, ...payload }); }
        click() { this.dispatch('click'); }
        focus() {}
        showModal() { this.open = true; }
        close() { this.open = false; }
        querySelectorAll(selector) {
            if (selector === '[data-build-action]') {
                if (!this.buttons) this.buttons = [...this.innerHTML.matchAll(/data-build-action="([^"]+)" data-build-id="([^"]+)"/g)].map(match => {
                    const button = new Element('button');
                    button.dataset = { buildAction: match[1], buildId: match[2] };
                    return button;
                });
                return this.buttons;
            }
            if (selector === '.import-char-checkbox:checked') return this.children.flatMap(row => row.children).filter(c => c.type === 'checkbox' && c.checked);
            return [];
        }
        querySelector() { return null; }
    }
    const nodes = new Map();
    const body = new Element('body');
    const find = (element, id) => element.id === id ? element : element.children.map(c => find(c, id)).find(Boolean);
    const document = {
        body, head: new Element('head'), documentElement: { lang: 'pt-BR' }, readyState: 'loading', listeners: {},
        createElement: tag => new Element(tag),
        getElementById(id) { return nodes.get(id) || find(body, id) || null; },
        querySelector(selector) { return selector === 'input[name="import_mode"]:checked' ? { value: 'sum' } : null; },
        querySelectorAll() { return []; },
        addEventListener(event, callback) { (this.listeners[event] ??= []).push(callback); },
        dispatch(event) { for (const cb of this.listeners[event] || []) cb(); }
    };
    const alerts = [];
    const location = { hash: '', origin: 'http://localhost', pathname: '/', reload() {} };
    const context = vm.createContext({
        localStorage: storage, sessionStorage: storage, document, location,
        console: { log() {}, warn() {}, error() {} }, crypto: webcrypto,
        window: { location, history: { replaceState() {} }, addEventListener() {} },
        alert: message => alerts.push(message), confirm: () => true,
        TextDecoder, Uint8Array, atob, btoa, setTimeout() {},
        FileReader: class { readAsText(file) { this.onload({ target: { result: file.content } }); } }
    });
    const run = code => vm.runInContext(code, context);
    const load = name => vm.runInContext(read(`js/${name}.js`), context, { filename: name });
    ['DataValidation', 'HtmlSafety', 'StorageService', 'AnalysisEngine', 'Renderer'].forEach(load);
    return {
        context, data, storage, writes, document, nodes, alerts, run, load,
        api: run('({ StorageService, DataValidation, HtmlSafety, AnalysisEngine, Renderer })'),
        mount(id) { const element = new Element(); element.id = id; nodes.set(id, element); return element; },
        seed(backup = fixture()) { context.backup = backup; run('StorageService.importAllData(backup)'); writes.length = 0; },
        boot() {
            for (const m of read('index.html').matchAll(/\bid="([^"]+)"/g)) this.mount(m[1]);
            ['AdminService', 'BuildController', 'App'].forEach(load);
            document.dispatch('DOMContentLoaded');
        }
    };
}

test('todos os scripts externos e inline têm sintaxe válida e referências locais existentes', () => {
    for (const file of fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js'))) new vm.Script(read(`js/${file}`), { filename: file });
    for (const file of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
        for (const match of read(file).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            const src = match[1].match(/src="([^"]+)"/);
            if (src && !src[1].startsWith('https:')) assert.ok(fs.existsSync(path.join(ROOT, src[1].split('?')[0])));
            if (!src) new vm.Script(match[2], { filename: file });
        }
        assert.equal((read(file).match(/src="js\/UpdateNotice.js/g) || []).length, 1);
    }
});

test('backups antigos são aceitos sem alteração de campos, IDs ou builds', () => {
    const e = environment();
    for (const file of ['SaveBuild.json', 'pvp_build_analyzer_data.json', 'Save/SaveBuild.json', 'Save/pvp_build_analyzer_data.json', 'Save/Site Atributos/pvp_build_analyzer_data.json']) {
        const data = JSON.parse(read(file)), original = JSON.stringify(data);
        e.api.StorageService.importAllData(data);
        assert.equal(JSON.stringify(data), original);
        assert.deepEqual(clone(e.api.StorageService.exportAllData().builds), data.builds);
    }
});

test('inicialização da versão nova não regrava nenhum dado existente', () => {
    const e = environment(); e.seed();
    const before = [...e.data];
    e.boot();
    assert.deepEqual([...e.data], before);
    assert.deepEqual(e.writes, []);
    assert.match(e.nodes.get('builds-list').innerHTML, /BuUH/);
});

test('SS vence B e S; SSR vence SS; SR antigo mantém compatibilidade', () => {
    const e = environment();
    for (const [winner, loser] of [['SS', 'B'], ['SS', 'S'], ['SSR', 'SS'], ['SR', 'S']]) {
        const gem = rarity => ({ rarity, attributes: [{ attribute_id: 1, remodel: 'comum' }] });
        const result = e.api.AnalysisEngine.runAnalysis({ artifacts: [{ position: 1, gems: [gem(winner), gem(loser)] }] }, [{ id: 1, name: 'Global' }], [{ attribute_id: 1 }], [], []);
        assert.equal(result.present_attributes.get(1)[0].element, 'fogo');
        assert.equal(result.duplicates_to_remove[0].gem_rarity, loser);
    }
});

test('elemento inválido nunca vence uma ocorrência válida, nem é recomendado como keeper', () => {
    const e = environment();
    const gem = rarity => ({ rarity, attributes: [{ attribute_id: 1, remodel: 'comum' }] });
    const build = { artifacts: [{ position: 1, gems: [gem('S'), gem('SSR'), gem('SS')] }] };
    const masters = [{ id: 1, name: 'Fogo', default_element: 'fogo' }];
    let result = e.api.AnalysisEngine.runAnalysis(build, masters, [{ attribute_id: 1 }], [], []);
    assert.equal(result.present_attributes.size, 1);
    assert.equal(result.missing_attributes.length, 0);
    assert.equal(result.duplicates_to_remove.length, 0);
    assert.equal(result.useless_gems.length, 2);
    build.artifacts[0].gems[0] = null;
    result = e.api.AnalysisEngine.runAnalysis(build, masters, [{ attribute_id: 1 }], [], []);
    assert.equal(result.missing_attributes.length, 1);
    assert.equal(result.duplicates_to_remove.length, 0);
});

test('reset apaga apenas o escopo exportado; restauração recupera builds e regras', () => {
    const e = environment({
        'pvp-checklist-data-v1': 'checklist', frag_sword_1: '500', rebel_routes_custom: 'routes',
        rebel_route_0: 'true', pvp_analyzer_lang: 'en', app_admin_password: 'secret',
        pvp_update_2026_10_safety_ack: '1', unrelated: 'keep'
    });
    const otherData = [...e.data]; e.seed();
    const backup = e.api.StorageService.exportAllData();
    const before = [...e.data].sort();
    e.api.StorageService.clearAllData();
    assert.deepEqual([...e.data], otherData);
    e.api.StorageService.importAllData(backup);
    assert.deepEqual([...e.data].sort(), before);
});

test('validação rejeita estruturas inválidas em qualquer parte antes da primeira escrita', () => {
    const e = environment(); e.seed(); const before = [...e.data];
    const malformed = [null, [], {}, { builds: {} }, { builds: [null] }, { globalNotes: {} },
        { builds: [], masterAttributes: [{ id: 1, name: {}, tier: 3 }] },
        { recommendedCombos: [{ id: 1, name: 'x', attribute_ids: {} }] },
        { requiredAttributes: [{ id: 1, attribute_id: [] }] }];
    const badGem = fixture(); badGem.builds[0].artifacts[0].gems[0].attributes = [null]; malformed.push(badGem);
    const duplicate = fixture(); duplicate.builds.push(clone(duplicate.builds[0])); malformed.push(duplicate);
    for (const data of malformed) {
        assert.throws(() => e.api.StorageService.importAllData(data));
        assert.deepEqual([...e.data], before);
        assert.deepEqual(e.writes, []);
    }
});

test('falha de quota durante importação restaura valores anteriores integralmente', () => {
    const e = environment(); e.seed(); const before = [...e.data].sort();
    const set = e.storage.setItem; let failed = false;
    e.storage.setItem = (key, value) => {
        if (key === 'master_attributes' && !failed) { failed = true; throw new Error('QuotaExceededError'); }
        set(key, value);
    };
    assert.throws(() => e.api.StorageService.importAllData({ builds: [], masterAttributes: [] }), /anteriores foram mantidos/);
    assert.deepEqual([...e.data].sort(), before);
});

test('importação parcial preserva campos ausentes e aceita notas vazias', () => {
    const e = environment(); e.seed(); const builds = e.data.get('pvp_builds');
    e.api.StorageService.importAllData({ globalNotes: '' });
    assert.equal(e.data.get('pvp_builds'), builds);
    assert.equal(e.api.StorageService.loadGlobalNotes(), '');
});

const payload = '<img src=x onerror="window.__injected=1">';
test('prévia usa texto e dashboard não interpola HTML ou código de IDs', () => {
    const e = environment(); const container = e.document.createElement('div');
    const build = { id: "1');window.__injected=1;//", name: payload, avatar: payload, power: payload, artifacts: [] };
    e.api.HtmlSafety.appendImportPreview(container, build, 0);
    const label = container.children[0].children[1];
    assert.ok(label.textContent.includes(payload));
    assert.equal(label.innerHTML, '');
    const html = e.api.Renderer.renderBuildCard(build);
    assert.ok(!html.includes('<img'));
    assert.ok(!html.includes('onclick='));
    assert.ok(html.includes('&lt;img'));
});

test('editor, listas, combos e relatório escapam conteúdo importado', () => {
    const e = environment(); const data = fixture();
    data.builds[0].name = payload; data.masterAttributes[0].name = payload;
    data.builds[0].artifacts[0].name = payload;
    data.builds[0].artifacts[0].gems[0].attributes[0].name = payload;
    data.builds[0].artifacts[0].gems[0].attributes[0].remodel = payload;
    e.seed(data); e.boot();
    e.api.Renderer.renderMasterAttributesList(data.masterAttributes);
    e.api.Renderer.renderRecommendedCombosList([{ id: 1, name: payload, rarity: payload, attribute_ids: [data.masterAttributes[0].id] }], data.masterAttributes);
    ['save-report-draft-btn', 'export-pdf-btn', 'export-csv-btn', 'share-link-btn'].forEach(id => e.mount(id));
    e.context.imported = data.builds[0];
    e.run('BuildController.setImportedBuild(imported); BuildController.generateFinalReport()');
    for (const id of ['builds-list', 'artifact-slots-container', 'master-attributes-list', 'recommended-combos-list', 'report-view']) {
        assert.ok(!e.nodes.get(id).innerHTML.includes('<img'), id);
        assert.ok(e.nodes.get(id).innerHTML.includes('&lt;img'), id);
    }
    assert.equal(e.api.StorageService.loadAllBuilds()[0].name, payload);
});

test('botões do dashboard continuam ligados às ações por listeners, sem onclick inline', () => {
    const e = environment(); e.seed();
    const container = e.mount('builds-list'); e.mount('no-builds-message');
    e.load('BuildController');
    e.context.calls = [];
    e.run("const App = {loadBuild: id => calls.push(['edit', id]), deleteBuild: id => calls.push(['delete', id]), exportBuild: id => calls.push(['export', id])}; BuildController.refreshDashboard()");
    for (const button of container.querySelectorAll('[data-build-action]')) button.click();
    assert.deepEqual(clone(e.context.calls), ['export', 'edit', 'delete'].map(action => [action, String(fixture().builds[0].id)]));
});

test('aviso só confirma a versão após clique, não reaparece e não altera builds', () => {
    const e = environment(); e.seed(); const before = [...e.data];
    e.load('UpdateNotice'); e.document.dispatch('DOMContentLoaded');
    const dialog = e.document.getElementById('update-welcome-dialog');
    assert.ok(dialog.open); assert.deepEqual([...e.data], before);
    const button = dialog.children.find(c => c.tagName === 'button'); button.click();
    assert.equal(e.data.get('pvp_update_2026_10_safety_ack'), '1');
    e.document.dispatch('DOMContentLoaded');
    assert.equal(e.document.getElementById('update-welcome-dialog'), null);
    assert.deepEqual([...e.data].filter(([key]) => key !== 'pvp_update_2026_10_safety_ack'), before);
});

test('importação pelo dashboard valida antes da prévia e mescla sem perder builds existentes', () => {
    const e = environment(); e.seed(); e.boot();
    const input = e.nodes.get('dash-import-input'); const before = e.data.get('pvp_builds');
    input.files = [{ name: 'invalid.json', content: '{"builds":{}}' }]; input.dispatch('change');
    assert.equal(e.data.get('pvp_builds'), before);
    assert.equal(e.nodes.get('import-characters-list').children.length, 0);
    const imported = fixture(); imported.builds[0].name = payload;
    input.files = [{ name: 'valid.json', content: JSON.stringify(imported) }]; input.dispatch('change');
    assert.equal(e.data.get('pvp_builds'), before);
    assert.ok(e.nodes.get('import-characters-list').children[0].children[1].textContent.includes(payload));
    e.nodes.get('confirm-import-btn').onclick();
    const builds = e.api.StorageService.loadAllBuilds();
    assert.equal(builds.length, 2);
    assert.deepEqual(clone(builds[0]), JSON.parse(before)[0]);
    assert.equal(builds[1].name, payload);
    assert.notEqual(builds[1].id, builds[0].id);
});

test('link de importação preserva Unicode, avatar e poder sem salvar automaticamente', () => {
    const e = environment(); e.seed();
    const imported = fixture().builds[0]; imported.name = 'João 🔮';
    e.context.location.hash = '#import=' + Buffer.from(JSON.stringify(imported), 'utf8').toString('base64');
    const before = [...e.data]; e.boot();
    assert.equal(e.nodes.get('char-name').value, imported.name);
    assert.equal(e.nodes.get('char-avatar').value, imported.avatar);
    assert.equal(e.nodes.get('char-power').value, imported.power);
    assert.deepEqual([...e.data], before);
});

test('backup real com 24 referências e quatro mestres excluídos tem total de 20 secundários', () => {
    const e = environment(); e.seed(); const before = [...e.data];
    const result = e.api.AnalysisEngine.runAnalysis(fixture().builds[0]);
    assert.equal(fixture().secondaryAttributes.length, 24);
    assert.equal(result.secondary_total, 20);
    assert.equal(result.secondary_present.length + result.missing_secondaries.length, 20);
    assert.deepEqual([...e.data], before);
    assert.deepEqual(e.writes, []);
});

test('total de secundários ignora referências repetidas, excluídas e já essenciais', () => {
    const e = environment();
    const masters = [{ id: 1, name: 'Essencial' }, { id: 2, name: 'Secundário' }];
    const references = [1, 2, 2, 999].map(attribute_id => ({ attribute_id }));
    const result = e.api.AnalysisEngine.runAnalysis({ artifacts: [] }, masters, [{ attribute_id: 1 }], references, []);
    assert.equal(result.secondary_total, 1);
    assert.deepEqual(clone(result.missing_secondaries).map(a => a.id), [2]);
    assert.equal(e.api.AnalysisEngine.runAnalysis({ artifacts: [] }, masters, [], [], []).secondary_total, 0);
});

test('tela e PDF usam 20/20 e releem o storage após mudanças, sem regravar builds', () => {
    const e = environment();
    const masters = Array.from({ length: 24 }, (_, i) => ({ id: i + 1, name: `Suporte ${i + 1}`, tier: 1, default_element: null }));
    const build = { id: 123, name: 'Teste secundários', artifacts: Array.from({ length: 5 }, (_, a) => ({
        id: a + 1, position: a + 1, name: `Artefato ${a + 1}`, level: 1,
        gems: Array.from({ length: 4 }, (_, g) => ({ rarity: 'SS', attributes: [{ attribute_id: a * 4 + g + 1, remodel: 'comum', tier: 1 }] }))
    })) };
    e.seed({ builds: [build], masterAttributes: masters, requiredAttributes: [], secondaryAttributes: masters.map(m => ({ id: m.id, attribute_id: m.id })), recommendedCombos: [] });
    e.boot();
    ['save-report-draft-btn', 'export-pdf-btn', 'export-csv-btn', 'share-link-btn'].forEach(id => e.mount(id));
    e.context.imported = build; e.run('BuildController.setImportedBuild(imported)');
    // O controller foi iniciado com 24 mestres; a lista salva agora tem apenas 20.
    e.api.StorageService.saveMasterAttributes(masters.slice(0, 20));
    const savedBuilds = e.data.get('pvp_builds');
    e.writes.length = 0;
    e.run('BuildController.generateFinalReport()');
    assert.match(e.nodes.get('report-view').innerHTML, />20\/20<\/span>/);
    const texts = [];
    e.context.window.jspdf = { jsPDF: function () {
        return new Proxy({ text: value => texts.push(value), splitTextToSize: value => [value] }, {
            get(target, key) { return target[key] || (() => {}); }
        });
    } };
    e.run("BuildController.generateReport('pdf')");
    assert.ok(texts.includes('Secundários Presentes: 20/20'));
    assert.equal(e.data.get('pvp_builds'), savedBuilds);
    assert.deepEqual(e.writes, []);
    // Uma alteração feita depois de abrir a prévia também deve chegar ao PDF.
    e.api.StorageService.saveSecondaryAttributes(masters.slice(0, 19).map(m => ({ id: m.id, attribute_id: m.id })));
    texts.length = 0;
    e.nodes.get('export-pdf-btn').click();
    assert.ok(texts.includes('Secundários Presentes: 19/19'));
    e.run('BuildController.generateFinalReport()');
    assert.match(e.nodes.get('report-view').innerHTML, />19\/19<\/span>/);
    e.api.StorageService.saveSecondaryAttributes([]);
    texts.length = 0;
    e.run("BuildController.generateReport('pdf'); BuildController.generateFinalReport()");
    assert.ok(texts.includes('Secundários Presentes: 0/0'));
    assert.match(e.nodes.get('report-view').innerHTML, />0\/0<\/span>/);
    assert.equal(e.data.get('pvp_builds'), savedBuilds);
});
