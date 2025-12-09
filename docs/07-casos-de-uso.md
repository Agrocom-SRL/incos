# 07 - CASOS DE USO
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Documento

Este documento describe los **casos de uso** del Sistema de Gestión Académica del Instituto INCOS. Cada caso de uso detalla las interacciones entre los actores y el sistema para lograr objetivos específicos.

### 1.2 Estructura de Caso de Uso

Cada caso de uso incluye:
- **ID y Nombre**
- **Descripción**
- **Actores** (primarios y secundarios)
- **Precondiciones**
- **Flujo Principal** (camino feliz)
- **Flujos Alternativos** (caminos alternativos)
- **Flujos de Excepción** (errores)
- **Postcondiciones**
- **Reglas de Negocio Asociadas**
- **Requerimientos Relacionados**

### 1.3 Notación

- **Actor Primario:** Usuario que inicia el caso de uso
- **Actor Secundario:** Usuario o sistema que participa pero no inicia
- **[RN-XXX-NNN]:** Referencia a regla de negocio
- **[RF-XXX-NNN]:** Referencia a requerimiento funcional

---

## 2. DIAGRAMA GENERAL DE CASOS DE USO

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA INCOS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Secretaria Académica]                                         │
│       │                                                         │
│       ├──> CU-001: Registrar Estudiante                        │
│       ├──> CU-002: Inscribir a Gestión                         │
│       ├──> CU-003: Inscribir a Materias                        │
│       └──> CU-010: Generar Boletín                             │
│                                                                 │
│  [Docente]                                                      │
│       │                                                         │
│       ├──> CU-004: Registrar Calificaciones                    │
│       ├──> CU-005: Modificar Calificación                      │
│       └──> CU-006: Consultar Lista de Estudiantes              │
│                                                                 │
│  [Estudiante]                                                   │
│       │                                                         │
│       ├──> CU-007: Consultar Calificaciones                    │
│       ├──> CU-008: Consultar Horario                           │
│       └──> CU-009: Solicitar Licencia                          │
│                                                                 │
│  [Director Académico]                                           │
│       │                                                         │
│       ├──> CU-011: Cerrar Periodo Académico                    │
│       ├──> CU-012: Aprobar Cambio de Estado                    │
│       ├──> CU-013: Revisar Licencias                           │
│       └──> CU-015: Supervisar Docente                          │
│                                                                 │
│  [Director Administrativo]                                      │
│       │                                                         │
│       ├──> CU-014: Asignar Beca                                │
│       ├──> CU-016: Registrar Pago                              │
│       └──> CU-017: Generar Reporte Financiero                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. CASOS DE USO - GESTIÓN DE ESTUDIANTES

### CU-001: Registrar Estudiante

**ID:** CU-001  
**Nombre:** Registrar Estudiante Nuevo  
**Descripción:** Permite registrar un nuevo estudiante en el sistema con todos sus datos personales, académicos y documentales.

**Actores:**
- **Primario:** Secretaria Académica
- **Secundario:** Director Académico (aprobación de becas 100%)

**Precondiciones:**
1. Usuario autenticado con permiso `estudiantes.crear`
2. Sistema disponible

**Flujo Principal:**
1. Secretaria selecciona opción "Nuevo Estudiante"
2. Sistema muestra formulario de registro
3. Secretaria ingresa datos personales:
   - Nombres, apellidos
   - CI y expedición
   - Fecha de nacimiento
   - Género, estado civil, tipo de sangre
   - Datos de contacto
4. Secretaria ingresa datos académicos:
   - Carrera de interés
   - Turno preferente
   - Colegio de procedencia
   - Año de egreso de secundaria
5. Secretaria ingresa datos socioeconómicos (opcional):
   - Porcentaje de beca (0%, 25%, 50%, 75%, 100%)
   - Motivo de la beca
6. Secretaria adjunta documentos:
   - Fotocopia de CI (frente y reverso)
   - Certificado de nacimiento
   - Diploma de bachiller
   - Fotografía 4x4
7. Sistema valida que el CI no esté duplicado [RN-EST-001]
8. Sistema valida edad mínima (17 años) [RN-EST-002]
9. Sistema valida email único (si se proporciona) [RN-EST-003]
10. Si beca = 100%, sistema valida documentación obligatoria [RN-EST-004]
11. Sistema genera código único de estudiante (EST-YYYY-NNNN)
12. Sistema guarda el registro en BD
13. Sistema muestra mensaje de confirmación con código de estudiante
14. **Fin del caso de uso**

