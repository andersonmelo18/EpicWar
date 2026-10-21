/** Valida backups sem alterar os objetos nem o armazenamento existente. */
const DataValidation = (() => {
    const has = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
    const fail = path => { throw new Error(`Backup inválido: verifique ${path}. Nenhum dado foi importado.`); };
    const object = (value, path) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path);
    };
    const array = (value, path) => { if (!Array.isArray(value)) fail(path); };
    const id = (value, path) => {
        if (!(typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) &&
            !(typeof value === 'string' && /^[a-zA-Z0-9_-]+$/.test(value))) fail(path);
    };
    const text = (value, path) => { if (typeof value !== 'string') fail(path); };
    const number = (value, path) => {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) fail(path);
    };
    const optional = (value, key, check, path) => {
        if (has(value, key) && value[key] !== null) check(value[key], `${path}.${key}`);
    };
    const texts = (value, keys, path) => keys.forEach(key => optional(value, key, text, path));
    const uniqueIds = (values, path) => {
        const ids = new Set();
        values.forEach(value => {
            if (value.id == null) return;
            const key = String(value.id);
            if (ids.has(key)) fail(`${path}: ID repetido ${key}`);
            ids.add(key);
        });
    };

    const build = (value, path = 'build', requireId = false) => {
        object(value, path);
        if (requireId) id(value.id, `${path}.id`);
        else optional(value, 'id', id, path);
        texts(value, ['name', 'class', 'avatar', 'icon', 'date', 'createdAt', 'lastUpdated'], path);
        optional(value, 'power', (v, p) => { if (typeof v !== 'string') number(v, p); }, path);
        optional(value, 'artifactCount', number, path);
        array(value.artifacts, `${path}.artifacts`);
        uniqueIds(value.artifacts.filter(Boolean), `${path}.artifacts`);
        value.artifacts.forEach((artifact, a) => {
            const ap = `${path}.artifacts[${a}]`;
            object(artifact, ap);
            id(artifact.id, `${ap}.id`);
            number(artifact.position, `${ap}.position`);
            texts(artifact, ['name'], ap);
            optional(artifact, 'level', number, ap);
            array(artifact.gems, `${ap}.gems`);
            if (artifact.gems.length > 4) fail(`${ap}.gems`);
            artifact.gems.forEach((gem, g) => {
                if (gem === null) return;
                const gp = `${ap}.gems[${g}]`;
                object(gem, gp);
                texts(gem, ['name', 'icon', 'element', 'rarity'], gp);
                optional(gem, 'plus_level', number, gp);
                optional(gem, 'tier', number, gp);
                if (gem.attributes !== undefined) {
                    array(gem.attributes, `${gp}.attributes`);
                    gem.attributes.forEach((attribute, i) => {
                        const p = `${gp}.attributes[${i}]`;
                        object(attribute, p);
                        id(attribute.attribute_id, `${p}.attribute_id`);
                        texts(attribute, ['name', 'remodel', 'quality', 'qualidade'], p);
                        optional(attribute, 'tier', number, p);
                    });
                }
            });
        });
        return value;
    };

    const backup = value => {
        object(value, 'arquivo');
        const keys = ['builds', 'masterAttributes', 'requiredAttributes', 'secondaryAttributes', 'recommendedCombos', 'globalNotes'];
        if (!keys.some(key => has(value, key))) fail('conteúdo do arquivo');
        keys.filter(key => key !== 'globalNotes').forEach(key => {
            if (!has(value, key)) return;
            array(value[key], key);
            value[key].forEach((entry, i) => {
                const path = `${key}[${i}]`;
                object(entry, path);
                if (key === 'builds') { build(entry, path, true); return; }
                id(entry.id, `${path}.id`);
                if (key === 'masterAttributes') {
                    text(entry.name, `${path}.name`);
                    number(entry.tier, `${path}.tier`);
                    optional(entry, 'default_element', (v, p) => {
                        if (!['fogo', 'gelo', 'luz', 'veneno', ''].includes(v)) fail(p);
                    }, path);
                } else if (key === 'recommendedCombos') {
                    text(entry.name, `${path}.name`);
                    texts(entry, ['rarity'], path);
                    optional(entry, 'plus_level', number, path);
                    array(entry.attribute_ids, `${path}.attribute_ids`);
                    entry.attribute_ids.forEach(v => id(v, `${path}.attribute_ids`));
                } else {
                    id(entry.attribute_id, `${path}.attribute_id`);
                    optional(entry, 'isUrgent', (v, p) => { if (typeof v !== 'boolean') fail(p); }, path);
                }
            });
            uniqueIds(value[key], key);
        });
        if (has(value, 'globalNotes')) text(value.globalNotes, 'globalNotes');
        return value;
    };

    return { backup, build };
})();
