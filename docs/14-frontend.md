# 14 - FRONTEND
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Enero 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Documento

Este documento describe en detalle la arquitectura, tecnologías, estructura y estándares de desarrollo del **frontend** del Sistema de Gestión Académica del Instituto INCOS Santa Cruz.

### 1.2 Alcance

El documento cubre:
- Stack tecnológico completo del frontend
- Arquitectura: Clean Architecture + Atomic Design
- Estructura de directorios y organización del código
- Tecnologías y librerías utilizadas
- Patrones de diseño aplicados
- Estándares de desarrollo

---

## 2. STACK TECNOLÓGICO

### 2.1 Framework y Librerías Principales

#### React 19.x
- **Versión:** 19.2.0
- **Justificación:**
  - Biblioteca más popular y estable para desarrollo de interfaces
  - Ecosistema maduro y extenso
  - Componentes reutilizables y composición
  - Virtual DOM para rendimiento optimizado
  - React Hooks para manejo de estado funcional

#### Vite 7.x
- **Versión:** 7.2.4
- **Justificación:**
  - Build tool extremadamente rápido (Hot Module Replacement instantáneo)
  - Desarrollo con ES modules nativos
  - Build optimizado para producción (tree-shaking, code splitting)
  - Configuración mínima requerida
  - Soporte nativo para TypeScript y JSX

#### Ant Design 6.x
- **Versión:** 6.0.1
- **Justificación:**
  - Component library completa y profesional
  - Componentes de formulario robustos y validados
  - Sistema de diseño consistente (colores, tipografía, espaciado)
  - Documentación excelente en español
  - Tematización y personalización del diseño
  - Componentes empresariales (tablas, formularios, modales, etc.)

**Componentes Ant Design más utilizados:**
- `Table`, `Form`, `Input`, `Button`, `Card`, `Modal`
- `Select`, `DatePicker`, `Upload`, `Pagination`
- `Layout`, `Menu`, `Breadcrumb`, `Avatar`
- `Message`, `Notification`, `Spin` (loading)

#### React Router DOM 7.x
- **Versión:** 7.10.1
- **Propósito:** Enrutamiento declarativo de la aplicación
- **Características:**
  - Rutas anidadas
  - Protected routes (rutas protegidas por autenticación)
  - Lazy loading de rutas
  - Navegación programática

---

### 2.2 Manejo de Estado

#### Zustand 5.x
- **Versión:** 5.0.9
- **Propósito:** State management ligero y simple
- **Justificación:**
  - API minimalista y fácil de usar
  - Menos boilerplate que Redux
  - No requiere Providers en la raíz
  - Perfecto para estado global de autenticación, usuario, etc.
  - Buen rendimiento con selectores optimizados

**Casos de uso:**
- Estado global de autenticación (usuario logueado, token)
- Estado de UI (sidebar abierto/cerrado, tema)
- Estado compartido entre múltiples componentes

#### TanStack React Query 5.x
- **Versión:** 5.90.12
- **Propósito:** Gestión de estado del servidor (server state)
- **Justificación:**
  - Caché automático de peticiones HTTP
  - Sincronización de datos en background
  - Revalidación automática
  - Optimistic updates
  - Manejo de estados de loading, error, success
  - Paginación y infinite scroll integrados

**Casos de uso:**
- Obtener listas de estudiantes, docentes, materias
- Consultar calificaciones, inscripciones
- Operaciones CRUD con caché inteligente

---

### 2.3 Formularios y Validación

#### React Hook Form 7.x
- **Versión:** 7.68.0
- **Propósito:** Manejo eficiente de formularios
- **Justificación:**
  - Menos re-renders (controla solo campos modificados)
  - Validación integrada
  - API declarativa
  - Excelente rendimiento con formularios complejos
  - Integración perfecta con Ant Design

#### Yup 1.x
- **Versión:** 1.7.1
- **Propósito:** Validación de schemas
- **Justificación:**
  - Schemas de validación declarativos
  - Validación compleja (dependencias entre campos)
  - Mensajes de error personalizables
  - Integración con React Hook Form via `@hookform/resolvers`

---

### 2.4 Peticiones HTTP

#### Axios 1.x
- **Versión:** 1.13.2
- **Propósito:** Cliente HTTP para comunicación con el backend
- **Características:**
  - Interceptores para añadir token JWT
  - Manejo centralizado de errores
  - Transformación automática de datos
  - Cancelación de requests

