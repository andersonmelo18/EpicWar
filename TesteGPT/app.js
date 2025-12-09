/* V2 + V4 App.js
   - LocalStorage backend
   - Artifacts (1..4), each with 4 slots (fogo,gelo,luz,veneno)
   - Gema modal: rarity, plus, 1..3 attributes (select from master list)
   - Admin for attributes (CRUD minimal)
   - Analysis engine: present, missing, useless gems
   - Export CSV, Download JSON, Share via token (localStorage)
*/

// Storage keys
const STORAGE = {
  BUILDS: 'mvp_builds_v2',
  ATTRS: 'mvp_attrs_v2',
  SHARED_PREFIX: 'mvp_shared_v2_'
};

// Default attributes list
const DEFAULT_ATTRS = [
  {id:1,name:'Benção de Deus (Lv3)',tier:3,default_element:'luz',required:true},
  {id:2,name:'Tirano (Lv3)',tier:3,default_element:'fogo',required:true},
  {id:3,name:'Enfraquecer Tirano (Lv3)',tier:3,default_element:'gelo',required:true},
  {id:4,name:'Redução de Dano de Tropas (Lv3)',tier:3,default_element:null,required:true},
  {id:5,name:'Dano de Tropas (Lv3)',tier:3,default_element:null,required:true},
  {id:6,name:'Capacidade de Herói (Lv3)',tier:3,default_element:null,required:true},
  {id:7,name:'Poder da Unidade (Lv3)',tier:3,default_element:null,required:true},
  {id:8,name:'Enfraquecer Supressão (Lv3)',tier:3,default_element:null,required:true},
  {id:9,name:'Supressão (Lv3)',tier:3,default_element:null,required:true},
  {id:10,name:'Taxa de produção de Primavera (Lv3)',tier:3,default_element:null,required:true},
  {id:11,name:'Todo Poder de Gemas De Fogo (Lv3)',tier:3,default_element:'fogo',required:true},
  {id:12,name:'Todo Poder de Gemas De Gelo (Lv3)',tier:3,default_element:'gelo',required:true},
  {id:13,name:'Todo Poder de Gemas De Veneno (Lv3)',tier:3,default_element:'veneno',required:true},
  {id:14,name:'Todo Poder de Gemas De Luz (Lv3)',tier:3,default_element:'luz',required:true},
  {id:15,name:'HADES - Veneno (Lv3)',tier:3,default_element:'veneno',required:true},
  {id:16,name:'Guardião (Lv2)',tier:2,default_element:null,required:true},
  {id:17,name:'Sede de Sangue (Lv2)',tier:2,default_element:null,required:true},
  {id:18,name:'Dano de Contra Ataque (Lv2)',tier:2,default_element:null,required:true},
  {id:19,name:'Redução de Dano de Contra Atack (Lv2)',tier:2,default_element:null,required:true},
  {id:20,name:'Capacidade dos mortos da primavera (Lv2)',tier:2,default_element:null,required:true},
  {id:21,name:'Revival (Lv1)',tier:1,default_element:null,required:true},
  {id:22,name:'Enfraquecer Revival (Lv1)',tier:1,default_element:null,required:true},
  {id:23,name:'Massacre (Lv1)',tier:1,default_element:null,required:true},
  {id:24,name:'Enfraquecer Massacre (Lv1)',tier:1,default_element:null,required:true},
  {id:25,name:'Quick recruit (Lv1)',tier:1,default_element:null,required:true},
  {id:26,name:'capacidade das tropas de cada elemento (Lv1)',tier:1,default_element:null,required:true}
];

// -----------------------------------------------------------
// STORAGE HELPERS
// -----------------------------------------------------------

function loadAttrs(){
  const raw = localStorage.getItem(STORAGE.ATTRS);
  if(!raw){
    localStorage.setItem(STORAGE.ATTRS, JSON.stringify(DEFAULT_ATTRS));
    return DEFAULT_ATTRS.slice();
  }
  try {
    return JSON.parse(raw);
  } catch(e){
    localStorage.setItem(STORAGE.ATTRS, JSON.stringify(DEFAULT_ATTRS));
    return DEFAULT_ATTRS.slice();
  }
}

