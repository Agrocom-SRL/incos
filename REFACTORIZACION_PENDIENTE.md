# Checklist de Refactorización Post-Presentación

**Fecha de creación:** 2025-12-16  
**Motivo:** Documentar todos los archivos creados/modificados durante la implementación rápida para presentación  
**Estado:** ⚠️ REQUIERE REFACTORIZACIÓN COMPLETA

---

## 📋 Resumen Ejecutivo

Este documento lista **TODOS** los archivos que fueron creados o modificados durante la implementación rápida para la presentación. Cada archivo debe ser revisado y refactorizado según la arquitectura limpia establecida.

**Total de archivos afectados:** 55

- **Backend:** 27 archivos (9 nuevos, 17 modificados, 1 eliminado)
- **Frontend:** 27 archivos (4 nuevos, 22 modificados, 1 eliminado)
- **Documentación:** 1 archivo modificado

**Última actualización:** 2025-12-16 (incluye cambios del día de hoy)

---

## 🔴 BACKEND - Archivos Creados (NUEVOS)

### 1. `backend/src/domain/entities/Documentacion.js`

**Prioridad:** 🟢 BAJA  
**Estado:** ✅ Entidad completa siguiendo patrón BaseEntity  
**Acción requerida:**

- [ ] Verificar que todos los campos estén correctamente mapeados
- [ ] Revisar métodos de validación si es necesario

---

### 2. `backend/src/infrastructure/database/models/Documentacion.js`

**Prioridad:** 🟢 BAJA  
**Estado:** ✅ Modelo completo siguiendo patrón establecido  
**Acción requerida:**

- [ ] Verificar que todos los campos estén correctamente mapeados
- [ ] Revisar relaciones con otras tablas si es necesario

---

### 3. `backend/src/infrastructure/repositories/DocumentacionRepository.js`

**Prioridad:** 🟢 BAJA  
**Estado:** ✅ Repositorio completo siguiendo patrón BaseRepository  
**Acción requerida:**

- [ ] Verificar métodos `findByTipoDocumento()` y `findRequeridos()`
- [ ] Revisar mapeo `activo` → `active` (corregido recientemente)

**Notas:** Reemplaza consultas SQL directas anteriores

---

### 4. `backend/src/presentation/controllers/catalogs.controller.js`

**Prioridad:** 🔴 ALTA  
**Problema:** Usa repositorios directamente sin use cases (viola arquitectura limpia)  
**Acción requerida:**

- [ ] Crear use cases específicos para cada catálogo o un `CatalogUseCase` genérico
- [ ] Mover lógica de negocio a use cases
- [ ] Controller solo debe orquestar use cases

**Notas:** Fue creado inicialmente, luego modificado para agregar endpoints geográficos con filtrado

---

### 5. `backend/src/presentation/routes/catalogs.routes.js`

**Prioridad:** 🟢 BAJA  
**Estado:** ✅ Correcto, solo rutas  
**Acción requerida:**

- [ ] Verificar que todas las rutas estén correctamente documentadas
- [ ] Agregar validadores si es necesario

**Notas:** Fue creado inicialmente, luego modificado para agregar rutas geográficas con query params

---

### 6. `backend/src/presentation/controllers/estudiantes/upload-document.controller.js`

**Prioridad:** 🔴 ALTA  
**Problema:** Usa repositorio directamente sin use case  
**Acción requerida:**

- [ ] Crear `UploadDocumentUseCase`
- [ ] Mover lógica de negocio (validación, guardado, movimiento de archivos) al use case
- [ ] Controller solo debe orquestar use case y manejar request/response

**Notas:** Implementa subida de documentos con Multer

---

### 7. `backend/src/infrastructure/external/storage/multer.config.js`

**Prioridad:** 🟡 MEDIA  
**Estado:** ✅ Configuración correcta  
**Acción requerida:**

- [ ] Revisar estructura de guardado de archivos (actualmente `{estudianteId}/`)
- [ ] Verificar límites de tamaño y tipos de archivo
- [ ] Considerar mover a configuración centralizada

**Notas:** Configuración de Multer para subida de archivos

---

### 8. `backend/MIGRACIONES_PENDIENTES.md`

**Prioridad:** 🟡 MEDIA  
**Estado:** ✅ Documentación  
**Acción requerida:**

- [ ] Revisar migraciones pendientes
- [ ] Implementar migraciones necesarias
- [ ] Actualizar documentación después de implementar

---

### 9. `backend/src/presentation/controllers/estudiantes/get-documents.controller.js` ⭐ **NUEVO (2025-12-16)**

**Prioridad:** 🟡 MEDIA  
**Estado:** ✅ Controlador creado para obtener documentos de estudiante  
**Acción requerida:**

- [ ] Verificar que el mapeo de entidades a formato de presentación sea correcto
- [ ] Considerar crear `GetStudentDocumentsUseCase` para seguir arquitectura limpia
- [ ] Revisar manejo de errores
- [ ] Verificar que el repositorio esté correctamente inyectado

**Notas:**

- Creado para resolver error 404 al verificar registros incompletos
- Usa repositorio directamente (debería usar use case)
- Convierte entidades de dominio a formato de presentación (castellano)

---

### 11. `backend/src/presentation/controllers/estudiantes/getById.controller.js` ⭐ **NUEVO (2025-12-16 tarde)**

