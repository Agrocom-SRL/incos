# Checklist de Refactorización Post-Presentación

**Fecha de creación:** 2025-12-16  
**Motivo:** Documentar todos los archivos creados/modificados durante la implementación rápida para presentación  
**Estado:** ⚠️ REQUIERE REFACTORIZACIÓN COMPLETA

---

## 📋 Resumen Ejecutivo

Este documento lista **TODOS** los archivos que fueron creados o modificados durante la implementación rápida para la presentación. Cada archivo debe ser revisado y refactorizado según la arquitectura limpia establecida.

**Total de archivos afectados:** 68 (actualizado 2025-12-19)

- **Backend:** 36 archivos (13 nuevos, 22 modificados, 1 eliminado)
- **Frontend:** 31 archivos (4 nuevos, 26 modificados, 1 eliminado)
- **Documentación:** 1 archivo modificado

**Última actualización:** 2025-12-19 (incluye cambios de 2025-12-16 y 2025-12-19)

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

### 11. `backend/database/01-schemas/15-configuracion-sistema.sql` ⭐ **NUEVO (2025-12-19)**

**Prioridad:** 🟡 MEDIA  
**Estado:** ✅ Schema SQL para tabla de configuración del sistema  
**Acción requerida:**

- [ ] Ejecutar migración en base de datos
- [ ] Verificar que la tabla se creó correctamente
- [ ] Revisar índices y constraints

**Notas:**

- Creada para almacenar configuraciones del sistema, especialmente correlativos de códigos de estudiantes por gestión
- Estructura: `clave`, `valor`, `tipo`, `descripcion`, `categoria`
- Permite manejar múltiples gestiones académicas con correlativos independientes

---

### 12. `backend/src/infrastructure/database/models/ConfiguracionSistema.js` ⭐ **NUEVO (2025-12-19)**

**Prioridad:** 🟢 BAJA  
**Estado:** ✅ Modelo Sequelize completo siguiendo patrón establecido  
**Acción requerida:**

- [ ] Verificar que todos los campos estén correctamente mapeados
- [ ] Revisar relaciones con otras tablas si es necesario

**Notas:**

- Modelo para la tabla `configuracion_sistema`
- Extiende `baseModelFields` y `baseModelOptions`

---

### 13. `backend/src/infrastructure/repositories/ConfiguracionSistemaRepository.js` ⭐ **NUEVO (2025-12-19)**

**Prioridad:** 🟢 BAJA  
**Estado:** ✅ Repositorio completo siguiendo patrón BaseRepository  
**Acción requerida:**

- [ ] Verificar métodos personalizados: `findByClave`, `findByCategoria`, `findOrCreate`, `incrementValue`
- [ ] Revisar manejo de tipos de datos (STRING, NUMBER, BOOLEAN, JSON, DATE)

**Notas:**

- Métodos personalizados para gestión de configuraciones del sistema
- `incrementValue` usado específicamente para incrementar correlativos de códigos de estudiantes
- `findOrCreate` usado para crear configuración inicial si no existe

---

### 14. `backend/database/01-schemas/16-estudiantes-discapacidad-campos.sql` ⭐ **NUEVO (2025-12-19)**

**Prioridad:** 🟡 MEDIA  
**Estado:** ✅ Schema SQL para agregar campos de discapacidad  
**Acción requerida:**

- [ ] Ejecutar migración en base de datos
- [ ] Verificar que las columnas se agregaron correctamente
- [ ] Descomentar campos en modelos/repositorios después de ejecutar

**Notas:**

- Agrega columnas `grado_invalidez` (VARCHAR(50)) y `detalles_discapacidad` (TEXT) a tabla `estudiantes`
- Los campos están implementados en código pero comentados hasta ejecutar esta migración
- Ver archivos relacionados en sección de modificados

---

## 🟡 BACKEND - Archivos Modificados

### 1. `backend/src/presentation/routes/index.js`

**Prioridad:** 🟢 BAJA  
**Cambio:** Agregada ruta `/catalogs`  
**Acción requerida:**

