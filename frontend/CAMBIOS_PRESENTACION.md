# Cambios Realizados para la Presentación

**Fecha:** 2025-12-15  
**Motivo:** Implementación rápida de funcionalidades requeridas para presentación  
**Estado:** ⚠️ CÓDIGO TEMPORAL - REQUIERE REFACTORIZACIÓN POST-PRESENTACIÓN  
**Última actualización:** 2025-12-16

---

## 📋 Resumen

Este documento lista todos los archivos creados y modificados para acelerar la implementación de funcionalidades requeridas para la presentación. **IMPORTANTE:** Estos cambios fueron realizados de forma pragmática manteniendo la arquitectura modular, pero requieren revisión y refactorización después de la presentación.

> **📌 NOTA IMPORTANTE:** Para la refactorización post-presentación, consulta el documento **`REFACTORIZACION_PENDIENTE.md`** en la raíz del proyecto, que contiene un checklist completo y estructurado de todos los archivos que requieren refactorización, organizados por prioridad y con acciones específicas para cada uno.

---

## 🆕 Archivos Creados (Backend)

### 1. `backend/src/presentation/controllers/catalogs.controller.js`
**Finalidad:** Controlador rápido para endpoints de catálogos (carreras, gestiones, municipios, idiomas, tipos de discapacidad, y datos geográficos)  
**Problema:** Usa repositorios directamente sin use cases (viola arquitectura limpia)  
**Acción post-presentación:** Crear use cases específicos para cada catálogo o un CatalogUseCase genérico  
**Nota:** Fue creado inicialmente con algunos endpoints, luego se modificó para agregar endpoints geográficos (países, departamentos, provincias) con filtrado

### 2. `backend/src/presentation/routes/catalogs.routes.js`
**Finalidad:** Rutas para endpoints de catálogos  
**Estado:** ✅ Correcto, solo rutas  
**Nota:** Fue creado inicialmente, luego se modificó para agregar rutas geográficas con query params para filtrado

---

## ✏️ Archivos Modificados (Backend)

### 1. `backend/src/presentation/routes/index.js`
**Cambio:** Agregada ruta `/catalogs`  
**Finalidad:** Montar las rutas de catálogos en la API  
**Estado:** ✅ Cambio correcto

### 2. `backend/src/application/dtos/request/RegisterStudentDTO.js`
**Cambio:** Agregados campos `carreraId` y `gestionIngresoId`  
**Finalidad:** Aceptar datos académicos en el registro de estudiante  
**Estado:** ✅ Cambio correcto, mantiene estructura del DTO

### 3. `backend/src/application/use-cases/Estudiantes/RegisterStudentUseCase.js`
**Cambio:** 
- Agregado `studentAcademicDataRepository` como dependencia
- Lógica para crear registro en `estudiantes_datos_academicos` después de crear estudiante
**Finalidad:** Crear datos académicos junto con el estudiante  
**Problema:** Lógica de creación de datos académicos mezclada con creación de estudiante  
**Acción post-presentación:** Crear un use case separado `CreateStudentAcademicDataUseCase` y orquestarlo desde un use case superior

### 4. `backend/src/infrastructure/container/modules/estudiantes.container.js`
**Cambio:** Agregado `studentAcademicDataRepository` a las dependencias de `RegisterStudentUseCase`  
**Finalidad:** Inyectar el repositorio necesario  
**Estado:** ✅ Cambio correcto

### 5. `backend/src/presentation/controllers/estudiantes/list.controller.js`
**Cambio:** Implementación rápida usando repositorio directamente sin use case  
**Finalidad:** Listar estudiantes para la página de listado  
**Problema:** Violación de arquitectura - debería usar `ListStudentsUseCase`  
**Acción post-presentación:** Crear `ListStudentsUseCase` completo con filtros, paginación y ordenamiento

---

## 🆕 Archivos Creados (Frontend)

**Ninguno** - Todos los cambios fueron modificaciones a archivos existentes

---

## ✏️ Archivos Modificados (Frontend)

### 1. `frontend/src/application/modules/estudiantes/hooks/useStudentFormData.js`
**Cambio:** 
- Agregadas llamadas a API para cargar catálogos (carreras, gestiones, municipios, idiomas, tipos de discapacidad)
- Agregados estados para cada catálogo
**Finalidad:** Cargar opciones dinámicas para los select del formulario  
**Estado:** ✅ Cambio correcto, mantiene estructura del hook

### 2. `frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx`
**Cambio:** 
- Agregados catálogos al contexto (carreras, gestiones, municipios, idiomas, tiposDiscapacidad)
- Exposición de catálogos en el value del Provider
**Finalidad:** Hacer disponibles los catálogos para el formulario  
**Estado:** ✅ Cambio correcto, mantiene estructura del Provider

