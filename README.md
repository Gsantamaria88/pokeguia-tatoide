# C-Gear de Tatoide

Panel de partida de PokeMMO: ruta completa por Teselia, matriz de combate con el equipo real, dinero, experiencia y límites de nivel.

**Web:** https://gsantamaria88.github.io/pokeguia-tatoide/

Funciona en móvil y consola, se puede instalar y sigue abierta sin conexión. El progreso se guarda en cada navegador y se puede pasar a otro aparato con un código.

## Probarla en local

```
cd docs && python3 -m http.server 8000
```

## Actualizar

La partida está en `docs/datos/partida.json`, la ruta en `ruta.json` y los rivales en `rivales.json`. Antes de publicar, `python3 scripts/validar.py`. Más detalle en `CLAUDE.md`.

## Créditos

Datos de la comunidad: pokemmo.wiki, PokeMMO ShoutWiki, PikaMMO, Serebii y Pokémon Database. Sprites de PokéAPI. Tipografías bajo licencia OFL.

Proyecto personal de un jugador, sin relación con PokeMMO, Nintendo ni Game Freak. Pokémon y sus personajes pertenecen a sus dueños.