function saveAttrs(list){
  localStorage.setItem(STORAGE.ATTRS, JSON.stringify(list));
  ATTRS = list;
  renderAttrTable();
}

function loadBuilds(){
  const raw = localStorage.getItem(STORAGE.BUILDS);
  return raw ? JSON.parse(raw) : [];
}

function saveBuilds(list){
  localStorage.setItem(STORAGE.BUILDS, JSON.stringify(list));
  BUILDS = list;
  renderBuildList();
}

// -----------------------------------------------------------
// STATE
// -----------------------------------------------------------

let ATTRS = loadAttrs();
let BUILDS = loadBuilds();
let editingBuild = null;
let editingGemContext = null;

// -----------------------------------------------------------
// UTILS
// -----------------------------------------------------------

function idGen(prefix='id'){
  return prefix + '_' + Math.random().toString(36).slice(2,9);
}

function tokenGen(){
  return Math.random().toString(36).slice(2,10) + Date.now().toString(36);
}

function el(id){
  return document.getElementById(id);
}

function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[c]));
}

// -----------------------------------------------------------
// BUILD LIST
// -----------------------------------------------------------

function renderBuildList(){
  const wrap = el('buildList');
  wrap.innerHTML = '';

  BUILDS.forEach(b=>{
    const card = document.createElement('div');
    card.className = 'build-card';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between">
        <strong>${escapeHtml(b.name)}</strong>
        <div><span class="pill">${escapeHtml(b.character.class || '')}</span></div>
      </div>

      <div style="margin-top:8px;color:var(--muted);font-size:13px">
        ${new Date(b.created_at).toLocaleString()}
      </div>

      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="small" onclick="openEditor('${b.id}')">Editar</button>
        <button class="small" onclick="viewBuild('${b.id}')">Visualizar</button>
        <button class="small" onclick="shareBuild('${b.id}')">Compartilhar</button>
        <button class="small" onclick="deleteBuild('${b.id}')">Excluir</button>
      </div>
    `;

    wrap.appendChild(card);
  });
}

// -----------------------------------------------------------
// EDITOR
// -----------------------------------------------------------

function newEmptyBuild(){
  return {
    id: idGen('build'),
    name: '',
    character: {name:'', class:''},
    artifacts: [],
    created_at: Date.now(),
    schema_version: 1
  };
}

function openEditor(buildId=null){
  if(buildId){
    editingBuild = JSON.parse(JSON.stringify(BUILDS.find(b=>b.id===buildId)));
    el('editorTitle').innerText = 'Editar Personagem';
  } else {
    editingBuild = newEmptyBuild();
    el('editorTitle').innerText = 'Criar Personagem';
  }

  el('editorWrap').style.display = 'block';
  el('charName').value = editingBuild.character.name || '';
  el('charClass').value = editingBuild.character.class || '';
  el('artifactCount').value = editingBuild.artifacts.length || 4;

  adjustArtifactCount(Number(el('artifactCount').value));
  renderArtifacts();
  renderSummary();

  window.scrollTo({top:0, behavior:'smooth'});
}
window.openEditor = openEditor;

function closeEditor(){
  editingBuild = null;
  el('editorWrap').style.display='none';
}

function adjustArtifactCount(n){
  editingBuild.artifacts = editingBuild.artifacts || [];

  while(editingBuild.artifacts.length < n){
    editingBuild.artifacts.push({
      id: idGen('art'),
      name: 'Artefato ' + (editingBuild.artifacts.length+1),
      level: 0,
      gems: [null,null,null,null]
    });
  }

  while(editingBuild.artifacts.length > n){
    editingBuild.artifacts.pop();
  }

  renderArtifacts();
}

function renderArtifacts(){
  const wrap = el('artifactsContainer');
  wrap.innerHTML = '';

  editingBuild.artifacts.forEach((art, ai)=>{
    const div = document.createElement('div');
    div.className = 'artifact';

    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <input value="${escapeHtml(art.name)}" data-ai="${ai}" class="artifact-name" style="font-weight:600;padding:6px;border-radius:6px;border:1px solid #eef2ff"/>
        </div>

        <div style="display:flex;gap:8px;align-items:center">
          <input type="number" value="${art.level||0}" data-ai-level="${ai}" style="width:84px;padding:6px;border-radius:6px;border:1px solid #eef2ff" />
          <button class="btn small" data-ai-add="${ai}">Adicionar Gema</button>
        </div>
      </div>

      <div class="slots">
        ${[0,1,2,3].map(si => renderSlotInner(art.gems[si], ai, si)).join('')}
      </div>
    `;

    wrap.appendChild(div);
  });

  document.querySelectorAll('.artifact-name')
    .forEach(inp => inp.addEventListener('input', e=>{
      const ai = +e.target.dataset.ai;
      editingBuild.artifacts[ai].name = e.target.value;
    }));

  document.querySelectorAll('[data-ai-level]')
    .forEach(inp => inp.addEventListener('change', e=>{
      const ai = +e.target.dataset.aiLevel;
      editingBuild.artifacts[ai].level = Number(e.target.value);
    }));

  document.querySelectorAll('[data-ai-add]')
    .forEach(btn=>btn.addEventListener('click', e=>{
      const ai = +e.target.dataset.aiAdd;
      openGemModal(ai, null);
    }));
}

