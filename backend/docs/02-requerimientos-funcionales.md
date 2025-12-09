# 02 - REQUERIMIENTOS FUNCIONALES
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Documento

Este documento describe en detalle los **requerimientos funcionales** del Sistema de Gestión Académica del Instituto INCOS Santa Cruz. Define QUÉ debe hacer el sistema desde la perspectiva del usuario, sin entrar en detalles de implementación técnica.

### 1.2 Alcance

Los requerimientos están organizados en **13 módulos funcionales** que cubren todas las operaciones académicas y administrativas del instituto:

1. Gestión de Estudiantes (EST)
2. Gestión de Inscripciones (INS)
3. Gestión de Calificaciones (CAL)
4. Gestión de Nivelaciones (NIV)
5. Gestión de Docentes (DOC)
6. Gestión de Pasantías Laborales (PAS)
7. Supervisión Docente (SUP)
8. Gestión de Horarios (HOR)
9. Gestión de Aranceles y Pagos (PAG)
10. Historial Académico Oficial (HIS)
11. Boletines de Calificaciones (BOL)
12. Reportes Académicos (REP)
13. Gestión de Usuarios y Permisos (USR)

### 1.3 Convenciones de Notación

- **RF-MOD-NNN:** Requerimiento Funcional, donde MOD es el código del módulo y NNN es el número secuencial
- **RN-MOD-NNN:** Regla de Negocio asociada
- **Prioridad:** ALTA, MEDIA, BAJA
- **Complejidad:** BAJA, MEDIA, ALTA
- **Actores:** Roles que interactúan con la funcionalidad

---

## 2. MÓDULOS FUNCIONALES

### MÓDULO 1: GESTIÓN DE ESTUDIANTES (EST)

**Descripción:** Gestión completa del ciclo de vida del estudiante en el instituto.

#### RF-EST-001: Registro de Estudiante Nuevo
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Actores:** Secretaria Académica, Director Académico

**Descripción:** Permite registrar un nuevo estudiante con datos personales, académicos y documentales.

**Datos Requeridos:**
- Personales: nombres, apellidos, CI, fecha nacimiento, dirección, contactos
- Académicos: carrera, turno, colegio de procedencia
- Socioeconómicos: beca/descuento (0%, 25%, 50%, 75%, 100%)
- Documentos: CI, certificado nacimiento, diploma bachiller, foto

**Reglas de Negocio:**
- RN-EST-001: CI + expedición único en el sistema
- RN-EST-002: Edad mínima 17 años
- RN-EST-003: Email único si se proporciona
- RN-EST-004: Becas 100% requieren documentación obligatoria

#### RF-EST-002: Búsqueda y Consulta de Estudiante
**Prioridad:** ALTA | **Complejidad:** BAJA

**Criterios de búsqueda:** Código, CI, nombres, carrera, estado académico, gestión de ingreso

#### RF-EST-003: Actualización de Datos de Estudiante
**Prioridad:** ALTA | **Complejidad:** BAJA

**Campos actualizables:** Teléfonos, email, dirección, contacto emergencia
**Campos NO actualizables sin aprobación:** CI, nombres, fecha nacimiento, carrera

#### RF-EST-004: Gestión de Becas y Descuentos
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Tipos:** 0%, 25%, 50%, 75%, 100%
**Reglas:**
- RN-EST-005: Solo UNA beca activa por gestión
- RN-EST-006: Becas 100% requieren aprobación del Rector
- RN-EST-007: Aplicación automática en aranceles

#### RF-EST-005: Gestión de Licencias Estudiantiles
**Prioridad:** MEDIA | **Complejidad:** MEDIA

**Tipos:** ENFERMEDAD, TRABAJO, FAMILIAR, OTRO
**Estados:** PENDIENTE, APROBADA, RECHAZADA, VENCIDA
**Reglas:**
- RN-EST-009: Licencia NO exime de exámenes
- RN-EST-010: Máximo 15 días por gestión

