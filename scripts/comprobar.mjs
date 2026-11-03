// Prueba la web en Chromium: errores, desbordes, guardado, código entre aparatos y modo sin conexión.
// Uso: node scripts/comprobar.mjs <carpeta-capturas> [url]
// Sin url levanta un servidor local con docs/. Requiere playwright (skill playwright-skill).
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(process.env.HOME + '/.claude/skills/playwright-skill/');
const { chromium } = require('playwright');
const web = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const salida = process.argv[2];
let url = process.argv[3];
let srv;
if (!url) {
  srv = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { cwd: web, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 900));
  url = 'http://127.0.0.1:8765/';
}
const b = await chromium.launch();
let fallos = 0;
const mal = (t) => { fallos++; console.log('FALLO', t); };
for (const [nombre, w, h, vistas] of [
  ['consola', 1280, 800, ['ahora', 'ruta', 'combate', 'dinero', 'regiones', 'mas']],
  ['movil', 390, 844, ['ahora', 'ruta', 'combate', 'dinero', 'regiones', 'mas']],
]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') mal('consola: ' + m.text()); });
  p.on('pageerror', (e) => mal('error: ' + e.message));
  p.on('requestfailed', (r) => mal('carga: ' + r.url()));
  for (const v of vistas) {
    await p.goto(url + '#' + v);
    await p.waitForSelector('.vista');
    const des = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (des > 0) mal(`desborde ${nombre}/${v}: ${des}px`);
    await p.screenshot({ path: `${salida}/${nombre}-${v}.png`, fullPage: v !== 'ruta' });
  }
  if (nombre === 'consola') {
    await p.goto(url + '#ahora');
    await p.waitForSelector('.vista');
    await p.click('#p-cura');
    await p.waitForTimeout(350);
    await p.reload();
    await p.waitForSelector('.vista');
    if (!(await p.evaluate(() => JSON.parse(localStorage.getItem('cgear-tato')).hechos.cura))) mal('no guarda');
    const rutaSup = await p.evaluate(async () => (await (await fetch('datos/ruta.json')).json()).fases.length);
    console.log('Fases de la ruta:', rutaSup);
    await p.goto(url + '#ruta');
    await p.click('#f1 > summary');
    await p.screenshot({ path: `${salida}/consola-ruta-f1.png` });
    // Buscador: de una palabra a su lugar
    await p.goto(url + '#ruta');
    await p.waitForSelector('#q');
    await p.fill('#q', 'piedra trueno');
    if (!(await p.innerText('#resultados')).includes('Electrorroca')) mal('buscador');
    await p.screenshot({ path: `${salida}/consola-busca.png` });
    await p.click('#resultados button');
    await p.waitForTimeout(200);
    if (!(await p.evaluate(() => document.querySelector('.marca-v')?.open))) mal('ir al resultado');
    // Filtros
    await p.click('[data-filtro="opc"]');
    if ((await p.locator('.paso').count()) < 5) mal('filtro opcionales');
    await p.click('[data-filtro="todo"]');
    // Versus y tabla
    await p.goto(url + '#combate');
    await p.waitForSelector('.versus');
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${salida}/consola-versus.png` });
    await p.click('[data-rival="gerania"]');
    await p.click('[data-modo="tabla"]');
    if (!(await p.locator('.matriz').count())) mal('tabla');
    // Guía del dinero: simulador, métodos, calculadora y buscador
    await p.goto(url + '#dinero');
    await p.waitForSelector('.vista');
    await p.screenshot({ path: `${salida}/consola-din-resumen.png`, fullPage: true });
    await p.click('[data-din="plan"]');
    await p.click('[data-sim="Teselia"]');
    await p.click('[data-mins="60"]');
    await p.waitForTimeout(400);
    const dia = +(await p.getAttribute('[data-cnt="simd"]', 'data-v'));
    if (dia !== Math.round(176526 * 1.5 - 14000)) mal('simulador: ' + dia);
    await p.screenshot({ path: `${salida}/consola-din-plan.png`, fullPage: true });
    await p.click('[data-din="metodos"]');
    await p.click('[data-solo="1"]');
    const ya = await p.locator('.met').count();
    if (ya < 6 || ya > 9) mal('métodos disponibles: ' + ya);
    await p.click('#m-amuleto > summary');
    await p.waitForTimeout(250);
    await p.screenshot({ path: `${salida}/consola-din-metodos.png`, fullPage: true });
    await p.click('[data-din="gtl"]');
    await p.fill('#pv', '100000');
    await p.fill('#pc', '50000');
    if (!(await p.innerText('#gtlres')).includes('45.000')) mal('calculadora GTL: ' + (await p.innerText('#gtlres')));
    await p.click('[data-din="esperas"]');
    await p.click('[data-ligah="6"]');
    if (!(await p.innerText('#timers')).includes('Espera de 6 h')) mal('espera elegible');
    await p.click('[data-din="equipos"]');
    await p.click('[data-din="dicc"]');
    await p.goto(url + '#ruta');
    await p.waitForSelector('#q');
    await p.fill('#q', 'moneda amuleto');
    await p.click('[data-ir-din="amuleto"]');
    await p.waitForTimeout(300);
    if (!(await p.evaluate(() => document.getElementById('m-amuleto')?.open))) mal('buscador a dinero');
    // Medalla, evolución y contadores
    await p.goto(url + '#ahora');
    await p.waitForSelector('.vista');
    await p.click('[data-ev="gat:1"]');
    if (!(await p.innerText('.ev-c')).includes('1/30')) mal('contador evento');
    await p.click('[data-med="6"]');
    await p.waitForTimeout(450);
    await p.screenshot({ path: `${salida}/consola-medalla.png` });
    if (!(await p.innerText('.capa')).includes('43')) mal('celebración');
    await p.click('.capa');
    await p.waitForTimeout(250);
    if (await p.locator('.capa').count()) mal('la capa no se cierra');
    await p.click('[data-med="6"]');
    await p.click('[data-evo="3"]');
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${salida}/consola-evo.png` });
    await p.waitForTimeout(3100);
    if (await p.locator('.capa').count()) mal('evolución sin cerrar');
    if (!(await p.innerText('.equipo')).includes('Dragonair')) mal('evolución');
    // Mando simulado: RB pasa a la siguiente sección
    await p.evaluate(() => {
      const bt = (i) => Array.from({ length: 17 }, (_, n) => ({ pressed: n === i }));
      let v = 0; navigator.getGamepads = () => [{ buttons: bt(v++ < 2 ? -1 : 5) }];
      dispatchEvent(new Event('gamepadconnected'));
    });
    await p.waitForTimeout(400);
    if (!(await p.evaluate(() => location.hash)).includes('ruta')) mal('mando');
    await p.evaluate(() => { navigator.getGamepads = () => []; });
    await p.waitForTimeout(100);
    await p.evaluate(() => localStorage.clear());
    await p.goto(url + '#mas');
    await p.waitForSelector('#copiar');
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
    await p.click('#copiar');
    const codigo = await p.evaluate(() => navigator.clipboard.readText());
    await p.fill('#codigo', codigo);
    await p.click('#pegar');
    if (!(await p.innerText('[role=status]')).includes('cargado')) mal('código entre aparatos');
    if (url.startsWith('http')) {
      await p.goto(url);
      await p.waitForSelector('.vista');
      await p.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 8000 }).catch(() => {});
      await p.reload();
      await p.waitForSelector('.vista');
      p.removeAllListeners('requestfailed');
      p.removeAllListeners('console');
      await ctx.setOffline(true);
      await p.reload();
      await p.waitForSelector('.vista', { timeout: 8000 }).catch(() => mal('sin conexión'));
      await ctx.setOffline(false);
      console.log('Sin conexión: revisado');
    }
  }
  await ctx.close();
}
await b.close();
if (srv) srv.kill();
console.log(fallos ? `${fallos} fallos` : 'Todo correcto');
process.exit(fallos ? 1 : 0);