**Flujos Alternativos:**

**FA-001a: CI Duplicado (paso 7)**
1. Sistema detecta que el CI ya existe
2. Sistema muestra mensaje: "Ya existe un estudiante con este CI: [Nombre Completo]"
3. Sistema ofrece opciones:
   - Ver estudiante existente
   - Corregir CI ingresado
4. Retorna al paso 3

**FA-001b: Beca 100% sin Documentación (paso 10)**
1. Sistema detecta beca 100% sin documentos
2. Sistema muestra mensaje: "Las becas del 100% requieren documentación de respaldo obligatoria"
3. Secretaria adjunta documentos faltantes
4. Continúa en paso 11

**FA-001c: Beca 100% Requiere Aprobación (paso 11)**
1. Sistema detecta beca 100%
2. Sistema crea solicitud de aprobación para Rector
3. Sistema notifica al Rector
4. Sistema guarda estudiante con beca PENDIENTE
5. Sistema muestra mensaje: "Estudiante registrado. Beca pendiente de aprobación del Rector"
6. **Fin del caso de uso**

**Flujos de Excepción:**

**FE-001a: Error de Validación (paso 8-10)**
1. Sistema detecta datos inválidos
2. Sistema muestra mensajes de error específicos por campo
3. Retorna al paso 3

**FE-001b: Error de Sistema (paso 12)**
1. Sistema no puede guardar el registro (error de BD)
2. Sistema muestra mensaje: "Error al guardar. Intente nuevamente"
3. Sistema registra error en logs
4. Retorna al paso 7

**Postcondiciones:**
- Estudiante registrado en BD con estado REGULAR
- Código de estudiante generado
- Documentos adjuntos almacenados
- Si beca > 0%, registro en tabla estudiantes_becas
- Registro en tabla auditoria

**Reglas de Negocio:**
- [RN-EST-001] CI + expedición único
- [RN-EST-002] Edad mínima 17 años
- [RN-EST-003] Email único
- [RN-EST-004] Becas 100% requieren documentación obligatoria

**Requerimientos Relacionados:**
- [RF-EST-001] Registro de Estudiante Nuevo

---

### CU-002: Inscribir a Gestión Académica

**ID:** CU-002  
**Nombre:** Inscribir Estudiante a Gestión Académica  
**Descripción:** Permite inscribir a un estudiante a una gestión académica específica (semestre).

**Actores:**
- **Primario:** Secretaria Académica
- **Secundario:** Sistema de Cálculo de Aranceles

**Precondiciones:**
1. Usuario autenticado con permiso `inscripciones.crear`
2. Estudiante registrado en el sistema
3. Gestión académica en estado INSCRIPCION_ABIERTA
4. Estudiante en estado REGULAR o NIVELACION

**Flujo Principal:**
1. Secretaria selecciona opción "Nueva Inscripción"
2. Sistema muestra buscador de estudiantes
3. Secretaria busca estudiante (por CI, código o nombre)
4. Sistema muestra datos del estudiante
5. Sistema verifica que estudiante NO tenga deudas pendientes [RN-INS-003]
6. Sistema verifica que estudiante NO esté inscrito en otra gestión activa [RN-INS-001]
7. Secretaria selecciona:
   - Gestión académica (ej: 2025-2)
   - Periodo que cursará (1º, 2º, 3º, 4º semestre)
   - Turno (MAÑANA, TARDE, NOCHE)
8. Sistema carga arancel base según carrera y periodo
9. Sistema verifica si estudiante tiene beca activa
10. Si tiene beca, sistema calcula descuento:
    - descuento_monto = arancel_base × (porcentaje_beca / 100)
    - arancel_neto = arancel_base - descuento_monto [RN-INS-004]
11. Sistema muestra resumen de inscripción:
    - Arancel base: Bs. 1500.00
    - Descuento (50%): Bs. 750.00
    - Arancel neto: Bs. 750.00
12. Secretaria confirma inscripción
13. Sistema crea registro en tabla `inscripciones`
14. Sistema genera comprobante de inscripción (PDF)
15. Sistema habilita al estudiante para inscribirse a materias
16. Sistema muestra mensaje de éxito
17. **Fin del caso de uso**

**Flujos Alternativos:**

**FA-002a: Estudiante con Deudas (paso 5)**
1. Sistema detecta deudas pendientes
2. Sistema muestra mensaje: "El estudiante tiene una deuda de Bs. XXX. ¿Desea inscribir con plan de pago?"
3. Secretaria selecciona:
   - Cancelar inscripción
   - Continuar con plan de pago
