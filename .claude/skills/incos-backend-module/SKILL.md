---
name: incos-backend-module
description: Arquitectura de módulos backend INCOS — Express + Sequelize + MySQL en capas limpias (routes/controllers/use-cases/repositories), inyección de dependencias, contrato de respuesta y RBAC. Activa al crear o editar cualquier endpoint, repositorio, use case, controller o router del backend.
---

# Arquitectura de módulos backend — INCOS

Clean Architecture + SOLID. Para permisos ver `incos-rbac`. Para el contrato con
el frontend ver `incos-frontend-module` §5.

## 1. Flujo de una petición (las capas y su única responsabilidad)

```
Cliente → GET /api/v1/<recurso>?pagina&limite&busqueda
  → routes/<recurso>.routes.js   (auth + verificarPermiso + validators)
    → controllers/.../list.controller.js   (BaseListController — solo adapta HTTP)
      → use-cases/.../List*UseCase.js       (BaseListUseCase — LÓGICA DE NEGOCIO)
        → repositories/*Repository.js        (BaseRepository.findAll — solo datos)
          → database/models/*.js (Sequelize) → MySQL
      ← entidades → mappers/*Mapper.js → DTO JSON
  ← responseFormatter { success, data, pagination? }
```

**Regla SOLID:** negocio en use cases; controllers solo adaptan HTTP;
repositorios solo persistencia/consulta. No filtrar lógica entre capas.

## 2. Organización (por recurso REST, NO por menú)

A diferencia del frontend, el backend se organiza por **recurso REST**
(`carreras`, `materias`, `docentes`), cada uno con su router, container y casos
de uso. Recursos del mismo dominio comparten `use-cases/<dominio>/`.

```
backend/
├── database/
│   ├── 01-schemas/   # DDL
│   ├── 02-seeders/   # RBAC por módulo: 55 roles, 56 usuarios-admin, 57-64 permisos-<mod>
│   │                 #   (cada archivo de módulo = permisos + permiso_acciones + roles_permisos,
│   │                 #    sin ids correlativos, refs por CÓDIGO; SEG incluye SYS). Ver incos-rbac.
│   └── 03-views/     # vistas de lectura (fichas complejas)
└── src/
    ├── domain/{entities, interfaces/repositories}/
    ├── application/{use-cases/{base,<dominio>}, mappers}/
    ├── infrastructure/{database/models, repositories, mappers, container/{tokens,modules}}/
    └── presentation/{routes, controllers, validators, middleware}/
```

## 3. Listado — piezas obligatorias

| # | Artefacto | Ubicación |
|---|-----------|-----------|
| 1 | Modelo Sequelize (solo columnas reales) | `database/models/<tabla>.js` |
| 2 | Interfaz dominio | `domain/interfaces/repositories/I*Repository.js` |
| 3 | Repositorio | `infrastructure/repositories/*Repository.js` |
| 4 | Mapper aplicación `entitiesToPresentation` | `application/mappers/<dominio>/` |
| 5 | `List*UseCase` (`BaseListUseCase`) | `application/use-cases/.../` |
| 6 | `List*Controller` (`BaseListController`) | `presentation/controllers/.../list.controller.js` |
| 7 | `listValidator` (common) + validators write | `presentation/validators/` |
| 8 | `build*Router({ controllers, middlewares })` | `presentation/routes/<recurso>.routes.js` |
| 9 | `register*Resource` + tokens | `container/modules/<modulo>/<recurso>.container.js` |
| 10 | `register*Module` + montaje | `container/modules/<modulo>/index.js` + `routes/index.js` |

En el repositorio: `getCollectionName()` (inglés plural), `getSearchFields()`
(**atributos Sequelize**, no nombres SQL), `findAll({ pagina, limite, busqueda, filtros, incluirInactivos })`.

### Cadena middleware GET /
```js
router.get('/', authenticate,
  verificarPermiso('configuracion.carrera', 'LISTAR'),
  listValidator, validateRequest,
  (req, res, next) => controllers.listCarrerasController.handle(req, res, next));
```

## 4. Detalle — piezas obligatorias

| # | Artefacto | Nota |
|---|-----------|------|
| 1 | Vista SQL (si ficha rica) | `database/03-views/` — **recrear en BD tras cada cambio**; antes de crear vista nueva leer `incos-evolucion-proyecto` (reutilizar, no duplicar; sin etiquetas V2/beta) |
| 2 | Repositorio `findById` / `findDetailBundleBy*Id` | cabecera + hijos |
| 3 | `Get*ByIdUseCase.execute(id)` | `NotFoundError` si null |
| 4 | Mapper detalle | DTO anidado: `profile`, colecciones, etc. |
| 5 | `Get*ByIdController` (`BaseGetController`) | `dataFieldName` coherente |
| 6 | Router `GET /:id` | **después** de `/` y estáticas (`/matriz`, `/validar`) |

Cadena: `authenticate` → `verificarPermiso(codigo, 'DETALLE')` → `idValidator`
→ `validateRequest` → controller.

## 5. Contrato de respuesta (crítico para que el frontend no quede vacío)

```json
{ "success": true, "data": { "carreras": [ ] }, "pagination": { "page":1,"limit":50,"total":120,"totalPages":3 } }
```

