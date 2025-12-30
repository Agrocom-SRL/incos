# Organización de Hooks - Módulo Estudiantes

## Estructura de Hooks

### 1. Hook de Contexto
**`useStudentContext`** - Consumir el contexto de estudiantes
- **Propósito**: Acceder al contexto proporcionado por `StudentProvider`
- **Uso**: En componentes que necesitan datos del contexto

### 2. Hooks de API (Llamadas al Backend)
**`useEstudiantesApi`** - Manejar todas las llamadas a la API relacionadas con estudiantes
- **Propósito**: Obtener datos del backend usando Use Cases
- **Responsabilidad**: Solo maneja la comunicación con la API (loading, error, refetch)
- **No contiene**: Lógica de UI, búsqueda, filtrado, formateo

### 3. Hooks de Feature (Lógica de UI por Feature)
**`useEstudiantesList`** - Lógica de UI para la lista de estudiantes
- **Propósito**: Combinar datos de API + lógica de búsqueda/filtrado + formateo
- **Usa**: `useEstudiantesApi` + `useTableData`
- **Específico para**: Feature de LISTADO de estudiantes

**Futuras features** (crear cuando se necesiten):
- `useEstudiantesBecas` - Lógica de UI para becas
- `useEstudiantesLicencias` - Lógica de UI para licencias
- `useEstudiantesDocumentos` - Lógica de UI para documentos

### 4. Hooks Genéricos (Reutilizables)
**`useTableData`** - Hook genérico para búsqueda y filtrado
- **Propósito**: Lógica reutilizable de búsqueda/filtrado para cualquier tabla
- **Ubicación**: `@molecules/DataTable` (co-localizado con el componente DataTable)
- **Uso**: Puede ser usado por cualquier feature que necesite búsqueda
- **Import**: `import { useTableData } from '@molecules';`

## Flujo de Datos

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

## Convención de Nombres

### Hooks de API
- **Formato**: `use[Entidad]Api`
- **Ejemplo**: `useEstudiantesApi`, `useBecasApi`
- **Indica**: Que es específico para llamadas a la API

### Hooks de Feature
- **Formato**: `use[Entidad][Feature]`
- **Ejemplo**: `useEstudiantesList`, `useEstudiantesBecas`
- **Indica**: Que es específico para una feature/UI específica

### Hooks Genéricos
- **Formato**: `use[Funcionalidad]`
- **Ejemplo**: `useTableData`, `useFormData`
- **Indica**: Que es reutilizable y no específico de una entidad

## Cómo Agregar una Nueva Feature

### Ejemplo: Agregar Feature de Becas

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

## Ventajas de esta Organización

1. **Separación de responsabilidades**: API separado de UI
2. **Escalabilidad**: Cada feature tiene su propio hook, no crece un solo hook
3. **Reutilización**: Hooks genéricos pueden ser usados por múltiples features
4. **Claridad**: Los nombres indican claramente el propósito
5. **Mantenibilidad**: Fácil de encontrar y modificar código específico