- [ ] Verificar que la ruta esté correctamente montada
- [ ] Revisar orden de rutas si es necesario

---

### 22. `backend/src/infrastructure/container/modules/repositories.container.js` ⭐ **MODIFICADO (2025-12-19)**

**Prioridad:** 🟢 BAJA  
**Cambio:** Registrado `ConfiguracionSistemaRepository` en el contenedor de DI  
**Acción requerida:**

- [ ] Verificar que el registro esté correcto

**Notas:**
- Agregado para inyección de dependencias del nuevo repositorio

---

### 23. `backend/src/infrastructure/container/modules/estudiantes.container.js` ⭐ **MODIFICADO (2025-12-19)**

**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregados `configuracionSistemaRepository` y `managementRepository` a dependencias de `RegisterStudentUseCase`  
**Acción requerida:**

- [ ] Verificar que todas las dependencias estén correctamente inyectadas
- [ ] Revisar si se necesitan más dependencias después de refactorizar use cases

**Notas:**
- Agregado para permitir generación de códigos de estudiante con correlativos por gestión

---

### 24. `frontend/src/router/modules/estudiantes.routes.jsx` ⭐ **MODIFICADO (2025-12-19)**

**Prioridad:** 🟢 BAJA  
**Cambio:** Label de menú cambiado de "Nuevo Estudiante" a "Nueva Admisión"  
**Acción requerida:**

- [ ] Verificar que el cambio de label sea consistente en toda la aplicación

**Notas:**
- Cambio solicitado por usuario para mejor claridad del proceso

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
**Cambio:** Agregadas rutas geográficas con query params, agregada ruta `/estados-civiles` (2025-12-19)  
**Acción requerida:**
- [ ] Verificar que todas las rutas estén correctamente documentadas
- [ ] Agregar validadores para query params si es necesario

---

### 16. `backend/src/presentation/controllers/catalogs.controller.js` (MODIFICADO - 2025-12-19) ⭐

**Prioridad:** 🔴 ALTA  
**Cambio:** Agregado endpoint `getEstadosCiviles`, modificado `getTiposDiscapacidad` para incluir `descripcion`  
**Problema:** Usa repositorios directamente sin use cases  
**Acción requerida:**
- [ ] Crear use cases para catálogos (ya mencionado anteriormente)
- [ ] Verificar que `descripcion` se devuelva correctamente en tipos de discapacidad

---

### 17. `backend/src/domain/services/StudentCodeGenerator.js` ⭐ **MODIFICADO (2025-12-19)**

**Prioridad:** 🟡 MEDIA  
**Cambio:** Formato de código cambiado de `EST-AÑO-CORRELATIVO` a `AÑO-CORRELATIVO`, agregado método `extractCorrelativo`  
**Acción requerida:**
- [ ] Verificar que el formato nuevo sea consistente
- [ ] Revisar método `isValid` y `extractYear` para nuevo formato
- [ ] Actualizar tests si existen

**Notas:**
- Formato anterior: `EST-2025-0001`
- Formato nuevo: `2025-0001`
- Correlativo con padding de 4 dígitos (ej: `0001`, `0123`)

---

### 18. `backend/src/application/use-cases/estudiantes/RegisterStudentUseCase.js` (MODIFICADO - 2025-12-19) ⭐

**Prioridad:** 🔴 ALTA  
**Cambio adicional:** Agregado uso de `configuracionSistemaRepository` y `managementRepository` para generación de código de estudiante  
**Acción requerida:**
- [ ] Verificar lógica de obtención de año de gestión
- [ ] Revisar manejo de correlativos (incremento y persistencia)
- [ ] Verificar que se crea configuración inicial correctamente
- [ ] Revisar migración de estudiantes antiguos (casos edge)

**Notas:**
- Ahora determina año de gestión desde `dto.gestionIngresoId` o usa año actual
- Usa `findOrCreate` para obtener/crear configuración de correlativo
- Usa `incrementValue` para obtener siguiente correlativo
- Ver cambios anteriores en sección 3