function renderSlotInner(gem, ai, si){
  if(!gem){
    return `
      <div class="slot empty">
        <div style="font-size:12px;color:var(--muted)">Slot ${si+1}</div>
        <div style="margin-top:8px">
          <small class="pill">${['fogo','gelo','luz','veneno'][si]}</small>
        </div>
      </div>
    `;
  }

  return `
    <div class="slot">
      <div style="font-weight:600">${escapeHtml(gem.rarity)} +${gem.plus}</div>
      <div style="font-size:12px;margin-top:6px">
        ${gem.attributes.map(a=>getAttrName(a.attribute_id)).join(' / ')}
      </div>
      <div style="margin-top:8px;display:flex;gap:6px;justify-content:center">
        <button class="small" onclick="editGem(${ai},${si})">Editar</button>
        <button class="small" onclick="removeGem(${ai},${si})">Remover</button>
      </div>
    </div>
  `;
}

function getAttrName(id){
  const a = ATTRS.find(x=>x.id===id);
  return a ? a.name : 'custom#'+id;
}

// -----------------------------------------------------------
// GEM MODAL
// -----------------------------------------------------------

function openGemModal(artifactIndex, slotIndex){
  editingGemContext = {artifactIndex, slotIndex};

  const modal = el('modalGem');
  modal.style.display='flex';

  const slotElement = ['fogo','gelo','luz','veneno'][slotIndex];
  el('gemElement').innerText = slotElement;

  el('gemRarity').value = 'SS';
  el('gemPlus').value = 0;
  el('gemAttrCount').value = 1;

  renderGemAttrs();

  const gem = editingBuild.artifacts[artifactIndex].gems[slotIndex];
  if(gem){
    el('gemRarity').value = gem.rarity;
    el('gemPlus').value = gem.plus;
    el('gemAttrCount').value = gem.attributes.length;

    renderGemAttrs();

    gem.attributes.forEach((ga, idx)=>{
      const sel = el(`attr_select_${idx}`);
      if(sel) sel.value = ga.attribute_id;

      const rem = el(`remodel_select_${idx}`);
      if(rem) rem.value = ga.remodel || 'normal';
    });
  }
}

function closeGemModal(){
  el('modalGem').style.display='none';
  editingGemContext = null;
}

