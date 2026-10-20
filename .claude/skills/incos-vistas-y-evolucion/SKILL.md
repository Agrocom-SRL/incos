---
name: incos-vistas-y-evolucion
description: Evita versiones V2/beta y vistas SQL duplicadas en INCOS. Usar al proponer 03-views, APIs de lectura, refactors o documentación de esquema (cualquier dominio).
---

# INCOS — vistas y evolución del proyecto

Leer y aplicar la regla **`incos-evolucion-proyecto`** (`.cursor/rules/incos-evolucion-proyecto.mdc`).

## Checklist rápido

1. ¿El proyecto está en construcción? → No nombrar entregas “V2”, “beta”, “nueva versión”.
2. ¿Hace falta una vista SQL? → `grep` en **todo** `backend/database/03-views/` y repos `*ViewRepository` / `vista_*`.
3. ¿Consumidor nuevo? → Reutilizar vista existente (JOIN, columna, `GROUP BY`) antes de crear archivo en `03-views/`.
4. ¿Horarios armado? → API `GET …/grilla-horario` y vistas `122`–`126`, `123` (no panel lateral con vista propia).
5. ¿Tablero KPI horarios? → Vista `87` + bases `70`–`79`; alinear grano a `paralelo_gestion_id` si hace falta.
6. ¿Flujo institucional? → CFG Académico (plan) → Oferta → Asignación docente → Bloques/publicación.
7. Documentar en `docs/plan/MIGRACION_CODIGO.md`, no en archivos `*_BETA.md`.

## Referencia

- Cadena datos y migración: `MIGRACION_CODIGO.md` §2 y §3.4
- Frontend horarios: `incos-frontend-module` + `SPRINT_5.md` §5