**Prioridad:** 🟡 MEDIA  
**Estado:** ✅ Controlador implementado para obtener estudiante por ID  
**Acción requerida:**

- [ ] Verificar que el mapeo de entidades a formato de presentación sea correcto
- [ ] Considerar crear `GetStudentByIdUseCase` para seguir arquitectura limpia
- [ ] Revisar manejo de errores (retorna 404 si no existe)
- [ ] Verificar que el repositorio esté correctamente inyectado

**Notas:**

- Creado para permitir cargar datos de estudiante existente al completar registro
- Usa repositorio directamente (debería usar use case)
- Convierte entidades de dominio a formato de presentación (castellano)
- Retorna 404 si el estudiante no existe

---

### 10. `backend/src/presentation/controllers/estudiantes/get-academic-data.controller.js` ⭐ **NUEVO (2025-12-16)**

**Prioridad:** 🟡 MEDIA  
**Estado:** ✅ Controlador creado para obtener datos académicos de estudiante  
**Acción requerida:**

- [ ] Verificar que el mapeo de entidades a formato de presentación sea correcto
- [ ] Considerar crear `GetStudentAcademicDataUseCase` para seguir arquitectura limpia
- [ ] Revisar manejo de errores (retorna 404 si no hay datos, podría retornar 200 con null)
- [ ] Verificar que el repositorio esté correctamente inyectado

**Notas:**

- Creado para resolver error 404 al verificar registros incompletos
- Usa repositorio directamente (debería usar use case)
- Convierte entidades de dominio a formato de presentación (castellano)
- Retorna 404 si no hay datos académicos (el frontend maneja esto correctamente)

---

## 🟡 BACKEND - Archivos Modificados

### 1. `backend/src/presentation/routes/index.js`

**Prioridad:** 🟢 BAJA  
**Cambio:** Agregada ruta `/catalogs`  
**Acción requerida:**

- [ ] Verificar que la ruta esté correctamente montada
- [ ] Revisar orden de rutas si es necesario

---

### 2. `backend/src/application/dtos/request/RegisterStudentDTO.js` ⭐ **MODIFICADO (2025-12-16)**

**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregados campos `carreraId`, `gestionIngresoId`, campos de documentos, y flag `skipDocumentValidation`  
**Acción requerida:**

- [ ] Verificar que todos los campos estén correctamente validados
- [ ] Revisar extracción de `documentosEntregados`
- [ ] Revisar lógica de `skipDocumentValidation` (permite guardado parcial)
- [ ] Asegurar que el DTO sigue el patrón establecido

**Notas:**

- Agregado `skipDocumentValidation` para permitir guardar estudiantes sin validar documentos requeridos
- Útil para guardados parciales durante el proceso de registro

---

### 3. `backend/src/application/use-cases/Estudiantes/RegisterStudentUseCase.js` ⭐ **MODIFICADO (2025-12-16)**

**Prioridad:** 🔴 ALTA  
**Problema:** Lógica de creación de datos académicos y documentos mezclada con creación de estudiante  
**Cambio adicional:** Agregada validación condicional de documentos requeridos basada en `skipDocumentValidation`  
**Acción requerida:**

- [ ] Crear `CreateStudentAcademicDataUseCase` separado
- [ ] Crear `CreateStudentDocumentsUseCase` separado
- [ ] Orquestar use cases desde un use case superior o desde el controller
- [ ] Separar responsabilidades claramente
- [ ] Revisar validación condicional de documentos requeridos (nueva funcionalidad)
- [ ] Revisar cálculo de estado (actualmente no se guarda en BD)
- [ ] Verificar que `documentosEntregadosNormalizados` esté siempre definido (corregido bug)

**Notas:**

- Agregado `studentAcademicDataRepository` y `studentDocumentRepository`
- Lógica de validación y creación de documentos mezclada
- **NUEVO:** Validación condicional permite guardar estudiantes parcialmente sin documentos requeridos
- **BUG FIX:** Corregido error `documentosEntregadosNormalizados is not defined`

---

### 4. `backend/src/infrastructure/container/modules/estudiantes.container.js`

**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregados repositorios a dependencias de `RegisterStudentUseCase`  
**Acción requerida:**

- [ ] Verificar que todas las dependencias estén correctamente inyectadas
- [ ] Revisar si se necesitan más dependencias después de refactorizar use cases

---

### 5. `backend/src/presentation/controllers/estudiantes/list.controller.js`

**Prioridad:** 🔴 ALTA  
**Problema:** Implementación rápida usando repositorio directamente sin use case  
**Acción requerida:**

- [ ] Crear `ListStudentsUseCase` completo con:
  - Filtros avanzados
  - Paginación del lado del servidor
  - Ordenamiento
  - Búsqueda
- [ ] Controller solo debe orquestar use case

---

### 6. `backend/src/presentation/routes/student.routes.js` ⭐ **MODIFICADO (2025-12-16)**

**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregada ruta `POST /:id/documentos` con middleware de multer, ruta `GET /:id/documentos`, y ruta `GET /:id/datos-academicos`  
**Acción requerida:**

- [ ] Verificar orden de rutas (específicas antes de genéricas)
- [ ] Revisar middleware de multer
- [ ] Agregar validadores si es necesario
- [ ] Verificar que las rutas GET estén correctamente posicionadas antes de `/:id`