#### RF-EST-006: Cambio de Estado Académico
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Estados:** REGULAR, NIVELACION, RETIRADO, EGRESADO, ABANDONO
**Reglas:**
- RN-EST-012: Estado EGRESADO es irreversible
- RN-EST-013: RETIRADO/ABANDONO puede solicitar reincorporación
- RN-EST-014: NIVELACION activa automáticamente si reprueba con recuperatorio

---

### MÓDULO 2: GESTIÓN DE INSCRIPCIONES (INS)

**Descripción:** Gestión del proceso de inscripción a gestiones académicas y materias.

#### RF-INS-001: Inscripción a Gestión Académica
**Prioridad:** ALTA | **Complejidad:** ALTA

**Pre-requisitos:**
- Estado REGULAR o NIVELACION
- Gestión ABIERTA
- Sin deudas pendientes

**Datos:** Gestión, carrera, periodo, turno, arancel, descuento aplicado

**Reglas:**
- RN-INS-001: NO puede inscribirse a dos gestiones simultáneas
- RN-INS-002: Es pre-requisito para inscripción a materias
- RN-INS-003: Pago mínimo 50% al momento de inscripción
- RN-INS-004: Beca se aplica automáticamente

#### RF-INS-002: Inscripción a Materias
**Prioridad:** ALTA | **Complejidad:** ALTA

**Validaciones:**
- Prerrequisitos aprobados
- Cupo disponible
- Sin solapamiento de horarios

**Reglas:**
- RN-INS-005: NO puede inscribirse dos veces a misma materia en misma gestión
- RN-INS-006: Sistema NO permite inscripción si faltan prerrequisitos
- RN-INS-007: Cupo máximo 35 estudiantes/curso (configurable)
- RN-INS-008: Estudiante en NIVELACION solo puede inscribirse a materias reprobadas

#### RF-INS-003: Gestión de Horarios de Estudiante
**Prioridad:** MEDIA | **Complejidad:** MEDIA

**Visualizaciones:** Vista semanal, vista lista, exportar PDF
**Detección:** Alertas de conflictos de horario

#### RF-INS-004: Anulación de Inscripción
**Prioridad:** MEDIA | **Complejidad:** MEDIA

**Tipos:** Anulación de gestión completa, anulación de materia específica
**Reglas:**
- RN-INS-012: Dentro de 2 semanas = devolución 100%
- RN-INS-013: Después de 2 semanas = sin devolución

---

### MÓDULO 3: GESTIÓN DE CALIFICACIONES (CAL)

**Descripción:** Registro, cálculo y gestión de calificaciones de estudiantes.

#### RF-CAL-001: Registro de Calificaciones Parciales
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Estructura de Calificaciones INCOS:**

| Campo | Rango | Tipo |
|-------|-------|------|
| 1º Parcial | 0-100 | Manual |
| 2º Parcial | 0-100 | Manual |
| SUMA | Auto | Calculado (1º + 2º) |
| 3º Parcial | 0-100 | Manual |
| PRÁCTICO | 0-100 | Manual |
| SUMA TOTAL | Auto | Calculado (suma + 3º + práctico) |
| NOTA FINAL | Auto | Calculado (suma_total / 4) |
| RECUPERATORIO | 0-100 | Manual (si nota_final < 60) |

**Cálculo:**
```
suma_parciales = nota_1er_parcial + nota_2do_parcial
suma_total = suma_parciales + nota_3er_parcial + nota_practico
nota_final = suma_total / 4
estado = nota_final >= 60 ? 'APROBADO' : 'REPROBADO'
```

**Reglas:**
- RN-CAL-001: Notas en rango 0-100
- RN-CAL-002: Nota de aprobación 60/100
- RN-CAL-003: Campos calculados automáticamente
- RN-CAL-004: Nota_final < 60 habilita recuperatorio

#### RF-CAL-002: Gestión de Recuperatorios
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Condiciones:** nota_final < 60, asistencia >= 75%
**Reglas:**
- RN-CAL-007: Si aprueba recuperatorio, nota_final = 60
- RN-CAL-008: Si reprueba, debe cursar nuevamente (nivelación)
- RN-CAL-009: Solo UN recuperatorio por materia/gestión