---

### 2.5 Utilidades

#### date-fns 4.x
- **Versión:** 4.1.0
- **Propósito:** Manipulación y formateo de fechas
- **Ventajas:**
  - Librería modular (tree-shaking friendly)
  - Funciones inmutables
  - Internacionalización (i18n) integrada

#### lodash-es 4.x
- **Versión:** 4.17.21
- **Propósito:** Funciones utilitarias para JavaScript
- **Uso:** Operaciones sobre arrays, objetos, strings, etc.

#### React Icons
- **Versión:** 5.5.0
- **Propósito:** Iconos vectoriales
- **Fuentes:** Font Awesome, Material Design, Ant Design Icons

---

## 3. ARQUITECTURA: CLEAN ARCHITECTURE + ATOMIC DESIGN

### 3.1 Clean Architecture en Frontend

El frontend sigue los principios de **Clean Architecture**, organizando el código en capas con responsabilidades claras:

```
src/
├── core/                    # Domain Layer (Lógica de negocio pura)
│   ├── entities/           # Entidades del dominio
│   ├── repositories/       # Interfaces de repositorios
│   ├── useCases/          # Casos de uso (lógica de negocio)
│   └── errors/            # Errores del dominio
│
├── infrastructure/         # Infrastructure Layer
│   ├── api/               # Cliente HTTP (Axios)
│   ├── repositories/      # Implementaciones de repositorios
│   └── storage/           # LocalStorage, SessionStorage
│
├── presentation/          # Presentation Layer
│   ├── components/        # Componentes React (Atomic Design)
│   ├── pages/            # Páginas/Vistas
│   ├── templates/        # Templates/Layouts
│   └── hooks/            # Custom React Hooks
│
└── shared/               # Código compartido
    ├── config/           # Configuraciones
    ├── constants/        # Constantes
    ├── types/           # Tipos TypeScript (si aplica)
    └── utils/           # Utilidades generales
```

#### 3.1.1 Domain Layer (`core/`)

**Responsabilidad:** Contiene la lógica de negocio pura, independiente de frameworks y librerías.

**Estructura:**
```
core/
├── entities/
│   ├── User.js          # Entidad Usuario
│   ├── Student.js       # Entidad Estudiante
│   ├── Course.js        # Entidad Curso
│   └── ...
│
├── repositories/
│   ├── IAuthRepository.js      # Interface repositorio de autenticación
│   ├── IStudentRepository.js   # Interface repositorio de estudiantes
│   └── ...
│
├── useCases/
│   ├── auth/
│   │   ├── LoginUseCase.js
│   │   ├── LogoutUseCase.js
│   │   └── RegisterUseCase.js
│   ├── students/
│   │   ├── RegisterStudentUseCase.js
│   │   ├── GetStudentUseCase.js
│   │   └── ...
│   └── ...
│
└── errors/
    ├── AuthErrors.js
    ├── StudentErrors.js
    └── ...
```

**Ejemplo de Entidad:**
```javascript
// core/entities/User.js
export class User {
  constructor({ id, email, username, role, nombre, apellidos }) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.role = role;
    this.nombre = nombre;
    this.apellidos = apellidos;
  }

  get fullName() {
    return `${this.nombre} ${this.apellidos}`.trim();
  }

  hasPermission(permission) {
    // Lógica de verificación de permisos
    return this.role.permissions.includes(permission);
  }
}
```

#### 3.1.2 Infrastructure Layer (`infrastructure/`)

**Responsabilidad:** Implementaciones concretas de las interfaces del dominio (API, almacenamiento, etc.).

**Estructura:**
```
infrastructure/
├── api/
│   └── client.js           # Configuración de Axios
│
├── repositories/
│   ├── AuthRepository.js   # Implementación HTTP de IAuthRepository
│   ├── StudentRepository.js
│   └── ...
│
└── storage/
    └── LocalStorageAdapter.js
```

**Ejemplo de Repositorio:**
```javascript
// infrastructure/repositories/AuthRepository.js
import { IAuthRepository } from '../../core/repositories/IAuthRepository.js';
import { apiClient } from '../api/client.js';
import { User } from '../../core/entities/User.js';

export class AuthRepository extends IAuthRepository {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return new User(response.data.user);
  }

  async logout() {
    await apiClient.post('/auth/logout');
  }
}
```