### 3. `frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx`
**Cambio:** 
- Agregados catálogos al destructuring del contexto
- Actualizado `resolveOptions` para mapear catálogos a formato `{label, value}`
**Finalidad:** Resolver opciones dinámicas para los campos select del formulario  
**Estado:** ✅ Cambio correcto, mantiene estructura del componente

### 4. `frontend/src/presentation/modules/estudiantes/config/formFields.js`
**Cambio:** 
- Agregados campos de foreign keys:
  - `municipioNacimientoId` (select)
  - `idiomaNatalId` (select)
  - `tipoDiscapacidadId` (select condicional)
  - `municipioResidenciaId` (select)
- Agregada sección `academicData` con:
  - `carreraId` (select requerido)
  - `gestionIngresoId` (select requerido)
- Agregada sección `documents` con checkboxes para documentos requeridos
- Actualizado orden de secciones
**Finalidad:** Agregar todos los campos necesarios para el registro completo  
**Problema:** 
  - Los checkboxes de documentos pueden no funcionar si `GenericForm` no los soporta
  - El campo `tipoDiscapacidadId` tiene lógica de dependencia que puede no estar implementada en `GenericForm`
**Acción post-presentación:** 
  - Verificar soporte de checkboxes en `GenericForm` o implementar manualmente
  - Verificar soporte de campos condicionales o implementar lógica manual

### 5. `frontend/src/presentation/pages/Estudiantes/List/List.jsx`
**Cambio:** Implementación completa en un solo archivo (todo-en-uno)  
**Finalidad:** Página funcional de listado de estudiantes para la presentación  
**Problema:** ⚠️ **VIOLACIÓN GRAVE DE ARQUITECTURA** - Todo el código está en un solo archivo  
**Acción post-presentación:** 
  - Separar en componentes (molecules/organisms)
  - Crear hooks personalizados para lógica de negocio
  - Mover funciones auxiliares a utils
  - Crear estilos separados si es necesario
  - Implementar paginación del lado del servidor
  - Agregar filtros avanzados

---

## 📝 Notas Importantes

### Arquitectura Mantenida ✅
- **Backend:** Se mantuvo la estructura de DTOs, Use Cases, Repositories
- **Frontend:** Se mantuvo la estructura de Providers, Hooks, Pages
- **Separación de responsabilidades:** Se respetó en la mayoría de los casos

### Compromisos Realizados ⚠️
1. **List.controller.js:** Usa repositorio directamente sin use case
2. **Catalogs.controller.js:** Usa repositorios directamente sin use cases
3. **List.jsx:** Todo el código en un solo archivo (viola arquitectura modular)
4. **Documentos:** Implementados como checkboxes simples, no hay subida de archivos real

### Funcionalidades Pendientes
1. **Subida de archivos en formulario:** 
   - El endpoint de subida existe (`POST /api/v1/estudiantes/:id/documentos`)
   - Pero el formulario solo tiene checkboxes, no permite subir archivos directamente
   - Los documentos se crean con estado `REQUERIDO` y se debe subir después
   - Acción: Agregar tipo `upload` a FormField o crear componente personalizado

2. **Campo es_original:**
   - No existe en BD, no se puede distinguir original vs fotocopia
   - Ver `backend/MIGRACIONES_PENDIENTES.md`

3. **Estado de registro:**
   - Se calcula pero no se guarda en BD (falta campo)
   - Ver `backend/MIGRACIONES_PENDIENTES.md`

4. **Validación condicional:** El campo `tipoDiscapacidadId` debería ser requerido solo si `tieneDiscapacidad === true`, pero esto no está implementado

5. **Filtros avanzados:** La página de listado no tiene filtros por carrera, gestión, etc.

6. **Paginación del servidor:** La paginación es solo del lado del cliente

---

## 🔧 Plan de Refactorización Post-Presentación

### Prioridad Alta
1. ✅ Crear `ListStudentsUseCase` completo
2. ✅ Crear use cases para catálogos o un `CatalogUseCase` genérico
3. ✅ Separar `List.jsx` en componentes modulares
4. ✅ Implementar subida real de documentos
5. ✅ Persistir documentos en la base de datos

### Prioridad Media
1. ✅ Crear `CreateStudentAcademicDataUseCase` separado
2. ✅ Implementar validación de documentos completos
3. ✅ Agregar filtros avanzados al listado
4. ✅ Implementar paginación del lado del servidor

### Prioridad Baja
1. ✅ Mejorar manejo de errores en catálogos
2. ✅ Agregar caché para catálogos
3. ✅ Optimizar carga de datos del formulario

---

## 📝 Cambios Adicionales Realizados

### Últimos Cambios (2025-12-15 - Subida de archivos y estados)

