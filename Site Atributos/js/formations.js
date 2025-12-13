document.addEventListener('DOMContentLoaded', () => {
    // Apenas um log para confirmar carregamento
    console.log("Sistema de Formações Carregado ⚔️");

    // Efeito Opcional: Destacar cards ao passar o mouse
    const cards = document.querySelectorAll('.role-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = "#6366f1"; // Muda a borda para Indigo ao passar mouse
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = ""; // Volta ao original (definido no CSS)
        });
    });
});