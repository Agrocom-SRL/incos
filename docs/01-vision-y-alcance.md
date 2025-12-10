# 01 - VISIÓN Y ALCANCE DEL SISTEMA
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INFORMACIÓN INSTITUCIONAL

### 1.1 Datos del Instituto

**Nombre Completo:** El Instituto Comercial Superior de la Nación INCOS Santa Cruz  
**Ubicación:** Calle Ñuflo de Chavez Nº 62, entre René Moreno y Calle Chuquisaca, dentro del centro histórico del municipio de Santa Cruz de la Sierra, Bolivia  
**Fundación:** 2 de agosto de 1985 mediante la Resolución Ministerial 746/1985  
**Resolución Ministerial Actual:** R.M. 0426/2016  
**Tipo de Institución:** Institución de Educación Superior Estatal, abierta al conjunto de la sociedad, establecida con plenas facultades legales dentro del sistema Educativo Nacional

**Historia:**
El instituto fue fundado ofertando inicialmente las Carreras de **Contaduría General** y **Secretariado Ejecutivo**. Posteriormente, en el año **1988**, se ampliaron las carreras de **Administración de Empresas** e **Informática**.

### 1.2 Personal Directivo

| Cargo | Nombre | CI |
|-------|--------|-----|
| Rector | Victor Hugo Bejarano Rendón | 3.456.789 SC |
| Directora Académica | Lidia Ordoñez Cuenca | 4.567.890 SC |
| Directora Administrativa | Mirian Fernández Colque | 5.678.901 SC |

### 1.3 Estructura Académica Actual

**Carreras Técnicas en Operación (Nivel Técnico Superior):**

1. **Sistemas Informáticos**
   - Estudiantes activos: ~145
   - Duración: Variable (definida en plan de estudios)
   - Turnos: Tarde (14:00-16:30), Noche (18:45-22:30), Sábados (17:00-21:00)
   - Modalidad: Presencial

2. **Administración de Empresas**
   - Estudiantes activos: ~195
   - Duración: Variable (definida en plan de estudios)
   - Turnos: Tarde (14:00-16:30), Noche (18:45-22:30), Sábados (17:00-21:00)
   - Modalidad: Presencial

3. **Contaduría General**
   - Estudiantes activos: ~280
   - Duración: Variable (definida en plan de estudios)
   - Turnos: Tarde (14:00-16:30), Noche (18:45-22:30), Sábados (17:00-21:00)
   - Modalidad: Presencial

**Totales:**
- Estudiantes activos: ~850
- Docentes: 25 (distribuidos por carrera y especialidad)
- Personal administrativo: 6
- Total usuarios del sistema: ~881

---

## 2. VISIÓN DEL PROYECTO

### 2.1 Declaración de Visión

Desarrollar un **Sistema Integral de Gestión Académica** que permita al Instituto INCOS Santa Cruz digitalizar, automatizar y optimizar todos sus procesos académicos, administrativos y operativos, proporcionando:

- **Eficiencia operativa** mediante la automatización de procesos manuales
- **Trazabilidad completa** de la información académica y administrativa
- **Acceso en tiempo real** a información crítica para la toma de decisiones
- **Cumplimiento normativo** con las regulaciones del Ministerio de Educación de Bolivia
- **Experiencia de usuario mejorada** para estudiantes, docentes y personal administrativo
- **Base sólida para crecimiento** que permita escalar a medida que el instituto crece

### 2.2 Objetivos Estratégicos

#### 2.2.1 Objetivos de Negocio

1. **Optimización de Procesos**
   - Reducir tiempos de inscripción de 2 horas a 15 minutos por estudiante
   - Automatizar generación de reportes académicos (de 2 días a tiempo real)
   - Eliminar errores de transcripción manual en calificaciones

2. **Mejora en la Gestión Académica**
   - Centralizar información de 850+ estudiantes en una única base de datos
   - Proveer visibilidad en tiempo real del rendimiento académico
   - Facilitar seguimiento individualizado de estudiantes

3. **Transparencia y Trazabilidad**
   - Auditoría completa de todas las operaciones críticas
   - Historial académico oficial con validación criptográfica (SHA256)
   - Trazabilidad de cambios en calificaciones y estados de estudiantes

