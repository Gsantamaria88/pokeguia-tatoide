# Instrucciones para el asistente: C-Gear de Tatoide (PokeMMO)

Web de partida de Guillermo. **Es pública.** Responde en español, claro y sin jerga: no es técnico.
Web: https://gsantamaria88.github.io/pokeguia-tatoide/ · Repo: `Gsantamaria88/pokeguia-tatoide`.

## Regla de oro: lo público y lo privado

`docs/`, `scripts/`, este archivo y `README.md` se publican. `privado/` no (`.gitignore`): empieza leyendo `privado/HISTORIA.md`.
Nunca poner fuera de `privado/` datos de acceso, historial de cuentas ni mods de terceros. `scripts/validar.py` vigila la lista de `privado/vetadas.txt`, pero la decisión es tuya.

## Estructura

```
docs/                   la web (GitHub Pages sirve esta carpeta)
  index.html, sw.js, manifest.webmanifest
  css/app.css           tema; tokens en :root; css/fuentes.css
  js/calculos.js        tipos, límites y cálculo de combate; sin DOM
  js/app.js             vistas y eventos
  js/efectos.js         movimiento: contar, barras, medalla, evolución
  datos/partida.json    ← estado real: medallas, dinero, equipo, pasos
  datos/ruta.json       ← paso a paso por fases y lugares
  datos/rivales.json    ← equipos para la matriz
  datos/dinero.json     ← guía del dinero: métodos, plan, simulador, GTL, equipos
  datos/objetos.json    ← objetos por Pokémon, equipables, MT, para el entrenador
  datos/personaje.json  ← ficha, mejoras y aspecto
  datos/cosmeticos.json ← catálogo, lo genera scripts/generar_cosmeticos.py
  img/ fonts/           sprites (estáticos y animados), iconos y tipografías
scripts/validar.py      revisa datos y fugas; sin dependencias
scripts/comprobar.mjs   prueba en navegador
privado/                historia, mods y notas (no se sube)
```

## Tareas habituales

**"Actualiza mi partida" / capturas nuevas** (`~/Pictures/Capturas de pantalla`, las más recientes):
1. Leer las capturas. Editar solo `docs/datos/partida.json`.
2. Poner `actualizado` con la hora actual en ISO UTC: la copia más reciente gana en cada aparato, y lo marcado se conserva.
3. Si cambia lo que va a pasar (nuevo rival, pasos), revisar `ruta.json` y `rivales.json`.
4. Validar y publicar (abajo).

**Añadir o corregir datos del juego:** editar el JSON. Paso = `[id, título, detalle, prueba, opcional]`.
No cambiar ids existentes: el progreso de los aparatos depende de ellos.
Prueba: `t` partida · `p` wiki de PokeMMO · `b` juego original o sin confirmar. Decir la verdad sobre la fuente:
los equipos de PokeMMO difieren del juego original, así que nada de `p` sin haberlo leído.

**Publicar:**
```
python3 scripts/validar.py
PATH=~/.nvm/versions/node/v24.19.0/bin:$PATH node scripts/comprobar.mjs <carpeta-del-scratchpad>
git add -A && git commit -m "…" && git push
```
Pages tarda un par de minutos. Comprobar luego la URL real. Commit solo con email noreply (ya configurado en este repo).

**Mods tras un parche:** ver `privado/MODS.md`.

## Movimiento

Lo frecuente, rápido y discreto (200 ms o menos, solo transform y opacity); lo raro, memorable (medalla, evolución). Siempre con `prefers-reduced-motion`. Sin animación lo que se repite con mando o teclado.

## Fuentes

Bloquean el acceso automático: foros, web y Condiciones de pokemmo.com (403), Bulbapedia, StrategyWiki, GameFAQs, Fandom.
ShoutWiki bloquea por tandas: aún sin leer Aloe, Iris, castillo de N, Rutas 1-10 (salvo las que figuran), Dragoespiral.
Dinero sin confirmar: espera de la Liga (6 h ShoutWiki, 18 h PikaMMO), comisión del GTL (5 % wiki, 2 % PikaMMO), cómo suben los niveles de los reencuentros, precios de Halloween. Pregúntaselo a Guillermo cuando lo vea en el juego.
Si Guillermo pega el texto o lo copia del navegador, se completa. No usar `pokemmobot`: vende bots.

## Reglas de juego

Nada de compras por fuera, bots ni varias cuentas para farmear. No recomendarlos ni en la web ni en el chat.

## Mantenimiento de la consola

El proyecto de la consola es `~/Documents/LegionGoS`. Ahí se apunta solo lo que afecta a la consola (cliente, mods).