4. Si continúa, sistema registra observación de deuda
5. Continúa en paso 7

**FA-002b: Ya Inscrito en Gestión (paso 6)**
1. Sistema detecta inscripción activa en otra gestión
2. Sistema muestra mensaje: "El estudiante ya está inscrito en la gestión [YYYY-X]"
3. Sistema muestra opción de anular inscripción anterior
4. **Fin del caso de uso**

**Flujos de Excepción:**

**FE-002a: Gestión Cerrada**
1. Sistema detecta que la gestión NO está abierta para inscripciones
2. Sistema muestra mensaje: "La gestión [YYYY-X] no está abierta para inscripciones"
3. **Fin del caso de uso**

**FE-002b: Estado Académico Inválido**
1. Sistema detecta que estado es RETIRADO, EGRESADO o ABANDONO
2. Sistema muestra mensaje: "El estudiante no puede inscribirse en su estado actual: [ESTADO]"
3. **Fin del caso de uso**

**Postcondiciones:**
- Inscripción creada en BD con estado ACTIVA
- Arancel calculado y registrado
- Estudiante habilitado para inscribirse a materias
- Comprobante de inscripción generado
- Registro en tabla auditoria

**Reglas de Negocio:**
- [RN-INS-001] NO puede inscribirse a dos gestiones simultáneas
- [RN-INS-002] Inscripción a gestión es PRE-REQUISITO para inscripción a materias
- [RN-INS-003] Arancel debe pagarse al menos 50% al inscribirse
- [RN-INS-004] Beca se aplica automáticamente

**Requerimientos Relacionados:**
- [RF-INS-001] Inscripción a Gestión Académica

---

### CU-003: Inscribir a Materias

**ID:** CU-003  
**Nombre:** Inscribir Estudiante a Materias Específicas  
**Descripción:** Permite inscribir a un estudiante en las materias del periodo correspondiente, validando prerrequisitos y cupos.

**Actores:**
- **Primario:** Secretaria Académica
- **Secundario:** Sistema de Validación de Prerrequisitos

**Precondiciones:**
1. Usuario autenticado con permiso `inscripciones_materias.gestionar`
2. Estudiante inscrito a la gestión académica
3. Materias ofertadas para la gestión/periodo

**Flujo Principal:**
1. Secretaria selecciona estudiante inscrito a la gestión
2. Sistema muestra inscripción activa del estudiante
3. Secretaria selecciona opción "Inscribir a Materias"
4. Sistema carga plan de estudios del periodo correspondiente
5. Sistema valida prerrequisitos de cada materia [RN-INS-006]
6. Sistema muestra lista de materias con indicadores:
   - ✅ DISPONIBLE (puede inscribirse)
   - ⚠️ PRERREQUISITO_FALTANTE (no cumple prerrequisitos)
   - 🚫 SIN_CUPO (no hay cupo disponible)
   - ✔️ YA_APROBADA (ya aprobó esta materia)
7. Secretaria selecciona materias disponibles
8. Para cada materia seleccionada:
   - Secretaria selecciona curso (Grupo A, B, C)
   - Secretaria selecciona turno
9. Sistema valida cupo disponible en cada curso [RN-INS-007]
10. Sistema valida que NO haya solapamiento de horarios [RN-INS-009]
11. Sistema muestra resumen de inscripción:
    - Lista de materias
    - Horarios por día
    - Docentes asignados
    - Total de horas semanales
12. Secretaria confirma inscripción
13. Sistema crea registros en tabla `inscripciones_materias`
14. Sistema actualiza `cupo_actual` en tabla `cursos`
15. Sistema genera horario del estudiante (PDF)
16. Sistema genera lista de estudiantes para cada docente
17. Sistema muestra mensaje de éxito
18. **Fin del caso de uso**

**Flujos Alternativos:**

**FA-003a: Prerrequisito No Cumplido (paso 5-6)**
1. Sistema detecta materia con prerrequisito no aprobado
2. Sistema marca materia como NO DISPONIBLE
3. Sistema muestra mensaje al pasar cursor: "Requiere: [Materia Prerrequisito]"
4. Secretaria NO puede seleccionar esa materia
5. Continúa en paso 7

**FA-003b: Sin Cupo Disponible (paso 9)**
1. Sistema detecta que el curso seleccionado está lleno
2. Sistema muestra mensaje: "El Grupo A está lleno (35/35). Seleccione otro grupo"
3. Sistema muestra grupos alternativos con cupo
4. Secretaria selecciona otro grupo
5. Continúa en paso 10

