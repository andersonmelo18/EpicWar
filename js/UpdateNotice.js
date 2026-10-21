/** Aviso informativo desta versão. Não migra, apaga nem regrava builds. */
(() => {
    const ACK_KEY = 'pvp_update_2026_10_safety_ack';
    const show = () => {
        try { if (localStorage.getItem(ACK_KEY) === '1') return; }
        catch (error) { console.warn('Não foi possível consultar o aviso de atualização.', error); }
        if (document.getElementById('update-welcome-dialog')) return;

        const en = document.documentElement.lang.startsWith('en') || (() => {
            try { return localStorage.getItem('pvp_analyzer_lang') === 'en'; }
            catch { return false; }
        })();
        const dialog = document.createElement('dialog');
        dialog.id = 'update-welcome-dialog';
        dialog.setAttribute('aria-labelledby', 'update-welcome-title');
        dialog.setAttribute('aria-describedby', 'update-welcome-description');
        Object.assign(dialog.style, {
            maxWidth: '520px', width: 'calc(100% - 32px)', padding: '28px',
            border: '1px solid #c7d2fe', borderRadius: '20px', color: '#1e293b',
            background: '#fff', boxShadow: '0 24px 80px #0f172a55', margin: 'auto'
        });
        const title = document.createElement('h2');
        title.id = 'update-welcome-title';
        title.textContent = en ? 'Welcome to the updated EpicWar!' : 'Bem-vindo à atualização do EpicWar!';
        Object.assign(title.style, { fontSize: '22px', fontWeight: '800', marginBottom: '16px' });
        const description = document.createElement('p');
        description.id = 'update-welcome-description';
        description.textContent = en
            ? 'Your saved builds remain on this browser and device. Nothing has been deleted or converted, and your builds have not been uploaded.'
            : 'Suas builds salvas continuam neste navegador e dispositivo. Nenhuma build foi apagada ou convertida, e seus dados não foram enviados para a internet.';
        const details = document.createElement('p');
        details.textContent = en
            ? 'This update fixes SS gem ranking and duplicate analysis, protects imported content and validates backups before saving. Reset now clears only builds and rules covered by the backup; checklist, equipment and rebellions are preserved.'
            : 'Esta atualização corrige a avaliação de gemas SS e duplicatas, protege conteúdos importados e valida backups antes de salvar. A limpeza agora apaga apenas builds e regras cobertas pelo backup; checklist, equipamentos e rebeliões são preservados.';
        details.style.marginTop = '12px';
        const hint = document.createElement('p');
        hint.textContent = en
            ? 'No data update is required. After confirming, this notice will not appear again in this browser.'
            : 'Não é necessário atualizar seus dados. Após confirmar, este aviso não aparecerá novamente neste navegador.';
        Object.assign(hint.style, { marginTop: '12px', fontSize: '14px' });
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = en ? 'Got it, continue' : 'Entendi, continuar';
        Object.assign(button.style, {
            marginTop: '20px', padding: '12px 20px', background: '#4f46e5',
            color: '#fff', border: '0', borderRadius: '10px', cursor: 'pointer', fontWeight: '700'
        });
        button.addEventListener('click', () => {
            try { localStorage.setItem(ACK_KEY, '1'); }
            catch (error) { console.warn('O navegador não permitiu salvar a confirmação do aviso.', error); }
            dialog.close();
            dialog.remove();
        });
        // Fechar pelo Esc não confirma a leitura; o botão é a única confirmação.
        dialog.addEventListener('cancel', event => event.preventDefault());
        dialog.append(title, description, details, hint, button);
        document.body.appendChild(dialog);
        dialog.showModal();
        button.focus();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
    else show();
})();
