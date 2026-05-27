# Documento 7 — Arquitectura de módulos backend (INCOS)

**Versión:** 1.0  
**Fecha:** 2026-05-27  

**Complementa:** `docs/04_guia_implementacion_listado_modulo.md`, `docs/05_guia_implementacion_detalle_modulo.md`, `docs/06_arquitectura_modulos_frontend.md`, `docs/matriz-permisos-sistema.md`.

**Par frontend:** el menú y las carpetas UI se documentan en el doc **06**; aquí el flujo inverso desde HTTP hasta MySQL.

---

## 1. Capas y flujo de una petición

```
Cliente (React)
    → GET /api/v1/<recurso>  (+ query: pagina, limite, busqueda, filtros)
        → presentation/routes/<recurso>.routes.js
            → authenticate → verificarPermiso(codigo, accion) → validators → validateRequest
                → presentation/controllers/.../list.controller.js (BaseListController)
                    → application/use-cases/.../List*UseCase.js (BaseListUseCase)
                        → infrastructure/repositories/*Repository.js (BaseRepository.findAll)
                            → infrastructure/database/models/*.js (Sequelize)
                                → MySQL
                    ← entities → application/mappers/*Mapper.js → DTO JSON
            ← responseFormatter { success, data, pagination? }
```

**Regla:** la lógica de negocio vive en **use cases**; controllers solo adaptan HTTP; repositorios solo persistencia/consulta.

---

## 2. Árbol de carpetas por responsabilidad

No se organiza por menú frontend: en backend cada **recurso REST** (`carreras`, `materias`, `docentes`) tiene su router, container y casos de uso. Varios recursos del mismo dominio de negocio comparten carpeta `application/use-cases/configuracion/`.

```
backend/
├── database/
│   ├── 01-schemas/          # DDL tablas
│   ├── 02-seeders/          # 53 roles, 54 permisos, 56 permiso_acciones, 55 roles_permisos
│   └── 03-views/            # Vistas lectura (fichas complejas, ej. docente)
├── src/
│   ├── domain/
│   │   ├── entities/        # Entidades de dominio (opcional según recurso)
│   │   └── interfaces/repositories/   # I*Repository
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── base/        # BaseListUseCase, BaseCreateUseCase, …
│   │   │   ├── docentes/
│   │   │   └── configuracion/   # ListCarrerasUseCase, GetPlanEstudiosByIdUseCase, …
│   │   └── mappers/         # DTO presentación API (CareerMapper, TeacherListMapper)
│   ├── infrastructure/
│   │   ├── database/models/
│   │   ├── repositories/    # *Repository extends BaseRepository
│   │   ├── mappers/         # Sequelize row ↔ entidad dominio (CareerMapper infra)
│   │   └── container/
│   │       ├── tokens/      # CONFIGURACION_TOKENS, DOCENTES_TOKENS, REPOSITORIOS_TOKENS
│   │       └── modules/
│   │           ├── docentes/
│   │           └── configuracion/   # carreras.container.js, materias, planes-estudios
│   └── presentation/
│       ├── routes/          # build*Router + montaje en routes/index.js
│       ├── controllers/     # Por dominio/recurso (configuracion/carreras/list.controller.js)
│       ├── validators/      # common/ + configuracion/carreras.validator.js
│       └── middleware/      # auth, permisos, validateRequest
```

---

## 3. Recurso REST — piezas obligatorias (listado)

| # | Artefacto | Ubicación típica |
|---|-----------|------------------|
| 1 | Modelo Sequelize | `infrastructure/database/models/<tabla>.js` |
| 2 | Interfaz dominio | `domain/interfaces/repositories/I*Repository.js` |
| 3 | Repositorio | `infrastructure/repositories/*Repository.js` — `getSearchFields()`, `getCollectionName()` |
| 4 | Mapper aplicación | `application/mappers/<dominio>/*Mapper.js` — `entitiesToPresentation` |
| 5 | List use case | `application/use-cases/.../List*UseCase.js` extends `BaseListUseCase` |
| 6 | List controller | `presentation/controllers/.../list.controller.js` extends `BaseListController` |
| 7 | Validators | `listValidator` (common) + create/update en `validators/<dominio>/` |
| 8 | Router factory | `presentation/routes/<recurso>.routes.js` — `build*Router({ controllers, middlewares })` |
| 9 | Container recurso | `infrastructure/container/modules/<modulo>/<recurso>.container.js` |
| 10 | Tokens | `infrastructure/container/tokens/<modulo>.tokens.js` |
| 11 | Registro módulo | `register*Module` en `container/modules/<modulo>/index.js` |
| 12 | Montaje API | `presentation/routes/index.js` → `router.use('/carreras', …)` |