**Notas:**

- Ruta reordenada para evitar conflictos con `/:id`
- **NUEVO:** Agregada ruta GET para obtener documentos de un estudiante (resuelve error 404)
- **NUEVO:** Agregada ruta GET para obtener datos académicos de un estudiante (resuelve error 404)

---

### 19. `backend/src/infrastructure/container/modules/repositories.container.js`

**Prioridad:** 🟢 BAJA  
**Cambio:** Agregado registro de `documentacionRepository`  
**Acción requerida:**

- [ ] Verificar que el registro esté correcto
- [ ] Revisar si hay otros repositorios pendientes de registrar

---

### 20. `backend/src/infrastructure/database/models/index.js`

**Prioridad:** 🟢 BAJA  
**Cambio:** Agregado export de Documentacion  
**Acción requerida:**

- [ ] Verificar que el export esté correcto

---

### 12. `backend/src/infrastructure/database/models/DocumentoEstudiante.js`

**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregados campos `documentacionId` y `esOriginal`  
**Acción requerida:**

- [ ] Verificar que todos los campos estén sincronizados con schema de BD
- [ ] Revisar que `tipoDocumento` haya sido removido correctamente

---

### 13. `backend/src/infrastructure/repositories/StudentDocumentRepository.js`

**Prioridad:** 🟡 MEDIA  
**Cambio:** Actualizado mapeo para incluir `documentacionId` y `esOriginal`  
**Acción requerida:**

- [ ] Verificar que `toEntity()` y `mapDataToModel()` estén correctos
- [ ] Revisar método `findByTipoDocumento()` (ahora consulta documentacion primero)
- [ ] Verificar que `tipoDocumento` haya sido removido correctamente

---

### 14. `backend/src/domain/constants/index.js`

**Prioridad:** 🟡 MEDIA  
**Cambio:** Probablemente agregadas constantes relacionadas con documentos  
**Acción requerida:**

- [ ] Revisar constantes agregadas
- [ ] Verificar que sigan el patrón establecido
- [ ] Documentar nuevas constantes si es necesario

---

### 15. `backend/src/presentation/controllers/estudiantes/create.controller.js`

**Prioridad:** 🟡 MEDIA  
**Cambio:** Probablemente agregados logs de debug  
**Acción requerida:**

- [ ] Revisar logs de debug agregados
- [ ] Remover logs innecesarios
- [ ] Mantener solo logs esenciales para producción

---

### 16. `backend/src/presentation/middleware/errorHandler.middleware.js`

**Prioridad:** 🟡 MEDIA  
**Cambio:** Posibles mejoras en manejo de errores  
**Acción requerida:**

- [ ] Revisar cambios en manejo de errores
- [ ] Verificar que todos los errores se manejen correctamente
- [ ] Asegurar que los mensajes de error sean apropiados

---

### 17. `backend/src/presentation/middleware/validation.middleware.js`

**Prioridad:** 🟡 MEDIA
**Cambio:** Posibles mejoras en validación  
**Acción requerida:**

- [ ] Revisar cambios en validación
- [ ] Verificar que todas las validaciones funcionen correctamente
- [ ] Asegurar que los mensajes de validación sean claros

---

### 18. `backend/src/infrastructure/external/storage/.gitkeep` [ELIMINADO]

**Prioridad:** 🟢 BAJA  
**Estado:** Archivo eliminado (reemplazado por multer.config.js)  
**Acción requerida:**

- [ ] Verificar que el directorio se mantenga en git
- [ ] No requiere acción adicional

---

### 14. `backend/src/presentation/controllers/catalogs.controller.js` (MODIFICADO después de creación)

**Prioridad:** 🔴 ALTA  
**Cambio:** Agregados endpoints geográficos con filtrado  
**Problema:** Usa repositorios directamente sin use cases  
**Acción requerida:**

- [ ] Crear use cases para catálogos geográficos
- [ ] Mover lógica de filtrado a use cases
- [ ] Controller solo debe orquestar use cases

---

### 15. `backend/src/presentation/routes/catalogs.routes.js` (MODIFICADO después de creación)
**Prioridad:** 🟢 BAJA  
**Cambio:** Agregadas rutas geográficas con query params  
**Acción requerida:**
- [ ] Verificar que todas las rutas estén correctamente documentadas
- [ ] Agregar validadores para query params si es necesario

---

## 🔴 FRONTEND - Archivos Creados (NUEVOS)

### 1. `frontend/src/application/modules/estudiantes/hooks/useUpdateStudent.js`
**Prioridad:** 🟡 MEDIA  
**Estado:** Hook para actualizar estudiantes  
**Acción requerida:**
- [ ] Revisar implementación del hook
- [ ] Verificar manejo de errores
- [ ] Revisar subida de archivos en actualización
- [ ] Asegurar que siga el patrón de otros hooks

---

### 2. `frontend/src/presentation/components/organisms/WizardForm/` (directorio completo)
**Prioridad:** 🟡 MEDIA  
**Estado:** Componente wizard para formularios multi-paso  
**Acción requerida:**
- [ ] Revisar estructura del componente
- [ ] Verificar que use `GenericForm` correctamente
- [ ] Revisar lógica de navegación entre pasos
- [ ] Verificar manejo de valores acumulados
- [ ] Asegurar que siga el patrón de organismos

---