#### Backend - Subida de Archivos:
1. **`backend/src/infrastructure/external/storage/multer.config.js`** [NUEVO]
   - Finalidad: Configuración de Multer para subida de archivos
   - Cambio: Middleware para guardar archivos en `/uploads/documentos/estudiantes/{estudianteId}/`
   - Límite: 5MB, solo PDF, JPEG, JPG, PNG

2. **`backend/src/presentation/controllers/estudiantes/upload-document.controller.js`** [NUEVO]
   - Finalidad: Controller para subir documentos de estudiante
   - Endpoint: `POST /api/v1/estudiantes/:id/documentos`
   - Problema: Usa repositorio directamente sin use case
   - Acción post-presentación: Crear `UploadDocumentUseCase`

3. **`backend/src/presentation/routes/student.routes.js`** [MODIFICADO]
   - Finalidad: Agregar ruta para subida de documentos
   - Cambio: Agregada ruta `POST /:id/documentos` con middleware de multer

#### Backend - Validación y Estados:
4. **`backend/src/application/use-cases/Estudiantes/RegisterStudentUseCase.js`** [MODIFICADO]
   - Finalidad: 
     - Validar que pago sea requerido
     - Calcular estado de registro (BORRADOR, PENDIENTE, ADMITIDO)
   - Cambio: 
     - Validación de `documentoPagoMatricula` requerido (línea 92-94)
     - Cálculo de estado basado en documentos (líneas 128-142)
     - Documentos creados con estado `REQUERIDO` hasta que se suba archivo
   - Problema: El estado se calcula pero NO se guarda en BD (falta campo `estado_registro`)
   - Acción post-presentación: 
     - Ver `backend/MIGRACIONES_PENDIENTES.md` para migraciones necesarias
     - Agregar campo `estado_registro ENUM('BORRADOR', 'PENDIENTE', 'ADMITIDO')` en `estudiantes_datos_academicos`
     - Guardar estado en BD
     - Implementar lógica completa para ADMITIDO (requiere documentos originales verificados)

5. **`backend/MIGRACIONES_PENDIENTES.md`** [NUEVO]
   - Finalidad: Documentar migraciones de BD necesarias
   - Contenido: SQL para agregar campos `estado_registro` y `es_original`

#### Frontend - Validación:
6. **`frontend/src/presentation/modules/estudiantes/config/formFields.js`** [MODIFICADO]
   - Finalidad: Hacer que el pago sea requerido en el formulario
   - Cambio: Agregada validación custom en `documentoPagoMatricula` (líneas 287-298)

### Cambios Pendientes por Implementar:
1. **Frontend: Soporte de Upload en formulario**
   - Agregar tipo `upload` a FormField
   - Modificar sección de documentos para permitir subir archivos
   - Agregar selector original/fotocopia

2. **Backend: Campo es_original en documentos**
   - Agregar campo `es_original BOOLEAN` en tabla `documentos_estudiante`
   - Actualizar repositorio y entidad

3. **Backend: Campo estado_registro**
   - Agregar campo `estado_registro` en `estudiantes_datos_academicos`
   - Persistir estado en BD

---

### Cambios Anteriores (2025-12-15 - Completar funcionalidad básica)

#### Backend:
1. **`backend/src/application/dtos/request/RegisterStudentDTO.js`** [MODIFICADO]
   - Finalidad: Agregados campos de documentos (checkboxes)
   - Cambio: Campos para rastrear qué documentos fueron entregados

2. **`backend/src/application/use-cases/Estudiantes/RegisterStudentUseCase.js`** [MODIFICADO]
   - Finalidad: Crear registros de documentos cuando están marcados
   - Cambio: Agregado `studentDocumentRepository` y lógica para crear documentos
   - Problema: Lógica de documentos mezclada con creación de estudiante
   - Acción post-presentación: Crear use case separado `CreateStudentDocumentsUseCase`

3. **`backend/src/infrastructure/container/modules/estudiantes.container.js`** [MODIFICADO]
   - Finalidad: Inyectar `studentDocumentRepository` al use case
   - Cambio: Agregado repositorio a las dependencias

#### Frontend:
1. **`frontend/src/presentation/components/molecules/FormField/FormField.jsx`** [MODIFICADO]
   - Finalidad: Agregar soporte para campo tipo `checkbox`
   - Cambio: Importado `Checkbox` de antd y agregado caso en switch
   - Estado: ✅ Cambio correcto, extiende funcionalidad del componente

2. **`frontend/src/application/modules/estudiantes/hooks/useCreateStudent.js`** [MODIFICADO]
   - Finalidad: Corregir hook para usar `apiClient` en lugar de use cases inexistentes
   - Cambio: Reescrito completamente para usar `apiClient.post('/v1/estudiantes')`
   - Problema anterior: Intentaba usar use cases del backend en el frontend (error)
   - Estado: ✅ Ahora correcto, usa API client
   - Nota: Los documentos se envían junto con los datos del estudiante, el backend los procesa