#### RF-CAL-003: Modificación de Calificaciones
**Prioridad:** MEDIA | **Complejidad:** MEDIA

**Flujo Normal (< 48 horas):** Modificación directa con motivo
**Flujo Especial (> 48 horas):** Requiere aprobación de Director Académico

**Reglas:**
- RN-CAL-011: < 48 horas NO requiere aprobación
- RN-CAL-012: > 48 horas requiere aprobación
- RN-CAL-013: TODAS las modificaciones deben tener motivo

#### RF-CAL-004: Cierre de Calificaciones por Periodo
**Prioridad:** ALTA | **Complejidad:** BAJA

**Estados:** ABIERTO, CERRADO, PUBLICADO
**Reglas:**
- RN-CAL-016: Solo Director Académico puede cerrar
- RN-CAL-017: Cierre después de finalizar recuperatorios
- RN-CAL-019: Reversible solo por Rector

---

### MÓDULO 4: GESTIÓN DE NIVELACIONES (NIV)

**Descripción:** Control de estudiantes en proceso de nivelación.

#### RF-NIV-001: Registro de Estudiante en Nivelación
**Prioridad:** ALTA | **Complejidad:** BAJA

**Activación automática:** Cuando reprueba materia + recuperatorio
**Estados:** PENDIENTE, CURSANDO, APROBADO, ABANDONO

#### RF-NIV-002: Inscripción a Materia de Nivelación
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Reglas:**
- RN-NIV-001: Solo puede inscribirse a materias reprobadas
- RN-NIV-002: Hasta 3 intentos para aprobar
- RN-NIV-003: Si falla 3 intentos, debe reiniciar carrera
- RN-NIV-004: Sin costo adicional

#### RF-NIV-003: Aprobación de Materia de Nivelación
**Prioridad:** ALTA | **Complejidad:** BAJA

**Flujo:** Aprobación → Verificación de otras pendientes → Cambio a REGULAR (automático)

---

### MÓDULO 5: GESTIÓN DE DOCENTES (DOC)

**Descripción:** Gestión de datos y asignaciones de docentes.

#### RF-DOC-001: Registro de Docente
**Prioridad:** ALTA | **Complejidad:** BAJA

**Datos:** Personales, profesionales (título, especialidad, experiencia), datos de sistema
**Reglas:**
- RN-DOC-001: CI único
- RN-DOC-002: Al menos una especialidad
- RN-DOC-003: Email único

#### RF-DOC-002: Asignación de Materias a Docentes
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Datos:** Docente, materia, curso, gestión, turno, carga horaria
**Validaciones:**
- Especialidad compatible
- No superar 40 horas/semana
- Sin solapamiento de horarios

**Reglas:**
- RN-DOC-004: Múltiples asignaciones posibles
- RN-DOC-005: Carga máxima 40 horas/semana
- RN-DOC-006: Asignaciones antes del inicio de gestión

---

### MÓDULO 6: GESTIÓN DE PASANTÍAS LABORALES (PAS)

**Descripción:** Gestión de pasantías en empresas colaboradoras.

#### RF-PAS-001: Registro de Empresa Colaboradora
**Prioridad:** MEDIA | **Complejidad:** BAJA

**Datos:**
- Razón social, NIT
- Rubro/sector
- Dirección, teléfonos
- Persona de contacto
- Email corporativo
- Estado: ACTIVA, INACTIVA

#### RF-PAS-002: Asignación de Estudiante a Pasantía
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Pre-requisitos:**
- Estudiante en 3º o 4º semestre
- Promedio >= 70
- Sin deudas académicas

**Datos:**
- Estudiante
- Empresa
- Puesto/área
- Docente supervisor
- Fecha inicio/fin
- Horas totales requeridas
- Estado: PROGRAMADA, EN_CURSO, FINALIZADA, CANCELADA

**Reglas:**
- RN-PAS-001: Pasantía obligatoria para egreso
- RN-PAS-002: Mínimo 240 horas
- RN-PAS-003: Máximo 6 meses de duración