function renderGemAttrs(){
  const count = Number(el('gemAttrCount').value);
  const list = el('gemAttrList');

  list.innerHTML = '';

  for(let i=0;i<count;i++){
    const row = document.createElement('div');
    row.style.marginTop = '8px';

    const tierSel = `
      <select id="tier_select_${i}">
        <option value="1">Lv1</option>
        <option value="2">Lv2</option>
        <option value="3" selected>Lv3</option>
      </select>
    `;

    const attrSel = `<select id="attr_select_${i}"></select>`;

    const remodel = `
      <select id="remodel_select_${i}">
        <option value="normal">Normal</option>
        <option value="raro">Raro</option>
        <option value="perfeito">Perfeito</option>
        <option value="epico">Epico</option>
        <option value="lendario">Lendario</option>
        <option value="mitico">Mitico</option>
      </select>
    `;

    row.innerHTML = `<div style="display:flex;gap:8px">${tierSel}${attrSel}${remodel}</div>`;
    list.appendChild(row);
  }

  const element = el('gemElement').innerText;

  for(let i=0;i<count;i++){
    const sel = el(`attr_select_${i}`);
    const tier = Number(el(`tier_select_${i}`).value);

    const options = ATTRS
      .filter(a=>a.tier==tier)
      .filter(a => !a.default_element || a.default_element===element)
      .concat(ATTRS.filter(a=>a.tier==tier && !a.default_element));

    const map = {};
    options.forEach(o=>{
      if(!map[o.id]) map[o.id] = o;
    });

    sel.innerHTML =
      '<option value="">-- selecionar atributo --</option>' +
      Object.values(map)
        .map(o=>`<option value="${o.id}">${o.name}${o.default_element ? ' ['+o.default_element+']' : ''}</option>`)
        .join('');

    el(`tier_select_${i}`).addEventListener('change', ()=>renderGemAttrs());
  }
}

function saveGemFromModal(){
  const ctx = editingGemContext;
  if(!ctx) return;

  const ai = ctx.artifactIndex;
  const si = ctx.slotIndex;

  const rarity = el('gemRarity').value;
  const plus = Number(el('gemPlus').value);
  const count = Number(el('gemAttrCount').value);

  const attrs = [];

  for(let i=0;i<count;i++){
    const aid = el(`attr_select_${i}`).value;
    const remodel = el(`remodel_select_${i}`).value || 'normal';

    if(!aid){
      alert('Selecione todos os atributos');
      return;
    }

    const aObj = ATTRS.find(x=>String(x.id)===String(aid));
    const slotElement = ['fogo','gelo','luz','veneno'][si];

    if(aObj && aObj.default_element && aObj.default_element !== slotElement){
      alert(`Atributo "${aObj.name}" é exclusivo de ${aObj.default_element} — não pode ser usado em slot ${slotElement}`);
      return;
    }

    attrs.push({attribute_id:Number(aid), remodel});
  }

  const gem = {
    element: ['fogo','gelo','luz','veneno'][si],
    rarity,
    plus,
    attributes: attrs
  };

  editingBuild.artifacts[ai].gems[si] = gem;

  renderArtifacts();
  closeGemModal();
  renderSummary();
}

function removeGem(ai,si){
  if(!confirm('Remover esta gema?')) return;
  editingBuild.artifacts[ai].gems[si] = null;

  renderArtifacts();
  renderSummary();
}

function editGem(ai,si){
  openGemModal(ai,si);
}

window.editGem = editGem;
window.removeGem = removeGem;

// -----------------------------------------------------------
// ANALYSIS ENGINE
// -----------------------------------------------------------

function analyzeBuild(build){
  const present = [];
  const presentDetails = [];
  const useless = [];
  const requiredIds = ATTRS.filter(a=>a.required).map(a=>a.id);

  build.artifacts.forEach((art, ai)=>{
    art.gems.forEach((gem, si)=>{
      if(!gem) return;

      let gemHasRequired = false;

      gem.attributes.forEach(ga=>{
        if(requiredIds.includes(ga.attribute_id)){
          gemHasRequired = true;

          const attr = ATTRS.find(x=>x.id===ga.attribute_id);

          present.push(ga.attribute_id);
          presentDetails.push({
            attr,
            art_index: ai,
            slot: si,
            gem
          });
        }
      });

      // exclusividade inválida
      gem.attributes.forEach(ga=>{
        const m = ATTRS.find(x=>x.id===ga.attribute_id);

        if(m && m.default_element && m.default_element !== gem.element){
          presentDetails.push({
            attr: m,
            art_index: ai,
            slot: si,
            gem,
            invalid: true
          });
        }
      });

      if(!gemHasRequired){
        useless.push({
          art_index: ai,
          slot: si,
          gem
        });
      }
    });
  });

  const uniquePresent = [...new Set(present)];
  const missing = requiredIds
    .filter(id=>!uniquePresent.includes(id))
    .map(id=>ATTRS.find(a=>a.id===id));

  return {present: presentDetails, missing, useless};
}

