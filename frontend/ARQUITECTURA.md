# Arquitectura del Proyecto - Clean Architecture + Atomic Design

## 📐 Estructura Actual (CORRECTA)

```
src/
├── domain/                  # 🟢 DOMAIN LAYER (Reglas de negocio puras)
│   ├── entities/           # Entidades de dominio (Student, etc.)
│   ├── repositories/       # Interfaces/Contratos (IStudentRepository)
│   └── useCases/           # Casos de uso (CreateStudentUseCase)
│
├── application/             # 🟡 APPLICATION LAYER (Orquestación)
│   └── modules/            # Módulos de aplicación
│       └── estudiantes/
│           ├── hooks/      # Custom hooks (useCreateStudent)
│           └── providers/ # Providers (StudentProvider)
│
├── infrastructure/         # 🔵 INFRASTRUCTURE LAYER (Implementaciones técnicas)
│   ├── api/                # ✅ Cliente HTTP (axios, fetch)
│   ├── repositories/       # ✅ Implementaciones de repositorios (StudentRepository)
│   ├── storage/            # ✅ Adaptadores de almacenamiento (LocalStorageAdapter)
│   └── config/             # ✅ Configuraciones técnicas
│       ├── theme/          # 🎨 CONFIGURACIÓN del tema Ant Design (colores, spacing, componentes)
│       │   ├── colors.js
│       │   ├── spacing.js
│       │   ├── components/
│       │   └── ...
│       ├── styles/         # ⚙️ INICIALIZACIÓN técnica de estilos (inyecta variables CSS)
│       │   ├── css-variables.js  # Inyecta variables CSS desde theme
│       │   └── init.js           # Inicializa el sistema de estilos
│       └── theme.config.js # Combina theme/ en objeto para Ant Design
│
├── presentation/            # 🟣 PRESENTATION LAYER (UI)
│   ├── components/         # Componentes organizados por Atomic Design
│   │   ├── atoms/         # Componentes atómicos
│   │   ├── molecules/     # Moléculas
│   │   └── organisms/      # Organismos
│   ├── pages/             # Páginas
│   ├── templates/          # Templates (MainLayout)
│   ├── styles/            # 📝 ARCHIVOS CSS reales (reset, global, componentes)
│   │   ├── base/          # reset.css, global.css
│   │   ├── layout/        # header.css, sider.css, content.css
│   │   ├── components/   # Estilos de componentes (atoms, molecules, organisms)
│   │   └── pages/        # Estilos de páginas
│   └── assets/            # ✅ Recursos de UI (imágenes, iconos)
│
└── router/                 # 🟠 ROUTING (Puede estar en presentation o separado)
```

## 🔍 DIFERENCIAS CLAVE: `infrastructure/config/styles/` vs `presentation/styles/`

### ⚙️ `infrastructure/config/styles/` (TÉCNICO)
**Propósito**: Inicialización técnica del sistema de estilos

- `css-variables.js` → **CÓMO** inyecta variables CSS en el DOM desde el tema JS
- `init.js` → **CÓMO** inicializa el sistema completo (tema + variables + CSS)

**Es configuración técnica**: No contiene estilos visuales, solo lógica de inicialización

### 📝 `presentation/styles/` (VISUAL)
**Propósito**: Archivos CSS reales que definen la apariencia visual

- `base/reset.css` → Reset CSS
- `base/global.css` → Estilos globales
- `layout/header.css` → Estilos del header
- `components/atoms/button.css` → Estilos de botones
- etc.

**Es presentación visual**: Contiene las reglas CSS que se aplican a los componentes

### 📊 Comparación

| Aspecto | `infrastructure/config/styles/` | `presentation/styles/` |
|---------|--------------------------------|------------------------|
| **Tipo** | JavaScript (lógica) | CSS (estilos) |
| **Propósito** | Inicializar sistema | Definir apariencia |
| **Contenido** | Funciones que inyectan variables | Reglas CSS visuales |
| **Ejemplo** | `root.style.setProperty('--color-primary', ...)` | `.button { color: var(--color-primary); }` |
| **Ubicación** | Infrastructure (técnico) | Presentation (visual) |

## ✅ ¿Por qué Infrastructure tiene repositories, storage y api?

**Infrastructure ES la capa técnica por definición en Clean Architecture.**

### Principio de Dependency Inversion:
- **Domain**: Define INTERFACES (IStudentRepository) - NO depende de nada
- **Infrastructure**: IMPLEMENTA esas interfaces (StudentRepository) - Depende de Domain

```
Domain (domain/repositories/IStudentRepository.js)
    ↑ (define interfaz)
    |
Infrastructure (infrastructure/repositories/StudentRepository.js)
    ↑ (implementa la interfaz usando api, storage, etc.)
```