- `dataFieldName` (**español**, ej. `carreras`) = clave en `data` = `dataKey` del frontend. Igual en use case Y controller.
- `collectionFieldName` (**inglés**, ej. `careers`) = nombre interno que devuelve el repositorio.
- Detalle: `data.<dataFieldName>` es un **objeto**, no lista.
- Errores: 401 sin token, 403 sin permiso, 404 id inexistente, 422 validación, 500 si modelo/DDL desalineados.

## 6. Inyección de dependencias (patrón INCOS)

`register*Resource(container)`: registra use cases → controllers (resolviendo
use case + `responseFormatter` + `logger`) → `build*Router` → token del router.
`register*Module` solo **compone** recursos. Repositorios se registran una vez
en `repositories.container.js`. Montar en `routes/index.js`:
`router.use('/carreras', container.resolve(CONFIGURACION_TOKENS.carrerasRouter))`.

Cadena canónica (ej. Asistencia, patrón de `horarios.container.js`):
```js
export function registerAsistenciaResource(container) {
  registerComponent(container, ACADEMICO_TOKENS.getPlanillaAsistenciaUseCase, (c) =>
    new GetPlanillaAsistenciaUseCase({
      planillaAsistenciaViewRepository: c.resolve(REPOSITORIOS_TOKENS.planillaAsistenciaViewRepository),
      logger: c.resolve(SERVICIOS_TOKENS.logger),
    }));
  registerComponent(container, ACADEMICO_TOKENS.getPlanillaAsistenciaController, (c) =>
    new GetPlanillaAsistenciaController({
      useCase: c.resolve(ACADEMICO_TOKENS.getPlanillaAsistenciaUseCase),
      responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
    }));
  registerComponent(container, ACADEMICO_TOKENS.asistenciaRouter, (c) =>
    buildAsistenciaRouter({ controllers: { /* … */ }, middlewares: { validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest) } }));
}
// repo/viewRepo → use-case (lógica) → controller (delgado) → router → token.
```

## 7. Mutaciones

| Op | Permiso | Base use case |
|----|---------|---------------|
| POST `/` | CREAR | `BaseCreateUseCase` |
| PUT/PATCH `/:id` | EDITAR | `BaseUpdateUseCase` |
| DELETE `/:id` | ELIMINAR | soft delete (`deleted_at`) |

Orden router: estáticas (`/matriz`, `/marcar-vigente`) **antes** de `/:id`.

## 8. Checklist express — nuevo endpoint

- [ ] DDL = modelo Sequelize = columnas en `findAll` (desalineado → 500).
- [ ] `getSearchFields()` usa atributos Sequelize, no columnas SQL.
- [ ] `dataFieldName` igual en use case, controller y `dataKey` frontend.
- [ ] `build*Router` con auth + `verificarPermiso` + validator.
- [ ] Container + tokens + `register*Module` + montaje en `routes/index.js`.
- [ ] Permisos en el archivo del módulo (`02-seeders/5x-seed-permisos-<mod>.sql`: permiso + acciones + roles_permisos, refs por código) + fila en matriz (ver `incos-rbac`).
- [ ] `GET /:id` lanza `NotFoundError`; va después de rutas estáticas.
- [ ] Prueba curl con rol con y sin permiso.

## 9. Errores frecuentes

1. Columnas en el modelo que no existen en MySQL → 500 en listado.
2. `dataFieldName` distinto entre capas → UI vacía con 200 OK.
3. `getSearchFields` con nombres SQL en vez de atributos Sequelize.
4. `GET /:id` antes que rutas fijas → "matriz" interpretado como id.
5. Router/use case no registrado en container → 404/500.
6. Vista SQL no recreada tras cambio de columnas → mapper con `undefined`.
7. Permiso del router ≠ seed 54 → 403 con rol que sí ve el menú.

## 10. Modelo de negocio — oferta académica e horarios

INCOS sigue siendo la **primera versión del sistema**. Los cambios en tablas
(`oferta_cursos`, `paralelos_gestion`, `asignacion_horarios`, etc.) son
**evolución de la lógica de negocio del instituto**, no una migración “V1 → V2”.

**No usar** en comentarios SQL/JS: `V1`, `V2`, `legacy`, “reemplaza tabla X”.
**Usar** descripción del dominio:

| Concepto | Tabla/columna | Notas |
|----------|---------------|-------|
| Oferta por gestión | `paralelos_gestion` + `oferta_cursos` | Materia ofertada en un paralelo de una gestión |
| Matrícula estable | `matriculas_materia.oferta_curso_id` | Ancla al curso ofertado durante la gestión |
| Docente ↔ oferta | `asignaciones_docentes.oferta_curso_id` | Una oferta puede tener docente asignado |
| Bloques horario | `asignacion_horarios` | Cuelgan de `asignacion_docente_id`, no de un curso suelto |
| Alias en vistas | `curso_id` | Alias de `oferta_cursos.id` para vistas/reportes dependientes |

En headers de vistas (`03-views/`), schemas (`01-schemas/`) y seeders: bloque
`-- Modelo de negocio:` cuando la vista dependa de esas relaciones.