function renderSummary(){
  if(!editingBuild) return;

  const outP = el('presentAttrs');
  const outM = el('missingAttrs');
  const outU = el('uselessGems');

  const res = analyzeBuild(editingBuild);

  outP.innerHTML =
    res.present.map(p=>`
      <li>${escapeHtml(p.attr.name)} — Artefato ${p.art_index+1} Slot ${p.slot+1}
      (${p.gem.rarity}+${p.gem.plus})${p.invalid?' [INVÁLIDO ELEMENTO]':''}</li>
    `).join('') || '<li style="color:var(--muted)">— nenhum —</li>';

  outM.innerHTML =
    res.missing.map(m=>`<li>${escapeHtml(m.name)}</li>`).join('')
    || '<li style="color:var(--muted)">— nenhum —</li>';

  outU.innerHTML =
    res.useless.map(u=>`
      <li>Artefato ${u.art_index+1} Slot ${u.slot+1}
      — ${escapeHtml(u.gem.rarity)} +${u.gem.plus}</li>
    `).join('') || '<li style="color:var(--muted)">— nenhum —</li>';
}

// -----------------------------------------------------------
// SAVE / EXPORT / SHARE
// -----------------------------------------------------------

function saveBuild(){
  if(!editingBuild) return;

  editingBuild.character.name = el('charName').value.trim();
  editingBuild.character.class = el('charClass').value.trim();

  if(!editingBuild.character.name){
    alert('Nome do personagem obrigatório');
    return;
  }

  editingBuild.name = editingBuild.character.name;
  editingBuild.updated_at = Date.now();

  const idx = BUILDS.findIndex(b=>b.id===editingBuild.id);

  if(idx>=0){
    BUILDS[idx] = editingBuild;
  } else {
    BUILDS.unshift(editingBuild);
  }

  saveBuilds(BUILDS);
  closeEditor();
}

function deleteBuild(id){
  if(!confirm('Excluir build?')) return;
  BUILDS = BUILDS.filter(b=>b.id!==id);
  saveBuilds(BUILDS);
}

function shareBuild(id){
  const b = BUILDS.find(x=>x.id===id);
  if(!b) return;

  const token = tokenGen();
  localStorage.setItem(STORAGE.SHARED_PREFIX + token, JSON.stringify(b));

  const link = location.href.split('?')[0].split('#')[0] + '?token=' + token;

  navigator.clipboard?.writeText(link)
    .then(()=>alert('Link copiado para a área de transferência'));
}

function viewBuild(id){
  const b = BUILDS.find(x=>x.id===id);
  if(!b) return;

  const w = window.open();
  w.document.write(`<pre>${escapeHtml(JSON.stringify(b,null,2))}</pre>`);
}

function exportAllCSV(){
  let rows = [
    'build_name,character_name,artifact_index,artifact_name,artifact_level,slot_index,gem_element,gem_rarity,gem_plus,attribute_name,attribute_tier,attribute_remodel'
  ];

  BUILDS.forEach(b=>{
    b.artifacts.forEach((art, ai)=>{
      art.gems.forEach((gem, si)=>{
        if(!gem) return;

        gem.attributes.forEach(ga=>{
          const a = ATTRS.find(x=>x.id===ga.attribute_id);

          rows.push([
            b.name,
            b.character.name,
            ai,
            art.name,
            art.level,
            si,
            gem.element,
            gem.rarity,
            gem.plus,
            a ? a.name : ga.attribute_id,
            a ? a.tier : '',
            ga.remodel || ''
          ].map(csvEscape).join(','));
        });
      });
    });
  });

  downloadFile(rows.join('\n'), 'all_builds.csv', 'text/csv');
}

