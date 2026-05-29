// =============================================================
// IMERSIVIDADE
// =============================================================

// Particulas Flutuantes
(function () {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.35';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }

    function mkParticle() {
        return { x: Math.random() * canvas.width, y: canvas.height + 10, size: Math.random() * 1.8 + 0.4, speed: Math.random() * 0.4 + 0.15, opacity: Math.random() * 0.35 + 0.08, drift: (Math.random() - 0.5) * 0.25 };
    }

    resize();
    for (let i = 0; i < 50; i++) { const p = mkParticle(); p.y = Math.random() * canvas.height; particles.push(p); }

    (function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.y -= p.speed; p.x += p.drift;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(94,204,138,${p.opacity})`; ctx.fill();
            if (p.y < -10) particles[i] = mkParticle();
        });
        requestAnimationFrame(animate);
    })();

    window.addEventListener('resize', resize);
})();

// A nimação dos Contadores
function animarContador(el, fim, duracao = 900) {
    const ini = performance.now();
    (function tick(agora) {
        const t = Math.min((agora - ini) / duracao, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * fim);
        if (t < 1) requestAnimationFrame(tick);
    })(ini);
}

// Saudações?
function saudacao(nome) {
    const h = new Date().getHours();
    if (h < 12) return `Bom dia, ${nome}`;
    if (h < 19) return `Boa tarde, ${nome}`;
    return `Boa noite, ${nome}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const navAvatar = document.getElementById('navAvatar');
    if (!navAvatar) return;
    const dados = sessionStorage.getItem('utilizadorAcesso');
    if (!dados) return;
    const utilizador = JSON.parse(dados);
    navAvatar.textContent = utilizador.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    const hamburger = document.getElementById('hamburger');
    const nav = document.querySelector('.navbar-nav');
    const backdrop = document.getElementById('navBackdrop');
    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        nav.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('open');
    });

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            hamburger.classList.remove('open');
            nav.classList.remove('open');
            backdrop.classList.remove('open');
        });
    }

    nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('open');
            nav.classList.remove('open');
            if (backdrop) backdrop.classList.remove('open');
        });
    });
});
