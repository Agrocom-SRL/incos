# Checklist de Refactorización Post-Presentación

**Fecha de creación:** 2025-12-16  
**Motivo:** Documentar todos los archivos creados/modificados durante la implementación rápida para presentación  
**Estado:** ⚠️ REQUIERE REFACTORIZACIÓN COMPLETA

---

## 📋 Resumen Ejecutivo

Este documento lista **TODOS** los archivos que fueron creados o modificados durante la implementación rápida para la presentación. Cada archivo debe ser revisado y refactorizado según la arquitectura limpia establecida.

**Total de archivos afectados:** 46
- **Backend:** 23 archivos (7 nuevos, 15 modificados, 1 eliminado)
- **Frontend:** 22 archivos (4 nuevos, 17 modificados, 1 eliminado)
- **Documentación:** 1 archivo modificado

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

## 🟡 BACKEND - Archivos Modificados

### 1. `backend/src/presentation/routes/index.js`
**Prioridad:** 🟢 BAJA  
**Cambio:** Agregada ruta `/catalogs`  
**Acción requerida:**
- [ ] Verificar que la ruta esté correctamente montada
- [ ] Revisar orden de rutas si es necesario

---

### 2. `backend/src/application/dtos/request/RegisterStudentDTO.js`
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregados campos `carreraId`, `gestionIngresoId`, y campos de documentos  
**Acción requerida:**
- [ ] Verificar que todos los campos estén correctamente validados
- [ ] Revisar extracción de `documentosEntregados`
- [ ] Asegurar que el DTO sigue el patrón establecido

---

### 3. `backend/src/application/use-cases/Estudiantes/RegisterStudentUseCase.js`
**Prioridad:** 🔴 ALTA  
**Problema:** Lógica de creación de datos académicos y documentos mezclada con creación de estudiante  
**Acción requerida:**
- [ ] Crear `CreateStudentAcademicDataUseCase` separado
- [ ] Crear `CreateStudentDocumentsUseCase` separado
- [ ] Orquestar use cases desde un use case superior o desde el controller
- [ ] Separar responsabilidades claramente
- [ ] Revisar validación de documentos requeridos
- [ ] Revisar cálculo de estado (actualmente no se guarda en BD)

**Notas:** 
- Agregado `studentAcademicDataRepository` y `studentDocumentRepository`
- Lógica de validación y creación de documentos mezclada

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

### 6. `backend/src/presentation/routes/student.routes.js`
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregada ruta `POST /:id/documentos` con middleware de multer  
**Acción requerida:**
- [ ] Verificar orden de rutas (específicas antes de genéricas)
- [ ] Revisar middleware de multer
- [ ] Agregar validadores si es necesario

**Notas:** Ruta reordenada para evitar conflictos con `/:id`

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

### 2. `frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx`
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregados catálogos al contexto  
**Acción requerida:**
- [ ] Verificar que todos los catálogos estén correctamente expuestos
- [ ] Revisar si hay catálogos innecesarios
- [ ] Optimizar carga de datos si es necesario

---

### 3. `frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx`
**Prioridad:** 🔴 ALTA  
**Problema:** Lógica de generación de campos de documentos mezclada con componente  
**Acción requerida:**
- [ ] Mover lógica de generación de campos de documentos a función helper o a `formFields.js`
- [ ] Separar responsabilidades claramente
- [ ] Revisar valores iniciales y dependencias geográficas
- [ ] Verificar que `resolveOptions` esté correctamente implementado

**Notas:** 
- Genera campos de documentos dinámicamente usando `useMemo`
- Tiene lógica de generación de `wizardSteps`

---

### 4. `frontend/src/presentation/modules/estudiantes/config/formFields.js`
**Prioridad:** 🔴 ALTA  
**Problema:** Configuración compleja con muchas dependencias y renderizado condicional  
**Acción requerida:**
- [ ] Revisar estructura de secciones
- [ ] Verificar que todos los campos estén correctamente configurados
- [ ] Revisar dependencias geográficas (cascada)
- [ ] Verificar renderizado condicional de `tipoDiscapacidadId`
- [ ] Revisar validación custom de `documentoPagoMatricula`
- [ ] Considerar separar en múltiples archivos si es muy grande

**Notas:** 
- Reorganización de secciones
- Cascada geográfica completa
- Renderizado condicional
- Validación custom

---

### 5. `frontend/src/presentation/pages/Estudiantes/List/List.jsx`
**Prioridad:** 🔴 ALTA  
**Problema:** ⚠️ **VIOLACIÓN GRAVE DE ARQUITECTURA** - Todo el código está en un solo archivo  
**Acción requerida:**
- [ ] Separar en componentes (molecules/organisms):
  - Tabla de estudiantes
  - Barra de búsqueda
  - Filtros avanzados
  - Acciones (botones)