#### RF-PAS-003: Registro de Evaluación de Pasantía
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Datos de Evaluación:**
- Descripción del trabajo realizado
- Principales actividades
- Nivel de desempeño: ALTO, MEDIO, BAJO
- Fortalezas observadas
- Áreas de mejora
- Sugerencias
- Firma digital docente INCOS
- Firma digital empresa

**Flujo:**
1. Estudiante completa horas
2. Empresa completa evaluación escrita
3. Docente supervisor realiza visita de supervisión
4. Docente completa evaluación en sistema
5. Sistema genera PDF con firmas digitales
6. Sistema marca pasantía como FINALIZADA
7. Sistema actualiza requisitos de egreso del estudiante

#### RF-PAS-004: Seguimiento de Horas de Pasantía
**Prioridad:** MEDIA | **Complejidad:** BAJA

**Control:**
- Registro de horas trabajadas
- Validación de firma de empresa
- Progreso vs total requerido
- Alertas por incumplimiento

---

### MÓDULO 7: SUPERVISIÓN DOCENTE (SUP)

**Descripción:** Sistema de supervisión y evaluación del desempeño docente.

#### RF-SUP-001: Programación de Supervisión
**Prioridad:** MEDIA | **Complejidad:** BAJA

**Actores:** Director Académico, Supervisor

**Datos:**
- Docente a supervisar
- Materia y curso
- Fecha y hora programada
- Supervisor asignado
- Estado: PROGRAMADA, REALIZADA, CANCELADA

#### RF-SUP-002: Ficha de Supervisión Docente
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Estructura de Evaluación (según PDF INCOS):**

1. **Control de Asistencia:**
   - ¿Se controla asistencia? SÍ/NO
   - Método: Lista manual, Excel, Google Meet, otro

2. **Presentación del Tema:**
   - Claridad en objetivos
   - Relación con plan de estudios
   - Calificación: EXCELENTE, BUENO, REGULAR, DEFICIENTE

3. **Recursos Didácticos:**
   - Uso de: PowerPoint, PDF, Excel, Word, Tablet, Pizarra
   - Efectividad de recursos
   - Calificación: EXCELENTE, BUENO, REGULAR, DEFICIENTE

4. **Exposición Docente:**
   - Dominio del tema
   - Claridad explicativa
   - Metodología utilizada
   - Calificación: EXCELENTE, BUENO, REGULAR, DEFICIENTE

5. **Participación de Estudiantes:**
   - Nivel de participación
   - Técnicas para motivar participación
   - Calificación: EXCELENTE, BUENO, REGULAR, DEFICIENTE

6. **Actividades Prácticas:**
   - Realización de ejercicios prácticos
   - Retroalimentación
   - Calificación: EXCELENTE, BUENO, REGULAR, DEFICIENTE

7. **Evaluación:**
   - Tipo: Proceso, Resultado, Ambas
   - Criterios claros
   - Calificación: EXCELENTE, BUENO, REGULAR, DEFICIENTE

**Datos Adicionales:**
- Observaciones generales
- Fortalezas identificadas
- Aspectos a mejorar
- Recomendaciones
- Firma digital del supervisor
- Firma digital del docente (conocimiento)

#### RF-SUP-003: Reporte de Desempeño Docente
**Prioridad:** MEDIA | **Complejidad:** MEDIA

**Métricas:**
- Promedio de calificaciones por dimensión
- Tendencia temporal (mejora/empeoramiento)
- Comparativo con otros docentes
- Indicadores críticos (DEFICIENTE en 2+ dimensiones)

**Acciones:**
- Generación de plan de mejora
- Programación de capacitaciones
- Seguimiento de implementación

---

### MÓDULO 8: GESTIÓN DE HORARIOS (HOR)

**Descripción:** Gestión de horarios académicos y asignación de turnos.

#### RF-HOR-001: Definición de Turnos y Bloques Horarios
**Prioridad:** ALTA | **Complejidad:** BAJA

**Turnos:**
- MAÑANA: 07:00 - 12:00
- TARDE: 14:00 - 18:00
- NOCHE: 19:00 - 22:00