3. **`frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx`** [MODIFICADO]
   - Finalidad: Agregar valores iniciales para checkboxes de documentos
   - Cambio: Agregados valores iniciales `false` para todos los checkboxes de documentos

---

## 🗺️ Cambios Adicionales: Cascada Geográfica y Renderizado Condicional

### Backend

#### 1. **`backend/src/presentation/controllers/catalogs.controller.js`** [MODIFICADO]
   - Finalidad: Agregar endpoints para datos geográficos con filtrado
   - Cambios:
     - Agregado `getPaises()`: Lista todos los países
     - Agregado `getDepartamentos()`: Lista departamentos, acepta `?paisId=X` para filtrar
     - Agregado `getProvincias()`: Lista provincias, acepta `?departamentoId=X` para filtrar
     - Modificado `getMunicipios()`: Ahora acepta `?provinciaId=X` para filtrar
   - Problema: Usa repositorios directamente sin use cases
   - Acción post-presentación: Crear use cases para cada catálogo geográfico

#### 2. **`backend/src/presentation/routes/catalogs.routes.js`** [MODIFICADO]
   - Finalidad: Agregar rutas para endpoints geográficos
   - Cambios:
     - Agregada ruta `GET /paises`
     - Agregada ruta `GET /departamentos` con query param `paisId` opcional
     - Agregada ruta `GET /provincias` con query param `departamentoId` opcional
     - Actualizada ruta `GET /municipios` con query param `provinciaId` opcional
   - Estado: ✅ Correcto, solo rutas

### Frontend

#### 1. **`frontend/src/application/modules/estudiantes/hooks/useStudentFormData.js`** [MODIFICADO]
   - Finalidad: Cargar datos geográficos completos para cascada
   - Cambios:
     - Agregados estados: `paises`, `departamentos`, `provincias`
     - Carga todos los datos geográficos al inicio (países, departamentos, provincias, municipios)
     - Agregadas funciones `loadDepartamentos`, `loadProvincias`, `loadMunicipios` (mantenidas para compatibilidad pero no usadas activamente, el filtrado se hace en el frontend)
   - Nota: Se carga todo al inicio para simplificar, el filtrado se hace en tiempo real en el componente

#### 2. **`frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx`** [MODIFICADO]
   - Finalidad: Exponer datos geográficos y funciones de carga
   - Cambios:
     - Agregados `paises`, `departamentos`, `provincias` al contexto
     - Expuestas funciones `loadDepartamentos`, `loadProvincias`, `loadMunicipios`
   - Estado: ✅ Correcto

#### 3. **`frontend/src/presentation/modules/estudiantes/config/formFields.js`** [MODIFICADO]
   - Finalidad: Implementar cascada geográfica y ajustar layout
   - Cambios:
     - **Cascada geográfica para nacimiento:**
       - Agregado `paisNacimientoId` (select)
       - Agregado `departamentoNacimientoId` (select, depende de `paisNacimientoId`)
       - Agregado `provinciaNacimientoId` (select, depende de `departamentoNacimientoId`)
       - Modificado `municipioNacimientoId` (ahora depende de `provinciaNacimientoId`)
     - **Cascada geográfica para residencia:**
       - Agregado `paisResidenciaId` (select)
       - Agregado `departamentoResidenciaId` (select, depende de `paisResidenciaId`)
       - Agregado `provinciaResidenciaId` (select, depende de `departamentoResidenciaId`)
       - Modificado `municipioResidenciaId` (ahora depende de `provinciaResidenciaId`)
     - **Renderizado condicional:**
       - Campo `tipoDiscapacidadId` ahora tiene `shouldRender: (formValues) => formValues?.tieneDiscapacidad === true`
       - Campo solo se muestra cuando `tieneDiscapacidad === true`
     - **Ajustes de layout:**
       - Todos los campos ahora tienen `span: 8` (3 columnas)
       - Solo `observaciones` mantiene `span: 24` (ancho completo)
   - Estado: ✅ Configuración correcta, requiere componentes actualizados para funcionar

#### 4. **`frontend/src/presentation/components/molecules/FormSection/FormSection.jsx`** [MODIFICADO]
   - Finalidad: Implementar renderizado condicional de campos
   - Cambios:
     - Agregado `Form.useWatch()` para observar cambios en valores del formulario
     - Agregado estado `visibleFields` que filtra campos basado en `shouldRender`
     - Filtra campos dinámicamente cuando cambian los valores del formulario
     - Pasa `formValues` y `onFieldChange` a `FormField`
   - Estado: ✅ Implementación correcta de renderizado condicional