### 3.1 Cadena middleware en `GET /`

```javascript
router.get(
  '/',
  authenticate,
  verificarPermiso('configuracion.carrera', 'LISTAR'),
  listValidator,
  validateRequest,
  (req, res, next) => controllers.listCarrerasController.handle(req, res, next),
);
```

- **`listValidator`:** normaliza `pagina`, `limite`, `busqueda` (máximo de filas acorde a política del sistema).
- **`verificarPermiso`:** consulta vistas de permisos efectivos; 403 si falla (ver matriz).

### 3.2 Respuesta estándar listado

```json
{
  "success": true,
  "data": {
    "carreras": [ /* DTOs */ ]
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

`dataFieldName` del use case (**español**, p. ej. `carreras`) debe coincidir con la clave en `data` y con lo que el frontend lee en `createApiHook` (`dataKey`).

`collectionFieldName` (**inglés**, p. ej. `careers`) es el nombre interno que devuelve el repositorio en el objeto intermedio del `BaseListUseCase`.

---

## 4. Recurso REST — piezas obligatorias (detalle `GET /:id`)

| # | Artefacto | Notas |
|---|-----------|--------|
| 1 | Vista SQL (si ficha rica) | `database/03-views/` — recrear en BD tras cambios |
| 2 | Repositorio | `findById` o `findDetailBundleBy*Id` |
| 3 | Get use case | `execute(id)` → `NotFoundError` si null |
| 4 | Mapper detalle | DTO anidado: `profile`, `assignments`, … |
| 5 | Get controller | `BaseGetController`, `dataFieldName` coherente |
| 6 | Router | `GET /:id` **después** de `GET /` y rutas estáticas (`/matriz`, `/validar`) |

**CFG plan de estudio:** además de `GetPlanEstudiosByIdUseCase`, endpoints especializados `GET /planes-estudios/:id/matriz` y `/validar` con permisos `configuracion.plan-estudio` (+ acciones de periodos/asignaturas en mutaciones).

---

## 5. Contenedor de inyección (patrón INCOS)

Cada **recurso** tiene un `register*Resource(container)`:

1. Registra use cases con `registerComponent(container, TOKEN, factory)`.
2. Registra controllers resolviendo use cases + `responseFormatter` + `logger`.
3. Construye router: `buildCarrerasRouter({ controllers: { … }, middlewares: { validateRequest } })`.
4. Registra el router en un token (`CONFIGURACION_TOKENS.carrerasRouter`).

El **módulo** (`registerConfiguracionModule`) solo compone recursos:

```javascript
export function registerConfiguracionModule(container) {
  registerCarrerasResource(container);
  registerMateriasResource(container);
  registerPlanesEstudiosResource(container);
  return container;
}
```

Los **repositorios** se registran una vez en `repositories.container.js` (`REPOSITORIOS_TOKENS.careerRepository`, etc.).

---

## 6. RBAC y seeders (siempre con el recurso nuevo)

| Archivo | Contenido |
|---------|-----------|
| `54-seed-permisos.sql` | Fila en `permisos`: `codigo`, `dominio`, `modulo`, `grupo_ui`, `ruta_sidebar` |
| `56-seed-permiso-acciones.sql` | Acciones permitidas para ese `permiso_id` (`LISTAR`, `DETALLE`, …) |
| `55-seed-roles-permisos.sql` | Asignación `(rol_id, permiso_id, accion)` por rol operativo |
| `matriz-permisos-sistema.md` | Documentar pantalla ↔ permiso ↔ API |

Código en router debe usar el **mismo** `codigo` string que `permisos.codigo` (ej. `configuracion.carrera`, no `cfg.academico.carreras`).

`ADMIN_SISTEMA` (rol 1): sin filas en 55; permisos desde catálogo 56 vía `AuthRepository`.

---

## 7. Referencia rápida — Docentes (listado + detalle)

| Capa | Listado | Detalle |
|------|---------|---------|
| Modelo | `infrastructure/database/models/docente.js` | + vistas `50–52` |
| Repositorio | `TeacherRepository.js` | `findDetailBundleByTeacherId` |
| Use case | `ListTeachersUseCase.js` | `GetTeacherDetailUseCase.js` |
| Mapper app | `TeacherListMapper.js` | `TeacherDetailPresentationMapper.js` |
| Controller | `docentes/list.controller.js` | `get-by-id.controller.js` |
| Router | `docentes.routes.js` | `GET /:id` con `DETALLE` |
| DI | `docentes.container.js`, `DOCENTES_TOKENS` | mismos |
| Permiso | `docentes.ver` + `LISTAR` | `docentes.ver` + `DETALLE` |

---

## 8. Referencia rápida — CFG Carreras (Sprint 1)

| Capa | Archivo |
|------|---------|
| DDL | `database/01-schemas/` (tabla `carreras`) |
| Modelo | `infrastructure/database/models/carrera.js` |
| Repositorio | `infrastructure/repositories/CareerRepository.js` |
| Use cases | `ListCarrerasUseCase`, `GetCarreraByIdUseCase`, `Create/Update/DeleteCarreraUseCase` |
| Mapper app | `application/mappers/configuracion/CareerMapper.js` |
| Controllers | `presentation/controllers/configuracion/carreras/*.controller.js` |
| Validators | `presentation/validators/configuracion/carreras.validator.js` |
| Router | `presentation/routes/carreras.routes.js` |
| DI | `container/modules/configuracion/carreras.container.js` |
| Módulo | `registerConfiguracionModule` en `configuracion/index.js` |
| API mount | `routes/index.js` → `/api/v1/carreras` |
| Permiso | `configuracion.carrera` (id 78) |

**Materias** y **planes-estudios** repiten el mismo esquema con sus archivos (`materias.container.js`, `planes-estudios.routes.js`, permisos 79–83).

---

## 9. Mutaciones (CREATE / UPDATE / DELETE)

| Operación | Permiso típico | Base use case | Notas |
|-----------|----------------|---------------|--------|
| POST `/` | `CREAR` | `BaseCreateUseCase` | Body validator dedicado |
| PUT/PATCH `/:id` | `EDITAR` | `BaseUpdateUseCase` | `idValidator` en ruta |
| DELETE `/:id` | `ELIMINAR` | soft delete en repositorio | `deleted_at` |

Orden en router: rutas estáticas (`/matriz`, `/marcar-vigente`) **antes** de `/:id`.

---

## 10. Errores frecuentes backend

1. **`dataFieldName` distinto** entre use case, controller y contrato frontend → UI vacía.
2. **`getSearchFields`** con nombres de columna SQL en lugar de atributos Sequelize.
3. **`GET /:id` antes que rutas fijas** → “matriz” interpretado como id.
4. **Permiso en router distinto al seed 54** → 403 en producción con rol correcto en UI.
5. **Vista SQL no recreada** tras cambio de columnas → mapper con `undefined`.
6. **Olvidar registrar** use case o router en container → 500 o 404 al montar API.

---

## 11. Checklist express — nuevo endpoint

- [ ] DDL y modelo alineados.
- [ ] Repositorio + interfaz dominio.
- [ ] Use case(s) + mapper presentación.
- [ ] Controller(s) base.
- [ ] `build*Router` con cadena auth + permiso + validator.
- [ ] Container + tokens + `register*Module`.
- [ ] `routes/index.js` montaje + entrada documentación `GET /`.
- [ ] Seeds 54 + 56 + 55 + fila en matriz.
- [ ] Prueba curl/Postman con rol con y sin permiso.

---

*Fin del documento 7.*