### 3. `frontend/src/presentation/modules/estudiantes/config/wizardSteps.js`
**Prioridad:** 🟡 MEDIA  
**Estado:** Configuración de pasos del wizard  
**Acción requerida:**
- [ ] Revisar configuración de pasos
- [ ] Verificar que todos los pasos estén correctamente definidos
- [ ] Asegurar que la configuración sea mantenible

---

## 🔴 FRONTEND - Archivos Modificados

### 1. `frontend/src/application/modules/estudiantes/hooks/useStudentFormData.js`
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregadas llamadas a API para cargar catálogos y datos geográficos  
**Acción requerida:**
- [ ] Revisar si se puede optimizar la carga de datos
- [ ] Considerar caché para catálogos
- [ ] Revisar manejo de errores
- [ ] Verificar que todas las funciones de carga estén siendo usadas

**Notas:** Carga todos los datos geográficos al inicio (puede ser lento con muchos datos)

---

### 2. `frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx` ⭐ **MODIFICADO (2025-12-16)**
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregados catálogos al contexto, y manejo de `estudianteId` para completar registro  
**Acción requerida:**
- [ ] Verificar que todos los catálogos estén correctamente expuestos
- [ ] Revisar si hay catálogos innecesarios
- [ ] Optimizar carga de datos si es necesario
- [ ] Revisar lógica de manejo de `estudianteId` en `handleWizardSubmit` (nueva funcionalidad)

**Notas:** 
- **NUEVO:** Maneja `estudianteId` que viene de los datos cuando se completa un registro existente
- **NUEVO:** Sincroniza estado del estudiante durante el wizard cuando se completa registro

---

### 3. `frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx` ⭐ **MODIFICADO (2025-12-16)**
**Prioridad:** 🔴 ALTA  
**Problema:** Lógica de generación de campos de documentos mezclada con componente  
**Cambio adicional:** Agregada funcionalidad para cargar datos de estudiante existente, completar registro, y gestión de documentos existentes  
**Acción requerida:**
- [ ] Mover lógica de generación de campos de documentos a función helper o a `formFields.js`
- [ ] Separar responsabilidades claramente
- [ ] Revisar valores iniciales y dependencias geográficas
- [ ] Verificar que `resolveOptions` esté correctamente implementado
- [ ] Revisar lógica de carga de datos de estudiante existente (nueva funcionalidad)
- [ ] Verificar manejo de documentos y datos académicos al cargar estudiante
- [ ] Revisar lógica de guardado de documentos existentes en `_documentosExistentes`
- [ ] Verificar que la validación condicional de archivos funcione correctamente

**Notas:** 
- Genera campos de documentos dinámicamente usando `useMemo`
- Tiene lógica de generación de `wizardSteps`
- **NUEVO:** Carga datos de estudiante existente cuando se pasa `estudianteId` en URL
- **NUEVO:** Prellena formulario con datos existentes (personales, documentos, académicos)
- **NUEVO:** Mejora en labels de documentos (asterisco para requeridos, info de fotocopia)
- **NUEVO:** Guarda información de documentos existentes en `_documentosExistentes` para pasarla a campos de upload
- **NUEVO:** Validación condicional: no requiere archivo si ya existe documento guardado
- **NUEVO:** Resolución de datos geográficos (departamento/provincia) desde municipios al cargar estudiante

---

### 4. `frontend/src/presentation/modules/estudiantes/config/formFields.js` ⭐ **MODIFICADO (2025-12-16 tarde)**
**Prioridad:** 🔴 ALTA  
**Problema:** Configuración compleja con muchas dependencias y renderizado condicional  
**Cambio adicional:** Agregado `watchFields` explícito para campo de discapacidad  
**Acción requerida:**
- [ ] Revisar estructura de secciones
- [ ] Verificar que todos los campos estén correctamente configurados
- [ ] Revisar dependencias geográficas (cascada)
- [ ] Verificar renderizado condicional de `tipoDiscapacidadId`
- [ ] Revisar validación custom de `documentoPagoMatricula`
- [ ] Considerar separar en múltiples archivos si es muy grande
- [ ] Verificar que `watchFields` esté correctamente configurado para todos los campos con `shouldRender`

**Notas:** 
- Reorganización de secciones
- Cascada geográfica completa
- Renderizado condicional
- Validación custom
- **NUEVO:** Agregado `watchFields: ['tieneDiscapacidad']` al campo `tipoDiscapacidadId` para que se observe correctamente el switch

---

### 5. `frontend/src/presentation/pages/Estudiantes/List/List.jsx` ⭐ **MODIFICADO (2025-12-16)**
**Prioridad:** 🔴 ALTA  
**Problema:** ⚠️ **VIOLACIÓN GRAVE DE ARQUITECTURA** - Todo el código está en un solo archivo  
**Cambio adicional:** Agregada funcionalidad de "Completar Registro" para estudiantes con registro incompleto  
**Acción requerida:**
- [ ] Separar en componentes (molecules/organisms):
  - Tabla de estudiantes
  - Barra de búsqueda
  - Filtros avanzados
  - Acciones (botones)
- [ ] Crear hooks personalizados para lógica de negocio:
  - `useEstudiantesList` para carga y filtrado
  - `useEstudiantesSearch` para búsqueda
  - `useRegistroIncompleto` para verificar estado de registro (nueva funcionalidad)