#### 3.1.2.1 Estándar de Implementación de Repositorios

Todos los repositorios deben seguir una estructura homogénea para mantener consistencia en el proyecto. Este estándar asegura que todos los repositorios compartan el mismo formato, comentarios y organización.

**Estructura Estándar de Repositorio:**

```javascript
/**
 * Implementación del Repositorio de [Nombre]
 * Implementa I[Nombre]Repository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para [nombre]
 * Liskov Substitution Principle: Puede reemplazar I[Nombre]Repository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { I[Nombre]Repository } from '@domain/repositories';
import { [NOMBRE]_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@config/api/responseHandler';

export class [Nombre]Repository extends I[Nombre]Repository {
  /**
   * Obtiene la lista de [nombre] con filtros y paginación
   * GET /v1/[nombre]?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get([NOMBRE]_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener [nombre]');
    }
  }

  /**
   * Crea un nuevo [nombre]
   * POST /v1/[nombre]
   * 
   * @param {Object} data - Datos del [nombre] a crear
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async crear(data) {
    try {
      // Llamada HTTP directa al endpoint
      const response = await apiClient.post([NOMBRE]_ENDPOINTS.BASE, data);

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear [nombre]');
    }
  }

}

export default new [Nombre]Repository();
```

**Características del Estándar:**

1. **Comentarios JSDoc consistentes:**
   - Header del archivo con descripción completa
   - Cada método documentado con `@param` y `@returns`
   - Endpoint HTTP documentado en el comentario del método

2. **Estructura de código uniforme:**
   - Mismo orden de imports (apiClient, interface, endpoints, handlers)
   - Mismo formato de try-catch
   - Mismo procesamiento de respuestas
   - Mismo manejo de errores

3. **Espaciado consistente:**
   - Línea en blanco entre métodos
   - Línea en blanco antes del `export default`
   - Indentación uniforme

4. **Manejo de errores estándar:**
   - Todos usan `handleErrorResponse()` con mensaje descriptivo
   - No procesan errores de validación (eso es responsabilidad del Use Case)
   - Retornan formato estándar: `{success, data?, error?}`

5. **Validación de datos:**
   - `obtenerTodos()` siempre asegura que `data` sea un array
   - Otros métodos retornan datos crudos del backend

**Ventajas de este estándar:**

- ✅ **Consistencia:** Todos los repositorios se ven y funcionan igual
- ✅ **Mantenibilidad:** Fácil de entender y modificar
- ✅ **Escalabilidad:** Fácil agregar nuevos métodos siguiendo el patrón
- ✅ **Onboarding:** Nuevos desarrolladores entienden rápidamente la estructura
- ✅ **Debugging:** Errores se manejan de forma predecible

**Nota:** Cuando se implementen métodos adicionales (actualizar, eliminar, etc.), deben seguir el mismo patrón de documentación y estructura.

#### 3.1.3 Presentation Layer (`presentation/`)

**Responsabilidad:** Componentes React, páginas y hooks que interactúan con el usuario.

**Organización:** **Atomic Design** (ver sección 3.2)

---

### 3.2 Atomic Design

El frontend utiliza **Atomic Design** para organizar los componentes de UI en una jerarquía clara y escalable:

```
presentation/
└── components/
    ├── atoms/              # Componentes básicos (botones, inputs, labels)
    ├── molecules/          # Combinaciones simples de átomos (form fields, cards)
    ├── organisms/          # Componentes complejos (formularios, headers, sidebars)
    ├── templates/          # Layouts (estructuras de página)
    └── pages/              # Páginas completas (combinan templates y organisms)
```

#### 3.2.1 Atoms (Átomos)

**Definición:** Componentes básicos e indivisibles, la unidad más pequeña de la UI.

**Ejemplos:**
- `Button` - Botón básico
- `Input` - Campo de entrada de texto
- `Typography` - Texto con variantes (h1, h2, p, span)
- `Avatar` - Imagen de perfil circular
- `Logo` - Logo del instituto
- `Divider` - Separador visual
- `Image` - Imagen optimizada

**Características:**
- No tienen dependencias de otros componentes
- Reutilizables en cualquier contexto
- Altamente configurables mediante props

**Estructura:**
```
atoms/
├── Button/
│   ├── Button.jsx
│   └── index.js
├── Input/
│   ├── Input.jsx
│   └── index.js
└── ...
```

