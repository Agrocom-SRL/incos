---
name: incos-rbac
description: RBAC y permisos INCOS — coherencia en 3 capas (ruta frontend, controles UI, verificarPermiso backend), vocabulario de acciones v2 (LISTAR/DETALLE/CREAR/...), seeds 54/56/55, landingStack y viewStack. Activa SIEMPRE al tocar permisos, rutas protegidas, ActionButton/TableActions, verificarPermiso o seeders de permisos.
---

# RBAC y permisos — INCOS

El error que más cuesta en producción: el menú se ve pero la API da 403, o un
botón aparece sin permiso real. Causa: las 3 capas no usan la **misma acción**.

## 1. Regla de oro — coherencia extremo a extremo

Toda función protegida valida la **MISMA acción** en 3 capas a la vez:

1. **Ruta frontend** (`routes.jsx`): `permiso` + `accion`.
2. **Controles UI** (`ActionButton`, `TableActions`, `PermisoGuard`, `useAcciones`).
3. **Backend** (`verificarPermiso(codigo, accion)`).

El string de `codigo` en el router debe ser **idéntico** a `permisos.codigo` del
seed 54 (ej. `configuracion.carrera`, nunca `cfg.academico.carreras`).

## 2. Vocabulario v2 (usar SIEMPRE; `VER` está deprecado)

| Flujo | Acción | Uso |
|-------|--------|-----|
| listado / abrir menú | `LISTAR` | visibilidad de sidebar depende de LISTAR |
| ficha (`GET /:id`) | `DETALLE` | |
| alta | `CREAR` | |
| edición | `EDITAR` | |
| baja | `ELIMINAR` | soft-delete |
| activar/desactivar | `ACTIVAR` | |
| aprobación de flujo | `APROBAR` | |
| export excel/pdf/recibo | `EXPORTAR` | |
| generar PDF | `GENERAR_PDF` | |

9 acciones en `permiso_acciones`. **Nunca** uses `VER` en código nuevo. Si un
doc legado lo usa como sinónimo de lectura → mapear a `LISTAR`/`DETALLE` y
documentar la excepción en `docs/referencia/matriz-permisos-sistema.md` antes del merge.

## 3. Seeds (siempre juntos, con cada recurso nuevo)

| Archivo | Contenido |
|---------|-----------|
| `54-seed-permisos.sql` | fila en `permisos`: `codigo`, `dominio`, `modulo`, `grupo_ui`, `ruta_sidebar` |
| `56-seed-permiso-acciones.sql` | acciones válidas para ese `permiso_id` (al menos `LISTAR`) |
| `55-seed-roles-permisos.sql` | `(rol_id, permiso_id, accion)` por rol operativo |
| `docs/referencia/matriz-permisos-sistema.md` | documentar pantalla ↔ permiso ↔ endpoint |

`ADMIN_SISTEMA` (rol_id=1): **sin filas en 55**; sus permisos salen del catálogo
56 vía `AuthRepository`. No intentes asignarle filas en 55.

Roles: 1 ADMIN_SISTEMA · 2 RECTOR · 3 DIR_ACADEMICO · 4 DIR_ADMIN ·
5 SEC_ACADEMICA · 6 SEC_ADMIN · 7 DOCENTE · 8 ESTUDIANTE.

## 4. Reglas de UI (fail-closed)

- `TableActions` **sin** objeto `permisos` → no muestra ver/editar/eliminar. Es
  intencional; no lo "arregles" mostrando todo.
- `TableActions` muestra **eliminar** solo si hay `deleteFn`/use case real Y permiso.
- Ocultar CTA con `PermisoGuard`/`ActionButton`, **nunca** con `if (rol === 'DOCENTE')`.
  El routing y la visibilidad dependen de **permisos**, no de códigos de rol.
- `permisoAny: [...]` en la ruta de entrada cuando un menú agrupa varios tabs.

## 5. Entradas por permiso (un menú, varias pantallas)

Cuando un mismo ítem de menú agrupa pantallas distintas (ej. coordinación vs
mis-cursos del docente), la pantalla **no depende del rol** sino de qué permisos
hijos tiene el usuario:

- **`menu.landingStack`** en la ruta de ingreso: primera entrada cuyo par
  permiso+acción cumple el usuario gana. Sin `redirectTo` → render inline; con
  `redirectTo` → `Navigate` a la ruta hija.
- **`viewStack`** (propiedad de primer nivel, NO dentro de `menu`): modo de
  subpantallas; resuelto con `useRouteViewMode(routeKey)`. Entradas con
  `persistContext` solo activan si hay permiso Y contexto en `location.state`/sessionStorage.
- `labelByRole` solo cambia el texto del menú; **nunca** sustituye permisos ni paths.
- No crear `useXxxVistaContext` por módulo; la lógica vive en `useRouteViewMode`.

## 6. Catálogos de referencia (`sistema.catalogo.referencia`, id 105)

Permiso técnico transparente: sin `grupo_ui` ni `ruta_sidebar`, **no aparece**
en la grilla de Seguridad, **no** se guarda en seed 55. Lo tiene cualquier
usuario autenticado con rol (para que combos de país/idioma/método de pago
funcionen aunque el rol solo tenga "crear"). Middleware `listarCatalogoReferencia`
en cada ruta GET de catálogo; no hay middleware global.

## 7. Checklist al agregar módulo con permisos

- [ ] Seed 54: permiso(s) con `codigo` exacto que usará `verificarPermiso`.
- [ ] Seed 56: acciones válidas (mínimo LISTAR).
- [ ] Seed 55: asignar a cada rol solo lo que le toca (no a ADMIN_SISTEMA).
- [ ] `routes.jsx`: `permiso` + `accion` correctos (o `permisoAny` en tabs).
- [ ] UI: `ActionButton`/`TableActions`/`PermisoGuard` con la MISMA acción.
- [ ] Backend: `verificarPermiso(codigo, accion)` con el mismo string y acción.
- [ ] Fila documentada en `docs/referencia/matriz-permisos-sistema.md`.
- [ ] Prueba: rol con permiso (200) y rol sin permiso (403 + UI sin CTA).

## 8. Errores frecuentes

1. Acción distinta entre capas (`LISTAR` en ruta, `VER` en UI) → incoherencia.
2. `codigo` del router ≠ seed 54 → 403 con menú visible.
3. Intentar asignar permisos a ADMIN_SISTEMA en seed 55 → redundante/incorrecto.
4. Routing por rol (`if rol === ...`) en vez de por permiso → rompe landingStack.
5. `DETALLE` ausente en seed 55 → 403 en ficha con menú visible por otro permiso del tab.
6. Mostrar todo en `TableActions` al no pasar `permisos` → bypass de seguridad.