---

### 19. `backend/src/infrastructure/database/models/Estudiante.js` ⭐ **MODIFICADO (2025-12-19)**

**Prioridad:** 🟡 MEDIA  
**Cambio:** Campos `gradoInvalidez` y `detallesDiscapacidad` agregados pero TEMPORALMENTE COMENTADOS  
**Acción requerida:**
- [ ] Ejecutar migración SQL `16-estudiantes-discapacidad-campos.sql`
- [ ] Descomentar campos después de ejecutar migración
- [ ] Verificar mapeo de campos

**Notas:**
- Campos comentados para evitar error SQL `Unknown column 'grado_invalidez'`
- Descomentar cuando se ejecute la migración
- Ver archivo relacionado: `backend/database/01-schemas/16-estudiantes-discapacidad-campos.sql`

---

### 20. `backend/src/infrastructure/repositories/StudentRepository.js` ⭐ **MODIFICADO (2025-12-19)**

**Prioridad:** 🟡 MEDIA  
**Cambio:** Ordenamiento por defecto actualizado para incluir `codigoEstudiante` primero, campos de discapacidad comentados temporalmente  
**Acción requerida:**
- [ ] Verificar que el ordenamiento funcione correctamente
- [ ] Descomentar campos de discapacidad después de ejecutar migración
- [ ] Revisar métodos `toEntity`, `mapDataToModel`, `mapDataToUpdate`

**Notas:**
- Orden por defecto: `[['codigoEstudiante', 'ASC'], ['apellidoPaterno', 'ASC'], ['apellidoMaterno', 'ASC'], ['nombres', 'ASC']]`
- Campos de discapacidad comentados temporalmente (ver sección 19)

---

### 21. `backend/src/application/mappers/StudentMapper.js` ⭐ **MODIFICADO (2025-12-19)**

**Prioridad:** 🟡 MEDIA  
**Cambio:** Mapeos de `gradoInvalidez` y `detallesDiscapacidad` TEMPORALMENTE COMENTADOS  
**Acción requerida:**
- [ ] Descomentar mapeos después de ejecutar migración SQL
- [ ] Verificar que los mapeos funcionen correctamente

**Notas:**
- Mapeos comentados en: `castellanoToDomain`, `domainToCastellano`, `entityToPresentation`
- Ver archivo relacionado: `backend/database/01-schemas/16-estudiantes-discapacidad-campos.sql`

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

### 1. `frontend/src/application/modules/estudiantes/hooks/useStudentFormData.js` ⭐ **MODIFICADO (2025-12-19)**
**Prioridad:** 🟡 MEDIA  
**Cambio adicional (2025-12-19):**
- Agregada carga de `estadosCiviles` desde endpoint `/v1/catalogs/estados-civiles`
- Actualizado `totalRequests` de 9 a 10
- Agregado `estados-civiles` a `catalogNames` y `/v1/catalogs/estados-civiles` a `catalogUrls`
- Procesamiento de `estadosCivilesRes` para actualizar estado

**Cambio anterior:** Agregadas llamadas a API para cargar catálogos y datos geográficos  
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

### 3. `frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx` ⭐ **MODIFICADO (2025-12-16, 2025-12-19)**
**Prioridad:** 🔴 ALTA  
**Problema:** Lógica de generación de campos de documentos mezclada con componente  
**Cambio adicional (2025-12-19):**
- Destruido `estadosCiviles` del contexto
- Actualizado `resolveOptions` para mapear `estadosCiviles`
- Mapeo de `tiposDiscapacidad` actualizado para incluir `descripcion` en las opciones

**Cambio anterior (2025-12-16):** Agregada funcionalidad para cargar datos de estudiante existente, completar registro, y gestión de documentos existentes  
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