4. **Cumplimiento Normativo**
   - Generar documentación oficial requerida por el Ministerio de Educación
   - Mantener registros históricos en formato Libro/Folio
   - Implementar controles de becas y descuentos según normativa

#### 2.2.2 Objetivos Tecnológicos

1. **Arquitectura Sostenible**
   - Implementar arquitectura de Monolito Modular escalable
   - Garantizar mantenibilidad mediante Clean Architecture
   - Facilitar futura evolución a microservicios si se requiere

2. **Seguridad y Confiabilidad**
   - Implementar autenticación y autorización robustas (JWT + RBAC)
   - Proteger datos sensibles (GDPR-compliant)
   - Garantizar disponibilidad del 99.5% en horario laboral

3. **Experiencia de Usuario**
   - Interfaces responsivas y accesibles desde cualquier dispositivo
   - Tiempos de respuesta < 2 segundos para operaciones comunes
   - Diseño intuitivo que minimice la curva de aprendizaje

---

## 3. ALCANCE DEL SISTEMA

### 3.1 Alcance Funcional (DENTRO DEL PROYECTO)

El sistema incluirá los siguientes módulos operativos:

#### 3.1.1 Módulos de Gestión Académica

1. **Gestión de Estudiantes**
   - Registro completo de datos personales, académicos y documentales
   - Gestión de becas y descuentos (hasta 100%)
   - Control de estados especiales (retirado, abandono, egresado)
   - Gestión de licencias estudiantiles (enfermedad, trabajo, familiar)

2. **Gestión de Inscripciones**
   - Inscripción a gestiones académicas (2025-1, 2025-2, etc.)
   - Inscripción a materias con validación de prerrequisitos
   - Control de cupos por curso y turno
   - Aplicación automática de becas/descuentos

3. **Gestión de Calificaciones**
   - Registro de notas parciales (1º, 2º, 3º parcial + práctico)
   - Cálculo automático de promedios y sumas
   - Gestión de recuperatorios
   - Validación de rangos (0-100 puntos)
   - Historial completo de modificaciones

4. **Gestión de Nivelaciones**
   - Registro de estudiantes en nivelación
   - Seguimiento de materias pendientes
   - Control de cambios de estado (EN_NIVELACION ↔ REGULAR)
   - Historial de intentos

5. **Gestión de Docentes**
   - Registro de datos personales y profesionales
   - Asignación de materias y grupos
   - Control de carga horaria
   - Gestión de disponibilidad por turno

#### 3.1.2 Módulos de Gestión Operativa

6. **Gestión de Pasantías Laborales**
   - Registro de empresas colaboradoras
   - Asignación de estudiantes a empresas
   - Evaluaciones ALTO/MEDIO/BAJO
   - Seguimiento de horas cumplidas
   - Generación de reportes con firmas digitales

7. **Supervisión Docente**
   - Programación de visitas de supervisión
   - Fichas de observación de clase
   - Evaluación de metodología y recursos didácticos
   - Seguimiento de observaciones y mejoras
   - Reportes de desempeño docente

8. **Gestión de Horarios**
   - Asignación de materias a turnos (Mañana, Tarde, Noche)
   - Control de solapamientos
   - Visualización de horarios por estudiante/docente
   - Gestión de cambios y ajustes

9. **Gestión de Aranceles y Pagos**
   - Registro de aranceles por gestión y carrera
   - Control de pagos parciales/totales
   - Aplicación de becas y descuentos
   - Generación de comprobantes
   - Reportes de morosidad

#### 3.1.3 Módulos de Reportes y Documentación

10. **Historial Académico Oficial**
    - Generación de historial en formato Libro/Folio
    - Registro oficial: "LIBRO 12, FOLIO 58"
    - Inclusión de carga horaria total y promedio general
    - Hash SHA256 para validación de autenticidad
    - Estados: EN_CURSO, EGRESADO, ABANDONO, RETIRADO

11. **Boletines de Calificaciones**
    - Estructura oficial: 1º Parcial, 2º Parcial, SUMA, 3º Parcial, PRÁCTICO, SUMA TOTAL, RECUPERATORIO
    - Generación por estudiante/gestión/periodo
    - Formato imprimible con membrete institucional
    - Exportación a PDF