- [ ] Mover funciones auxiliares a utils
- [ ] Crear estilos separados si es necesario
- [ ] Implementar paginación del lado del servidor
- [ ] Agregar filtros avanzados
- [ ] Revisar lógica de verificación de registros incompletos (nueva funcionalidad)
- [ ] Optimizar verificación de registros (actualmente verifica todos los estudiantes)

**Notas:** 
- **NUEVO:** Agregada columna "Estado" que muestra si el registro está completo o incompleto
- **NUEVO:** Agregada columna "Acciones" con botón "Completar Registro" para estudiantes incompletos
- **NUEVO:** Verificación automática de documentos y datos académicos para detectar registros incompletos
- **NUEVO:** Navegación a página de registro con `estudianteId` en URL

---

### 6. `frontend/src/presentation/components/molecules/FormField/FormField.jsx` ⭐ **MODIFICADO (2025-12-16)**
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregado soporte para `checkbox`, filtrado dinámico basado en dependencias, props `help` y `required`, badges/tooltips para documentos, gestión de documentos existentes, optimización de observación de dependencias geográficas, y preservación de valores seleccionados al navegar entre pasos del wizard  
**Acción requerida:**
- [ ] Revisar implementación de filtrado dinámico
- [ ] Verificar que el filtrado funcione correctamente para todos los casos
- [ ] Optimizar `useEffect` para evitar renders innecesarios
- [ ] Revisar manejo de dependencias geográficas
- [ ] Verificar que `help` y `required` se muestren correctamente en todos los tipos de campo
- [ ] Revisar implementación de badges y tooltips para documentos
- [ ] Verificar gestión de estado de documentos existentes (mostrar enlace vs input file)
- [ ] Optimizar lógica de `uploadStates` para múltiples campos de upload
- [ ] Revisar lógica de observación de dependencias geográficas (solo campos select con dependencias geográficas)
- [ ] Verificar que los campos geográficos se actualicen correctamente cuando cambian las dependencias
- [ ] Revisar lógica de preservación de valores seleccionados cuando la dependencia no está establecida

**Notas:** 
- Filtrado funciona para campos de nacimiento y residencia independientemente
- Agregado soporte para `checkbox`
- **NUEVO:** Agregado soporte para `help` (texto de ayuda) y `required` (indicador de campo requerido)
- **NUEVO:** Badges de color (verde/naranja) para indicar si acepta fotocopia en campo upload
- **NUEVO:** Tooltip con ícono de información para mostrar descripción completa del documento
- **NUEVO:** Gestión de documentos existentes: muestra enlace al documento con botón "Modificar" para reemplazar
- **NUEVO:** Input file oculto inicialmente si hay documento existente, solo se muestra al hacer clic en "Modificar"
- **NUEVO:** Optimización: Solo observa dependencias para campos geográficos (select con dependencias), no para campos de texto/textarea
- **NUEVO:** Lectura directa del formulario para valores iniciales de campos geográficos
- **NUEVO:** Preservación de valores seleccionados: No limpia automáticamente campos cuando la dependencia está vacía (permite restauración de valores guardados)
- **NUEVO:** Si hay valor seleccionado pero no está en opciones filtradas, lo agrega desde opciones originales para mantenerlo visible
- **NUEVO:** Mantiene todas las opciones si hay valor seleccionado pero no hay dependencia (útil al volver a paso anterior)

---

### 7. `frontend/src/presentation/components/molecules/FormSection/FormSection.jsx` ⭐ **MODIFICADO (2025-12-16 tarde)**
**Prioridad:** 🟡 MEDIA  
**Cambio:** Implementado renderizado condicional de campos, optimización de observación de campos, y mejoras para switch de discapacidad  
**Acción requerida:**
- [ ] Revisar implementación de `Form.useWatch()`
- [ ] Verificar que el renderizado condicional funcione correctamente
- [ ] Optimizar para evitar renders innecesarios
- [ ] Revisar que `prevFormValuesRef` esté funcionando correctamente
- [ ] Verificar que solo se observen campos necesarios (geográficos y campos con shouldRender)
- [ ] Revisar lógica de inicialización de campos visibles
- [ ] Verificar que el switch de discapacidad muestre/oculte el select correctamente
- [ ] Revisar logs de depuración y removerlos en producción

**Notas:** 
- Filtra campos dinámicamente basado en `shouldRender`
- Usa `Form.useWatch()` para observar cambios
- **NUEVO:** Solo observa campos geográficos (select con dependencias geográficas) y campos con `shouldRender`
- **NUEVO:** Inicialización mejorada de campos visibles basándose en valores iniciales del formulario
- **NUEVO:** Key dinámica en FormField que incluye valor de dependencia para forzar re-render
- **NUEVO:** Logs de depuración agregados para diagnosticar problemas con shouldRender

---

### 8. `frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx` ⭐ **MODIFICADO (2025-12-16 tarde)**
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregado prop `onFieldChange` y `wizardMode`, y actualización de valores cuando cambian initialValues con orden de dependencias geográficas  
**Acción requerida:**
- [ ] Verificar que `wizardMode` esté correctamente implementado
- [ ] Revisar que `onFieldChange` se pase correctamente a las secciones
- [ ] Verificar que el form se exponga correctamente via ref
- [ ] Revisar lógica de actualización de valores cuando cambian initialValues
- [ ] Verificar que el orden de establecimiento de valores geográficos funcione correctamente