### 4. `frontend/src/presentation/modules/estudiantes/config/formFields.js` ⭐ **MODIFICADO (2025-12-16 tarde, 2025-12-19)**
**Prioridad:** 🔴 ALTA  
**Problema:** Configuración compleja con muchas dependencias y renderizado condicional  
**Cambio adicional (2025-12-19):** 
- Agregado campo `estadoCivilId` (select con estados civiles)
- Cambio de label "Ciudad de Nacimiento" → "Localidad o Comunidad de Nacimiento"
- Agregados campos `gradoInvalidez` y `detallesDiscapacidad` (condicionales, dependen de tieneDiscapacidad y tipoDiscapacidadId)
- Agregado checkbox `esExtranjero` ("Es Extranjero / Doble Nacionalidad")
- Agregado campo `paisOrigenId` (select con lista temporal de países sudamericanos, visible cuando esExtranjero está marcado)
- Agregado `watchFields` explícito para campo de discapacidad

**Acción requerida:**
- [ ] Revisar estructura de secciones
- [ ] Verificar que todos los campos estén correctamente configurados
- [ ] Revisar dependencias geográficas (cascada)
- [ ] Verificar renderizado condicional de `tipoDiscapacidadId`, `gradoInvalidez`, `detallesDiscapacidad`, `paisOrigenId`
- [ ] Revisar validación custom de `documentoPagoMatricula`
- [ ] Considerar separar en múltiples archivos si es muy grande
- [ ] Verificar que `watchFields` esté correctamente configurado para todos los campos con `shouldRender`
- [ ] Reemplazar lista temporal de países con datos dinámicos cuando esté disponible la tabla de países

**Notas:** 
- Reorganización de secciones
- Cascada geográfica completa
- Renderizado condicional
- Validación custom
- **2025-12-16:** Agregado `watchFields: ['tieneDiscapacidad']` al campo `tipoDiscapacidadId`
- **2025-12-19:** Campos de discapacidad adicionales, estado civil, extranjeros

---

### 5. `frontend/src/presentation/pages/Estudiantes/List/List.jsx` ⭐ **MODIFICADO (2025-12-16, 2025-12-19)**
**Prioridad:** 🔴 ALTA  
**Problema:** ⚠️ **VIOLACIÓN GRAVE DE ARQUITECTURA** - Todo el código está en un solo archivo  
**Cambio adicional (2025-12-19):**
- Nuevo orden de columnas: Código de Estudiante (primera), Nombre Completo (segunda), CI (tercera)
- Formato de nombre: "Apellido Paterno Apellido Materno, Nombres" (apellidos primero)
- Ordenamiento por defecto por código de estudiante
- Búsqueda mejorada para incluir código de estudiante
- Placeholder actualizado: "Buscar por código, nombre, CI, email o celular..."

**Cambio anterior (2025-12-16):** Agregada funcionalidad de "Completar Registro" para estudiantes con registro incompleto  
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

### 6. `frontend/src/presentation/components/molecules/FormField/FormField.jsx` ⭐ **MODIFICADO (2025-12-16, 2025-12-19)**
**Prioridad:** 🟡 MEDIA  
**Cambio adicional (2025-12-19):**
- Capitalización automática de nombres y apellidos (función `capitalizeText`, handlers en `onChange` y `onBlur`)
- Placeholder dinámico para campo de nacionalidad según estado de `esExtranjero`
- Renderizado reactivo de descripción de discapacidad cuando se selecciona tipo (usa `Form.useWatch`)
- Parser personalizado para fechas que acepta guiones y barras (DD-MM-YYYY o DD/MM/YYYY) usando `dayjs` con `customParseFormat`

**Cambio anterior (2025-12-16):** Agregado soporte para `checkbox`, filtrado dinámico basado en dependencias, props `help` y `required`, badges/tooltips para documentos, gestión de documentos existentes, optimización de observación de dependencias geográficas, y preservación de valores seleccionados al navegar entre pasos del wizard  
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

