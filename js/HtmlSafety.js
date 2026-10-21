/** Escape somente na saída HTML: o texto original continua intacto no storage. */
const HtmlSafety = (() => {
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));

    const appendImportPreview = (container, build, index) => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `import-char-${index}`;
        checkbox.value = index;
        checkbox.checked = true;
        checkbox.className = 'import-char-checkbox w-4 h-4 text-indigo-600 rounded';
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.className = 'text-sm font-medium text-slate-700 cursor-pointer flex-1';
        label.textContent = `${build.avatar || build.icon || '👤'} ${build.name || 'Sem Nome'} (${build.power || '0'} Poder)`;
        row.append(checkbox, label);
        container.appendChild(row);
    };

    return { escape, appendImportPreview };
})();