**FA-003c: Conflicto de Horario (paso 10)**
1. Sistema detecta solapamiento de horarios
2. Sistema muestra alerta: "Conflicto de horario: [Materia A] (Lun 08:00-10:00) se solapa con [Materia B] (Lun 09:00-11:00)"
3. Secretaria debe reasignar a otro curso o turno
4. Retorna al paso 8

**FA-003d: Estudiante en Nivelación (paso 6)**
1. Sistema detecta estado NIVELACION
2. Sistema filtra y muestra SOLO materias reprobadas [RN-INS-008]
3. Sistema muestra mensaje: "Estudiante en nivelación. Solo puede inscribirse a materias reprobadas"
4. Continúa en paso 7

**Flujos de Excepción:**

**FE-003a: Sin Materias Disponibles**
1. Sistema detecta que todas las materias están sin cupo o con prerrequisitos pendientes
2. Sistema muestra mensaje: "No hay materias disponibles para inscripción"
3. **Fin del caso de uso**

**Postcondiciones:**
- Inscripciones a materias creadas en BD
- Cupos actualizados en cursos
- Horario del estudiante generado
- Listas de estudiantes generadas para docentes
- Registro en tabla auditoria

**Reglas de Negocio:**
- [RN-INS-005] NO puede inscribirse dos veces a misma materia en misma gestión
- [RN-INS-006] Sistema NO permite inscripción si faltan prerrequisitos
- [RN-INS-007] Cupo máximo 35 estudiantes/curso (configurable)
- [RN-INS-008] Estudiante en NIVELACION solo puede inscribirse a materias reprobadas
- [RN-INS-009] Sistema NO permite inscribir con horarios solapados

**Requerimientos Relacionados:**
- [RF-INS-002] Inscripción a Materias

---

## 4. CASOS DE USO - GESTIÓN DE CALIFICACIONES

### CU-004: Registrar Calificaciones

**ID:** CU-004  
**Nombre:** Registrar Calificaciones de Estudiantes  
**Descripción:** Permite al docente registrar las calificaciones de sus estudiantes siguiendo la estructura oficial INCOS.

**Actores:**
- **Primario:** Docente
- **Secundario:** Sistema de Cálculo de Promedios

**Precondiciones:**
1. Usuario autenticado con permiso `calificaciones.registrar`
2. Docente asignado al curso
3. Periodo académico en estado ABIERTO

**Flujo Principal:**
1. Docente accede a "Mis Materias"
2. Sistema muestra lista de materias asignadas al docente
3. Docente selecciona materia y curso (ej: Contabilidad Intermedia - Grupo A)
4. Sistema muestra lista de estudiantes inscritos
5. Sistema muestra estructura de calificaciones:
   ```
   | Estudiante | 1º P | 2º P | SUMA | 3º P | PRÁCT | SUMA T | FINAL | RECUP |
   ```
6. Docente selecciona columna a llenar (ej: 1º Parcial)
7. Docente ingresa notas (0-100) para cada estudiante [RN-CAL-001]
8. Sistema valida rango de notas en tiempo real
9. Docente hace clic en "Guardar"
10. Sistema valida que todas las notas estén en rango válido
11. Sistema guarda las notas en BD
12. Sistema recalcula automáticamente:
    - SUMA = 1º Parcial + 2º Parcial
    - SUMA TOTAL = SUMA + 3º Parcial + PRÁCTICO
    - NOTA FINAL = SUMA TOTAL / 4 [RN-CAL-003]
13. Sistema evalúa estado:
    - Si NOTA FINAL >= 60 → estado = APROBADO [RN-CAL-002]
    - Si NOTA FINAL < 60 → estado = REPROBADO, habilita RECUPERATORIO [RN-CAL-004]
14. Sistema registra operación en tabla `auditoria`
15. Sistema muestra mensaje de éxito
16. **Fin del caso de uso**

**Flujos Alternativos:**

**FA-004a: Modificación de Nota Existente (paso 7)**
1. Docente modifica nota ya registrada
2. Sistema solicita "Motivo de modificación"
3. Docente ingresa motivo
4. Si modificación < 48 horas: continúa en paso 9 [RN-CAL-011]
5. Si modificación > 48 horas: ver CU-005 (requiere aprobación) [RN-CAL-012]

