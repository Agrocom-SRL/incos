# 03 - REQUERIMIENTOS NO FUNCIONALES
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Documento

Este documento especifica los **requerimientos no funcionales** (RNF) del Sistema de Gestión Académica del Instituto INCOS. Los RNF definen **CÓMO debe comportarse el sistema** en términos de calidad, rendimiento, seguridad, usabilidad y otras características que no son funcionalidades específicas pero que son críticas para el éxito del sistema.

### 1.2 Categorías de Requerimientos No Funcionales

Los RNF están organizados en las siguientes categorías:

1. **Rendimiento (PER):** Tiempos de respuesta, throughput, uso de recursos
2. **Seguridad (SEC):** Autenticación, autorización, protección de datos
3. **Disponibilidad (DIS):** Uptime, recuperación ante fallos
4. **Escalabilidad (ESC):** Capacidad de crecimiento
5. **Usabilidad (USA):** Facilidad de uso, accesibilidad
6. **Mantenibilidad (MAN):** Facilidad de mantenimiento y evolución
7. **Portabilidad (POR):** Independencia de plataforma
8. **Confiabilidad (CON):** Precisión y consistencia de datos
9. **Cumplimiento (CUM):** Normativas y regulaciones
10. **Compatibilidad (COM):** Integración con otros sistemas

### 1.3 Convenciones de Notación

- **RNF-CAT-NNN:** Requerimiento No Funcional, donde CAT es la categoría y NNN es el número secuencial
- **Prioridad:** ALTA, MEDIA, BAJA
- **Verificabilidad:** Métrica o criterio de aceptación específico

---

## 2. REQUERIMIENTOS DE RENDIMIENTO (PER)

### RNF-PER-001: Tiempo de Respuesta de Operaciones Comunes
**Prioridad:** ALTA

**Descripción:**  
Las operaciones más frecuentes del sistema deben responder en tiempos aceptables para no afectar la productividad del usuario.

**Métricas:**

| Operación | Tiempo Máximo | Percentil |
|-----------|---------------|-----------|
| Login | 1 segundo | P95 |
| Búsqueda de estudiante | 2 segundos | P95 |
| Carga de lista de estudiantes (paginado) | 2 segundos | P95 |
| Registro de calificación individual | 1 segundo | P95 |
| Generación de boletín (1 estudiante) | 3 segundos | P95 |
| Generación de reporte simple | 5 segundos | P95 |
| Carga de dashboard principal | 2 segundos | P95 |

**Criterio de Aceptación:**
- 95% de las operaciones comunes deben completarse dentro del tiempo máximo especificado
- Medición bajo condiciones normales de operación (50 usuarios concurrentes)

---

### RNF-PER-002: Tiempo de Respuesta de Operaciones Complejas
**Prioridad:** MEDIA

**Descripción:**  
Las operaciones complejas que involucran procesamiento intensivo o generación de documentos deben completarse en tiempos razonables.

**Métricas:**

| Operación | Tiempo Máximo | Condición |
|-----------|---------------|-----------|
| Generación de historial académico (PDF) | 10 segundos | 1 estudiante |
| Generación de boletines en lote | 30 segundos | hasta 100 estudiantes |
| Exportación de reporte a Excel | 15 segundos | hasta 1000 registros |
| Cálculo masivo de promedios (cierre de periodo) | 60 segundos | 850 estudiantes |

**Criterio de Aceptación:**
- Operaciones complejas deben mostrar indicador de progreso
- Usuario debe recibir feedback visual cada 3 segundos durante operaciones largas

---

### RNF-PER-003: Concurrencia de Usuarios
**Prioridad:** ALTA

**Descripción:**  
El sistema debe soportar múltiples usuarios accediendo simultáneamente sin degradación significativa del rendimiento.

**Métricas:**
- **Usuarios concurrentes objetivo:** 100 usuarios simultáneos
- **Usuarios concurrentes máximo:** 150 usuarios simultáneos
- **Degradación aceptable:** Incremento máximo del 20% en tiempos de respuesta con carga máxima

**Escenarios de Carga:**

| Escenario | Usuarios Concurrentes | Horario |
|-----------|----------------------|---------|
| Operación normal | 20-50 | Durante el día |
| Periodo de inscripciones | 80-100 | Primera semana del semestre |
| Consulta de calificaciones | 150+ | Días de publicación de notas |

**Criterio de Aceptación:**
- Sistema debe mantener tiempos de respuesta dentro de +20% de los especificados con 100 usuarios concurrentes
- No debe haber errores de "timeout" o "connection refused" bajo carga normal

---

### RNF-PER-004: Uso de Recursos del Servidor
**Prioridad:** MEDIA

**Descripción:**  
El sistema debe operar eficientemente sin consumir excesivos recursos del servidor.