### 7. `frontend/src/presentation/components/molecules/FormSection/FormSection.jsx` ⭐ **MODIFICADO (2025-12-16 tarde, 2025-12-19)**
**Prioridad:** 🟡 MEDIA  
**Cambio adicional (2025-12-19):**
- Observación de `esExtranjero` para renderizado condicional de campos relacionados con extranjeros
- Normalización de valores booleanos para `esExtranjero` en cálculo de campos visibles
- Efecto adicional para forzar actualización cuando cambia `esExtranjero`

**Cambio anterior (2025-12-16):** Implementado renderizado condicional de campos, optimización de observación de campos, y mejoras para switch de discapacidad  
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

### 8. `frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx` ⭐ **MODIFICADO (2025-12-16 tarde, 2025-12-19)**
**Prioridad:** 🟡 MEDIA  
**Cambio adicional (2025-12-19):**
- Manejo de `esExtranjero` en `handleValuesChange` (similar a `tieneDiscapacidad`)
- Fuerza actualización del formulario cuando cambia `esExtranjero` para que Form.useWatch detecte el cambio

**Cambio anterior (2025-12-16):** Agregado prop `onFieldChange` y `wizardMode`, y actualización de valores cuando cambian initialValues con orden de dependencias geográficas  
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
- **Archivos nuevos (código):** 17 (agregados en 2025-12-16: `get-documents.controller.js`, `get-academic-data.controller.js`, `getById.controller.js`; agregados en 2025-12-19: `15-configuracion-sistema.sql`, `ConfiguracionSistema.js`, `ConfiguracionSistemaRepository.js`, `16-estudiantes-discapacidad-campos.sql`)
- **Archivos modificados (código):** 48 (actualizado 2025-12-19)
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

**Última actualización:** 2025-12-19 (incluye cambios de 2025-12-16 y 2025-12-19)  
**Próximo paso:** Revisar archivo por archivo según prioridad

---

## 🔧 Cambios Recientes (2025-12-16 noche)

### Mejoras en Subida de Documentos:
- **`useUpdateStudent.js`:** Modificado para subir documentos automáticamente si hay un archivo seleccionado, aunque el checkbox "entregado" no esté marcado. Esto resuelve el problema de que los documentos no se subían cuando el usuario seleccionaba un archivo pero olvidaba marcar el checkbox.
- Agregados logs de depuración para rastrear el proceso de subida de documentos y facilitar el diagnóstico de problemas.

---

## 🆕 Cambios Recientes (2025-12-19)

### Funcionalidades Agregadas:

#### 1. **Sistema de Configuración del Sistema y Código de Estudiante Mejorado:**
- **Nuevo formato de código:** `AÑO-CORRELATIVO` (ej: `2025-0001`, `2025-0123`)
- **Nueva tabla `configuracion_sistema`:** Para almacenar correlativos por gestión académica
- **Correlativo por gestión:** Cada gestión académica tiene su propio correlativo que se reinicia
- **Migración de estudiantes antiguos:** La tabla permite manejar correlativos para estudiantes migrados

**Archivos Nuevos:**
- `backend/database/01-schemas/15-configuracion-sistema.sql` - Schema de tabla de configuración
- `backend/src/infrastructure/database/models/ConfiguracionSistema.js` - Modelo Sequelize
- `backend/src/infrastructure/repositories/ConfiguracionSistemaRepository.js` - Repositorio con métodos `findByClave`, `findOrCreate`, `incrementValue`

**Archivos Modificados:**
- `backend/src/domain/services/StudentCodeGenerator.js` - Cambio de formato a `AÑO-CORRELATIVO`
- `backend/src/application/use-cases/estudiantes/RegisterStudentUseCase.js` - Usa configuración del sistema para correlativos
- `backend/src/infrastructure/container/modules/repositories.container.js` - Registro de ConfiguracionSistemaRepository
- `backend/src/infrastructure/container/modules/estudiantes.container.js` - Inyección de configuracionSistemaRepository y managementRepository

#### 2. **Cambio de Menú: "Nuevo Registro" → "Nueva Admisión":**
- **Archivo Modificado:**
- `frontend/src/router/modules/estudiantes.routes.jsx` - Cambio de label de menú