#### 5. **`frontend/src/presentation/components/molecules/FormField/FormField.jsx`** [MODIFICADO]
   - Finalidad: Implementar filtrado dinámico basado en dependencias
   - Cambios:
     - Agregado `useEffect` para limpiar campos cuando cambian sus dependencias
     - Agregada lógica de filtrado en caso `select`:
       - Filtra departamentos por `paisId`
       - Filtra provincias por `departamentoId`
       - Filtra municipios por `provinciaId`
     - Filtrado funciona para campos de nacimiento y residencia independientemente
     - Si no hay valor en la dependencia, no muestra opciones
   - Estado: ✅ Implementación correcta de filtrado dinámico

#### 6. **`frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx`** [MODIFICADO]
   - Finalidad: Pasar función `onFieldChange` a las secciones
   - Cambios:
     - Agregado prop `onFieldChange` al componente
     - Pasa `onFieldChange` a `FormSection`
   - Estado: ✅ Cambio correcto

#### 7. **`frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx`** [MODIFICADO]
   - Finalidad: Manejar cambios en campos con dependencias geográficas
   - Cambios:
     - Agregados `paises`, `departamentos`, `provincias` al contexto
     - Agregadas funciones `loadDepartamentos`, `loadProvincias`, `loadMunicipios`
     - Actualizado `resolveOptions` para mapear datos geográficos con IDs de relación (`paisId`, `departamentoId`, `provinciaId`)
     - Agregada función `handleFieldChange` para manejar cambios en campos geográficos (actualmente no hace nada ya que el filtrado se hace en el frontend)
     - Pasa `onFieldChange={handleFieldChange}` a `GenericForm`
   - Nota: Las funciones de carga están preparadas pero no se usan activamente porque todos los datos se cargan al inicio y se filtran en el frontend

---

## 📋 Cambios Adicionales: Reorganización del Formulario y Actualización de Ayuda

### Frontend

#### 1. **`frontend/src/presentation/modules/estudiantes/config/formFields.js`** [MODIFICADO]
   - Finalidad: Reorganizar secciones del formulario para mejor UX
   - Cambios:
     - **Separación de datos geográficos:**
       - Removidos campos geográficos de la sección "Datos Personales Básicos"
       - Creada nueva sección "Origen y Ubicación Geográfica" con:
         - Nacionalidad
         - Idioma Natal
         - Cascada completa: País → Departamento → Provincia → Municipio de Nacimiento
         - Ciudad de Nacimiento
     - **Ajuste de layout:**
       - Campo "Dirección" cambiado de `span: 8` a `span: 24` (ancho completo)
     - **Reorganización de secciones:**
       - Actualizado orden de secciones para incluir nueva sección geográfica
       - Nuevo orden: Datos Personales Básicos → Origen y Ubicación Geográfica → Datos de Contacto → Datos Académicos → Documentos → Observaciones
   - Problema: Cambio de estructura que puede afectar scripts o tests existentes
   - Acción post-presentación: Verificar que la nueva estructura no rompa validaciones o integraciones

#### 2. **`frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx`** [MODIFICADO]
   - Finalidad: Establecer valores por defecto para país (Bolivia)
   - Cambios:
     - Agregados valores iniciales `paisNacimientoId: 1` y `paisResidenciaId: 1` en `initialValues`
     - Facilita el uso cuando solo hay un país registrado
   - Estado: ✅ Cambio correcto, mejora UX

#### 3. **`frontend/src/presentation/components/molecules/HelpGuideCard/HelpGuideCard.jsx`** [MODIFICADO]
   - Finalidad: Proporcionar información más específica y útil en la guía de ayuda
   - Cambios:
     - **Nueva sección "Datos Geográficos":**
       - Explicación de la cascada geográfica (País → Departamento → Provincia → Municipio)
       - Instrucciones sobre cómo seleccionar cada nivel
       - Nota sobre Bolivia seleccionada por defecto
     - **Nueva sección "Documentos Requeridos":**
       - Documento de Pago marcado como OBLIGATORIO
       - Instrucciones sobre cómo marcar documentos entregados
       - Lista completa de documentos requeridos
     - **Nueva sección "Estados del Registro":**
       - Explicación de estados BORRADOR, PENDIENTE y ADMITIDO
       - Condiciones para cada estado
     - **Nueva sección "Proceso de Llenado":**
       - Campo de discapacidad condicional
       - Instrucciones para dirección
       - Nota sobre origen y residencia diferentes
     - Removida sección genérica "Consejos Rápidos" y reemplazada con información más específica
   - Estado: ✅ Mejora la UX y claridad del formulario
   - Nota: La información debe mantenerse actualizada si cambian los procesos

---

## 📍 Ubicación de Archivos