**Métricas:**

| Recurso | Uso Normal | Uso Máximo Permitido |
|---------|------------|----------------------|
| CPU | < 40% | < 70% |
| Memoria RAM | < 2 GB | < 4 GB |
| Almacenamiento en disco | Crecimiento ~500 MB/año | - |
| Conexiones a BD simultáneas | < 50 | < 100 |

**Criterio de Aceptación:**
- Monitoreo de recursos debe estar implementado
- Alertas automáticas si se supera el 80% del uso máximo permitido

---

### RNF-PER-005: Tamaño de Base de Datos
**Prioridad:** BAJA

**Descripción:**  
El crecimiento de la base de datos debe ser predecible y manejable.

**Proyección de Crecimiento:**

| Año | Estudiantes | Inscripciones | Tamaño Estimado BD |
|-----|-------------|---------------|--------------------|
| Año 1 | 850 | 1700 | 500 MB |
| Año 3 | 1000 | 6000 | 1.5 GB |
| Año 5 | 1200 | 12000 | 3 GB |

**Criterio de Aceptación:**
- Estrategia de archivado de datos históricos (gestiones > 5 años)
- Proceso de optimización de BD (índices, análisis de queries)

---

### RNF-PER-006: Optimización de Consultas
**Prioridad:** ALTA

**Descripción:**  
Las consultas a la base de datos deben estar optimizadas para evitar timeouts y cargas innecesarias.

**Estrategias:**
- Uso de índices en columnas de búsqueda frecuente (CI, email, código de estudiante)
- Paginación obligatoria en listados (máximo 50 registros por página)
- Uso de caché para datos estáticos (catálogos, configuraciones)
- Lazy loading en relaciones de entidades
- Consultas con `SELECT` específico (evitar `SELECT *`)

**Criterio de Aceptación:**
- Todas las consultas deben completarse en < 500ms (P95)
- Uso de EXPLAIN ANALYZE para identificar consultas lentas
- Query monitoring activado en producción

---

## 3. REQUERIMIENTOS DE SEGURIDAD (SEC)

### RNF-SEC-001: Autenticación de Usuarios
**Prioridad:** ALTA

**Descripción:**  
El sistema debe implementar un mecanismo robusto de autenticación para verificar la identidad de los usuarios.

**Especificaciones:**
- **Mecanismo:** JWT (JSON Web Tokens)
- **Algoritmo:** HS256 (HMAC + SHA256)
- **Duración del token:** 8 horas
- **Refresh token:** 30 días (opcional para "Recordarme")
- **Almacenamiento:** httpOnly cookie (mitigar XSS)

**Política de Contraseñas:**
- Longitud mínima: 8 caracteres
- Debe incluir: 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
- No permitir contraseñas comunes (diccionario de 1000 contraseñas más comunes)
- Hash: bcrypt con salt rounds = 10

**Criterio de Aceptación:**
- Sistema debe rechazar credenciales inválidas con mensaje genérico ("Usuario o contraseña incorrectos")
- Implementar rate limiting: máximo 5 intentos por IP cada 15 minutos

---

### RNF-SEC-002: Autorización Basada en Roles (RBAC)
**Prioridad:** ALTA

**Descripción:**  
El sistema debe controlar el acceso a recursos basándose en el rol del usuario.

**Especificaciones:**
- 11 roles predefinidos (ver documento de Requerimientos Funcionales)
- 70+ permisos granulares
- Verificación de permisos en CADA endpoint de API
- Verificación de permisos en el frontend (ocultación de UI no autorizada)

**Reglas:**
- Principio de mínimo privilegio (cada rol tiene solo los permisos estrictamente necesarios)
- Separación de responsabilidades (ningún rol individual puede realizar operaciones críticas sin supervisión)
- Permisos NO acumulativos entre roles

**Criterio de Aceptación:**
- Middleware de autorización implementado en todas las rutas protegidas
- Tests unitarios para verificar permisos de cada rol
- Documentación de matriz Rol-Permiso actualizada

---

### RNF-SEC-003: Protección contra Vulnerabilidades Comunes
**Prioridad:** ALTA

**Descripción:**  
El sistema debe estar protegido contra las vulnerabilidades más comunes (OWASP Top 10).

**Vulnerabilidades a Mitigar:**

1. **SQL Injection:**
   - Uso obligatorio de ORM (Sequelize) con prepared statements
   - NO concatenación de strings en queries
   - Validación de inputs

2. **XSS (Cross-Site Scripting):**
   - Sanitización de inputs del usuario
   - Escapado de outputs en frontend
   - Content Security Policy (CSP) headers

3. **CSRF (Cross-Site Request Forgery):**
   - Tokens CSRF en formularios críticos
   - SameSite cookies