**FA-004b: Registro de Recuperatorio (paso 6)**
1. Docente selecciona columna RECUPERATORIO
2. Sistema muestra SOLO estudiantes con NOTA FINAL < 60
3. Docente ingresa notas de recuperatorio
4. Sistema evalúa:
   - Si RECUP >= 60 → estado = APROBADO, NOTA FINAL = 60 [RN-CAL-007]
   - Si RECUP < 60 → estado = REPROBADO, inicia NIVELACION [RN-CAL-008]
5. Sistema actualiza estado del estudiante si corresponde
6. Continúa en paso 11

**Flujos de Excepción:**

**FE-004a: Nota Fuera de Rango (paso 8-10)**
1. Sistema detecta nota < 0 o > 100
2. Sistema marca campo en rojo
3. Sistema muestra mensaje: "La nota debe estar entre 0 y 100"
4. Retorna al paso 7

**FE-004b: Periodo Cerrado**
1. Sistema detecta que el periodo está CERRADO
2. Sistema muestra mensaje: "El periodo está cerrado. No se pueden registrar calificaciones"
3. **Fin del caso de uso**

**FE-004c: Docente No Asignado**
1. Sistema detecta que usuario NO es el docente asignado
2. Sistema muestra mensaje: "No tienes permiso para registrar calificaciones en este curso"
3. **Fin del caso de uso**

**Postcondiciones:**
- Calificaciones registradas en tabla `inscripciones_materias`
- Campos calculados actualizados automáticamente
- Estados de aprobación/reprobación actualizados
- Recuperatorios habilitados si corresponde
- Registro en tabla auditoria con valores anteriores y nuevos

**Reglas de Negocio:**
- [RN-CAL-001] Notas en rango 0-100
- [RN-CAL-002] Nota de aprobación 60/100
- [RN-CAL-003] Campos calculados automáticamente
- [RN-CAL-004] Si nota_final < 60, habilita recuperatorio
- [RN-CAL-005] Solo docente asignado puede registrar/modificar notas
- [RN-CAL-007] Si aprueba recuperatorio, nota_final = 60
- [RN-CAL-008] Si reprueba recuperatorio, debe cursar nuevamente

**Requerimientos Relacionados:**
- [RF-CAL-001] Registro de Calificaciones Parciales

---

### CU-005: Modificar Calificación

**ID:** CU-005  
**Nombre:** Modificar Calificación Después de 48 Horas  
**Descripción:** Permite al docente solicitar modificación de una calificación después de 48 horas de registrada, requiriendo aprobación del Director Académico.

**Actores:**
- **Primario:** Docente
- **Secundario:** Director Académico (aprobación)

**Precondiciones:**
1. Usuario autenticado con permiso `calificaciones.editar`
2. Calificación registrada hace más de 48 horas
3. Periodo académico en estado ABIERTO

**Flujo Principal:**
1. Docente accede a calificaciones de su curso
2. Docente intenta modificar una nota
3. Sistema detecta que la nota fue registrada hace > 48 horas [RN-CAL-012]
4. Sistema muestra formulario de solicitud:
   - Campo: [nota_1er_parcial]
   - Valor actual: 75.00
   - Nuevo valor: 85.00
   - Motivo: [campo de texto]
5. Docente ingresa nuevo valor y motivo [RN-CAL-013]
6. Sistema valida que motivo tenga al menos 10 caracteres
7. Sistema crea solicitud de cambio en tabla `solicitudes_cambio_calificacion`
8. Sistema envía notificación al Director Académico
9. Sistema muestra mensaje: "Solicitud enviada al Director Académico"
10. **Espera de aprobación...**
11. Director Académico revisa solicitud (ver CU-011)
12. Si APROBADA:
    - Sistema aplica la modificación
    - Sistema registra en auditoria con nota de aprobación
    - Sistema notifica al docente
13. Si RECHAZADA:
    - Sistema mantiene valor original
    - Sistema notifica al docente con motivo de rechazo
14. **Fin del caso de uso**

**Flujos Alternativos:**

**FA-005a: Modificación < 48 Horas (paso 3)**
1. Sistema detecta que modificación < 48 horas
2. Sistema aplica cambio inmediatamente [RN-CAL-011]
3. Sistema solicita motivo breve
4. Sistema guarda en auditoria
5. **Fin del caso de uso**

**Flujos de Excepción:**

**FE-005a: Motivo Insuficiente (paso 6)**
1. Sistema detecta motivo < 10 caracteres
2. Sistema muestra mensaje: "El motivo debe tener al menos 10 caracteres"
3. Retorna al paso 5

