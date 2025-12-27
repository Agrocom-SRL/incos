# Arquitectura del Router - Clean Architecture + SOLID

## Análisis de la Estructura Actual

### Estado Actual:
```
router/
├── AppRouter.jsx          # Factory que crea el router
├── index.jsx              # Componente que exporta RouterProvider
├── config/
│   └── routesConfig.js    # Agrupa todas las rutas
├── modules/               # Definiciones de rutas por módulo
└── utils/                 # Servicios técnicos
    ├── menuGeneratorService.js
    ├── routeMapperService.js
    └── routeNormalizer.js
```

### Problemas Identificados:
1. ❌ `utils/` es un nombre genérico que no describe responsabilidades
2. ❌ Servicios técnicos mezclados con configuración
3. ❌ Difícil entender qué es infraestructura vs presentación
4. ❌ Nombres inconsistentes (Service, Normalizer, Mapper)

---

## Propuesta: Clean Architecture para Router

### Principios a Aplicar:

1. **Clean Architecture Layers:**
   - **Infrastructure**: Implementaciones técnicas (react-router-dom)
   - **Application**: Lógica de negocio de navegación (si aplica)
   - **Presentation**: Definiciones de rutas y componentes

2. **SOLID Principles:**
   - **Single Responsibility**: Cada archivo tiene una responsabilidad clara
   - **Open/Closed**: Extensible sin modificar código existente
   - **Dependency Inversion**: Depende de abstracciones, no implementaciones

3. **Naming Conventions:**
   - **Factory**: `create*` o `*Factory`
   - **Service**: Operaciones que transforman datos
   - **Adapter**: Adapta interfaces externas
   - **Config**: Configuración estática

---

## Estructura Propuesta

### Opción 1: Router como Infrastructure (Recomendada)

El router es **Infrastructure** porque:
- Implementa tecnología externa (react-router-dom)
- Es una implementación técnica, no lógica de negocio
- Puede ser intercambiado por otra librería de routing

```
infrastructure/
└── navigation/
    ├── router/
    │   ├── createAppRouter.js        # Factory del router
    │   └── routerConfig.js           # Configuración centralizada
    ├── services/
    │   ├── menuGenerator.js          # Genera menú desde rutas
    │   ├── routeMapper.js            # Mapea keys del menú ↔ rutas
    │   └── routeNormalizer.js        # Normaliza paths de rutas
    └── index.js                      # Exporta factory

presentation/
└── routes/                           # Definiciones de rutas (metadata + componentes)
    └── modules/
        ├── estudiantes.routes.jsx
        ├── dashboard.routes.jsx
        └── ...
```

### Opción 2: Router Independiente (Actual, Mejorada)

Mantener `router/` independiente pero con mejor organización:

```
router/
├── factories/
│   └── createAppRouter.js            # Factory pattern - crea el router
├── config/
│   └── routesConfig.js               # Configuración centralizada
├── services/                         # Servicios técnicos (renombrado de utils/)
│   ├── menuGenerator.js              # Genera estructura del menú
│   ├── routeMapper.js                # Mapea keys ↔ rutas
│   └── routeNormalizer.js            # Normaliza paths
├── definitions/                      # Definiciones de rutas (renombrado de modules/)
│   └── [módulos].routes.jsx
├── adapters/                         # (Futuro) Adaptadores para guards, loaders
│   └── routeGuard.js                 # Guard para autenticación
└── index.jsx                         # Componente RouterProvider
```

---

## Recomendación Final: Opción 1 - Router como Infrastructure (MEJOR SEGÚN CLEAN ARCHITECTURE)

**¿Por qué Infrastructure es la opción correcta?**

Según Clean Architecture pura:
1. ✅ **Separación de responsabilidades**: Infrastructure contiene implementaciones técnicas
2. ✅ **Intercambiabilidad**: Puedes cambiar react-router-dom sin afectar lógica de negocio
3. ✅ **Dependencias claras**: Infrastructure depende de librerías externas, no al revés
4. ✅ **Testeabilidad**: Puedes mockear fácilmente la infraestructura de routing
5. ✅ **Prácticas de empresas grandes**: Meta, Google, Netflix estructuran routing como infrastructure

**Híbrido Inteligente:**
- **Infrastructure**: Implementación técnica del router (factory, servicios, normalizadores)
- **Presentation**: Definiciones de rutas con metadata de UI (menús, labels) - porque son parte de la presentación

Esta separación es la más limpia y sigue Clean Architecture estrictamente.

**Mejoras propuestas:**

1. **Renombrar `utils/` → `services/`**
   - Más descriptivo: son servicios que procesan datos
   - Con consistencia: todos terminan en `.js` (sin Service en nombre)

2. **Renombrar `modules/` → `definitions/`**
   - Más claro: son definiciones de rutas
   - Evita confusión con application/modules

3. **Crear `factories/` para el factory**
   - Patrón claro: Factory Pattern
   - Separado de configuración

4. **Mejorar nombres de archivos:**
   - `menuGeneratorService.js` → `menuGenerator.js`
   - `routeMapperService.js` → `routeMapper.js`
   - `routeNormalizer.js` → ✅ (ya está bien)
   - `routerService.jsx` → `createAppRouter.js` → ✅ (ya está bien como AppRouter.jsx)

