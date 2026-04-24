# Documento 3 — Plan de desarrollo
## Implementación del módulo de seguridad v2 · Instituto INCOS
**Versión:** 3.1
**Fecha:** 2026-04-08

---

## 1. Contexto y objetivo

Este documento define el plan de implementación del módulo de seguridad v2 (autenticación, autorización, permisos, sidebar y grilla de roles) alineado a:

- Documento 1: `docs/01_schema_datos.md`
- Documento 2: `docs/02_estructura_sidebar.md`

Decisión del proyecto actual:

- El módulo de seguridad todavía no está en producción.
- Se permite eliminar y reconstruir completamente el schema del módulo (`DROP + CREATE + SEEDS`).
- No se usará estrategia de compatibilidad con `VER`; el baseline queda directamente en vocabulario v2 (`LISTAR`, `DETALLE`, etc.).

**Stack:** Node.js + Express (backend), React + Ant Design + React Router v6 (frontend), MySQL (BD), Redis (caché)

---

## 2. Principios de implementación

1. **Implantación limpia del módulo de seguridad.** Se recrean tablas y catálogo de permisos v2 desde cero.
2. **Separación DDL y seeds.** Evitar scripts monolíticos para facilitar mantenimiento y pruebas.
3. **BD como fuente de verdad.** Frontend consume permisos efectivos desde `/auth/me`; no hardcodea autorizaciones.
4. **Consistencia funcional primero.** Backend y frontend se ajustan al mismo vocabulario de acciones y al mismo árbol de navegación.
5. **Idempotencia en seeds.** Los scripts deben poder re-ejecutarse en dev sin inconsistencias.

---

## 3. Alcance y no alcance

### Incluye

- Redefinir schema de seguridad v2.
- Poblar catálogo de roles, permisos, acciones y asignaciones por rol.
- Ajustar backend para resolver permisos v2 y exponer datos para grilla.
- Refactorizar frontend para `accion` por ruta, sidebar simplificado y `labelByRole`.
- Validación integral por rol (incluyendo ESTUDIANTE y ADMIN_SISTEMA).

### No incluye

- Migración incremental de datos legacy (`VER -> LISTAR`).
- Preservación histórica de datos previos del módulo de seguridad.
- Cambios a lógica de negocio de módulos académicos/financieros fuera de autorización y navegación.

---

## 4. Fases de desarrollo

### Fase 0 — Preparación técnica

**Objetivo:** Dejar entorno listo para ejecutar la implantación limpia.

- [ ] Crear rama `feature/security-v2`.
- [ ] Congelar cambios paralelos en auth/rutas mientras se ejecuta esta fase.
- [ ] Respaldar BD de desarrollo/staging antes de reconstruir tablas.
- [ ] Confirmar lista de tablas a recrear: `roles`, `permisos`, `permiso_acciones`, `usuarios`, `roles_permisos`, `usuarios_permisos`, `sesiones`.
- [ ] Definir usuario admin inicial de desarrollo.

---

### Fase 1 — Reestructuración del schema de seguridad (clean install)

**Objetivo:** Reconstruir schema con estructura v2.

#### 1.1 Estructura física

- [ ] Actualizar `backend/database/01-schemas/04-sistema-seguridad.sql` al modelo v2:
  - ENUM de acciones en `permiso_acciones`, `roles_permisos`, `usuarios_permisos`:
    `LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR, APROBAR, EXPORTAR, GENERAR_PDF`
  - Nuevas columnas en `permisos`: `grupo_ui`, `ruta_sidebar`
  - Dominio `CONFIGURACION` habilitado en catálogos y comentarios.

#### 1.2 Política de ejecución

- [ ] Mantener `DROP TABLE IF EXISTS` solo para entornos no productivos en esta etapa.
- [ ] Ejecutar script completo con `SET FOREIGN_KEY_CHECKS = 0` al inicio y `= 1` al final.

#### 1.3 Verificación de schema

```sql
SHOW COLUMNS FROM permisos;
SHOW COLUMNS FROM permiso_acciones;
SHOW COLUMNS FROM roles_permisos;
SHOW COLUMNS FROM usuarios_permisos;
```

Criterios de aceptación:

- [ ] `permisos` contiene `grupo_ui` y `ruta_sidebar`.
- [ ] No existe `VER` en ENUMs de acciones.
- [ ] Todas las tablas del módulo se crean sin errores.

---

### Fase 2 — Seeds v2 del módulo de seguridad

**Objetivo:** Cargar datos base consistentes con documentos 1 y 2.

- [ ] Insertar roles base (incluye `ADMIN_SISTEMA`).
- [ ] Insertar permisos por dominio y módulo con `grupo_ui` y `ruta_sidebar`.
- [ ] Insertar `permiso_acciones` según capacidad real de cada permiso.
- [ ] Insertar usuario admin inicial (solo dev/staging).
- [ ] Insertar `roles_permisos` por rol funcional.
- [ ] Mantener regla: `ADMIN_SISTEMA` puede resolverse dinámicamente desde `permiso_acciones`.

Verificaciones SQL mínimas:

```sql
-- No debe existir VER
SELECT COUNT(*) AS c FROM permiso_acciones WHERE accion = 'VER';
SELECT COUNT(*) AS c FROM roles_permisos WHERE accion = 'VER';

-- Permisos activos con grupo y ruta
SELECT COUNT(*) AS sin_grupo
FROM permisos
WHERE activo = 1 AND deleted_at IS NULL AND grupo_ui IS NULL;

SELECT COUNT(*) AS sin_ruta
FROM permisos
WHERE activo = 1 AND deleted_at IS NULL AND ruta_sidebar IS NULL;
```

Criterios de aceptación:

- [ ] `VER` no existe en datos.
- [ ] Permisos activos tienen `grupo_ui` y `ruta_sidebar`.
- [ ] Existe cobertura de acciones válidas para cada grupo funcional.

---

### Fase 3 — Backend de autorización y grilla de permisos

**Objetivo:** Alinear backend con vocabulario v2 y grilla por `grupo_ui`.

- [ ] Revisar `authorize.js` para uso de acciones v2 en rutas (`LISTAR`, `DETALLE`, `CREAR`, etc.).
- [ ] Mantener `permissionResolver.js` con mismo enfoque (Set `codigo:accion`), pero alimentado con catálogo v2.
- [ ] Implementar/ajustar endpoint `GET /roles/:id/permisos-grilla` (o ruta definitiva acordada).
- [ ] Implementar método de repositorio para devolver:
  - `grupoUi`
  - `rutaSidebar`
  - `codigos`
  - `accionesValidas`
  - `accionesAsignadas`
- [ ] Asegurar invalidación de caché al modificar permisos de rol/usuario.

Criterios de aceptación:

- [ ] `/auth/me` entrega permisos efectivos con acciones v2.
- [ ] Endpoint de grilla responde por dominio sin errores.
- [ ] Cambios en permisos reflejan invalidación de caché y lectura actualizada.

---

### Fase 4 — Frontend de rutas, sidebar y protección

**Objetivo:** Aplicar estructura final de navegación y autorización del Documento 2.

- [ ] Actualizar `ProtectedRoute` para soportar `accion` explícita.
- [ ] Actualizar `useNavigationMenu` (`filterMenuByPermiso`) con `accion` y `labelByRole`.
- [ ] Refactorizar `routes.jsx` de módulos para declarar `accion` en cada ruta protegida.
- [ ] Aplicar patrón `menu: null` para rutas internas.
- [ ] Agregar/ajustar dominio raíz `CFG` y módulo `PERFIL`.
- [ ] Crear páginas de configuración con tabs internas:
  - `ConfigAcademicoPage`
  - `ConfigDocumentacionPage`
  - `ConfigComplementarioPage`
- [ ] Crear/ajustar `AvanceAcademicoPage` y rutas de perfil.

Criterios de aceptación:

- [ ] Sidebar refleja 41 ítems esperados.
- [ ] Rutas internas sin menú se protegen correctamente.
- [ ] Rol ESTUDIANTE ve etiquetas en primera persona cuando corresponda.

---

### Fase 5 — Panel de seguridad: matriz de permisos

**Objetivo:** Entregar grilla funcional con acciones por capas y guardado por delta.