#### 3. **Estado Civil como Catálogo:**
- **Backend:**
  - `backend/src/presentation/controllers/catalogs.controller.js` - Agregado endpoint `getEstadosCiviles`
  - `backend/src/presentation/routes/catalogs.routes.js` - Agregada ruta `/estados-civiles`
- **Frontend:**
  - `frontend/src/application/modules/estudiantes/hooks/useStudentFormData.js` - Carga de estados civiles
  - `frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx` - Exposición de estados civiles
  - `frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx` - Mapeo de estados civiles
  - `frontend/src/presentation/modules/estudiantes/config/formFields.js` - Campo `estadoCivilId` agregado

#### 4. **Mejoras en Formulario de Estudiante:**
- **Capitalización automática:** Nombres y apellidos se capitalizan automáticamente (primera letra de cada palabra)
  - `frontend/src/presentation/components/molecules/FormField/FormField.jsx` - Función `capitalizeText` y handlers en inputs
  
- **Cambio de label:** "Ciudad de Nacimiento" → "Localidad o Comunidad de Nacimiento"
  - `frontend/src/presentation/modules/estudiantes/config/formFields.js` - Actualizado label, placeholder y mensaje de validación

- **Descripción de tipos de discapacidad:** Muestra descripción cuando se selecciona un tipo
  - `backend/src/presentation/controllers/catalogs.controller.js` - Agregado `descripcion` en respuesta de tipos de discapacidad
  - `frontend/src/presentation/components/molecules/FormField/FormField.jsx` - Renderizado reactivo de descripción usando `Form.useWatch`

- **Formato de fecha de nacimiento:** Acepta guiones y barras (DD-MM-YYYY o DD/MM/YYYY)
  - `frontend/src/presentation/modules/estudiantes/config/formFields.js` - Formato cambiado a `DD-MM-YYYY`
  - `frontend/src/presentation/components/molecules/FormField/FormField.jsx` - Parser personalizado para ambos formatos usando `dayjs` con `customParseFormat`

#### 5. **Campos de Discapacidad (Temporalmente Comentados):**
- **Schema SQL creado:**
  - `backend/database/01-schemas/16-estudiantes-discapacidad-campos.sql` - Agrega `grado_invalidez` y `detalles_discapacidad`
  
- **Campos agregados pero temporalmente comentados:**
  - `backend/src/infrastructure/database/models/Estudiante.js` - Campos comentados con TODO
  - `backend/src/infrastructure/repositories/StudentRepository.js` - Mapeos comentados
  - `backend/src/application/mappers/StudentMapper.js` - Mapeos comentados
  - `backend/src/domain/entities/Student.js` - Campos mantienen propiedades (no interactúa con BD)
  
- **Razón:** Error SQL `Unknown column 'grado_invalidez'` hasta que se ejecute la migración

- **Frontend implementado:**
  - `frontend/src/presentation/modules/estudiantes/config/formFields.js` - Campos `gradoInvalidez` y `detallesDiscapacidad` configurados
  - `frontend/src/presentation/components/molecules/FormField/FormField.jsx` - Renderizado condicional de descripción
  - `frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx` - Manejo de `tieneDiscapacidad` en `onValuesChange`
  - `frontend/src/presentation/components/molecules/FormSection/FormSection.jsx` - Observación de `tieneDiscapacidad` para renderizado condicional

#### 6. **Doble Nacionalidad y Extranjeros:**
- **Checkbox "Es Extranjero / Doble Nacionalidad":**
  - `frontend/src/presentation/modules/estudiantes/config/formFields.js` - Campo `esExtranjero` agregado
  
- **Campo "País de Origen" (temporal - lista hardcodeada de países sudamericanos):**
  - `frontend/src/presentation/modules/estudiantes/config/formFields.js` - Campo `paisOrigenId` con lista temporal
  - Lista incluye: Argentina, Bolivia, Brasil, Chile, Colombia, Ecuador, Guyana, Paraguay, Perú, Surinam, Uruguay, Venezuela
  
