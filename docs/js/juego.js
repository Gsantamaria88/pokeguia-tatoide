// Logros y entrenamiento. Todo sale de la partida real: nada que mantener a mano.
import { ESPECIES, celda, xf } from './calculos.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ani = (id, cl = 'spr') => `<img class="${cl}" alt="" src="img/animados/${id}.gif" onerror="this.onerror=null;this.src='img/sprites/${id}.png'">`;
const miles = (n) => n.toLocaleString('es-ES');

/* ---------- Logros ---------- */
// [id, icono, nombre, cómo se consigue, valor actual, meta]
export function logros(E, ctx) {
  const f = E.ficha || {}, nvs = E.equipo.map((m) => m.nv), mt = Object.keys(E.tengo || {}).filter((k) => /^M[TO] /.test(k) && E.tengo[k]).length;
  const en = E.entreno || {}, pct = Math.round(ctx.progreso * 100);
  return [
    ['med1', 'ahora', 'Primera medalla', 'Gana tu primera medalla', E.medallas, 1],
    ['med4', 'ahora', 'Media región', 'Reúne 4 medallas', E.medallas, 4],
    ['med8', 'ahora', 'Las ocho', 'Reúne las 8 medallas de Teselia', E.medallas, 8],
    ['liga', 'combate', 'Campeón de Teselia', 'Gana la Liga y cierra el castillo', ctx.liga ? 1 : 0, 1],
    ['ruta50', 'ruta', 'Medio camino', 'Completa la mitad de la ruta', pct, 50],
    ['ruta100', 'ruta', 'Teselia entera', 'Completa todos los pasos obligatorios', pct, 100],
    ['din100', 'dinero', 'Primeros ahorros', 'Junta 100.000 $', E.dinero, 1e5],
    ['din500', 'dinero', 'Medio millón', 'Junta 500.000 $', E.dinero, 5e5],
    ['din1m', 'dinero', 'Millonario', 'Junta 1.000.000 $', E.dinero, 1e6],
    ['dex25', 'objetos', 'Coleccionista', 'Registra 25 Pokémon en la Pokédex', f.dex || 0, 25],
    ['dex100', 'objetos', 'Enciclopedia', 'Registra 100 Pokémon en la Pokédex', f.dex || 0, 100],
    ['nv50', 'personaje', 'Primer Nv.50', 'Sube a un Pokémon a Nv.50', Math.max(...nvs), 50],
    ['todos50', 'personaje', 'Equipo parejo', 'Los seis a Nv.50 o más', Math.min(...nvs), 50],
    ['mt8', 'objetos', 'Maletín de MT', 'Consigue 8 MT o MO', mt, 8],
    ['racha5', 'combate', 'Buen ojo', 'Racha de 5 en el entrenamiento', en.record || 0, 5],
    ['racha15', 'combate', 'Estratega', 'Racha de 15 en el entrenamiento', en.record || 0, 15],
  ].map(([id, ic, nom, como, v, meta]) => ({ id, ic, nom, como, v, meta, ok: v >= meta }));
}

export function logrosH(lista, IC) {
  const ok = lista.filter((l) => l.ok).length;
  // Primero los conseguidos; de los que faltan, el más cercano delante.
  const orden = [...lista].sort((a, b) => (b.ok - a.ok) || (b.v / b.meta - a.v / a.meta));
  return `<section class="seccion"><header><h2>Logros</h2><span class="nota">${ok} de ${lista.length}</span></header>
  <ul class="logros">${orden.map((l) => `<li class="logro${l.ok ? ' ok' : ''}"><span class="hex" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="${IC[l.ic]}"/></svg></span><div><b>${esc(l.nom)}</b><span>${esc(l.como)}</span>${l.ok ? '' : `<span class="bv"><i style="transform:scaleX(${Math.min(1, l.v / l.meta).toFixed(3)})"></i></span><small>${miles(Math.min(l.v, l.meta))} de ${miles(l.meta)}</small>`}</div></li>`).join('')}</ul></section>`;
}

// Devuelve los logros recién conseguidos y los apunta como vistos. La primera vez no avisa de ninguno.
export function logrosNuevos(E, lista) {
  const hechos = lista.filter((l) => l.ok).map((l) => l.id);
  if (!Array.isArray(E.logrosVistos)) { E.logrosVistos = hechos; return []; }
  const nuevos = lista.filter((l) => l.ok && !E.logrosVistos.includes(l.id));
  if (nuevos.length) E.logrosVistos = [...new Set([...E.logrosVistos, ...hechos])];
  return nuevos;
}