**Bloques Horarios:** Definibles por turno (ej: 2 horas por bloque)

#### RF-HOR-002: Asignación de Horarios a Cursos
**Prioridad:** ALTA | **Complejidad:** ALTA

**Datos:**
- Materia
- Curso
- Docente
- Turno
- Días de clase (Lun-Sáb)
- Hora inicio/fin
- Aula

**Validaciones:**
- Sin solapamiento de aulas
- Sin solapamiento de docente
- Cumplimiento de carga horaria de materia

#### RF-HOR-003: Generación de Horarios para Estudiantes
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Generación automática** basada en inscripciones a materias
**Detección de conflictos** y alertas
**Exportación** a PDF y Excel

---

### MÓDULO 9: GESTIÓN DE ARANCELES Y PAGOS (PAG)

**Descripción:** Control de aranceles, pagos y estados financieros de estudiantes.

#### RF-PAG-001: Configuración de Aranceles
**Prioridad:** ALTA | **Complejidad:** BAJA

**Datos:**
- Gestión académica
- Carrera
- Periodo (1º, 2º, 3º, 4º semestre)
- Monto del arancel
- Vigencia desde/hasta

#### RF-PAG-002: Registro de Pago
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Datos:**
- Estudiante
- Inscripción (gestión)
- Monto pagado
- Método de pago: EFECTIVO, TRANSFERENCIA, CHEQUE
- Fecha de pago
- Comprobante/número de transacción
- Usuario que registra

**Cálculo:**
```
total_a_pagar = arancel_base - descuento_beca
pagado = SUM(pagos del estudiante)
saldo = total_a_pagar - pagado
```

#### RF-PAG-003: Generación de Comprobante de Pago
**Prioridad:** ALTA | **Complejidad:** BAJA

**Contenido:**
- Número de recibo (autoincremental)
- Fecha
- Datos del estudiante
- Detalle del pago
- Monto
- Método
- Firma de cajero

#### RF-PAG-004: Reporte de Morosidad
**Prioridad:** MEDIA | **Complejidad:** MEDIA

**Filtros:**
- Por carrera
- Por gestión
- Por monto de deuda
- Por antigüedad de deuda

**Acciones:**
- Notificación al estudiante
- Bloqueo de inscripción a siguiente gestión
- Generación de plan de pago

---

### MÓDULO 10: HISTORIAL ACADÉMICO OFICIAL (HIS)

**Descripción:** Generación de historial académico con formato oficial Libro/Folio.

#### RF-HIS-001: Generación de Historial Académico
**Prioridad:** ALTA | **Complejidad:** ALTA

**Pre-requisitos:**
- Estudiante en estado EGRESADO
- Todas las materias aprobadas
- Sin deudas académicas ni financieras

**Estructura del Historial:**

```
INSTITUTO INCOS SANTA CRUZ
HISTORIAL ACADÉMICO OFICIAL

Estudiante: [Nombres Apellidos]
CI: [Número] [Expedición]
Carrera: [Nombre de Carrera]

1º AÑO – LIBRO 12, FOLIO 58
2º AÑO – LIBRO 13, FOLIO 68

┌────────────────────┬────────────────┬───────────┬────────┐
│ MATERIA            │ CARGA HORARIA  │ NOTA FINAL│ ESTADO │
├────────────────────┼────────────────┼───────────┼────────┤
│ [Materia 1]        │ 80h            │ 75        │ APR    │
│ [Materia 2]        │ 60h            │ 82        │ APR    │
│ ...                │ ...            │ ...       │ ...    │
└────────────────────┴────────────────┴───────────┴────────┘

CARGA HORARIA TOTAL: 1440 horas
PROMEDIO GENERAL: 78.5
MATERIAS APROBADAS: 24/24

Fecha de Egreso: [DD/MM/YYYY]
Estado: EGRESADO

Hash de Validación: [SHA256]

_______________________    _______________________
Directora Académica        Rector
```

**Datos:**
- Libro y Folio (asignación secuencial por año)
- Lista completa de materias aprobadas
- Carga horaria por materia
- Notas finales
- Promedio general
- Hash SHA256 para validación de autenticidad