**Notas:** 
- Agregado soporte para modo wizard
- Pasa `onFieldChange` a `FormSection`
- **NUEVO:** Actualiza valores del formulario cuando cambian los initialValues (importante en modo wizard)
- **NUEVO:** Establece valores en orden de dependencias geográficas (país → departamento → provincia → municipio)
- **NUEVO:** Usa setTimeout con delay para asegurar que formulario y opciones estén listas antes de establecer valores

---

### 9. `frontend/src/presentation/components/organisms/WizardForm/WizardForm.jsx` ⭐ **MODIFICADO (2025-12-16)**
**Prioridad:** 🟡 MEDIA  
**Cambio:** Actualizado para usar `App.useApp()`, validación parcial de pasos, guardado temporal, actualización de valores cuando cambian initialValues, y preservación de valores al navegar entre pasos  
**Acción requerida:**
- [ ] Verificar que el uso de `App.useApp()` esté correcto
- [ ] Revisar lógica de navegación entre pasos
- [ ] Verificar manejo de valores acumulados
- [ ] Revisar validación parcial de pasos (nueva funcionalidad)
- [ ] Verificar que `getCurrentStepFields()` funcione correctamente
- [ ] Revisar lógica de guardado temporal vs finalización
- [ ] Revisar `useEffect` que actualiza `formValues` cuando cambian `initialValues` (nueva funcionalidad)
- [ ] Verificar que la actualización del formulario de Ant Design con `setFieldsValue` funcione correctamente
- [ ] Revisar lógica de guardado de valores antes de retroceder

**Notas:** 
- Cambio reciente para eliminar warning de Ant Design
- Usa `GenericForm` internamente
- **NUEVO:** Validación solo de campos del paso actual (no valida pasos siguientes)
- **NUEVO:** Botón "Guardar y Continuar Después" guarda en backend sin validar documentos requeridos
- **NUEVO:** Permite guardar progreso parcial y continuar después
- **NUEVO:** Actualiza `formValues` cuando cambian los `initialValues` (útil cuando se cargan datos de estudiante existente)
- **NUEVO:** Usa `requestAnimationFrame` para actualizar formulario de Ant Design después del renderizado
- **NUEVO:** Guarda valores actuales del formulario antes de retroceder (handlePrev) para preservar valores geográficos y otros campos
- **NUEVO:** Eliminados logs de depuración excesivos

---

### 10. `frontend/src/presentation/components/molecules/HelpGuideCard/HelpGuideCard.jsx`
**Prioridad:** 🟢 BAJA  
**Cambio:** Actualizado información de ayuda con detalles específicos  
**Acción requerida:**
- [ ] Verificar que la información esté actualizada
- [ ] Revisar que coincida con la funcionalidad actual
- [ ] Mantener actualizado si cambian los procesos

---

### 11. `frontend/src/application/modules/estudiantes/hooks/useCreateStudent.js`
**Prioridad:** 🟡 MEDIA  
**Cambio:** Reescrito para usar `apiClient` y subir archivos después de crear estudiante  
**Acción requerida:**
- [ ] Revisar manejo de errores en subida de archivos
- [ ] Considerar rollback si falla la subida
- [ ] Verificar que todos los archivos se suban correctamente
- [ ] Revisar extracción de `documentosEntregados` y `archivosASubir`

**Notas:** 
- Separa documentos entregados de archivos a subir
- Sube archivos después de crear estudiante

---

### 13. `frontend/src/application/modules/estudiantes/hooks/useUpdateStudent.js` ⭐ **MODIFICADO (2025-12-16)**
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregado soporte para guardado parcial, actualización de estudiantes existentes, flag `skipDocumentValidation`, y subida automática de documentos  
**Acción requerida:**
- [ ] Revisar implementación del hook
- [ ] Verificar manejo de errores
- [ ] Revisar subida de archivos en actualización
- [ ] Verificar lógica de detección de `estudianteId` en datos (nueva funcionalidad)
- [ ] Revisar envío de flag `skipDocumentValidation` al backend
- [ ] Verificar que la subida automática de documentos funcione correctamente (nueva funcionalidad)
- [ ] Asegurar que siga el patrón de otros hooks

**Notas:** 
- **NUEVO:** Detecta automáticamente si hay `estudianteId` en los datos para actualizar en lugar de crear
- **NUEVO:** Envía `skipDocumentValidation=true` cuando es guardado temporal
- **NUEVO:** Permite crear estudiante en primer paso y actualizar en pasos siguientes
- **NUEVO:** Maneja actualización de estudiantes existentes cuando se completa registro
- **NUEVO:** Sube documentos automáticamente si hay archivo, aunque el checkbox no esté marcado (el hecho de subir un archivo implica que el documento está entregado)
- **NUEVO:** Agregados logs de depuración para rastrear subida de documentos

---

### 12. `frontend/src/main.jsx`
**Prioridad:** 🟢 BAJA  
**Cambio:** Agregado componente `App` de Ant Design para contexto de tema  
**Acción requerida:**
- [ ] Verificar que el componente `App` esté correctamente configurado
- [ ] Revisar que el warning de Ant Design haya desaparecido

**Notas:** Cambio reciente para eliminar warning de Ant Design