### Backend
```
backend/
├── src/
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── catalogs.controller.js          [NUEVO - MODIFICADO: endpoints geográficos]
│   │   │   └── estudiantes/
│   │   │       ├── list.controller.js         [MODIFICADO]
│   │   │       └── upload-document.controller.js [NUEVO]
│   │   └── routes/
│   │       ├── catalogs.routes.js              [NUEVO - MODIFICADO: rutas geográficas]
│   │       ├── student.routes.js               [MODIFICADO: ruta upload]
│   │       └── index.js                        [MODIFICADO]
│   ├── application/
│   │   ├── dtos/
│   │   │   └── request/
│   │   │       └── RegisterStudentDTO.js       [MODIFICADO]
│   │   └── use-cases/
│   │       └── Estudiantes/
│   │           └── RegisterStudentUseCase.js    [MODIFICADO]
│   └── infrastructure/
│       └── container/
│           └── modules/
│               └── estudiantes.container.js    [MODIFICADO]
```

### Frontend
```
frontend/
├── src/
│   ├── application/
│   │   └── modules/
│   │       └── estudiantes/
│   │           ├── hooks/
│   │           │   └── useStudentFormData.js   [MODIFICADO]
│   │           └── providers/
│   │               └── StudentProvider.jsx     [MODIFICADO]
│   └── presentation/
│       ├── components/
│       │   ├── molecules/
│       │   │   ├── FormField/
│       │   │   │   └── FormField.jsx          [MODIFICADO: filtrado dinámico]
│       │   │   ├── FormSection/
│       │   │   │   └── FormSection.jsx        [MODIFICADO: renderizado condicional]
│       │   │   └── HelpGuideCard/
│       │   │       └── HelpGuideCard.jsx      [MODIFICADO: información específica]
│       │   └── organisms/
│       │       └── GenericForm/
│       │           └── GenericForm.jsx        [MODIFICADO: onFieldChange]
│       └── modules/
│           └── estudiantes/
│               ├── config/
│               │   └── formFields.js          [MODIFICADO: reorganización, cascada, spans]
│               └── pages/
│                   └── Registrar/
│                       └── Registrar.jsx      [MODIFICADO: valores por defecto, dependencias]
│       └── pages/
│           └── Estudiantes/
│               └── List/
│                   └── List.jsx                [MODIFICADO - TODO EN UNO]
```

---

## ⚠️ Advertencias

1. **NO usar este código como referencia** para futuras implementaciones
2. **Revisar todos los cambios** antes de hacer merge a producción
3. **Los endpoints de catálogos** son temporales y deben mejorarse
4. **La página de listado** debe refactorizarse completamente
5. **Los documentos** no están completamente implementados
6. **La cascada geográfica** carga todos los datos al inicio, puede ser lenta con muchos datos
7. **El filtrado geográfico** se hace en el frontend, considerar moverlo al backend para mejor rendimiento
8. **Los campos geográficos** no guardan los IDs intermedios (país, departamento, provincia), solo el municipio final

---

---

## 📄 Documentación Relacionada

- **`backend/MIGRACIONES_PENDIENTES.md`**: Migraciones de BD necesarias para completar la funcionalidad

---

## 🔮 Cambios Planificados: Wizard de Registro (PENDIENTE DE IMPLEMENTACIÓN)

### Contexto
Convertir el registro de estudiantes en un asistente (wizard) de múltiples pasos que permite completar el registro en etapas, aplicando los estados BORRADOR, PENDIENTE, ADMITIDO según el progreso.

### Estructura Propuesta

#### Paso 1: Datos Personales y Geográficos
- Todos los datos personales básicos
- Datos geográficos (origen y ubicación)
- **Estado resultante:** BORRADOR si solo completa este paso

#### Paso 2: Documentos
- Checkboxes para marcar documentos entregados físicamente
- Subida digital de documentos (opcional en este momento)
- Marcar si es original o fotocopia (cuando se implemente `es_original`)
- **Estado resultante:** PENDIENTE si marca documentos pero no sube todos digitales
- **Estado resultante:** ADMITIDO si completa todos los documentos requeridos y los sube digitalmente

#### Paso 3: Datos Académicos
- Carrera y gestión de ingreso (obligatorios)
- Campos adicionales de `estudiantes_datos_academicos`:
  - `unidad_educativa_procedencia`
  - `anio_egreso_secundaria`
  - `promedio_anual`
  - `fecha_egreso`
  - `foto_url`

### Implementación Técnica

#### Archivos a Crear:
1. **`frontend/src/presentation/components/organisms/WizardForm/WizardForm.jsx`**
   - Componente nuevo que maneja la navegación entre pasos
   - Usa `GenericForm` internamente para cada paso
   - Maneja los botones de navegación (Anterior, Siguiente, Guardar)
   - Actualiza el estudiante existente en cada paso (PUT/PATCH)