- [ ] Crear hooks personalizados para lógica de negocio:
  - `useEstudiantesList` para carga y filtrado
  - `useEstudiantesSearch` para búsqueda
- [ ] Mover funciones auxiliares a utils
- [ ] Crear estilos separados si es necesario
- [ ] Implementar paginación del lado del servidor
- [ ] Agregar filtros avanzados

---

### 6. `frontend/src/presentation/components/molecules/FormField/FormField.jsx`
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregado soporte para `checkbox` y filtrado dinámico basado en dependencias  
**Acción requerida:**
- [ ] Revisar implementación de filtrado dinámico
- [ ] Verificar que el filtrado funcione correctamente para todos los casos
- [ ] Optimizar `useEffect` para evitar renders innecesarios
- [ ] Revisar manejo de dependencias geográficas

**Notas:** 
- Filtrado funciona para campos de nacimiento y residencia independientemente
- Agregado soporte para `checkbox`

---

### 7. `frontend/src/presentation/components/molecules/FormSection/FormSection.jsx`
**Prioridad:** 🟡 MEDIA  
**Cambio:** Implementado renderizado condicional de campos  
**Acción requerida:**
- [ ] Revisar implementación de `Form.useWatch()`
- [ ] Verificar que el renderizado condicional funcione correctamente
- [ ] Optimizar para evitar renders innecesarios
- [ ] Revisar que `prevFormValuesRef` esté funcionando correctamente

**Notas:** 
- Filtra campos dinámicamente basado en `shouldRender`
- Usa `Form.useWatch()` para observar cambios

---

### 8. `frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx`
**Prioridad:** 🟡 MEDIA  
**Cambio:** Agregado prop `onFieldChange` y `wizardMode`  
**Acción requerida:**
- [ ] Verificar que `wizardMode` esté correctamente implementado
- [ ] Revisar que `onFieldChange` se pase correctamente a las secciones
- [ ] Verificar que el form se exponga correctamente via ref

**Notas:** 
- Agregado soporte para modo wizard
- Pasa `onFieldChange` a `FormSection`

---

### 9. `frontend/src/presentation/components/organisms/WizardForm/WizardForm.jsx`
**Prioridad:** 🟡 MEDIA  
**Cambio:** Actualizado para usar `App.useApp()` en lugar de `message` estático  
**Acción requerida:**
- [ ] Verificar que el uso de `App.useApp()` esté correcto
- [ ] Revisar lógica de navegación entre pasos
- [ ] Verificar manejo de valores acumulados
- [ ] Revisar validación de pasos

**Notas:** 
- Cambio reciente para eliminar warning de Ant Design
- Usa `GenericForm` internamente

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
3. `backend/src/application/use-cases/Estudiantes/RegisterStudentUseCase.js`
4. `backend/src/presentation/controllers/estudiantes/list.controller.js`
5. `frontend/src/presentation/modules/estudiantes/pages/Registrar/Registrar.jsx`
6. `frontend/src/presentation/modules/estudiantes/config/formFields.js`
7. `frontend/src/presentation/pages/Estudiantes/List/List.jsx`
8. `backend/src/presentation/controllers/catalogs.controller.js` (modificado)

### 🟡 Prioridad MEDIA (18 archivos)
1. `backend/src/infrastructure/external/storage/multer.config.js`
2. `backend/src/application/dtos/request/RegisterStudentDTO.js`
3. `backend/src/infrastructure/container/modules/estudiantes.container.js`
4. `backend/src/presentation/routes/student.routes.js`
5. `backend/src/infrastructure/database/models/DocumentoEstudiante.js`
6. `backend/src/infrastructure/repositories/StudentDocumentRepository.js`
7. `frontend/src/application/modules/estudiantes/hooks/useStudentFormData.js`
8. `frontend/src/application/modules/estudiantes/providers/StudentProvider.jsx`
9. `frontend/src/presentation/components/molecules/FormField/FormField.jsx`
10. `frontend/src/presentation/components/molecules/FormSection/FormSection.jsx`
11. `frontend/src/presentation/components/organisms/GenericForm/GenericForm.jsx`
12. `frontend/src/presentation/components/organisms/WizardForm/WizardForm.jsx`
13. `frontend/src/application/modules/estudiantes/hooks/useCreateStudent.js`
14. `frontend/src/application/modules/estudiantes/hooks/useUpdateStudent.js`

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

- **Total de archivos a revisar:** 46 (45 de código + 1 documentación)
- **Archivos con violaciones de arquitectura:** 5
- **Archivos que requieren creación de use cases:** 4
- **Archivos que requieren separación de componentes:** 2
- **Archivos nuevos (código):** 11
- **Archivos modificados (código):** 32
- **Archivos eliminados:** 2

**Última actualización:** 2025-12-16  
**Próximo paso:** Revisar archivo por archivo según prioridad

