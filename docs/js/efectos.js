// Movimiento de la web. Criterio: lo frecuente, rápido y discreto; lo raro (medalla, evolución), memorable.
// Solo transform y opacity, salvo el filtro de la silueta de evolución en un único elemento pequeño.
const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function contar(el, de, a, formato) {
  if (reducido() || de === a) { el.textContent = formato(a); return; }
  const t0 = performance.now(), dur = 280;
  (function paso(t) {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = formato(Math.round(de + (a - de) * e));
    if (k < 1 && el.isConnected) requestAnimationFrame(paso);
  })(t0);
}

export function barra(el, de, a) {
  if (reducido() || de === a) return;
  el.animate([{ transform: `scaleX(${de})` }, { transform: `scaleX(${a})` }], { duration: 300, easing: EASE });
}

export function destellar(el) {
  el.animate([{ outlineColor: 'rgb(241 196 83 / 1)' }, { outlineColor: 'rgb(241 196 83 / 0)' }], { duration: 1200, easing: 'ease-out' });
}

function capa(etiqueta) {
  const c = document.createElement('div');
  c.className = 'capa';
  c.setAttribute('role', 'status');
  c.setAttribute('aria-label', etiqueta);
  document.body.append(c);
  let hecho = false;
  const cierra = () => {
    if (hecho) return;
    hecho = true;
    const a = c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-out', fill: 'forwards' });
    a.onfinish = () => c.remove();
  };
  c.addEventListener('click', cierra);
  return { c, cierra };
}

// Medalla ganada: sello y chispas de píxel. Pasa 8 veces en toda la región.
export function celebrar({ titulo, sub, color }) {
  const { c, cierra } = capa(titulo + '. ' + sub);
  c.innerHTML = `<div class="cel"><div class="cel-sello" style="--c:${color}"></div><h2>${titulo}</h2><p>${sub}</p></div>`;
  if (!reducido()) {
    c.querySelector('.cel-sello').animate(
      [{ transform: 'scale(1.5) rotate(-12deg)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 280, easing: EASE });
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('i');
      p.className = 'chispa';
      p.style.background = i % 3 ? color : 'var(--tinta)';
      c.append(p);
      const ang = (i / 26) * Math.PI * 2, r = 110 + Math.random() * 150;
      p.animate(
        [{ transform: 'translate(0,0)', opacity: 1 },
         { transform: `translate(${Math.cos(ang) * r}px,${Math.sin(ang) * r + 40}px)`, opacity: 0 }],
        { duration: 800 + Math.random() * 300, easing: EASE, fill: 'forwards' });
    }
  }
  setTimeout(cierra, 2200);
}

// Evolución: silueta blanca que late y aparece la forma nueva, como en el juego.
export function evolucionar({ de, a, nomDe, nomA, onerror }) {
  const { c, cierra } = capa(`${nomDe} evoluciona a ${nomA}`);
  c.innerHTML = `<div class="cel"><div class="evo"><img class="evo-a" alt="" src="${de}"><img class="evo-b" alt="" src="${a}"></div><h2>¡${nomDe} evoluciona!</h2><p></p></div>`;
  c.querySelectorAll('img').forEach((im) => { im.onerror = onerror; });
  const A = c.querySelector('.evo-a'), B = c.querySelector('.evo-b'), T = c.querySelector('h2'), P = c.querySelector('p');
  const final = () => { A.style.opacity = 0; B.style.opacity = 1; B.style.filter = 'none'; T.textContent = '¡Ahora es ' + nomA + '!'; P.textContent = 'Sus tipos y ataques ya se tienen en cuenta en la matriz.'; setTimeout(cierra, 1500); };
  if (reducido()) { final(); return; }
  A.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(0) invert(1)' }], { duration: 400, fill: 'forwards', easing: 'ease-out' });
  A.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
    { duration: 1100, delay: 200, easing: 'ease-in-out' }).onfinish = () => {
    B.style.filter = 'brightness(0) invert(1)';
    A.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
    B.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: EASE, fill: 'forwards' });
    B.animate([{ filter: 'brightness(0) invert(1)' }, { filter: 'none' }], { duration: 420, delay: 220, easing: 'ease-out', fill: 'forwards' }).onfinish = final;
  };
}