#### RF-HIS-002: Validación de Historial Académico
**Prioridad:** MEDIA | **Complejidad:** BAJA

**Proceso:**
1. Usuario ingresa hash del documento
2. Sistema busca el documento original en BD
3. Sistema recalcula hash del documento almacenado
4. Sistema compara hashes
5. Si coinciden: DOCUMENTO AUTÉNTICO
6. Si NO coinciden: DOCUMENTO ADULTERADO

#### RF-HIS-003: Registro en Libros Oficiales
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Datos:**
- Número de libro (secuencial por gestión)
- Número de folio (secuencial dentro del libro)
- Gestión de egreso
- Estudiante
- Estado del registro: ACTIVO, ANULADO

**Reglas:**
- RN-HIS-001: Los números de libro/folio son secuenciales y NO reutilizables
- RN-HIS-002: Cada estudiante tiene UNA entrada por año de estudio
- RN-HIS-003: Las anulaciones NO borran registros, se marcan como ANULADO

---

### MÓDULO 11: BOLETINES DE CALIFICACIONES (BOL)

**Descripción:** Generación de boletines de calificaciones oficiales.

#### RF-BOL-001: Generación de Boletín de Calificaciones
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Estructura (según PDF INCOS):**

```
INSTITUTO INCOS SANTA CRUZ
BOLETÍN DE CALIFICACIONES

Estudiante: [Nombres Apellidos]
CI: [Número]
Carrera: [Nombre]
Gestión: 2025-2
Periodo: 2º Semestre

┌──────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────┐
│ MATERIA  │ 1º P │ 2º P │ SUMA │ 3º P │ PRÁCT│ SUMA │ NOTA │ RECUP│ ESTADO │
│          │      │      │      │      │      │ TOTAL│ FINAL│      │        │
├──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼────────┤
│ Mat 1    │ 85   │ 78   │ 163  │ 80   │ 90   │ 333  │ 83.25│  -   │ APR    │
│ Mat 2    │ 70   │ 65   │ 135  │ 55   │ 60   │ 250  │ 62.50│  -   │ APR    │
│ Mat 3    │ 50   │ 55   │ 105  │ 48   │ 52   │ 205  │ 51.25│ 65   │ APR    │
└──────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴────────┘

PROMEDIO DEL PERIODO: 68.33

_______________________    _______________________
Secretaria Académica       Director Académico
```

#### RF-BOL-002: Publicación de Calificaciones
**Prioridad:** ALTA | **Complejidad:** BAJA

**Estados:**
- BORRADOR: visible solo para personal académico
- PUBLICADO: visible para estudiantes

**Reglas:**
- RN-BOL-001: Solo se pueden publicar calificaciones de periodo CERRADO
- RN-BOL-002: Una vez publicadas, los estudiantes son notificados automáticamente

---

### MÓDULO 12: REPORTES ACADÉMICOS (REP)

**Descripción:** Generación de reportes estadísticos y analíticos.

#### RF-REP-001: Reporte de Rendimiento Académico
**Prioridad:** MEDIA | **Complejidad:** MEDIA

**Métricas:**
- Promedio general por carrera
- Promedio por materia
- Tasa de aprobación/reprobación
- Ranking de estudiantes

**Filtros:** Gestión, carrera, periodo, materia

#### RF-REP-002: Reporte de Asistencia
**Prioridad:** BAJA | **Complejidad:** MEDIA

**Datos:**
- Estudiantes por materia
- Porcentaje de asistencia
- Alertas por baja asistencia (<75%)

#### RF-REP-003: Reporte de Deserción
**Prioridad:** MEDIA | **Complejidad:** MEDIA

**Análisis:**
- Estudiantes que no se inscribieron a siguiente gestión
- Tendencia temporal
- Factores asociados (rendimiento, pagos)

#### RF-REP-004: Reporte de Becas
**Prioridad:** MEDIA | **Complejidad:** BAJA

**Datos:**
- Cantidad de estudiantes becados
- Monto total de becas otorgadas
- Distribución por porcentaje
- Impacto financiero