### Ejemplo del flujo:
1. **Domain** define: `IStudentRepository.create()`
2. **Infrastructure** implementa: `StudentRepository.create()` usando `apiClient.post()`
3. **Application** usa: `CreateStudentUseCase` que recibe `IStudentRepository` (abstracción)
4. **Presentation** usa: `StudentProvider` que inyecta `StudentRepository` (implementación)

## 📋 Responsabilidades por Capa

### 🟢 Domain (Domain Layer)
- **Entidades**: Lógica de negocio pura (Student.validate(), Student.getAge())
- **Interfaces**: Contratos que deben cumplir las implementaciones
- **Casos de Uso**: Orquestan la lógica de negocio
- **NO depende de**: Infrastructure, Presentation, Application

### 🟡 Application Layer
- **Hooks**: Lógica de aplicación (useCreateStudent)
- **Providers**: Estado y contexto (StudentProvider)
- **Depende de**: Domain (useCases, entities)
- **Usa**: Infrastructure (pero a través de abstracciones)

### 🔵 Infrastructure Layer
- **API**: Cliente HTTP (axios, fetch)
- **Repositories**: Implementaciones técnicas de las interfaces de Domain
- **Storage**: Adaptadores de almacenamiento (localStorage, IndexedDB)
- **Config**: Configuraciones técnicas
  - **theme/**: Configuración del tema (colores, spacing, componentes)
  - **styles/**: Inicialización técnica (inyección de variables CSS)
- **Depende de**: Domain (implementa sus interfaces)

### 🟣 Presentation Layer
- **Components**: UI organizada por Atomic Design
- **Pages**: Páginas de la aplicación
- **Styles**: Archivos CSS reales (reset, global, componentes)
- **Assets**: Recursos de UI (imágenes, iconos)
- **Templates**: Layouts
- **Depende de**: Application (hooks, providers), Domain (entities)

## ❓ Preguntas Frecuentes

### ¿Por qué `assets/` está en `presentation/`? ¿No sobrecarga el layer?

**NO, no sobrecarga.** Los assets (imágenes, iconos) SON parte de la UI:
- Se usan en componentes de presentación
- Son recursos visuales
- Pertenecen naturalmente a la capa de presentación

**Es como tener**: `presentation/components/` + `presentation/styles/` + `presentation/assets/`
Todos son parte de la presentación visual.

### ¿Por qué separar `theme/` y `styles/` en `infrastructure/config/`?

**Ya están separados correctamente:**
- `theme/` = **QUÉ** configuración (colores, spacing, componentes)
- `styles/` = **CÓMO** inicializar (inyectar variables, inicializar sistema)

**Son responsabilidades diferentes:**
- `theme/` define la configuración
- `styles/` usa esa configuración para inicializar el sistema

### ¿Por qué `core/` se llama `domain/`?

**`domain/` es más descriptivo** según Clean Architecture:
- "Domain" = Dominio del negocio
- "Core" = Más genérico, puede confundirse

**Recomendación**: Renombrar `core/` → `domain/` para mayor claridad.

## 🎯 Atomic Design en Presentation

```
presentation/
├── components/
│   ├── atoms/          # Botones, Inputs, Avatares
│   ├── molecules/       # FormField, NavigationMenu
│   └── organisms/      # GenericForm, WizardForm
├── pages/              # Dashboard, Estudiantes/List
└── templates/          # MainLayout
```

## 🔄 Flujo de Dependencias (CORRECTO)

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure → Domain
```

**Regla**: Las dependencias solo van hacia adentro (hacia Domain), nunca hacia afuera.

## ✅ Tu Estructura es CORRECTA

- ✅ `domain/` (o `core/`) = Domain Layer
- ✅ `infrastructure/repositories` = Implementaciones técnicas (CORRECTO)
- ✅ `infrastructure/storage` = Adaptadores técnicos (CORRECTO)
- ✅ `infrastructure/api` = Cliente HTTP técnico (CORRECTO)
- ✅ `infrastructure/config/theme/` = Configuración del tema (CORRECTO)
- ✅ `infrastructure/config/styles/` = Inicialización técnica (CORRECTO)
- ✅ `presentation/styles/` = Archivos CSS visuales (CORRECTO)
- ✅ `presentation/assets/` = Recursos de UI (CORRECTO)

## 📝 Recomendaciones

1. **Renombrar `core/` → `domain/`** (más descriptivo)
2. **Mantener `theme/` y `styles/` separados** (ya lo están, perfecto)
3. **Mover `assets/` → `presentation/assets/`** (si aún no está)