---

## 📄 DOCUMENTACIÓN - Archivos Modificados/Creados

### 1. `docs/05-modelo-datos.md`
**Prioridad:** 🟢 BAJA  
**Estado:** Documentación actualizada  
**Acción requerida:**
- [ ] Revisar cambios en documentación
- [ ] Verificar que la información esté actualizada
- [ ] Asegurar que coincida con la implementación actual

---

### 2. `frontend/CAMBIOS_PRESENTACION.md`
**Prioridad:** 🟢 BAJA  
**Estado:** Documentación de cambios realizados  
**Acción requerida:**
- [ ] Mantener actualizado si se hacen más cambios
- [ ] Considerar mover a carpeta de documentación general

---

### 3. `REFACTORIZACION_PENDIENTE.md` (este documento)
**Prioridad:** 🟢 BAJA  
**Estado:** Checklist de refactorización  
**Acción requerida:**
- [ ] Actualizar conforme se vayan completando las tareas
- [ ] Marcar como completado cuando termine la refactorización

---

## 📊 Resumen por Prioridad

### 🔴 Prioridad ALTA (8 archivos)
1. `backend/src/presentation/controllers/catalogs.controller.js`
2. `backend/src/presentation/controllers/estudiantes/upload-document.controller.js`
3. `backend/src/application/use-cases/Estudiantes/RegisterStudentUseCase.js` ⭐
4. `backend/src/presentation/controllers/estudiantes/list.controller.js`
5. `frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx` ⭐
6. `frontend/src/presentation/modules/estudiantes/config/formFields.js`
7. `frontend/src/presentation/pages/Estudiantes/List/List.jsx` ⭐
8. `backend/src/presentation/controllers/catalogs.controller.js` (modificado)

⭐ = Modificado hoy (2025-12-16)

### 🟡 Prioridad MEDIA (20 archivos)
1. `backend/src/infrastructure/external/storage/multer.config.js`
2. `backend/src/application/dtos/request/RegisterStudentDTO.js` ⭐
3. `backend/src/infrastructure/container/modules/estudiantes.container.js`
4. `backend/src/presentation/routes/student.routes.js` ⭐
5. `backend/src/infrastructure/database/models/DocumentoEstudiante.js`
6. `backend/src/infrastructure/repositories/StudentDocumentRepository.js`
7. `frontend/src/application/modules/estudiantes/hooks/useStudentFormData.js`
8. `frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx` ⭐
9. `frontend/src/presentation/components/molecules/FormField/FormField.jsx` ⭐
10. `frontend/src/presentation/components/molecules/FormSection/FormSection.jsx`
11. `frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx`
12. `frontend/src/presentation/components/organisms/WizardForm/WizardForm.jsx` ⭐
13. `frontend/src/application/modules/estudiantes/hooks/useCreateStudent.js`
14. `frontend/src/application/modules/estudiantes/hooks/useUpdateStudent.js` ⭐
15. `backend/src/presentation/controllers/estudiantes/get-documents.controller.js` ⭐ (NUEVO)
16. `backend/src/presentation/controllers/estudiantes/get-academic-data.controller.js` ⭐ (NUEVO)

⭐ = Modificado/Creado hoy (2025-12-16)

### 🟢 Prioridad BAJA (20 archivos)
1. `backend/src/presentation/routes/catalogs.routes.js`
2. `backend/src/presentation/routes/index.js`
3. `backend/src/infrastructure/database/models/Documentacion.js`
4. `backend/src/domain/entities/Documentacion.js`
5. `backend/src/infrastructure/repositories/DocumentacionRepository.js`
6. `backend/src/infrastructure/container/modules/repositories.container.js`
7. `backend/src/infrastructure/database/models/index.js`
8. `frontend/src/presentation/components/molecules/HelpGuideCard/HelpGuideCard.jsx`
9. `frontend/src/main.jsx`

---

## 🎯 Plan de Refactorización Recomendado

### Fase 1: Backend - Use Cases (Prioridad ALTA)
1. Crear `CatalogUseCase` genérico o use cases específicos
2. Crear `UploadDocumentUseCase`
3. Crear `ListStudentsUseCase`
4. Separar `CreateStudentAcademicDataUseCase`
5. Separar `CreateStudentDocumentsUseCase`
6. Refactorizar `RegisterStudentUseCase` para orquestar use cases

### Fase 2: Frontend - Separación de Responsabilidades (Prioridad ALTA)
1. Refactorizar `List.jsx` en componentes modulares
2. Mover lógica de generación de campos de `Registrar.jsx` a helpers
3. Revisar y optimizar `formFields.js`

### Fase 3: Optimizaciones (Prioridad MEDIA)
1. Optimizar carga de catálogos (caché, lazy loading)
2. Mejorar manejo de errores
3. Implementar paginación del lado del servidor
4. Optimizar filtrado geográfico

### Fase 4: Limpieza (Prioridad BAJA)
1. Revisar y documentar todos los archivos
2. Eliminar código comentado
3. Actualizar documentación

---

## 📝 Notas Finales