12. **Reportes Académicos**
    - Estadísticas de rendimiento por carrera/materia
    - Índices de aprobación/reprobación
    - Ranking de estudiantes
    - Reportes de asistencia
    - Análisis de deserción

#### 3.1.4 Módulos de Administración del Sistema

13. **Gestión de Usuarios y Permisos**
    - 11 roles predefinidos: SUPER_ADMIN, RECTOR, DIRECTOR_ACADEMICO, DIRECTOR_ADMINISTRATIVO, SECRETARIA_ACADEMICA, SECRETARIA_ADMINISTRATIVA, CONTADOR, DOCENTE, ESTUDIANTE, DOCENTE_TUTOR, SUPERVISOR
    - Sistema de permisos granulares (70+ permisos específicos)
    - Auditoría completa de accesos y acciones
    - Control de sesiones concurrentes

### 3.2 Usuarios del Sistema

| Rol | Cantidad | Acceso Principal |
|-----|----------|------------------|
| Super Admin | 1 | Configuración total del sistema |
| Rector | 1 | Supervisión general, reportes estratégicos |
| Director Académico | 1 | Gestión académica, supervisiones, aprobaciones |
| Director Administrativo | 1 | Gestión financiera, recursos, personal |
| Secretaria Académica | 1 | Inscripciones, calificaciones, certificados |
| Secretaria Administrativa | 1 | Pagos, documentación, atención |
| Contador | 1 | Finanzas, aranceles, reportes contables |
| Docentes | 25 | Calificaciones, asistencias, materiales |
| Estudiantes | ~850 | Consulta de notas, horarios, pagos |
| **TOTAL** | **~881** | |

### 3.3 Límites del Alcance (FUERA DEL PROYECTO)

**Funcionalidades NO incluidas en la versión 1.0:**

1. **Módulos Fuera de Alcance:**
   - Sistema de biblioteca o inventario de activos
   - Plataforma LMS (Learning Management System) con contenidos educativos
   - Sistema de recursos humanos completo (planilla de sueldos)
   - Portal de exámenes en línea
   - Sistema de videoconferencias integrado
   - App móvil nativa (solo web responsive)

2. **Integraciones Externas:**
   - Integración con sistemas del Ministerio de Educación (futuro)
   - Pasarelas de pago online (se manejará efectivo/transferencias)
   - Sistemas de biometría o reconocimiento facial
   - ERP empresarial externo

3. **Funcionalidades Pospuestas:**
   - Gestión de proyectos de grado/tesis
   - Sistema de encuestas de satisfacción
   - Portal de empleabilidad para egresados
   - Sistema de tutorías personalizadas

---

## 4. BENEFICIOS ESPERADOS

### 4.1 Beneficios Cuantitativos

| Métrica | Situación Actual | Meta con Sistema | Mejora |
|---------|------------------|------------------|--------|
| Tiempo de inscripción | 2 horas/estudiante | 15 min/estudiante | 87.5% |
| Generación de boletines | 2 días | Inmediato | 100% |
| Errores de transcripción | ~5% | <0.1% | 98% |
| Tiempo de búsqueda de historial | 30 minutos | <10 segundos | 99.4% |
| Reportes académicos | 1 semana | Tiempo real | 100% |

### 4.2 Beneficios Cualitativos

1. **Para Estudiantes:**
   - Acceso 24/7 a notas y horarios
   - Transparencia en el proceso académico
   - Seguimiento de progreso personal
   - Agilidad en trámites administrativos

2. **Para Docentes:**
   - Registro simplificado de calificaciones
   - Visibilidad de historial de estudiantes
   - Herramientas de seguimiento académico
   - Reducción de carga administrativa

3. **Para Administración:**
   - Información centralizada y accesible
   - Reportes automatizados para toma de decisiones
   - Cumplimiento normativo garantizado
   - Trazabilidad y auditoría completas

4. **Para la Institución:**
   - Mejora de imagen institucional
   - Base para acreditación y certificación
   - Escalabilidad para crecimiento futuro
   - Reducción de costos operativos

---