#### RF-REP-005: Reporte Financiero
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Métricas:**
- Ingresos por gestión
- Pagos pendientes
- Morosidad
- Proyección de ingresos

---

### MÓDULO 13: GESTIÓN DE USUARIOS Y PERMISOS (USR)

**Descripción:** Sistema de autenticación, autorización y auditoría.

#### RF-USR-001: Registro de Usuario
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Datos:**
- Usuario (username único)
- Email (único)
- Contraseña (hash bcrypt)
- Rol asignado
- Estado: ACTIVO, INACTIVO, BLOQUEADO

**Reglas:**
- RN-USR-001: Username y email únicos
- RN-USR-002: Contraseña mínimo 8 caracteres, incluir mayúscula, minúscula, número
- RN-USR-003: Usuario se crea INACTIVO, requiere activación por Super Admin

#### RF-USR-002: Autenticación (Login)
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Flujo:**
1. Usuario ingresa username/email y contraseña
2. Sistema valida credenciales
3. Sistema verifica estado del usuario (ACTIVO)
4. Sistema genera token JWT (válido 8 horas)
5. Sistema registra login en auditoría

**Manejo de Errores:**
- 3 intentos fallidos consecutivos → Bloqueo temporal (15 minutos)
- 5 intentos fallidos en 24 horas → Bloqueo permanente (requiere desbloqueo manual)

#### RF-USR-003: Gestión de Roles
**Prioridad:** ALTA | **Complejidad:** ALTA

**Roles del Sistema:**
1. SUPER_ADMIN: Control total del sistema
2. RECTOR: Supervisión general, reportes estratégicos
3. DIRECTOR_ACADEMICO: Gestión académica, supervisiones, aprobaciones
4. DIRECTOR_ADMINISTRATIVO: Gestión financiera, recursos, personal
5. SECRETARIA_ACADEMICA: Inscripciones, calificaciones, certificados
6. SECRETARIA_ADMINISTRATIVA: Pagos, documentación, atención
7. CONTADOR: Finanzas, aranceles, reportes contables
8. DOCENTE: Calificaciones, asistencias, materiales
9. ESTUDIANTE: Consulta de notas, horarios, pagos
10. DOCENTE_TUTOR: Docente + supervisión de pasantías
11. SUPERVISOR: Supervisión docente

#### RF-USR-004: Gestión de Permisos (RBAC)
**Prioridad:** ALTA | **Complejidad:** ALTA

**Permisos Granulares (70+ permisos):**

**Estudiantes:**
- `estudiantes.crear`, `estudiantes.ver`, `estudiantes.editar`, `estudiantes.eliminar`
- `estudiantes.becas.gestionar`, `estudiantes.licencias.aprobar`

**Inscripciones:**
- `inscripciones.crear`, `inscripciones.ver`, `inscripciones.anular`
- `inscripciones_materias.gestionar`

**Calificaciones:**
- `calificaciones.registrar`, `calificaciones.editar`, `calificaciones.publicar`
- `calificaciones.cerrar_periodo`

**Docentes:**
- `docentes.gestionar`, `docentes.asignar_materias`

**Pasantías:**
- `pasantias.gestionar`, `pasantias.evaluar`

**Reportes:**
- `reportes.academicos`, `reportes.financieros`, `reportes.administrativos`

**Sistema:**
- `usuarios.gestionar`, `roles.gestionar`, `auditoria.ver`, `configuracion.editar`

**Matriz Rol-Permisos:** Ver documento SISTEMA_AUTENTICACION_PERMISOS.md

#### RF-USR-005: Auditoría de Acciones
**Prioridad:** ALTA | **Complejidad:** MEDIA

**Datos de Auditoría:**
- Usuario que realizó la acción
- Acción realizada (CREATE, READ, UPDATE, DELETE)
- Tabla/entidad afectada
- ID del registro afectado
- Valores anteriores (JSON)
- Valores nuevos (JSON)
- IP del usuario
- Fecha y hora (timestamp)