**FE-005b: Cambio que Afecta Estado (paso 5)**
1. Sistema detecta que cambio convertiría REPROBADO → APROBADO
2. Sistema valida que estudiante NO esté en proceso de nivelación [RN-CAL-015]
3. Si está en nivelación, sistema requiere validación adicional
4. Continúa en paso 6

**Postcondiciones:**
- Solicitud de cambio creada en BD
- Notificación enviada al Director Académico
- Si aprobada: calificación modificada y auditada
- Si rechazada: valor original mantenido

**Reglas de Negocio:**
- [RN-CAL-011] Modificaciones < 48 horas NO requieren aprobación
- [RN-CAL-012] Modificaciones > 48 horas requieren aprobación del Director
- [RN-CAL-013] TODAS las modificaciones deben tener motivo registrado
- [RN-CAL-014] Historial de modificaciones es inmutable
- [RN-CAL-015] Validar nivelaciones si cambio afecta estado

**Requerimientos Relacionados:**
- [RF-CAL-003] Modificación de Calificaciones

---

## 5. CASOS DE USO - ESTUDIANTE

### CU-007: Consultar Calificaciones

**ID:** CU-007  
**Nombre:** Consultar Calificaciones Personales  
**Descripción:** Permite al estudiante consultar sus calificaciones en tiempo real.

**Actores:**
- **Primario:** Estudiante

**Precondiciones:**
1. Usuario autenticado como ESTUDIANTE
2. Estudiante inscrito a materias

**Flujo Principal:**
1. Estudiante accede a "Mis Calificaciones"
2. Sistema muestra selector de gestión académica
3. Estudiante selecciona gestión (ej: 2025-2)
4. Sistema muestra todas las materias inscritas
5. Para cada materia, sistema muestra:
   ```
   CONTABILIDAD INTERMEDIA - Grupo A
   Docente: Lic. Pedro Ramírez
   
   | 1º P | 2º P | SUMA | 3º P | PRÁCT | SUMA T | FINAL | RECUP | ESTADO   |
   | 85   | 78   | 163  | 80   | 90    | 333    | 83.25 | -     | APROBADO |
   
   Asistencia: 28/30 (93.33%)
   ```
6. Sistema muestra resumen del periodo:
   - Promedio general: 78.5
   - Materias aprobadas: 5
   - Materias reprobadas: 0
   - Materias pendientes: 2
7. Sistema ofrece opción "Descargar Boletín (PDF)"
8. **Fin del caso de uso**

**Flujos Alternativos:**

**FA-007a: Calificaciones No Publicadas (paso 4-5)**
1. Sistema detecta que calificaciones aún NO están publicadas
2. Sistema muestra mensaje: "Calificaciones pendientes de publicación"
3. Sistema muestra solo estructura sin notas
4. **Fin del caso de uso**

**FA-007b: Descargar Boletín (paso 7)**
1. Estudiante hace clic en "Descargar Boletín"
2. Sistema genera PDF con membrete institucional
3. Sistema incluye todas las calificaciones y promedio
4. Sistema descarga PDF
5. Continúa en paso 8

**Postcondiciones:**
- Ninguna (solo consulta)

**Requerimientos Relacionados:**
- [RF-CAL-001] (implícito - consulta)

---

### CU-009: Solicitar Licencia

**ID:** CU-009  
**Nombre:** Solicitar Licencia Estudiantil  
**Descripción:** Permite al estudiante solicitar una licencia por ausencias justificadas.

**Actores:**
- **Primario:** Estudiante
- **Secundario:** Director Académico (aprobación)

**Precondiciones:**
1. Usuario autenticado como ESTUDIANTE
2. Estudiante en estado REGULAR o NIVELACION

**Flujo Principal:**
1. Estudiante accede a "Mis Licencias"
2. Sistema muestra lista de licencias históricas (si existen)
3. Estudiante hace clic en "Nueva Solicitud"
4. Sistema muestra formulario:
   - Tipo de licencia: [ENFERMEDAD | TRABAJO | FAMILIAR | OTRO]
   - Motivo detallado: [textarea]
   - Fecha inicio: [date]
   - Fecha fin: [date]
   - Documentos de respaldo: [file upload]
5. Estudiante completa formulario
6. Estudiante adjunta documentos (certificado médico, carta, etc.)
7. Sistema valida fechas (fecha_fin >= fecha_inicio)
8. Sistema calcula días totales
9. Sistema valida máximo de días por gestión (15 días) [RN-EST-010]
10. Estudiante hace clic en "Enviar Solicitud"
11. Sistema crea registro en tabla `licencias_solicitudes` con estado PENDIENTE
12. Sistema envía notificación al Director Académico
13. Sistema muestra mensaje: "Solicitud enviada. Pendiente de revisión"
14. **Fin del caso de uso**