#### 3.2.2 Molecules (Moléculas)

**Definición:** Combinaciones simples de átomos que forman componentes más complejos.

**Ejemplos:**
- `FormField` - Input + Label + Error message
- `ProductCard` - Card + Image + Typography + Button
- `NavigationMenu` - Lista de Items de navegación
- `SectionHeader` - Typography + Divider + Button opcional
- `SearchBar` - Input + Button de búsqueda
- `ActivityItem` - Avatar + Typography + Badge

**Características:**
- Combinan 2-5 átomos
- Tienen una responsabilidad específica
- Reutilizables en múltiples contextos

#### 3.2.3 Organisms (Organismos)

**Definición:** Componentes complejos que combinan moléculas y átomos para formar secciones funcionales de la UI.

**Ejemplos:**
- `Header` - Logo + NavigationMenu + UserMenu + Avatar
- `Sidebar` - NavigationMenu + UserProfile + LogoutButton
- `StudentForm` - Múltiples FormFields + Validación + SubmitButton
- `StudentTable` - Table + Pagination + Filters + Actions
- `ProductList` - Lista de ProductCards + Loading + Empty state
- `Banner` - BannerContent + Image + CTA Button

**Características:**
- Representan secciones completas de una página
- Pueden tener lógica de negocio (hooks, state)
- Altamente especializados para su contexto

#### 3.2.4 Templates (Plantillas)

**Definición:** Layouts o estructuras de página que definen la disposición general.

**Ejemplos:**
- `MainLayout` - Header + Sidebar + Content Area + Footer
- `AuthLayout` - Logo centrado + Form area
- `DashboardLayout` - Header + Sidebar + Main content + Right sidebar opcional

**Características:**
- Definen la estructura general, no el contenido específico
- Reutilizables para múltiples páginas
- Utilizan `children` para contenido dinámico

**Ejemplo:**
```javascript
// presentation/templates/MainLayout/MainLayout.jsx
import { Header } from '../../components/organisms/Header';
import { Sidebar } from '../../components/organisms/Sidebar';

export const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};
```

#### 3.2.5 Pages (Páginas)

**Definición:** Páginas completas que combinan templates con organisms y molecules.

**Ejemplos:**
- `Dashboard` - MainLayout + DashboardWidgets + Charts
- `StudentsList` - MainLayout + StudentTable + Filters + CreateButton
- `StudentDetail` - MainLayout + StudentInfo + EnrollmentHistory + GradesTable
- `Login` - AuthLayout + LoginForm

**Características:**
- Son las "rutas" de la aplicación
- Combinan múltiples organisms
- Contienen la lógica de página (data fetching, routing)

---

## 4. ESTRUCTURA DE DIRECTORIOS

### 4.1 Estructura Completa