4. **Authentication Bypass:**
   - Verificación de token en CADA request
   - Invalidación de sesiones al cambiar contraseña
   - Logout forzado después de 8 horas

5. **Sensitive Data Exposure:**
   - HTTPS obligatorio en producción
   - Contraseñas hasheadas (bcrypt)
   - Datos sensibles NO en logs

6. **Broken Access Control:**
   - Validación de ownership (un estudiante solo puede ver SUS datos)
   - Verificación de permisos en backend (no confiar en frontend)

**Criterio de Aceptación:**
- Pasar escaneo de vulnerabilidades con herramienta automatizada (ej: OWASP ZAP)
- Code review de seguridad antes de cada release
- Penetration testing básico en ambiente de staging

---

### RNF-SEC-004: Auditoría y Trazabilidad
**Prioridad:** ALTA

**Descripción:**  
Todas las operaciones críticas deben quedar registradas en logs de auditoría.

**Operaciones Auditadas:**
- Logins exitosos y fallidos
- Cambios en datos de estudiantes
- Registro/modificación de calificaciones
- Cambios de estado académico
- Asignación/modificación de becas
- Aprobación/rechazo de licencias
- Cambios en configuración del sistema
- Modificaciones de usuarios y permisos

**Datos del Log:**
- Usuario que realizó la acción
- Timestamp (fecha y hora exacta)
- Acción realizada (CREATE, UPDATE, DELETE)
- Entidad/tabla afectada
- ID del registro
- Valores anteriores y nuevos (JSON)
- IP del cliente

**Criterio de Aceptación:**
- Tabla `auditoria` poblándose correctamente
- Logs inmutables (no se pueden editar ni eliminar)
- Retención de logs: mínimo 5 años
- Interfaz de consulta de auditoría para Super Admin

---

### RNF-SEC-005: Protección de Datos Personales
**Prioridad:** ALTA

**Descripción:**  
El sistema debe cumplir con principios de protección de datos personales (GDPR-like).

**Principios:**
1. **Minimización de Datos:** Solo recolectar datos estrictamente necesarios
2. **Propósito Limitado:** Usar datos solo para el fin declarado
3. **Exactitud:** Permitir corrección de datos incorrectos
4. **Limitación de Almacenamiento:** Eliminar datos cuando ya no son necesarios
5. **Confidencialidad:** Acceso solo a personal autorizado

**Implementación:**
- Consentimiento explícito para recolección de datos sensibles
- Derecho de acceso (estudiantes pueden descargar sus datos)
- Derecho de rectificación (estudiantes pueden solicitar corrección)
- Derecho al olvido (eliminación de datos de estudiantes retirados > 5 años)
- Cifrado de datos sensibles en reposo (campos como CI, dirección)

**Criterio de Aceptación:**
- Política de privacidad visible y aceptada por usuarios
- Proceso documentado para solicitudes de acceso/rectificación/eliminación
- Datos eliminados de forma segura (borrado físico, no solo lógico)

---

### RNF-SEC-006: Gestión de Sesiones
**Prioridad:** MEDIA

**Descripción:**  
Las sesiones de usuario deben gestionarse de forma segura.

**Especificaciones:**
- Sesiones con timeout de inactividad: 2 horas
- Cierre automático de sesión a las 8 horas desde login
- Invalidación de sesión al cambiar contraseña
- Soporte para logout explícito
- Prevención de sesiones concurrentes (opcional, configurable por rol)

**Criterio de Aceptación:**
- Usuario recibe advertencia 5 minutos antes de expiración de sesión
- Usuario puede extender sesión con un clic (si aún no pasaron 8 horas)

---

## 4. REQUERIMIENTOS DE DISPONIBILIDAD (DIS)

### RNF-DIS-001: Tiempo de Actividad (Uptime)
**Prioridad:** ALTA

**Descripción:**  
El sistema debe estar disponible durante el horario laboral del instituto.

**Métricas:**
- **Uptime objetivo:** 99.5% en horario laboral (8:00-20:00, Lun-Sáb)
- **Downtime máximo permitido:** 30 minutos/mes
- **Ventana de mantenimiento:** Domingos 02:00-06:00 (planificado, notificado)

**Horario Crítico (100% disponibilidad requerida):**
- Primera semana de cada gestión (inscripciones)
- Días de publicación de calificaciones
- Última semana de gestión (cierre de notas)

**Criterio de Aceptación:**
- Monitoreo de uptime con herramienta externa (ej: UptimeRobot)
- Notificaciones automáticas a administradores si el sistema está caído > 5 minutos
- Post-mortem documentado para cada incidente que cause downtime > 10 minutos

---