- **Total de archivos a revisar:** 55 (54 de código + 1 documentación)
- **Archivos con violaciones de arquitectura:** 5
- **Archivos que requieren creación de use cases:** 6 (agregados `GetStudentDocumentsUseCase` y `GetStudentAcademicDataUseCase`)
- **Archivos que requieren separación de componentes:** 2
- **Archivos nuevos (código):** 13 (agregados `get-documents.controller.js` y `get-academic-data.controller.js`)
- **Archivos modificados (código):** 39 (7 archivos modificados hoy)
- **Archivos eliminados:** 2

## 🆕 Cambios del Día (2025-12-16)

### Funcionalidades Agregadas:
1. **Guardado parcial de estudiantes:** Permite guardar estudiantes sin completar todos los pasos
2. **Completar registro:** Funcionalidad para completar registros incompletos desde la lista
3. **Validación parcial:** Solo valida campos del paso actual, no los siguientes
4. **Mejora en visualización de documentos:** Asterisco para requeridos, info de fotocopia
5. **Endpoint GET documentos:** Nuevo endpoint para obtener documentos de estudiante
6. **Endpoint GET datos académicos:** Nuevo endpoint para obtener datos académicos de estudiante
7. **Visualización mejorada de documentos:** Badges de color (verde/naranja) para indicar si acepta fotocopia, tooltips con información detallada
8. **Gestión de documentos existentes:** Muestra enlace al documento existente con opción de modificar/reemplazar, input file oculto cuando hay documento existente
9. **Validación condicional de archivos:** No requiere subir archivo si ya existe uno guardado
10. **Optimización de dependencias geográficas:** Solo observa dependencias para campos geográficos (select), no para campos de texto/textarea
11. **Mejora en switch de discapacidad:** Agregado `watchFields` explícito para que el select de tipos de discapacidad se muestre/oculte correctamente
12. **Cascada geográfica mejorada:** Los campos geográficos se actualizan correctamente cuando cambian las dependencias (país → departamento → provincia → municipio)
13. **Preservación de valores geográficos en wizard:** Los valores seleccionados en campos geográficos se mantienen al navegar entre pasos del wizard (avanzar/retroceder)
14. **Guardado de valores antes de retroceder:** WizardForm guarda valores actuales antes de cambiar de paso para preservar datos ingresados
15. **Actualización ordenada de valores geográficos:** GenericForm establece valores en orden de dependencias (país → departamento → provincia → municipio) para asegurar que las dependencias estén establecidas antes que los dependientes
16. **Subida automática de documentos:** Si hay un archivo seleccionado, se sube automáticamente al servidor aunque el checkbox "entregado" no esté marcado (el hecho de subir un archivo implica que el documento está entregado)

### Archivos Nuevos:
- `backend/src/presentation/controllers/estudiantes/get-documents.controller.js`
- `backend/src/presentation/controllers/estudiantes/get-academic-data.controller.js`
- `backend/src/presentation/controllers/estudiantes/getById.controller.js` ⭐ **NUEVO (2025-12-16 tarde)**

### Archivos Modificados:
- `backend/src/presentation/routes/student.routes.js` - Agregada ruta GET documentos y GET datos académicos
- `backend/src/application/dtos/request/RegisterStudentDTO.js` - Flag `skipDocumentValidation`
- `backend/src/application/use-cases/Estudiantes/RegisterStudentUseCase.js` - Validación condicional
- `backend/src/presentation/controllers/estudiantes/getById.controller.js` ⭐ - Implementado endpoint GET estudiante por ID
- `frontend/src/presentation/pages/Estudiantes/List/List.jsx` - Funcionalidad completar registro
- `frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx` ⭐ - Carga datos existentes, mejora en generación de campos de documentos, manejo de documentos existentes
- `frontend/src/application/modules/estudiantes/hooks/useUpdateStudent.js` ⭐ - Guardado parcial, subida automática de documentos (si hay archivo, se sube aunque checkbox no esté marcado)
- `frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx` - Manejo estudianteId, método `setCurrentStudentId`
- `frontend/src/presentation/components/organisms/WizardForm/WizardForm.jsx` ⭐ - Validación parcial, actualización de valores cuando cambian initialValues, guardado de valores antes de retroceder
- `frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx` ⭐ - Actualización de valores cuando cambian initialValues, orden de dependencias geográficas
- `frontend/src/presentation/components/molecules/FormField/FormField.jsx` ⭐ - Props help y required, badges y tooltips para documentos, gestión de documentos existentes, optimización de dependencias geográficas, preservación de valores seleccionados
- `frontend/src/presentation/components/molecules/FormSection/FormSection.jsx` ⭐ - Optimización de observación de campos, mejoras para switch de discapacidad
- `frontend/src/presentation/modules/estudiantes/config/formFields.js` ⭐ - Agregado `watchFields` para campo de discapacidad

⭐ = Modificado en sesión de tarde (2025-12-16)

**Última actualización:** 2025-12-16 (incluye cambios de mañana, tarde y noche)  
**Próximo paso:** Revisar archivo por archivo según prioridad

---

## 🔧 Cambios Recientes (2025-12-16 noche)

### Mejoras en Subida de Documentos:
- **`useUpdateStudent.js`:** Modificado para subir documentos automáticamente si hay un archivo seleccionado, aunque el checkbox "entregado" no esté marcado. Esto resuelve el problema de que los documentos no se subían cuando el usuario seleccionaba un archivo pero olvidaba marcar el checkbox.
- Agregados logs de depuración para rastrear el proceso de subida de documentos y facilitar el diagnóstico de problemas.