- [ ] Renderizar columnas por acción:
  - Capa 1: `LISTAR`
  - Capa 2: `DETALLE`, `CREAR`, `EDITAR`, `ELIMINAR`, `ACTIVAR`
  - Capa 3: `APROBAR`, `EXPORTAR`, `GENERAR_PDF`
- [ ] Estados de celda:
  - habilitada (asignada)
  - disponible (válida no asignada)
  - no aplica (acción no válida)
- [ ] Guardar cambios por delta con `PUT /roles/:id/permisos`.
- [ ] Refrescar estado en UI tras persistencia.

Criterios de aceptación:

- [ ] El usuario admin puede asignar y quitar permisos sin recargar manualmente.
- [ ] No se habilitan acciones fuera de `permiso_acciones`.

---

### Fase 6 — Validación integral y salida a staging

**Objetivo:** Garantizar comportamiento por rol antes de estabilización.

Checklist mínimo:

- [ ] Login (`POST /auth/login`) y perfil (`GET /auth/me`) correctos.
- [ ] Sidebar correcto por rol (`RECTOR`, `DIR_ACADEMICO`, `DIR_ADMIN`, `SEC_ACADEMICA`, `SEC_ADMIN`, `DOCENTE`, `ESTUDIANTE`, `ADMIN_SISTEMA`).
- [ ] Rutas con `menu: null` responden 200 con permiso y 403 sin permiso.
- [ ] Grilla de roles persiste cambios en `roles_permisos`.
- [ ] `ADMIN_SISTEMA` tiene acceso total por resolución dinámica.
- [ ] Caches de permisos se invalidan correctamente.

---

## 5. Estructura recomendada de archivos de BD

Para evitar deuda técnica del script monolítico, separar en:

- `backend/database/01-schemas/04-sistema-seguridad.sql` (solo DDL)
- `backend/database/02-seeds/54-seed-roles.sql`
- `backend/database/02-seeds/55-seed-permisos.sql`
- `backend/database/02-seeds/56-seed-permiso-acciones.sql`
- `backend/database/02-seeds/57-seed-usuarios-admin.sql`
- `backend/database/02-seeds/58-seed-roles-permisos.sql`

Nota:

- Durante esta etapa puede mantenerse una versión monolítica para bootstrap local, pero la fuente principal debe ser modular.

---

## 6. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Inconsistencia entre backend y seeds v2 | Media | Ejecutar tests de integración de `/auth/me` y grilla tras cada cambio de seed |
| Sidebar incompleto por `accion` faltante en rutas | Media | Regla obligatoria: toda ruta protegida declara `accion` explícita |
| Errores de autorización por mapeo de acciones | Media | Matriz de pruebas por rol y por acción (LISTAR/DETALLE/CREAR/etc.) |
| Desalineación entre `permisos` y `permiso_acciones` | Media | Queries de validación y revisión de catálogos antes de liberar |
| Caché con permisos obsoletos | Alta | Invalidación por cambios de rol/usuario y smoke tests inmediatos |

---

## 7. Estrategia de despliegue para el estado actual del proyecto

Como el módulo todavía no está en producción:

1. Ejecutar reconstrucción limpia de BD de seguridad en entorno objetivo.
2. Cargar seeds v2 completos.
3. Desplegar backend v2.
4. Verificar `/auth/me` y endpoints de permisos.
5. Desplegar frontend v2 (routes/sidebar/grilla).
6. Ejecutar smoke tests por rol.

Si en el futuro entra a producción con datos reales, este plan deberá evolucionar a una estrategia incremental sin `DROP TABLE`.

---

## 8. Checklist de contexto para trabajo asistido por IA

Al delegar tareas al agente, usar este contexto:

```text
Contexto del proyecto:
- Sistema académico INCOS
- Backend: Node.js + Express + MySQL + Redis
- Frontend: React + Ant Design + React Router v6
- Módulo de seguridad en implantación limpia (no productivo aún)

Cambio central:
- Vocabulario de acciones v2: LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR, APROBAR, EXPORTAR, GENERAR_PDF
- Sidebar simplificado (41 ítems) con `accion` por ruta y `labelByRole`
- Grilla de permisos por `grupo_ui` + `ruta_sidebar`

Documentos fuente:
- Documento 1: schema y reglas de permisos
- Documento 2: estructura final del sidebar
- Documento 3: plan de ejecución por fases (este documento)
```