```
frontend/
├── public/                    # Archivos estáticos
│   ├── favicon.ico
│   └── ...
│
├── src/
│   ├── assets/                # Recursos (imágenes, iconos, fuentes)
│   │   └── images/
│   │       └── branding/
│   │           ├── logo-horizontal.webp
│   │           └── logo-icon.webp
│   │
│   ├── core/                  # Domain Layer (Clean Architecture)
│   │   ├── entities/
│   │   │   ├── User.js
│   │   │   └── index.js
│   │   ├── repositories/
│   │   │   ├── IAuthRepository.js
│   │   │   └── index.js
│   │   ├── useCases/
│   │   │   ├── auth/
│   │   │   │   ├── LoginUseCase.js
│   │   │   │   ├── LogoutUseCase.js
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   └── errors/
│   │       ├── AuthErrors.js
│   │       └── index.js
│   │
│   ├── infrastructure/        # Infrastructure Layer
│   │   ├── api/
│   │   │   └── client.js      # Configuración de Axios
│   │   ├── repositories/
│   │   │   ├── AuthRepository.js
│   │   │   └── index.js
│   │   └── storage/
│   │       └── LocalStorageAdapter.js
│   │
│   ├── presentation/          # Presentation Layer
│   │   ├── components/        # Atomic Design
│   │   │   ├── atoms/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Typography/
│   │   │   │   ├── Avatar/
│   │   │   │   ├── Logo/
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── molecules/
│   │   │   │   ├── FormField/
│   │   │   │   ├── ProductCard/
│   │   │   │   ├── NavigationMenu/
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── organisms/
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── StudentForm/
│   │   │   │   ├── StudentTable/
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── templates/
│   │   │       ├── MainLayout/
│   │   │       └── AuthLayout/
│   │   │
│   │   ├── pages/            # Páginas/Rutas
│   │   │   ├── Dashboard/
│   │   │   ├── Students/
│   │   │   │   ├── StudentsList.jsx
│   │   │   │   ├── StudentDetail.jsx
│   │   │   │   └── StudentForm.jsx
│   │   │   ├── Login/
│   │   │   └── ...
│   │   │
│   │   └── hooks/            # Custom React Hooks
│   │       ├── useAuth.js
│   │       ├── useStudents.js
│   │       └── ...
│   │
│   ├── shared/               # Código compartido
│   │   ├── config/
│   │   │   └── theme.config.js
│   │   ├── constants/
│   │   │   └── index.js
│   │   └── utils/
│   │       └── formatDate.js
│   │
│   ├── styles/               # Estilos globales
│   │   ├── base/
│   │   │   ├── global.css
│   │   │   └── reset.css
│   │   ├── components/       # Estilos por componente
│   │   ├── theme/
│   │   │   ├── colors.css
│   │   │   └── typography.css
│   │   └── index.css
│   │
│   ├── App.jsx               # Componente raíz
│   └── main.jsx              # Punto de entrada
│
├── .env                      # Variables de entorno
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 5. FLUJO DE DATOS Y ESTADO

### 5.1 Flujo de Datos Típico

```
1. Usuario interactúa con componente (Presentation Layer)
   ↓
2. Componente llama a Use Case (Domain Layer)
   ↓
3. Use Case llama a Repository (Interface)
   ↓
4. Repository implementación (Infrastructure) hace petición HTTP
   ↓
5. Backend procesa y devuelve respuesta
   ↓
6. Repository convierte respuesta a Entidad del dominio
   ↓
7. Use Case procesa lógica de negocio
   ↓
8. Componente recibe resultado y actualiza UI
```

### 5.2 Gestión de Estado

#### Estado Local (Component State)
- **Cuando usar:** Estado que solo afecta a un componente
- **Cómo:** `useState`, `useReducer` de React

#### Estado Global (Zustand)
- **Cuando usar:** Estado compartido entre múltiples componentes
- **Ejemplos:**
  - Usuario autenticado
  - Token de acceso
  - Configuración de UI (tema, sidebar)
  - Estado de navegación

#### Estado del Servidor (React Query)
- **Cuando usar:** Datos que provienen del backend
- **Ejemplos:**
  - Lista de estudiantes
  - Calificaciones
  - Inscripciones
  - Cualquier dato que se cachea y sincroniza

### 5.3 Organización de Custom Hooks

El frontend sigue una organización clara de hooks para mantener la separación de responsabilidades y facilitar la escalabilidad.

#### Estructura de Hooks

**1. Hooks de Contexto**
- **Propósito:** Consumir el contexto proporcionado por Providers
- **Ejemplo:** `useStudentContext` - Acceder al contexto de estudiantes
- **Uso:** En componentes que necesitan datos del contexto

**2. Hooks de API (Llamadas al Backend)**
- **Formato:** `use[Entidad]Api`
- **Ejemplo:** `useEstudiantesApi`, `useBecasApi`
- **Propósito:** Manejar todas las llamadas a la API relacionadas con una entidad
- **Responsabilidad:** Solo maneja la comunicación con la API (loading, error, refetch)
- **No contiene:** Lógica de UI, búsqueda, filtrado, formateo
- **Flujo:** Hook → Use Case → Repository → API

**3. Hooks de Feature (Lógica de UI por Feature)**
- **Formato:** `use[Entidad][Feature]`
- **Ejemplo:** `useEstudiantesList`, `useEstudiantesBecas`
- **Propósito:** Combinar datos de API + lógica de búsqueda/filtrado + formateo
- **Usa:** Hooks de API + Hooks genéricos
- **Específico para:** Una feature/UI específica

**4. Hooks Genéricos (Reutilizables)**
- **Formato:** `use[Funcionalidad]`
- **Ejemplo:** `useTableData`, `useFormData`
- **Propósito:** Lógica reutilizable no específica de una entidad
- **Ubicación:** Co-localizados con sus componentes (ej: `useTableData` en `@molecules/DataTable`)
- **Uso:** Puede ser usado por cualquier feature que necesite la funcionalidad

#### Flujo de Datos con Hooks

```
Componente (Page)
    ↓