**Flujos Alternativos:**

**FA-009a: Licencia de Emergencia (paso 9)**
1. Estudiante marca checkbox "Es una emergencia"
2. Sistema permite solicitud retroactiva (fecha_inicio en el pasado)
3. Sistema agrega nota en observaciones
4. Continúa en paso 10

**Flujos de Excepción:**

**FE-009a: Excede Días Permitidos (paso 9)**
1. Sistema detecta que días solicitados + días usados > 15
2. Sistema muestra mensaje: "Has usado XX días de 15 permitidos. Solo puedes solicitar XX días más"
3. Retorna al paso 5

**FE-009b: Fechas Inválidas (paso 7)**
1. Sistema detecta fecha_fin < fecha_inicio
2. Sistema muestra mensaje: "La fecha de fin debe ser posterior a la fecha de inicio"
3. Retorna al paso 5

**FE-009c: Sin Documentos (paso 6)**
1. Estudiante no adjunta documentos
2. Sistema muestra advertencia: "Se recomienda adjuntar documentos de respaldo"
3. Sistema permite continuar de todos modos
4. Continúa en paso 7

**Postcondiciones:**
- Solicitud de licencia creada con estado PENDIENTE
- Documentos adjuntos almacenados
- Notificación enviada al Director Académico
- Registro en tabla auditoria

**Reglas de Negocio:**
- [RN-EST-009] Licencia NO exime de exámenes
- [RN-EST-010] Máximo 15 días por gestión (salvo excepción)
- [RN-EST-011] Solicitar con 24h anticipación (salvo emergencias)

**Requerimientos Relacionados:**
- [RF-EST-005] Gestión de Licencias Estudiantiles

---

## 6. CASOS DE USO - DIRECTOR ACADÉMICO

### CU-011: Cerrar Periodo Académico

**ID:** CU-011  
**Nombre:** Cerrar Periodo Académico  
**Descripción:** Permite al Director Académico cerrar un periodo académico, impidiendo modificaciones posteriores sin autorización especial.

**Actores:**
- **Primario:** Director Académico

**Precondiciones:**
1. Usuario autenticado con permiso `calificaciones.cerrar_periodo`
2. Periodo académico en estado ABIERTO
3. Todos los recuperatorios finalizados

**Flujo Principal:**
1. Director Académico accede a "Gestión de Periodos"
2. Sistema muestra lista de periodos académicos
3. Director selecciona periodo a cerrar (ej: 2025-1, 1º Semestre)
4. Sistema valida que todas las materias tengan calificaciones completas
5. Si hay materias sin calificaciones:
   - Sistema muestra lista de materias incompletas
   - Sistema muestra alerta: "Hay X materias sin calificaciones completas"
6. Director puede:
   - a) CANCELAR: Posponer cierre hasta completar calificaciones
   - b) FORZAR CIERRE: Cerrar de todos modos
7. Si Director confirma cierre:
8. Sistema marca el periodo como CERRADO
9. Sistema impide modificaciones de notas (salvo con autorización del Rector)
10. Sistema genera reportes automáticos:
    - Estudiantes aprobados por materia
    - Estudiantes reprobados por materia
    - Estudiantes que pasan a NIVELACION
11. Sistema actualiza estados académicos:
    - Si tiene materias reprobadas → estado = NIVELACION
    - Si aprobó todas las materias → estado = REGULAR
12. Sistema genera ranking de estudiantes por promedio
13. Sistema notifica a docentes que el periodo está cerrado
14. Sistema muestra mensaje: "Periodo cerrado correctamente"
15. **Fin del caso de uso**

**Flujos Alternativos:**

**FA-011a: Reversión de Cierre (solo Rector)**
1. Rector solicita reabrir periodo cerrado
2. Sistema solicita motivo
3. Rector ingresa motivo de reversión
4. Sistema cambia estado a ABIERTO
5. Sistema registra operación en auditoria
6. Sistema notifica a Director Académico

**Flujos de Excepción:**

**FE-011a: Recuperatorios Pendientes (paso 4)**
1. Sistema detecta recuperatorios pendientes
2. Sistema muestra mensaje: "Hay X recuperatorios pendientes de registro"
3. Sistema muestra lista de docentes con recuperatorios pendientes
4. Director debe coordinar con docentes
5. **Fin del caso de uso**