## 5. SUPUESTOS Y RESTRICCIONES

### 5.1 Supuestos del Proyecto

1. **Infraestructura:**
   - El instituto cuenta con conexión a internet estable
   - Existe infraestructura de red local (LAN)
   - Se dispone de servidor o hosting para despliegue
   - Los usuarios tienen acceso a computadoras/dispositivos con navegador web

2. **Organizacionales:**
   - Existirá un usuario Super Admin capacitado para administrar el sistema
   - El personal recibirá capacitación para uso del sistema
   - Habrá disponibilidad de usuarios para pruebas y validación
   - Se asignará personal para migración de datos históricos

3. **Operacionales:**
   - Los procesos académicos actuales están documentados
   - Existe información histórica digitalizable (Excel, documentos)
   - Se cuenta con reglamentos académicos definidos
   - Hay disponibilidad para ajustar procesos si se requiere

### 5.2 Restricciones del Proyecto

1. **Técnicas:**
   - Stack tecnológico: Node.js + Express + MySQL (definido)
   - Arquitectura: Monolito Modular (no microservicios inicialmente)
   - Hosting: Servidor único (sin alta disponibilidad distribuida)
   - Sin app móvil nativa (solo web responsive)

2. **Presupuestarias:**
   - Presupuesto limitado para infraestructura
   - Priorización de funcionalidades core sobre nice-to-have
   - Sin licencias premium de terceros (usar open source)

3. **Temporales:**
   - Desarrollo en 8 semanas
   - Despliegue antes del inicio de gestión 2025-2
   - Capacitación en 2 semanas post-despliegue

4. **Regulatorias:**
   - Cumplimiento con normativa del Ministerio de Educación de Bolivia
   - Protección de datos personales (GDPR-like)
   - Documentación oficial con formatos establecidos

5. **Operacionales:**
   - Disponibilidad en horario laboral (8:00-20:00)
   - Soporte técnico local limitado
   - Sin equipo de QA dedicado (pruebas por usuarios finales)

---

## 6. STAKEHOLDERS

### 6.1 Stakeholders Principales

| Stakeholder | Rol | Interés | Influencia |
|-------------|-----|---------|------------|
| Victor Hugo Bejarano (Rector) | Sponsor | Muy Alto | Muy Alta |
| Lidia Ordoñez (Directora Académica) | Usuario Clave | Muy Alto | Alta |
| Mirian Fernández (Directora Administrativa) | Usuario Clave | Alto | Alta |
| Equipo de Desarrollo | Implementadores | Alto | Media |
| Docentes (25) | Usuarios Finales | Alto | Media |
| Estudiantes (~850) | Usuarios Finales | Medio | Baja |
| Personal Administrativo (6) | Usuarios Finales | Alto | Media |

### 6.2 Matriz de Comunicación

| Stakeholder | Frecuencia | Canal | Tipo de Información |
|-------------|-----------|-------|---------------------|
| Rector | Semanal | Reunión presencial | Avance general, decisiones estratégicas |
| Directoras | Bi-semanal | Reunión + Email | Validaciones funcionales, prioridades |
| Personal Administrativo | Según necesidad | Email + Demo | Capacitación, feedback de usabilidad |
| Docentes | Al finalizar módulos | Sesión grupal | Presentación de funcionalidades, capacitación |
| Estudiantes | Pre-lanzamiento | Comunicado general | Anuncio de nuevo sistema, guía de uso |

---

## 7. RIESGOS INICIALES IDENTIFICADOS

### 7.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos durante migración | Media | Crítico | Backups múltiples, proceso de validación post-migración |
| Problemas de rendimiento con 850+ usuarios | Media | Alto | Optimización de queries, índices en BD, caching |
| Incompatibilidad de navegadores antiguos | Baja | Medio | Pruebas cross-browser, documentar requisitos mínimos |

### 7.2 Riesgos Organizacionales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Resistencia al cambio del personal | Alta | Alto | Capacitación intensiva, soporte post-lanzamiento |
| Falta de disponibilidad de usuarios para pruebas | Media | Medio | Planificación anticipada, incentivos para participación |
| Cambios de alcance frecuentes | Alta | Alto | Control de cambios formal, priorización clara |