### RNF-DIS-002: Recuperación ante Fallos (RTO y RPO)
**Prioridad:** ALTA

**Descripción:**  
El sistema debe poder recuperarse rápidamente ante fallos críticos.

**Métricas:**
- **RTO (Recovery Time Objective):** 30 minutos
  - Tiempo máximo desde que ocurre un fallo hasta que el sistema vuelve a estar operativo
  
- **RPO (Recovery Point Objective):** 24 horas
  - Cantidad máxima de datos que se pueden perder (última copia de backup)

**Tipos de Fallos:**
1. **Fallo de aplicación:** Reinicio automático del servicio
2. **Fallo de base de datos:** Restauración desde backup diario
3. **Fallo de servidor:** Migración a servidor de respaldo (si existe)
4. **Corrupción de datos:** Restauración desde backup + logs de transacciones

**Criterio de Aceptación:**
- Proceso de recuperación documentado y probado
- Backups automáticos diarios funcionando
- Simulacro de recuperación realizado trimestralmente

---

### RNF-DIS-003: Backups Automáticos
**Prioridad:** ALTA

**Descripción:**  
El sistema debe realizar copias de seguridad automáticas de la base de datos y archivos críticos.

**Especificaciones:**
- **Frecuencia:** Diaria (02:00 AM)
- **Retención:**
  - Backups diarios: 7 días
  - Backups semanales: 4 semanas
  - Backups mensuales: 12 meses
  - Backup anual: 5 años
  
- **Alcance:**
  - Base de datos completa (dump SQL)
  - Documentos adjuntos (PDFs, imágenes)
  - Configuraciones del sistema
  
- **Almacenamiento:**
  - Backup local (servidor)
  - Backup remoto (cloud storage o servidor externo)

**Proceso de Backup:**
1. Sistema detiene escrituras temporalmente (< 30 segundos)
2. Crea snapshot de BD
3. Comprime y cifra el backup
4. Copia a almacenamiento local
5. Replica a almacenamiento remoto
6. Valida integridad del backup
7. Notifica éxito/fallo a administradores

**Criterio de Aceptación:**
- Backups ejecutándose exitosamente cada día
- Prueba de restauración exitosa cada mes
- Proceso de restauración documentado
- Tiempo de restauración < 30 minutos (RTO)

---

### RNF-DIS-004: Monitoreo y Alertas
**Prioridad:** MEDIA

**Descripción:**  
El sistema debe estar monitoreado continuamente para detectar problemas antes de que afecten a los usuarios.

**Métricas a Monitorear:**
- Disponibilidad del servicio (ping HTTP)
- Tiempo de respuesta de endpoints críticos
- Uso de CPU, RAM, disco
- Errores en logs de aplicación
- Fallos de conexión a BD
- Tamaño de la BD
- Cantidad de usuarios concurrentes

**Alertas:**
- **CRÍTICA:** Sistema caído, BD inaccesible, uso de disco > 90%
  - Notificación: Email + SMS a Super Admin
  - Acción: Inmediata
  
- **ADVERTENCIA:** Tiempo de respuesta > 5 segundos, uso de CPU > 80%
  - Notificación: Email a Super Admin
  - Acción: Dentro de 1 hora
  
- **INFO:** Backup exitoso, actualizaciones disponibles
  - Notificación: Email diario consolidado
  - Acción: No crítica

**Criterio de Aceptación:**
- Dashboard de monitoreo accesible para Super Admin
- Historial de métricas de al menos 30 días
- Alertas llegando correctamente (probar con simulación)

---

## 5. REQUERIMIENTOS DE ESCALABILIDAD (ESC)

### RNF-ESC-001: Escalabilidad de Usuarios
**Prioridad:** MEDIA

**Descripción:**  
El sistema debe poder escalar para soportar el crecimiento del instituto.

**Proyección de Crecimiento:**

| Año | Estudiantes | Docentes | Total Usuarios |
|-----|-------------|----------|----------------|
| Año 1 (actual) | 850 | 25 | 881 |
| Año 3 | 1200 | 35 | 1241 |
| Año 5 | 1500 | 45 | 1551 |

**Estrategias de Escalabilidad:**
1. **Vertical (Año 1-2):**
   - Incrementar recursos del servidor (CPU, RAM)
   - Optimización de queries y código
   
2. **Horizontal (Año 3+):**
   - Load balancer con múltiples instancias de aplicación
   - BD separada en servidor dedicado
   - Caché distribuido (Redis)

**Criterio de Aceptación:**
- Arquitectura debe permitir escalar horizontalmente sin refactoring mayor
- Código debe ser stateless (sin sesiones en memoria local)
- Configuración debe soportar múltiples instancias (variables de entorno)

---

### RNF-ESC-002: Escalabilidad de Datos
**Prioridad:** MEDIA