**Postcondiciones:**
- Periodo marcado como CERRADO
- Modificaciones de notas bloqueadas (salvo autorización especial)
- Estados académicos actualizados
- Reportes generados
- Notificaciones enviadas

**Reglas de Negocio:**
- [RN-CAL-016] Solo Director Académico puede cerrar periodo
- [RN-CAL-017] Cierre después de finalizar recuperatorios
- [RN-CAL-018] Modificaciones post-cierre requieren autorización del Rector
- [RN-CAL-019] Cierre reversible solo por Rector

**Requerimientos Relacionados:**
- [RF-CAL-004] Cierre de Calificaciones por Periodo

---

### CU-013: Revisar Licencias

**ID:** CU-013  
**Nombre:** Revisar y Aprobar/Rechazar Licencias  
**Descripción:** Permite al Director Académico revisar solicitudes de licencias estudiantiles y aprobarlas o rechazarlas.

**Actores:**
- **Primario:** Director Académico

**Precondiciones:**
1. Usuario autenticado con permiso `estudiantes.licencias.aprobar`
2. Existen solicitudes de licencia PENDIENTES

**Flujo Principal:**
1. Director Académico accede a "Licencias Pendientes"
2. Sistema muestra lista de solicitudes en estado PENDIENTE
3. Para cada solicitud muestra:
   - Estudiante, carrera, código
   - Tipo de licencia
   - Fechas (inicio, fin, días totales)
   - Motivo
   - Documentos adjuntos (links para descargar)
4. Director selecciona una solicitud
5. Sistema muestra detalle completo
6. Director revisa documentos adjuntos
7. Director decide:
   - a) APROBAR
   - b) RECHAZAR (requiere motivo)
8. **Si APRUEBA:**
   - Sistema cambia estado a APROBADA
   - Sistema registra fecha de aprobación
   - Sistema notifica al estudiante: "Tu licencia ha sido aprobada"
9. **Si RECHAZA:**
   - Sistema solicita motivo de rechazo
   - Director ingresa motivo
   - Sistema cambia estado a RECHAZADA
   - Sistema registra motivo y fecha
   - Sistema notifica al estudiante con motivo
10. Sistema registra operación en auditoria
11. Sistema actualiza contador de días usados del estudiante
12. Sistema muestra mensaje de confirmación
13. **Fin del caso de uso**

**Flujos Alternativos:**

**FA-013a: Solicitar Más Información (paso 7)**
1. Director hace clic en "Solicitar más información"
2. Sistema envía notificación al estudiante
3. Licencia permanece en estado PENDIENTE
4. Estudiante debe adjuntar documentos adicionales
5. **Fin del caso de uso**

**Flujos de Excepción:**

**FE-013a: Sin Motivo de Rechazo (paso 9)**
1. Director intenta rechazar sin motivo
2. Sistema muestra mensaje: "Debe ingresar un motivo de rechazo"
3. Retorna al paso 9

**Postcondiciones:**
- Solicitud de licencia actualizada (APROBADA o RECHAZADA)
- Estudiante notificado
- Si aprobada: días usados actualizados
- Registro en tabla auditoria

**Requerimientos Relacionados:**
- [RF-EST-005] Gestión de Licencias Estudiantiles (aprobación)

---

## 7. RESUMEN DE CASOS DE USO

### Por Módulo

| Módulo | Casos de Uso | Prioridad Alta |
|--------|--------------|----------------|
| Estudiantes | 5 | 3 |
| Inscripciones | 4 | 3 |
| Calificaciones | 5 | 4 |
| Nivelaciones | 2 | 2 |
| Docentes | 3 | 2 |
| Pasantías | 3 | 2 |
| Supervisión | 2 | 1 |
| Reportes | 5 | 3 |
| Sistema | 4 | 4 |
| **TOTAL** | **33** | **24** |

### Por Actor Principal

| Actor | Casos de Uso Iniciados |
|-------|------------------------|
| Secretaria Académica | 8 |
| Docente | 5 |
| Estudiante | 5 |
| Director Académico | 7 |
| Director Administrativo | 4 |
| Contador | 2 |
| Super Admin | 2 |

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Versión inicial - 10 CU detallados |

---

## REFERENCIAS

- 02-requerimientos-funcionales.md: Base de requerimientos
- 05-modelo-datos.md: Estructura de datos
- 06-diseno-api.md: Contratos de API
- 08-reglas-negocio.md: Reglas de negocio detalladas

---

**FIN DEL DOCUMENTO - 07 CASOS DE USO**