### 7.3 Riesgos Operacionales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Indisponibilidad de internet | Media | Medio | Modo offline limitado, caché local |
| Falta de soporte técnico 24/7 | Alta | Medio | Documentación exhaustiva, capacitación de super admin |
| Errores en datos históricos migrados | Alta | Alto | Proceso de validación, ventana de corrección |

---

## 8. CRITERIOS DE ÉXITO

### 8.1 Criterios de Aceptación del Sistema

El sistema será considerado exitoso si cumple con:

1. **Funcionalidad:**
   - ✅ Los 13 módulos definidos están operativos
   - ✅ Migración exitosa de datos de 850+ estudiantes
   - ✅ 11 roles con permisos funcionando correctamente
   - ✅ Generación exitosa de documentos oficiales (boletines, historiales)

2. **Rendimiento:**
   - ✅ Tiempo de respuesta < 2 segundos en operaciones comunes
   - ✅ Soporte concurrente de 100+ usuarios sin degradación
   - ✅ Carga de página inicial < 3 segundos

3. **Seguridad:**
   - ✅ Sistema de autenticación JWT operativo
   - ✅ Control de acceso por roles sin vulnerabilidades
   - ✅ Auditoría de operaciones críticas funcionando
   - ✅ Backups automáticos diarios

4. **Usabilidad:**
   - ✅ Tasa de satisfacción de usuarios > 80%
   - ✅ Tiempo de capacitación < 4 horas por rol
   - ✅ Tasa de errores de usuario < 5%

5. **Disponibilidad:**
   - ✅ Uptime del 99.5% en horario laboral (8:00-20:00)
   - ✅ Proceso de recuperación ante fallos < 30 minutos

### 8.2 Métricas de Adopción (Post-Lanzamiento)

**Primer Mes:**
- 100% de personal administrativo usando el sistema
- 80% de docentes registrando calificaciones digitalmente
- 50% de estudiantes consultando el sistema regularmente

**Tercer Mes:**
- 100% de inscripciones gestionadas por el sistema
- 100% de calificaciones digitales (eliminación de registros manuales)
- 70% de estudiantes usando el sistema semanalmente

**Sexto Mes:**
- Reducción del 90% en tiempo de generación de reportes
- Eliminación total de errores de transcripción
- Satisfacción general de usuarios > 85%

---

## 9. PRÓXIMOS PASOS

### 9.1 Fase de Documentación (Actual)

- [x] Consolidación de visión y alcance (este documento)
- [ ] Requerimientos funcionales detallados
- [ ] Requerimientos no funcionales
- [ ] Arquitectura del sistema
- [ ] Modelo de datos completo

### 9.2 Fase de Desarrollo (8 semanas)

1. **Setup y Fundamentos** (Semana 1)
2. **Módulos Core** (Semanas 2-4)
3. **Módulos Operativos** (Semanas 5-6)
4. **Integración y Pruebas** (Semana 7)
5. **Preparación para Producción** (Semana 8)

### 9.3 Fase de Despliegue y Capacitación

1. Migración de datos históricos (1 semana)
2. Capacitación de usuarios (2 semanas)
3. Marcha blanca (2 semanas)
4. Lanzamiento oficial

---

## 10. APROBACIONES

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Rector (Sponsor) | Victor Hugo Bejarano Rendón | | |
| Directora Académica | Lidia Ordoñez Cuenca | | |
| Directora Administrativa | Mirian Fernández Colque | | |
| Líder Técnico | [Equipo de Desarrollo] | | |

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Versión inicial consolidada basada en 16 documentos fuente |

---

## REFERENCIAS

- Documentos fuente: DOMINIO_NEGOCIO.md, arquitectura_backend.md, PLAN_DESARROLLO_MODULAR.md
- Análisis de datos reales: analisis_datos_reales.md (850+ estudiantes)
- Documentación operativa: OtraDocumentacion_INCOS.pdf
- Schema de base de datos: instituto_schema_v3_modulos_operativos.sql
- Sistema de autenticación: SISTEMA_AUTENTICACION_PERMISOS.md

---

**FIN DEL DOCUMENTO - 01 VISIÓN Y ALCANCE DEL SISTEMA**