useStudentContext()  ← Consume el contexto
    ↓
StudentProvider
    ↓
useEstudiantesList()  ← Feature hook (combina API + UI)
    ↓
    ├─→ useEstudiantesApi()  ← API hook (llamadas al backend)
    │       ↓
    │   Use Case → Repository → API
    │
    └─→ useTableData()  ← Generic hook (búsqueda/filtrado) [desde @molecules/DataTable]
```

#### Co-localización de Hooks

Los hooks genéricos que pertenecen a componentes específicos se co-localizan con sus componentes:

```
molecules/
└── DataTable/
    ├── DataTable.jsx
    ├── index.js              # Exporta componente + hook
    └── hooks/
        └── useTableData.js   # Hook co-localizado

organisms/
└── Sidebar/
    ├── Sidebar.jsx
    ├── index.js              # Exporta componente + hook
    └── hooks/
        └── useSidebarState.js # Hook co-localizado
```

**Ventajas:**
- ✅ Código relacionado está junto
- ✅ Fácil de encontrar y mantener
- ✅ Patrón consistente entre componentes

#### Cómo Agregar una Nueva Feature

**Ejemplo: Agregar Feature de Becas**

1. **Crear hook de API** (si es necesario):
```javascript
// hooks/useBecasApi.js
export const useBecasApi = () => {
  // Llamadas a la API de becas
};
```

2. **Crear hook de feature**:
```javascript
// hooks/useEstudiantesBecas.js
import { useBecasApi } from './useBecasApi';
import { useTableData } from '@molecules';

export const useEstudiantesBecas = () => {
  const { becas, loading, error, refetch } = useBecasApi();
  const { searchText, setSearchText, filteredData } = useTableData(becas, getSearchFields);
  
  return {
    becas: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
```

3. **Agregar al Provider**:
```javascript
// providers/StudentProvider.jsx
import { useEstudiantesBecas } from '@application-estudiantes/hooks';

const becasData = useEstudiantesBecas();

const value = {
  ...listData,
  ...becasData,  // Agregar aquí
};
```

4. **Exportar en index.js**:
```javascript
// hooks/index.js
export { useEstudiantesBecas } from './useEstudiantesBecas';
```

#### Ventajas de esta Organización

1. **Separación de responsabilidades:** API separado de UI
2. **Escalabilidad:** Cada feature tiene su propio hook, no crece un solo hook
3. **Reutilización:** Hooks genéricos pueden ser usados por múltiples features
4. **Claridad:** Los nombres indican claramente el propósito
5. **Mantenibilidad:** Fácil de encontrar y modificar código específico

---

## 6. INTEGRACIÓN CON BACKEND

### 6.1 Cliente HTTP (Axios)

**Configuración base:** `infrastructure/api/client.js`

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

### 6.2 Autenticación

**Flujo de autenticación:**
1. Usuario ingresa credenciales en LoginForm
2. Se llama a `LoginUseCase`
3. UseCase usa `AuthRepository` para hacer POST a `/auth/login`
4. Backend devuelve token JWT + datos de usuario
5. Token se guarda en LocalStorage
6. Usuario se guarda en Zustand store
7. Redirección a Dashboard

---

## 7. ESTILOS Y DISEÑO

### 7.1 Ant Design Theme

El sistema utiliza el sistema de diseño de Ant Design con personalización:

**Configuración de tema:** `shared/config/theme.config.js`

```javascript
export const themeConfig = {
  token: {
    colorPrimary: '#1890ff',        // Color principal del instituto
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 6,
    },
    Input: {
      borderRadius: 6,
    },
    Card: {
      borderRadius: 8,
    },
  },
};
```

### 7.2 CSS Custom

Además de Ant Design, se utilizan estilos CSS personalizados para:
- Variables CSS (colores, espaciado, tipografía)
- Reset CSS
- Utilidades (helpers)
- Estilos específicos de componentes cuando Ant Design no cubre necesidades

---

## 8. RUTAS Y NAVEGACIÓN

### 8.1 Estructura de Rutas

```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './presentation/templates/MainLayout';
import { ProtectedRoute } from './presentation/components/ProtectedRoute';

<Routes>
  {/* Rutas públicas */}
  <Route path="/login" element={<LoginPage />} />
  
  {/* Rutas protegidas */}
  <Route element={<ProtectedRoute />}>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/estudiantes" element={<StudentsList />} />
      <Route path="/estudiantes/:id" element={<StudentDetail />} />
      <Route path="/estudiantes/nuevo" element={<StudentForm />} />
      {/* ... más rutas */}
    </Route>
  </Route>
</Routes>
```

### 8.2 Protected Routes

Rutas que requieren autenticación verifican el token antes de renderizar:

```javascript
// presentation/components/ProtectedRoute.jsx
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};
```

---

## 9. MANEJO DE FORMULARIOS

### 9.1 Ejemplo: Formulario de Estudiante

```javascript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Input, Button } from 'antd';