**Acciones Auditadas:**
- Registro/modificación de estudiantes
- Inscripciones y anulaciones
- Registro/modificación de calificaciones
- Cambios de estado académico
- Asignación/modificación de becas
- Registro de pagos
- Aprobación de licencias
- Cambios en configuración del sistema
- Logins exitosos y fallidos

#### RF-USR-006: Recuperación de Contraseña
**Prioridad:** MEDIA | **Complejidad:** MEDIA

**Flujo:**
1. Usuario hace clic en "Olvidé mi contraseña"
2. Ingresa su email
3. Sistema genera token de recuperación (válido 1 hora)
4. Sistema envía email con link de recuperación
5. Usuario hace clic en link
6. Usuario ingresa nueva contraseña
7. Sistema valida token y actualiza contraseña
8. Sistema notifica cambio exitoso por email

---

## 3. RESUMEN DE REQUERIMIENTOS

### 3.1 Prioridades

| Prioridad | Cantidad | Porcentaje |
|-----------|----------|------------|
| ALTA | 42 | 70% |
| MEDIA | 15 | 25% |
| BAJA | 3 | 5% |
| **TOTAL** | **60** | **100%** |

### 3.2 Por Módulo

| Módulo | Código | RFs | Prioridad Alta |
|--------|--------|-----|----------------|
| Gestión de Estudiantes | EST | 7 | 5 |
| Gestión de Inscripciones | INS | 4 | 3 |
| Gestión de Calificaciones | CAL | 4 | 4 |
| Gestión de Nivelaciones | NIV | 3 | 3 |
| Gestión de Docentes | DOC | 2 | 2 |
| Gestión de Pasantías | PAS | 4 | 2 |
| Supervisión Docente | SUP | 3 | 1 |
| Gestión de Horarios | HOR | 3 | 2 |
| Gestión de Aranceles y Pagos | PAG | 4 | 3 |
| Historial Académico Oficial | HIS | 3 | 2 |
| Boletines de Calificaciones | BOL | 2 | 2 |
| Reportes Académicos | REP | 5 | 1 |
| Gestión de Usuarios y Permisos | USR | 6 | 6 |
| **TOTAL** | | **60** | **42** |

---

## 4. TRAZABILIDAD

### 4.1 Requerimientos vs Módulos de Base de Datos

| Requerimiento Funcional | Tablas Principales Involucradas |
|-------------------------|--------------------------------|
| RF-EST-001 | estudiantes, estudiantes_becas, documentos_estudiante |
| RF-EST-005 | licencias_solicitudes, licencias_documentos |
| RF-INS-001 | inscripciones, gestiones, aranceles |
| RF-INS-002 | inscripciones_materias, cursos, materias, prerrequisitos |
| RF-CAL-001 | inscripciones_materias, auditoria |
| RF-NIV-001 | historial_nivelaciones, inscripciones_materias |
| RF-DOC-002 | asignaciones_docentes, materias, cursos |
| RF-PAS-002 | pasantias_asignaciones, pasantias_empresas |
| RF-PAS-003 | pasantias_evaluaciones |
| RF-SUP-002 | fichas_supervision, supervisiones_programadas |
| RF-PAG-002 | pagos_aranceles, detalle_pagos |
| RF-HIS-001 | libros_registro, folios_estudiantes |
| RF-USR-003 | usuarios, roles, roles_permisos |

### 4.2 Requerimientos vs Reglas de Negocio

**Ver documento:** 08-reglas-negocio.md (para detalle completo)

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Versión inicial consolidada - 13 módulos, 60 RFs |

---

## REFERENCIAS

- 01-vision-y-alcance.md: Contexto general del proyecto
- DOMINIO_NEGOCIO.md: Definición de entidades y módulos
- OtraDocumentacion_INCOS.pdf: Formularios operativos reales
- SISTEMA_AUTENTICACION_PERMISOS.md: Matriz de roles y permisos
- instituto_schema_v3_modulos_operativos.sql: Modelo de datos

---

**FIN DEL DOCUMENTO - 02 REQUERIMIENTOS FUNCIONALES**