---

## Estructura Final Recomendada: Opción 1 (Clean Architecture Pura)

### Infrastructure Layer (Implementación Técnica)

```
infrastructure/
└── navigation/
    ├── router/
    │   ├── createAppRouter.js        # Factory: crea el router configurado
    │   └── routerConfig.js           # Config: agrupa rutas de presentation
    │
    └── services/
        ├── menuGenerator.js          # Genera menú desde rutas
        ├── routeMapper.js            # Mapea menuKey ↔ route
        └── routeNormalizer.js        # Normaliza paths para react-router
```

### Presentation Layer (Definiciones y Metadata)

```
presentation/
└── routes/                           # Definiciones de rutas con metadata UI
    └── modules/
        ├── estudiantes.routes.jsx
        ├── dashboard.routes.jsx
        ├── gestiones.routes.jsx
        └── ... (todos los módulos)
```

### Entry Point (App Level)

```
src/
└── App.jsx                          # Usa infrastructure/navigation/router
```

---

## Mapeo de Responsabilidades (Clean Architecture)

| Archivo | Responsabilidad | Patrón | Capa | Ubicación |
|---------|----------------|--------|------|-----------|
| `createAppRouter.js` | Crear y configurar router | Factory | Infrastructure | `infrastructure/navigation/router/` |
| `routerConfig.js` | Agrupar rutas de presentation | Config | Infrastructure | `infrastructure/navigation/router/` |
| `menuGenerator.js` | Generar menú desde rutas | Service | Infrastructure | `infrastructure/navigation/services/` |
| `routeMapper.js` | Mapear keys ↔ rutas | Service | Infrastructure | `infrastructure/navigation/services/` |
| `routeNormalizer.js` | Normalizar paths | Service | Infrastructure | `infrastructure/navigation/services/` |
| `*.routes.jsx` | Definir rutas y metadata UI | Definition | **Presentation** | `presentation/routes/modules/` |

**Flujo de Dependencias (Clean Architecture):**
```
presentation/routes/ (define rutas)
    ↓ (exporta)
infrastructure/navigation/router/routerConfig.js (agrupa)
    ↓ (usa)
infrastructure/navigation/services/ (procesa)
    ↓ (configura)
infrastructure/navigation/router/createAppRouter.js (factory)
    ↓ (proporciona)
App.jsx (consume)
```

---

## Ventajas de la Opción 1 (Infrastructure)

1. ✅ **Clean Architecture Pura**: Respeta las capas estrictamente
2. ✅ **SOLID**: Single Responsibility bien aplicado en cada capa
3. ✅ **Separación clara**: Infrastructure (técnico) vs Presentation (UI/metadata)
4. ✅ **Testeabilidad**: Mock fácil de infrastructure sin tocar presentation
5. ✅ **Escalabilidad**: Fácil agregar guards, loaders, adapters en infrastructure
6. ✅ **Intercambiabilidad**: Puedes cambiar react-router-dom sin afectar presentation
7. ✅ **Práctica empresarial**: Sigue estándares de empresas grandes (Meta, Google, Netflix)
8. ✅ **Mantenibilidad**: Fácil encontrar qué hace cada archivo según su capa

---

## Comparación Final

### Opción 1: Infrastructure (✅ RECOMENDADA - Clean Architecture Pura)
- ✅ Separa claramente infrastructure de presentation
- ✅ Sigue principios de Clean Architecture estrictamente
- ✅ Más profesional y escalable
- ✅ Práctica de empresas grandes
- ⚠️ Requiere mover archivos entre capas

### Opción 2: Router Independiente
- ✅ Todo en un lugar (cohesión)
- ✅ Más simple de implementar
- ❌ No sigue Clean Architecture estrictamente
- ❌ Mezcla responsabilidades de diferentes capas

## Decisión: Opción 1 (Infrastructure)

**Recomendación clara**: Opción 1 es la mejor según Clean Architecture porque:
1. El router ES infrastructure - es implementación técnica de react-router-dom
2. Las definiciones de rutas SON presentation - tienen metadata de UI (menús, labels)
3. La separación es limpia y sigue principios SOLID
4. Es la práctica estándar en proyectos enterprise

---

## Próximos Pasos (Implementación Opción 1)

1. **Crear estructura en infrastructure:**
   - `infrastructure/navigation/router/`
   - `infrastructure/navigation/services/`

2. **Mover archivos técnicos a infrastructure:**
   - `router/AppRouter.jsx` → `infrastructure/navigation/router/createAppRouter.js`
   - `router/config/routesConfig.js` → `infrastructure/navigation/router/routerConfig.js`
   - `router/utils/*.js` → `infrastructure/navigation/services/*.js`

3. **Mover definiciones a presentation:**
   - `router/modules/*.routes.jsx` → `presentation/routes/modules/*.routes.jsx`

4. **Actualizar imports y alias:**
   - Actualizar todos los imports afectados
   - Actualizar `vite.config.js` con nuevos alias
   - Crear alias: `@navigation` → `infrastructure/navigation`

5. **Actualizar entry point:**
   - `router/index.jsx` puede moverse a `infrastructure/navigation/index.jsx` o mantenerse como wrapper en App.jsx