#### Archivos a Modificar:
1. **`frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx`**
   - Agregar prop `wizardMode` (boolean)
   - Si `wizardMode === true`, no renderizar `FormActions`
   - Exponer el formulario via `ref` o prop para que WizardForm pueda acceder a los valores

2. **`frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx`**
   - Reemplazar `GenericForm` con `WizardForm`
   - Pasar las configuraciones de cada paso al wizard

3. **`frontend/src/application/modules/estudiantes/hooks/useCreateStudent.js` o nuevo hook `useUpdateStudent.js`**
   - Crear hook para actualizar estudiante (PUT/PATCH)
   - Manejar actualización parcial de datos

4. **`backend/src/presentation/controllers/estudiantes/update.controller.js`** (si no existe)
   - Crear endpoint PUT/PATCH para actualizar estudiante
   - Manejar actualización de datos académicos y documentos

### Consideraciones Importantes:
- **No es guardado parcial**: Es actualización normal del mismo registro, solo cambia el estado
- **WizardForm nuevo**: Componente separado que usa GenericForm internamente
- **GenericForm sin submit**: Cuando está en modo wizard, no maneja el submit, solo renderiza los campos
- **Actualización por pasos**: Cada paso actualiza el estudiante con PUT/PATCH
- **Estados**: Se calculan según qué paso está completo

### Notas:
- Los documentos se manejan según el schema `documentos_estudiante`
- Los datos académicos incluyen todos los campos de `estudiantes_datos_academicos`
- El estudiante ya existe después del Paso 1, los siguientes pasos solo actualizan

---

## 🔄 Cambios Recientes: Documentación Dinámica y Subida de Archivos (2025-12-15)

### Backend - Modelo, Entidad y Repositorio de Documentación:

1. **`backend/src/infrastructure/database/models/Documentacion.js`** [NUEVO]
   - Finalidad: Modelo Sequelize para la tabla `documentacion`
   - Campos: nombre, tipoDocumento, aceptaFotocopia, requerido, orden, descripcion
   - Estado: ✅ Modelo completo siguiendo patrón establecido

2. **`backend/src/domain/entities/Documentacion.js`** [NUEVO]
   - Finalidad: Entidad de dominio para documentación
   - Campos: name, documentType, acceptsPhotocopy, required, order, description
   - Estado: ✅ Entidad completa siguiendo patrón BaseEntity

3. **`backend/src/infrastructure/repositories/DocumentacionRepository.js`** [NUEVO]
   - Finalidad: Repositorio para operaciones CRUD de documentación
   - Métodos: findByTipoDocumento(), findRequeridos()
   - Estado: ✅ Repositorio completo siguiendo patrón BaseRepository
   - Nota: Reemplaza consultas SQL directas anteriores

4. **`backend/src/infrastructure/container/modules/repositories.container.js`** [MODIFICADO]
   - Finalidad: Registrar DocumentacionRepository en el contenedor de DI
   - Cambio: Agregado registro de `documentacionRepository`
   - Estado: ✅ Cambio correcto

5. **`backend/src/infrastructure/database/models/index.js`** [MODIFICADO]
   - Finalidad: Exportar modelo Documentacion
   - Cambio: Agregado export de Documentacion
   - Estado: ✅ Cambio correcto

### Backend - Actualización de Controllers:

6. **`backend/src/presentation/controllers/catalogs.controller.js`** [MODIFICADO]
   - Finalidad: Usar repositorio en lugar de consulta SQL directa
   - Cambio: `getDocumentacionInscripcion()` ahora usa `documentacionRepository.findByTipoDocumento()`
   - Estado: ✅ Mejora arquitectónica, sigue patrón establecido
   - Problema anterior: Usaba consulta SQL directa (violaba arquitectura limpia)
   - Acción post-presentación: Ninguna, ya está correcto

7. **`backend/src/presentation/controllers/estudiantes/upload-document.controller.js`** [MODIFICADO]
   - Finalidad: Usar repositorio para obtener información de documentación
   - Cambio: Reemplazada consulta SQL directa por `documentacionRepository.findById()`
   - Cambio adicional: Actualizada estructura de guardado de archivos a `{ci}_{apellido}/INSCRIPCION/`
   - Estado: ✅ Mejora arquitectónica

8. **`backend/src/infrastructure/external/storage/multer.config.js`** [MODIFICADO]
   - Finalidad: Actualizar estructura de guardado de archivos
   - Cambio: 
     - Guarda archivos en estructura `{ci}_{apellido}/INSCRIPCION/` cuando tiene CI y apellido
     - Usa carpeta temporal `temp/INSCRIPCION/` si no tiene datos del estudiante
   - Estado: ✅ Mejora funcional

### Backend - Actualización de Modelo DocumentoEstudiante:

9. **`backend/src/infrastructure/database/models/DocumentoEstudiante.js`** [MODIFICADO]
   - Finalidad: Agregar campos faltantes según schema actualizado
   - Cambio: Agregados campos `documentacionId` y `esOriginal`
   - Estado: ✅ Sincronizado con schema de BD

10. **`backend/src/infrastructure/repositories/StudentDocumentRepository.js`** [MODIFICADO]
    - Finalidad: Mapear nuevos campos documentacionId y esOriginal
    - Cambio: Actualizado `toEntity()` y `mapDataToModel()` para incluir nuevos campos
    - Estado: ✅ Sincronizado con modelo

### Frontend - Documentos Dinámicos:

11. **`backend/src/presentation/controllers/catalogs.controller.js`** [MODIFICADO - ya mencionado]
    - Endpoint: `GET /api/v1/catalogs/documentacion-inscripcion?tipo=INSCRIPCION`
    - Finalidad: Obtener documentos requeridos de tipo INSCRIPCION

12. **`backend/src/presentation/routes/catalogs.routes.js`** [MODIFICADO]
    - Finalidad: Agregar ruta para documentación de inscripción
    - Cambio: Agregada ruta `GET /documentacion-inscripcion`
    - Estado: ✅ Cambio correcto

13. **`frontend/src/application/modules/estudiantes/hooks/useStudentFormData.js`** [MODIFICADO]
    - Finalidad: Obtener documentación requerida del backend
    - Cambio: 
      - Agregado estado `documentacionInscripcion`
      - Agregada llamada a `/v1/catalogs/documentacion-inscripcion?tipo=INSCRIPCION`
    - Estado: ✅ Cambio correcto

14. **`frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx`** [MODIFICADO]
    - Finalidad: Exponer documentacionInscripcion en el contexto
    - Cambio: Agregado `documentacionInscripcion` al value del contexto
    - Estado: ✅ Cambio correcto

15. **`frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx`** [MODIFICADO]
    - Finalidad: Generar campos de documentos dinámicamente
    - Cambio: 
      - Genera campos de documentos usando `useMemo` basándose en `documentacionInscripcion`
      - Cada documento tiene checkbox (`documento_{id}_entregado`) y campo upload (`documento_{id}_archivo`)
      - Genera `wizardSteps` dinámicamente con los campos de documentos
    - Estado: ✅ Implementación correcta pero requiere revisión (viola separación de responsabilidades)
    - Problema: La lógica de generación de campos debería estar en formFields.js o un helper
    - Acción post-presentación: Mover lógica de generación a función helper o a formFields.js

16. **`frontend/src/presentation/modules/estudiantes/config/formFields.js`** [MODIFICADO]
    - Finalidad: Remover campo de upload del Folder Amarillo
    - Cambio: Eliminado campo `documentoFolderAmarilloFile` (solo queda checkbox)
    - Estado: ✅ Corrección correcta según requerimientos

### Frontend - Subida de Archivos:

17. **`frontend/src/application/modules/estudiantes/hooks/useCreateStudent.js`** [MODIFICADO]
    - Finalidad: Subir archivos después de crear el estudiante
    - Cambio: 
      - Separar documentos entregados de archivos a subir
      - Después de crear estudiante, sube cada archivo usando `POST /v1/estudiantes/:id/documentos`
      - Envía `documentacionId` y archivo en FormData
    - Estado: ✅ Funcional pero requiere mejor manejo de errores
    - Problema: Si falla la subida de un archivo, continúa con los demás (podría ser deseable o no)
    - Acción post-presentación: Mejorar manejo de errores y rollback si es necesario

---

**Última actualización:** 2025-12-15 (Documentación dinámica, modelo/repositorio de documentación, subida de archivos)  
**Autor:** Cambios realizados para acelerar presentación  
**Revisión requerida:** ✅ SÍ - Después de la presentación

---

## 🔗 Documentación Relacionada

- **`REFACTORIZACION_PENDIENTE.md`** (raíz del proyecto): Checklist completo y estructurado para la refactorización post-presentación
  - Lista todos los 46 archivos afectados
  - Organizados por prioridad (ALTA, MEDIA, BAJA)
  - Con acciones específicas para cada archivo
  - Plan de refactorización recomendado por fases

- **`backend/MIGRACIONES_PENDIENTES.md`**: Migraciones de BD necesarias para completar la funcionalidad

---

## 📝 Nota sobre este Documento

Este documento se mantiene como **documentación histórica** de los cambios realizados durante la implementación rápida para la presentación. Contiene detalles sobre:
- Qué se hizo y por qué
- Contexto de las decisiones tomadas
- Problemas conocidos
- Funcionalidades pendientes

Para la **refactorización activa**, usa el documento **`REFACTORIZACION_PENDIENTE.md`** que está optimizado como checklist de trabajo.

