# Prompt de continuación (para retomar desde VS Code)

> Pegar el bloque de abajo en Claude Code, en la raíz del repo. Estado del programa al 2026-10-27:
> todo lo hecho está fusionado en `develop` (PR #56 a #78, CI verde). La memoria viva del programa
> es `docs/plan/programa-pruebas-ci-estado.md`.

```
Contexto: el programa de correcciones y pruebas del backlog "correcciones-hallazgos-pruebas" ya está
fusionado en la rama develop (PR #56 a #78, todos con CI verde). No rehagas nada de eso.

Primero, sincroniza y recupera el contexto:
1. git fetch origin && git checkout develop && git pull origin develop
2. Lee en este orden: CLAUDE.md, docs/plan/programa-pruebas-ci-estado.md (memoria viva del programa),
   docs/plan/correcciones-hallazgos-pruebas.md y docs/guias/pruebas.md.
3. En backend/ y frontend/ ejecuta `npm ci`, y confirma que pasan: backend `npm run lint` y
   `npm run test:unit`; frontend `npm run lint`, `npm run build` y `npm test`
   (esta última tarda unos 7 minutos).

Reglas de trabajo (las mismas que seguí hasta ahora):
- Un PR por cambio hacia develop, de uno en uno. El auto-merge solo aplica al autor autorizado y falla
  con "Base branch was modified" si dos PR se fusionan a la vez.
- Todo cambio de lógica lleva su prueba (skill incos-testing). Un bug corregido lleva la prueba que lo reproduce.
- Antes de abrir cada PR: fusionar origin/develop en la rama, correr lint y las pruebas completas, y comprobar
  que el commit remoto coincide con el local.
- Para validar la integración en local hay que levantar una MariaDB 10.11 aparte (mariadb-install-db en un
  directorio temporal y otro puerto) y cargar la BD con backend/scripts/ci-cargar-bd.sh. DB_NAME debe terminar
  en _test.
- Excluir design/ y studio/.

Tareas pendientes, en este orden:
A) Aplicar los workflows que quedaron como archivos pendientes en docs/plan/workflows-pendientes/:
   copiar e2e.yml.txt y carga.yml.txt a .github/workflows/ (e2e.yml y carga.yml) y aplicar
   seguridad-ci.patch sobre ci.yml (git apply). Luego borrar esa carpeta y abrir el PR.
   Esto requiere un usuario con permiso "workflow". Si jsdom 30 da problemas, usar Node >= 22.22.2.
B) Decisiones de diseño que debe tomar el dueño (pregúntale antes de implementar):
   - Guardar `areaConocimiento` de Materia: la columna no existe, requiere DDL.
   - Prevenir al guardar un bloque el choque de docente con otro paralelo
     (HorarioConflictosService.validarPropuesta solo ve choques ya guardados).
   - Autenticar /uploads (hoy es estático y público, incluye documentos de estudiantes).
   - POST /proyectos-grado/:id/bitacora/:entradaId/confirmar muta con permiso de lectura.
C) Despliegue: re-sembrar el seed 60 (permisos) en las bases ya sembradas.
D) Opcional, menor: ~20 providers del frontend con lógica propia sin probar, y las 3 vulnerabilidades
   moderadas de uuid anidado en exceljs/sequelize (esperar parche o migrar a sequelize 7).

Empieza por A, y pregúntame lo que necesites de B antes de tocar código.
```