**Descripción:**  
El sistema debe manejar eficientemente el crecimiento de datos históricos.

**Proyección:**

| Año | Registros en `inscripciones_materias` | Tamaño BD |
|-----|--------------------------------------|-----------|
| Año 1 | ~20,000 | 500 MB |
| Año 3 | ~80,000 | 1.5 GB |
| Año 5 | ~150,000 | 3 GB |

**Estrategias:**
- Archivado de datos > 5 años en tablas de históricos
- Índices optimizados en tablas grandes
- Paginación obligatoria en consultas
- Particionamiento de tablas (por gestión académica)

**Criterio de Aceptación:**
- Consultas sobre datos históricos deben completarse en < 3 segundos
- Proceso de archivado automatizado y probado

---

### RNF-ESC-003: Modularidad para Futura Migración a Microservicios
**Prioridad:** BAJA

**Descripción:**  
Aunque la versión inicial es un monolito modular, el código debe estar estructurado para facilitar una futura migración a microservicios si se requiere.

**Principios de Diseño:**
- Módulos con bajo acoplamiento y alta cohesión
- Interfaces bien definidas entre módulos
- Uso de eventos para comunicación entre módulos (Event-Driven Architecture preparatorio)
- Base de datos compartida inicialmente, pero con esquemas lógicamente separados

**Módulos Candidatos a Microservicios (futuro):**
1. Servicio de Autenticación
2. Servicio de Estudiantes
3. Servicio de Calificaciones
4. Servicio de Reportes

**Criterio de Aceptación:**
- Cada módulo debe tener su propia carpeta con capas bien definidas
- Dependencias entre módulos deben ser explícitas
- Documentación de límites de módulos (bounded contexts)

---

## 6. REQUERIMIENTOS DE USABILIDAD (USA)

### RNF-USA-001: Curva de Aprendizaje
**Prioridad:** ALTA

**Descripción:**  
El sistema debe ser intuitivo y fácil de aprender para minimizar la resistencia al cambio.

**Métricas:**
- Usuario nuevo debe poder realizar tareas básicas después de 2 horas de capacitación
- Usuario frecuente debe poder completar tareas comunes en < 5 clics
- Tasa de errores de usuario < 5% en tareas críticas

**Estrategias:**
- Interfaz consistente (mismos patrones de navegación en todo el sistema)
- Etiquetas claras y descriptivas
- Mensajes de error comprensibles con sugerencias de solución
- Tooltips y ayuda contextual
- Videos tutoriales cortos (2-3 minutos) para tareas comunes

**Criterio de Aceptación:**
- Pruebas de usabilidad con usuarios reales (mínimo 5 usuarios por rol)
- Tasa de satisfacción de usuarios > 80% en encuestas post-capacitación

---

### RNF-USA-002: Accesibilidad
**Prioridad:** MEDIA

**Descripción:**  
El sistema debe ser accesible para usuarios con diferentes capacidades.

**Estándares:**
- Cumplimiento parcial con WCAG 2.1 Nivel AA (mínimo Nivel A)

**Características:**
- Contraste de colores adecuado (ratio mínimo 4.5:1)
- Navegación con teclado (sin mouse)
- Etiquetas semánticas en formularios
- Texto alternativo en imágenes
- Tamaño de fuente ajustable
- Soporte para lectores de pantalla (básico)

**Criterio de Aceptación:**
- Pasar validación de herramientas de accesibilidad (ej: WAVE, Axe)
- Pruebas con navegación únicamente con teclado

---

### RNF-USA-003: Diseño Responsivo
**Prioridad:** ALTA

**Descripción:**  
El sistema debe ser usable desde diferentes dispositivos y tamaños de pantalla.

**Dispositivos Soportados:**
- Desktop: 1920x1080, 1366x768 (más común)
- Laptop: 1280x800
- Tablet: 1024x768 (iPad)
- Móvil: 375x667 (iPhone), 360x640 (Android)

**Estrategias:**
- Mobile-first design
- Breakpoints: 320px, 768px, 1024px, 1280px
- Menú hamburguesa en móvil
- Tablas con scroll horizontal en móvil
- Botones con tamaño mínimo de 44x44px (touch-friendly)

**Funcionalidades Priorizadas por Dispositivo:**

**Desktop/Laptop (100% funcionalidad):**
- Todas las operaciones administrativas
- Reportes complejos
- Configuración del sistema

**Tablet (80% funcionalidad):**
- Consulta de información
- Registro de calificaciones
- Generación de reportes simples

**Móvil (50% funcionalidad):**
- Consulta de notas (estudiantes)
- Consulta de horarios
- Notificaciones
- Registro rápido de asistencia (docentes)