function exportCurrentCSV(){
  if(!editingBuild) return alert('Abra editor com build');

  const b = editingBuild;

  let rows = [
    'artifact_index,artifact_name,artifact_level,slot_index,gem_element,gem_rarity,gem_plus,attribute_name,attribute_tier,attribute_remodel'
  ];

  b.artifacts.forEach((art, ai)=>{
    art.gems.forEach((gem, si)=>{
      if(!gem) return;

      gem.attributes.forEach(ga=>{
        const a = ATTRS.find(x=>x.id===ga.attribute_id);

        rows.push([
          ai,
          art.name,
          art.level,
          si,
          gem.element,
          gem.rarity,
          gem.plus,
          a ? a.name : ga.attribute_id,
          a ? a.tier : '',
          ga.remodel || ''
        ].map(csvEscape).join(','));
      });
    });
  });

  downloadFile(rows.join('\n'), (b.name||'build')+'.csv','text/csv');
}

function downloadCurrentJSON(){
  if(!editingBuild) return alert('Abra editor com build');
  downloadFile(
    JSON.stringify(editingBuild,null,2),
    (editingBuild.name||'build')+'.json',
    'application/json'
  );
}

function csvEscape(s){
  if(s==null) return '';
  s = String(s);
  if(/[",\n]/.test(s)){
    return '"' + s.replace(/"/g,'""') + '"';
  }
  return s;
}

function downloadFile(content, filename, type){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// -----------------------------------------------------------
// ADMIN
// -----------------------------------------------------------

function openAdmin(){
  renderAttrTable();
  el('modalAdmin').style.display='flex';
}

function closeAdmin(){
  el('modalAdmin').style.display='none';
}

function renderAttrTable(){
  const tb = el('attrTable');
  tb.innerHTML = '';

  ATTRS.forEach(a=>{
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${escapeHtml(a.name)}</td>
      <td style="text-align:center">${a.tier}</td>
      <td style="text-align:center">${a.default_element || 'global'}</td>
      <td style="text-align:center">${a.required ? 'Sim':'Não'}</td>
      <td style="text-align:right">
        <button class="small" onclick="deleteAttr(${a.id})">Excluir</button>
      </td>
    `;

    tb.appendChild(tr);
  });
}

function deleteAttr(id){
  if(!confirm('Excluir atributo?')) return;
  ATTRS = ATTRS.filter(a=>a.id!==id);
  saveAttrs(ATTRS);
  renderAttrTable();
}

function addAttrFromAdmin(){
  const name = el('newAttrName').value.trim();
  const tier = Number(el('newAttrTier').value);
  const elSel = el('newAttrElement').value || null;
  const req = el('newAttrRequired').checked;

  if(!name){
    return alert('Nome obrigatório');
  }

  const nid = Math.max(0,...ATTRS.map(a=>a.id)) + 1;

  ATTRS.push({
    id: nid,
    name,
    tier,
    default_element: elSel,
    required: req
  });

  saveAttrs(ATTRS);
  el('newAttrName').value = '';
}

// -----------------------------------------------------------
// IMPORT / SHARE LOADING
// -----------------------------------------------------------

function importJSON(){
  const fileInput = document.createElement('input');
  fileInput.type='file';
  fileInput.accept='application/json';

  fileInput.onchange = e=>{
    const f = e.target.files[0];
    const r = new FileReader();

    r.onload = ()=>{
      try{
        const data = JSON.parse(r.result);

        if(Array.isArray(data)){
          BUILDS = data;
          saveBuilds(BUILDS);
          alert('Importado '+data.length+' builds');
        } else {
          BUILDS.push(data);
          saveBuilds(BUILDS);
          alert('Importado 1 build');
        }

      } catch(err){
        alert('JSON inválido');
      }
    };

    r.readAsText(f);
  };

  fileInput.click();
}

// FINAL — função que estava faltando no seu arquivo
function loadSharedFromParam(){
  const u = new URL(location.href);
  const token = u.searchParams.get('token');

  if(!token) return;

  const raw = localStorage.getItem(STORAGE.SHARED_PREFIX + token);
  if(!raw) return;

  try{
    const b = JSON.parse(raw);
    const w = window.open();
    w.document.write(`<pre>${escapeHtml(JSON.stringify(b, null, 2))}</pre>`);

  } catch(e){
    alert('Token inválido ou corrompido.');
  }
}

// chama automaticamente ao abrir a página
loadSharedFromParam();