export function aviso(texto, sub) {
  const t = document.createElement('div');
  t.className = 'tostada';
  t.setAttribute('role', 'status');
  t.innerHTML = `<b>${esc(texto)}</b><span>${esc(sub)}</span>`;
  document.body.append(t);
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!quieto) t.animate([{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(0.23,1,0.32,1)' });
  setTimeout(() => {
    const a = t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
    a.onfinish = () => t.remove();
  }, 3200);
}

/* ---------- Entrenamiento: ¿a quién sacas? ---------- */
// Misma regla que la matriz (tipos, potencia y misma-tipo), con tu equipo y los rivales reales.
let P = null; // pregunta en curso: { rv, r, filas, max, elegido }

export function nuevaPregunta(E, RIV, INM, fijo) {
  const cerca = RIV.filter((x) => x.med >= Math.min(E.medallas, 8));
  for (let k = 0; k < 24; k++) {
    const bolsa = fijo ? [fijo] : (Math.random() < 0.7 && cerca.length ? cerca : RIV);
    const rv = bolsa[Math.floor(Math.random() * bolsa.length)], r = rv.eq[Math.floor(Math.random() * rv.eq.length)];
    if (P && P.r === r && rv.eq.length > 1) continue;
    const filas = E.equipo.map((m, i) => ({ i, m, c: celda(m, r, INM) })), max = Math.max(...filas.map((x) => x.c.s));
    const buenas = filas.filter((x) => x.c.s >= max * 0.999).length;
    if (max > 0 && buenas <= 2) { P = { rv, r, filas, max, elegido: null }; return P; }
  }
  return P;
}

export const pregunta = () => P;
export function responde(i) {
  if (!P || P.elegido !== null) return null;
  P.elegido = i;
  return P.filas[i].c.s >= P.max * 0.999;
}

export function entrenaH(E, tipoH) {
  if (!P) return '';
  const { rv, r, filas, max, elegido } = P, en = E.entreno || {}, visto = elegido !== null;
  const acierto = visto && filas[elegido].c.s >= max * 0.999;
  return `<section class="entrena" aria-label="Entrenamiento">
  <div class="marcador"><div><span>Racha</span><b data-cnt="racha" data-v="${en.racha || 0}">${en.racha || 0}</b></div><div><span>Récord</span><b>${en.record || 0}</b></div><div><span>Aciertos</span><b>${en.ok || 0} de ${en.total || 0}</b></div></div>
  <div class="reto"><div class="reto-rival">${ani(r[1], 'spr grande')}<div><h3>${esc(r[0])} <span class="nota">Nv.${r[2]}</span></h3><p class="nota">${esc(rv.nom)} · ${esc(rv.lugar)}</p><div class="tipos">${r[3].map(tipoH).join('')}</div>${r[5] ? `<p class="nota">Habilidad: ${esc(r[5])}</p>` : ''}</div></div>
  <h2 id="reto-q">${visto ? (acierto ? 'Bien elegido.' : 'No era la mejor opción.') : '¿A quién sacas?'}</h2>
  <div class="opciones" role="group" aria-labelledby="reto-q">${filas.map((x) => {
    const top = x.c.s >= max * 0.999, cl = !visto ? '' : top ? ' si' : x.i === elegido ? ' no' : ' resto';
    return `<button class="opcion${cl}" data-resp="${x.i}"${visto ? ' disabled' : ''}>${ani(ESPECIES[x.m.sp].id)}<b>${esc(x.m.sp)}</b>${visto ? `<span>${esc(x.c.g.n)} ${xf(x.c.g.m)}</span><span>recibe ${xf(x.c.d.m)}</span>` : `<span>Nv.${x.m.nv}</span>`}</button>`;
  }).join('')}</div>
  ${visto ? `<div class="fila-acc"><button class="btn" data-sigue="1">Siguiente</button><span class="nota">${acierto ? 'Pega más fuerte y aguanta mejor que el resto.' : 'En verde, quien mejor sale parado.'}</span></div>` : ''}
  <p class="nota">Cuenta lo mismo que la matriz: tipos, potencia y misma-tipo. No ve niveles, estadísticas ni objetos.</p></section>`;
}