- **Placeholder dinámico de nacionalidad:**
  - `frontend/src/presentation/components/molecules/FormField/FormField.jsx` - Cambia según estado de `esExtranjero`
  
- **Manejo reactivo:**
  - `frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx` - Manejo de `esExtranjero` en `onValuesChange`
  - `frontend/src/presentation/components/molecules/FormSection/FormSection.jsx` - Observación de `esExtranjero` para renderizado condicional

#### 7. **Ordenamiento y Visualización en Lista de Estudiantes:**
- **Nuevo orden de columnas:**
  1. Código de Estudiante (primera columna, fija)
  2. Nombre Completo (apellidos primero, luego nombres)
  3. CI (después del nombre)
  
- **Formato de nombre:** "Apellido Paterno Apellido Materno, Nombres"
  - `frontend/src/presentation/pages/Estudiantes/List/List.jsx` - Función `getFullName` actualizada
  
- **Ordenamiento por defecto:** Por código de estudiante (año y correlativo)
  - `backend/src/infrastructure/repositories/StudentRepository.js` - `getDefaultSort()` actualizado
  - `frontend/src/presentation/pages/Estudiantes/List/List.jsx` - `defaultSort` configurado en tabla
  
- **Búsqueda mejorada:** Incluye búsqueda por código de estudiante
  - `frontend/src/presentation/pages/Estudiantes/List/List.jsx` - Filtrado actualizado

### Archivos Nuevos (2025-12-19):
1. `backend/database/01-schemas/15-configuracion-sistema.sql`
2. `backend/src/infrastructure/database/models/ConfiguracionSistema.js`
3. `backend/src/infrastructure/repositories/ConfiguracionSistemaRepository.js`
4. `backend/database/01-schemas/16-estudiantes-discapacidad-campos.sql`

### Archivos Modificados (2025-12-19):
**Backend:**
1. `backend/src/domain/services/StudentCodeGenerator.js`
2. `backend/src/application/use-cases/estudiantes/RegisterStudentUseCase.js`
3. `backend/src/infrastructure/container/modules/repositories.container.js`
4. `backend/src/infrastructure/container/modules/estudiantes.container.js`
5. `backend/src/presentation/controllers/catalogs.controller.js`
6. `backend/src/presentation/routes/catalogs.routes.js`
7. `backend/src/infrastructure/database/models/Estudiante.js`
8. `backend/src/infrastructure/repositories/StudentRepository.js`
9. `backend/src/application/mappers/StudentMapper.js`

**Frontend:**
1. `frontend/src/router/modules/estudiantes.routes.jsx`
2. `frontend/src/application/modules/estudiantes/hooks/useStudentFormData.js`
3. `frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx`
4. `frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx`
5. `frontend/src/presentation/modules/estudiantes/config/formFields.js`
6. `frontend/src/presentation/components/molecules/FormField/FormField.jsx`
7. `frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx`
8. `frontend/src/presentation/components/molecules/FormSection/FormSection.jsx`
9. `frontend/src/presentation/pages/Estudiantes/List/List.jsx`

### Notas Importantes:
- ⚠️ **Campos de discapacidad comentados:** Los campos `grado_invalidez` y `detalles_discapacidad` están implementados en el código pero comentados temporalmente hasta que se ejecute la migración SQL `16-estudiantes-discapacidad-campos.sql`
- 📋 **Lista temporal de países:** El campo "País de Origen" usa una lista hardcodeada de países sudamericanos. Se debe reemplazar por una tabla de países cuando esté disponible
- 🔄 **Migración requerida:** Se debe ejecutar `15-configuracion-sistema.sql` antes de usar el nuevo sistema de códigos de estudiante
- 🔄 **Migración pendiente:** Se debe ejecutar `16-estudiantes-discapacidad-campos.sql` y luego descomentar los campos en el código

**Última actualización:** 2025-12-19