**Criterio de Aceptación:**
- Pruebas en dispositivos reales (mínimo 3 tamaños diferentes)
- Sin scroll horizontal en móvil
- Interfaz usable en todos los breakpoints definidos

---

### RNF-USA-004: Mensajes y Retroalimentación
**Prioridad:** ALTA

**Descripción:**  
El sistema debe proporcionar feedback claro y oportuno al usuario.

**Tipos de Mensajes:**
1. **Éxito:** "Estudiante registrado correctamente"
2. **Error:** "No se pudo guardar. Verifique que el CI no esté duplicado"
3. **Advertencia:** "Este estudiante tiene pagos pendientes"
4. **Información:** "La inscripción se abrirá el 15 de enero"

**Características:**
- Mensajes visibles y destacados
- Auto-desaparición después de 5 segundos (éxito/info)
- Permanentes hasta cerrar manualmente (error/advertencia)
- Indicadores de carga para operaciones > 2 segundos
- Confirmación para operaciones destructivas ("¿Está seguro de eliminar?")

**Criterio de Aceptación:**
- Todos los formularios validan inputs antes de enviar
- Mensajes de error específicos (no genéricos)
- Validación en tiempo real en campos críticos (CI, email)

---

## 7. REQUERIMIENTOS DE MANTENIBILIDAD (MAN)

### RNF-MAN-001: Documentación del Código
**Prioridad:** ALTA

**Descripción:**  
El código debe estar bien documentado para facilitar el mantenimiento futuro.

**Estándares:**
- Comentarios en funciones complejas explicando el "por qué", no el "qué"
- JSDoc para funciones públicas (descripción, @param, @returns)
- README.md en cada módulo principal
- Guía de arquitectura actualizada
- Diagramas de flujo para procesos complejos (ej: cálculo de notas)

**Criterio de Aceptación:**
- Todas las funciones de >20 líneas deben tener comentarios
- Todas las funciones públicas de servicios deben tener JSDoc
- Documentación técnica actualizada en cada release

---

### RNF-MAN-002: Código Limpio y Estándares
**Prioridad:** ALTA

**Descripción:**  
El código debe seguir estándares de calidad y buenas prácticas.

**Herramientas:**
- ESLint con reglas de Airbnb (JavaScript)
- Prettier para formateo automático
- Husky para pre-commit hooks (lint + tests)

