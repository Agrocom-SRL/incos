# Cambios de workflows pendientes de aplicar a mano

El token de la sesión automatizada no tiene el permiso `workflow` de GitHub, por lo que no puede subir cambios a `.github/workflows/`. Se dejan como parche para aplicarlos con un usuario que sí lo tenga.

| Parche | Qué hace |
|---|---|
| `seguridad-ci.patch` | Paso `npm run test:seguridad` en el job backend, job `seguridad` (`npm audit` + escaneo de secretos con `backend/scripts/ci-escanear-secretos.sh`) y `seguridad` en `needs` de `automerge`. |

Aplicar: `git apply docs/plan/workflows-pendientes/seguridad-ci.patch` (si `ci.yml` cambió, resolver a mano) y borrar el parche al fusionar.