const schema = yup.object({
  nombres: yup.string().required('Nombres son requeridos'),
  apellidos: yup.string().required('Apellidos son requeridos'),
  ci: yup.string().required('CI es requerido').matches(/^\d+$/, 'CI inválido'),
  email: yup.string().email('Email inválido'),
});

const StudentForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    // Llamar a use case
    await registerStudentUseCase.execute(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Campos del formulario */}
    </Form>
  );
};
```

---

## 10. TESTING

### 10.1 Herramientas

- **Vitest** - Framework de testing (integrado con Vite)
- **React Testing Library** - Testing de componentes React
- **MSW (Mock Service Worker)** - Mocking de API calls

### 10.2 Tipos de Tests

- **Unit Tests:** Lógica de negocio (use cases, utils)
- **Component Tests:** Componentes React aislados
- **Integration Tests:** Flujos completos (login, registro de estudiante)
- **E2E Tests:** (Futuro) Playwright o Cypress

---

## 11. BUILD Y DEPLOYMENT

### 11.1 Build de Producción

```bash
npm run build
```

Genera:
- Bundle optimizado con tree-shaking
- Code splitting automático
- Assets optimizados (imágenes, CSS)
- Output en `dist/` listo para servir

### 11.2 Preview Local

```bash
npm run preview
```

Sirve el build de producción localmente para verificar antes del deployment.

### 11.3 Deployment

**Opción 1: Servidor estático (Nginx)**
- Build se sirve como archivos estáticos
- Nginx como reverse proxy

**Opción 2: Docker**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 12. ESTÁNDARES DE DESARROLLO

### 12.1 Linting y Formatting

- **ESLint:** Configurado con reglas de React y mejores prácticas
- **Prettier:** Formateo automático de código

**Comandos:**
```bash
npm run lint          # Verificar errores de linting
npm run lint:fix      # Corregir automáticamente
npm run format        # Formatear código
```

### 12.2 Convenciones de Código

- **Nombres de archivos:** PascalCase para componentes (`StudentForm.jsx`), camelCase para utils (`formatDate.js`)
- **Nombres de componentes:** PascalCase (`const StudentForm = () => {}`)
- **Hooks personalizados:** Prefijo `use` (`useAuth`, `useStudents`)
- **Variables y funciones:** camelCase (`getStudentById`)
- **Constantes:** UPPER_SNAKE_CASE (`API_BASE_URL`)

### 12.3 Estructura de Componentes

Cada componente debe incluir:
- Archivo del componente (`.jsx`)
- Archivo `index.js` para exportación
- (Opcional) Estilos específicos (`.css`)
- (Opcional) Tests (`.test.jsx`)

---

## 13. RECURSOS Y ENLACES

### 13.1 Documentación Oficial

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Ant Design](https://ant.design/)
- [React Router](https://reactrouter.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Yup](https://github.com/jquense/yup)

### 13.2 Documentación del Proyecto

- Ver [README.md](../frontend/README.md) del frontend
- Ver [09-estandares-codigo.md](09-estandares-codigo.md) para estándares completos

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-01-XX | Equipo de Desarrollo | Versión inicial - Documentación completa del frontend |

---

## REFERENCIAS

- [04-arquitectura-sistema.md](04-arquitectura-sistema.md) - Arquitectura general del sistema
- [09-estandares-codigo.md](09-estandares-codigo.md) - Estándares de código
- frontend/README.md - README específico del frontend

---

**FIN DEL DOCUMENTO - 14 FRONTEND**