**Convenciones:**
- Nombres descriptivos (variables, funciones, clases)
- Funciones pequeñas (máximo 50 líneas)
- Principio DRY (Don't Repeat Yourself)
- Separación de responsabilidades
- SOLID principles (especialmente Single Responsibility)

**Criterio de Aceptación:**
- ESLint pasa sin errores (warnings aceptables)
- Code review obligatorio antes de merge a main
- Cobertura de tests > 70% en lógica de negocio crítica

---

### RNF-MAN-003: Versionado y Control de Cambios
**Prioridad:** ALTA

**Descripción:**  
El código debe estar bajo control de versiones con un flujo de trabajo estructurado.

**Sistema:** Git + GitHub

**Branching Strategy:**
```
main (producción)
  ↑
develop (integración)
  ↑
feature/nombre-funcionalidad (nuevas funcionalidades)
hotfix/nombre-bug (correcciones urgentes)
```

**Convenciones de Commits:**
```
tipo(scope): descripción corta

[tipo: feat, fix, docs, style, refactor, test, chore]
[scope: módulo afectado]

Ejemplos:
feat(estudiantes): agregar búsqueda por CI
fix(calificaciones): corregir cálculo de promedio
docs(readme): actualizar instrucciones de instalación
```

**Criterio de Aceptación:**
- Todos los commits siguen convención
- Pull requests con revisión obligatoria
- Changelog actualizado en cada release

---

### RNF-MAN-004: Logs de Aplicación
**Prioridad:** ALTA

**Descripción:**  
El sistema debe generar logs estructurados para debugging y monitoreo.

**Niveles de Log:**
- **ERROR:** Errores que requieren atención inmediata
- **WARN:** Advertencias que no detienen la operación
- **INFO:** Información de operaciones importantes
- **DEBUG:** Información detallada para debugging (solo en desarrollo)

**Información en Logs:**
- Timestamp
- Nivel
- Módulo/archivo
- Mensaje descriptivo
- Usuario (si aplica)
- Request ID (para tracking)
- Stack trace (en errores)

**Almacenamiento:**
- Logs rotativos diarios (1 archivo por día)
- Retención: 30 días
- Logs de errores críticos: notificación inmediata a administradores

**Criterio de Aceptación:**
- Sistema de logging configurado (Winston, Bunyan, etc.)
- Logs estructurados en formato JSON
- No incluir datos sensibles en logs (contraseñas, tokens)

---

## 8. REQUERIMIENTOS DE PORTABILIDAD (POR)

### RNF-POR-001: Independencia de Sistema Operativo
**Prioridad:** MEDIA

**Descripción:**  
El sistema debe poder ejecutarse en diferentes sistemas operativos.

**Sistemas Operativos Soportados:**
- Linux Ubuntu 20.04+ (primario, producción)
- Linux CentOS 7+ (alternativo)
- Windows Server 2019+ (solo desarrollo)
- macOS (solo desarrollo)

**Estrategias:**
- Uso de variables de entorno para configuración
- Paths relativos (no hardcoded)
- Docker para despliegue (garantiza consistencia)

**Criterio de Aceptación:**
- Aplicación ejecuta correctamente en Linux y Windows
- Documentación de instalación para cada SO

---

### RNF-POR-002: Containerización
**Prioridad:** MEDIA

**Descripción:**  
El sistema debe poder desplegarse mediante contenedores para facilitar portabilidad.

**Especificaciones:**
- Dockerfile para aplicación Node.js
- docker-compose.yml para orquestación (App + MySQL + Redis opcional)
- Volúmenes para persistencia de datos
- Variables de entorno para configuración

**Servicios en Contenedores:**
1. **app:** Aplicación Node.js + Express
2. **db:** MySQL 8.0
3. **cache (opcional):** Redis para sesiones/caché

**Criterio de Aceptación:**
- Sistema completo levanta con `docker-compose up`
- Imagen Docker < 500 MB
- Documentación de uso de Docker

---

### RNF-POR-003: Independencia de Base de Datos (relativa)
**Prioridad:** BAJA

**Descripción:**  
El código debe minimizar dependencias específicas de MySQL para facilitar migración futura.

**Estrategias:**
- Uso de ORM (Sequelize) para abstraer queries
- Evitar SQL nativo (usar solo cuando sea estrictamente necesario)
- Funciones específicas de MySQL documentadas (fácil identificación para migración)

**Criterio de Aceptación:**
- >90% de queries a través de ORM
- SQL nativo claramente marcado con comentarios

---

## 9. REQUERIMIENTOS DE CONFIABILIDAD (CON)

### RNF-CON-001: Integridad de Datos
**Prioridad:** ALTA

**Descripción:**  
El sistema debe garantizar la exactitud y consistencia de los datos almacenados.

**Estrategias:**
- Restricciones de integridad referencial (Foreign Keys)
- Validaciones en múltiples capas (frontend, backend, BD)
- Transacciones ACID para operaciones críticas
- Constraints de base de datos (UNIQUE, NOT NULL, CHECK)

**Operaciones que Requieren Transacciones:**
- Inscripción a gestión + cálculo de arancel
- Registro de pago + actualización de saldo
- Cambio de estado académico + actualización de historiales
- Cierre de periodo + actualización masiva de estados

**Criterio de Aceptación:**
- Todas las operaciones críticas usan transacciones
- Tests de integridad de datos (casos de borde)
- Recuperación automática ante errores en transacciones (rollback)

---

### RNF-CON-002: Precisión de Cálculos
**Prioridad:** ALTA

**Descripción:**  
Los cálculos académicos y financieros deben ser precisos al 100%.

**Cálculos Críticos:**
1. **Calificaciones:**
   - SUMA = 1º Parcial + 2º Parcial
   - SUMA TOTAL = SUMA + 3º Parcial + PRÁCTICO
   - NOTA FINAL = SUMA TOTAL / 4
   
2. **Aranceles:**
   - Descuento = Arancel Base × (% Beca / 100)
   - Arancel Neto = Arancel Base - Descuento
   
3. **Promedios:**
   - Promedio de Gestión = Σ(Nota Final de cada materia) / Cantidad de Materias
   - Promedio General = Σ(Todas las Notas Finales) / Total de Materias

**Validaciones:**
- Uso de tipos de datos apropiados (DECIMAL para notas y montos)
- Redondeo consistente (2 decimales)
- Tests unitarios para cada fórmula

**Criterio de Aceptación:**
- Cálculos coinciden 100% con cálculos manuales
- Tests automatizados para fórmulas críticas
- Documentación matemática de cada fórmula

---

### RNF-CON-003: Manejo de Errores
**Prioridad:** ALTA

**Descripción:**  
El sistema debe manejar errores gracefully sin pérdida de datos.

**Tipos de Errores:**
1. **Errores de Validación:** Datos inválidos del usuario
2. **Errores de Negocio:** Reglas de negocio no cumplidas
3. **Errores Técnicos:** Fallo de BD, servicio externo no disponible
4. **Errores Inesperados:** Bugs en el código

**Estrategia:**
- Try-catch en todas las operaciones críticas
- Mensajes de error claros para el usuario
- Logs detallados para debugging
- Rollback automático de transacciones fallidas
- Estado consistente incluso si falla una operación

**Criterio de Aceptación:**
- Sistema NO muestra stack traces al usuario en producción
- Todos los errores se loggean
- Usuario recibe mensaje comprensible y accionable

---

## 10. REQUERIMIENTOS DE CUMPLIMIENTO (CUM)

### RNF-CUM-001: Cumplimiento con Normativa Educativa
**Prioridad:** ALTA

**Descripción:**  
El sistema debe cumplir con las normativas del Ministerio de Educación de Bolivia.

**Aspectos Regulados:**
- Formato de historial académico oficial (Libro/Folio)
- Estructura de calificaciones (sistema centesimal 0-100)
- Documentación requerida para egreso
- Registro de gestiones académicas
- Control de asistencia mínima (75%)

**Criterio de Aceptación:**
- Documentación oficial generada cumple formato ministerial
- Campos obligatorios según normativa presentes
- Auditoría de cumplimiento antes de lanzamiento

---

### RNF-CUM-002: Protección de Datos Personales
**Prioridad:** ALTA

**Descripción:**  
Aunque Bolivia no tiene ley específica de protección de datos, el sistema debe seguir principios internacionales (GDPR-like).

**Principios:**
- Consentimiento informado
- Minimización de datos
- Propósito específico
- Derecho de acceso
- Derecho de rectificación
- Derecho al olvido (con restricciones por normativa educativa)

**Criterio de Aceptación:**
- Política de privacidad visible
- Proceso documentado para ejercicio de derechos
- Datos sensibles cifrados

---

## 11. REQUERIMIENTOS DE COMPATIBILIDAD (COM)

### RNF-COM-001: Navegadores Web Soportados
**Prioridad:** ALTA

**Descripción:**  
El sistema debe funcionar correctamente en navegadores web modernos.

**Navegadores Soportados:**
- Chrome 90+ (primario)
- Firefox 85+
- Safari 14+ (macOS/iOS)
- Edge 90+

**Navegadores NO Soportados:**
- Internet Explorer (cualquier versión)

**Criterio de Aceptación:**
- Pruebas en los 4 navegadores principales
- Mensaje de advertencia en navegadores no soportados

---

### RNF-COM-002: Integraciones Futuras
**Prioridad:** BAJA

**Descripción:**  
El sistema debe estar preparado para futuras integraciones con sistemas externos.

**Integraciones Potenciales:**
- Sistema de pagos online (pasarela de pagos)
- Sistema del Ministerio de Educación (reportes)
- Sistema de mensajería (SMS/WhatsApp para notificaciones)
- Sistema de videoconferencias (Google Meet, Zoom)

**Preparación:**
- API RESTful bien documentada
- Endpoints de integración claramente identificados
- Webhooks para eventos importantes (inscripción, publicación de notas)

**Criterio de Aceptación:**
- Documentación de API con OpenAPI/Swagger
- Endpoints de salud (`/health`, `/version`)

---

## 12. RESUMEN DE PRIORIDADES

### 12.1 Requerimientos Críticos (ALTA)

| Categoría | RNF Críticos | Total RNF |
|-----------|--------------|-----------|
| Rendimiento | 3 | 6 |
| Seguridad | 5 | 6 |
| Disponibilidad | 3 | 4 |
| Usabilidad | 3 | 4 |
| Mantenibilidad | 4 | 4 |
| Confiabilidad | 3 | 3 |
| Cumplimiento | 2 | 2 |
| Compatibilidad | 1 | 2 |
| **TOTAL** | **24** | **37** |

### 12.2 Distribución por Categoría

```
Seguridad         ████████ (6 RNF)
Rendimiento       ██████ (6 RNF)
Disponibilidad    ████ (4 RNF)
Usabilidad        ████ (4 RNF)
Mantenibilidad    ████ (4 RNF)
Escalabilidad     ███ (3 RNF)
Confiabilidad     ███ (3 RNF)
Portabilidad      ███ (3 RNF)
Cumplimiento      ██ (2 RNF)
Compatibilidad    ██ (2 RNF)
```

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Versión inicial consolidada - 37 RNF en 10 categorías |

---

## REFERENCIAS

- 01-vision-y-alcance.md: Contexto y objetivos del proyecto
- 02-requerimientos-funcionales.md: Funcionalidades a implementar
- OWASP Top 10: Vulnerabilidades de seguridad más críticas
- WCAG 2.1: Web Content Accessibility Guidelines
- ISO 25010: Modelo de calidad de software

---

**FIN DEL DOCUMENTO - 03 REQUERIMIENTOS NO FUNCIONALES**
