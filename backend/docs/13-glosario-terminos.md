# 13 - GLOSARIO DE TÉRMINOS
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## A

**ACID**  
Propiedades de las transacciones de base de datos: Atomicidad, Consistencia, Aislamiento (Isolation), Durabilidad. Garantizan la integridad de los datos.

**API (Application Programming Interface)**  
Conjunto de endpoints y reglas que permiten la comunicación entre el frontend y backend del sistema.

**Arancel**  
Monto que debe pagar un estudiante por su inscripción a una gestión académica. Puede tener descuentos por becas.

**Asignación Docente**  
Proceso de asignar un docente a un curso específico en una gestión académica determinada.

**Asistencia**  
Registro de la presencia de un estudiante en las clases. Se requiere mínimo 75% de asistencia para aprobar una materia.

**Auditoría**  
Registro automático de todas las operaciones críticas del sistema (CREATE, UPDATE, DELETE) para trazabilidad.

**Autenticación**  
Proceso de verificar la identidad de un usuario mediante credenciales (username + password) y generación de token JWT.

**Autorización**  
Proceso de verificar si un usuario autenticado tiene permisos para realizar una acción específica (RBAC).

---

## B

**Bcrypt**  
Algoritmo de hash utilizado para encriptar contraseñas de forma segura antes de almacenarlas en la base de datos.

**Beca**  
Descuento otorgado a un estudiante sobre el arancel académico. Puede ser del 0%, 25%, 50%, 75% o 100%.  
- **Beca 100%:** Requiere aprobación del Rector.  
- **Regla:** Solo una beca activa por gestión.

**Boletín de Calificaciones**  
Documento oficial que muestra las notas de un estudiante en todas las materias de un periodo académico.

**Business Rule (Regla de Negocio)**  
Restricción o política del dominio del negocio que debe cumplirse. Ejemplo: "Nota mínima de aprobación: 60/100".

---

## C

**Calificación**  
Nota obtenida por un estudiante en una materia. Sistema INCOS:
- 1º Parcial (0-100)
- 2º Parcial (0-100)
- SUMA (1º + 2º)
- 3º Parcial (0-100)
- PRÁCTICO (0-100)
- SUMA TOTAL (SUMA + 3º + PRÁCT)
- NOTA FINAL (SUMA TOTAL / 4)
- RECUPERATORIO (si NOTA FINAL < 60)

**Carga Horaria**  
Cantidad de horas académicas asignadas a una materia. Se divide en teóricas y prácticas.

**Carrera**  
Programa académico que ofrece el instituto. INCOS tiene 3 carreras:
- Contaduría General (CONT)
- Administración de Empresas (ADM)
- Sistemas Informáticos (SIS)

**CI (Cédula de Identidad)**  
Documento de identificación personal único. En el sistema se registra junto con el departamento de expedición (SC, LP, CB, etc.).

**CORS (Cross-Origin Resource Sharing)**  
Mecanismo de seguridad que permite o restringe peticiones HTTP desde diferentes dominios.

**CRUD**  
Create, Read, Update, Delete. Operaciones básicas sobre recursos del sistema.

**Cupo**  
Cantidad máxima de estudiantes que puede tener un curso. Por defecto: 35 estudiantes.

**Curso**  
Grupo específico de una materia (Grupo A, B, C) con horario y docente asignado.

---

## D

**Dependency Injection (DI)**  
Patrón de diseño donde las dependencias se "inyectan" en lugar de crearlas internamente, facilitando testing y mantenibilidad.

**Deserción**  
Abandono del estudiante sin completar formalmente el retiro. Estado académico: ABANDONO.

**Desarrollo Incremental**  
Metodología donde el sistema se construye en módulos secuenciales (Semanas 1-8).

**Docente**  
Profesor que imparte clases en el instituto. Puede tener múltiples asignaciones de materias.

**Docente Tutor**  
Docente especializado que supervisa pasantías laborales de estudiantes.

**DTO (Data Transfer Object)**  
Objeto que transporta datos entre capas del sistema sin lógica de negocio.

---

## E

**Egresado**  
Estudiante que ha completado todas las materias de su carrera y está listo para obtener su título. Estado académico: EGRESADO.

**Endpoint**  
URL específica de la API que responde a una operación. Ejemplo: `GET /api/v1/estudiantes/:id`

**Entity (Entidad)**  
Objeto del dominio de negocio con identidad propia. Ejemplos: Estudiante, Inscripción, Calificación.

**Escalabilidad Vertical**  
Aumentar recursos del servidor (CPU, RAM) para manejar más carga.

**Escalabilidad Horizontal**  
Agregar más servidores para distribuir la carga.

**Estado Académico**  
Situación actual de un estudiante:
- **REGULAR:** Estudiante al día con sus materias
- **NIVELACION:** Estudiante que reprobó materias y debe nivelar
- **RETIRADO:** Estudiante que se retiró formalmente
- **EGRESADO:** Completó todas las materias
- **ABANDONO:** Dejó de asistir sin formalizar retiro

**Estudiante**  
Usuario principal del sistema que se inscribe a carreras, materias y recibe calificaciones.

---

## F

**Ficha de Supervisión**  
Documento de evaluación del desempeño docente en clase. Incluye aspectos como presentación, recursos didácticos, exposición, participación de estudiantes.

**Folio**  
Número secuencial dentro de un libro de registro oficial. Formato: "LIBRO 12, FOLIO 58".

**Foreign Key (Clave Foránea)**  
Campo de una tabla que referencia la clave primaria de otra tabla, estableciendo relaciones.

---

## G

**Gestión Académica**  
Periodo académico de un año dividido en dos semestres. Ejemplo: 2025-1 (primer semestre 2025).

**Guard Clause**  
Validación al inicio de una función que retorna temprano si no se cumple una condición.

---

## H

**Hash**  
Función criptográfica unidireccional. Se usa para almacenar contraseñas (bcrypt) y validar integridad de documentos (SHA256).

**Historial Académico Oficial**  
Documento oficial que muestra el registro completo de un estudiante, incluyendo todas las materias cursadas, notas y promedio general. Se registra en libros y folios oficiales.

**Horario**  
Distribución de días y horas en que se dicta un curso. Ejemplo: LUN-MIE-VIE 08:00-10:00.

**HTTP Status Code**  
Código numérico que indica el resultado de una petición HTTP:
- 200: OK
- 201: Creado
- 400: Bad Request
- 401: No autenticado
- 403: Prohibido
- 404: No encontrado
- 500: Error del servidor

---

## I

**Inscripción**  
Proceso de matricular a un estudiante en una gestión académica y en materias específicas.

**Inscripción a Gestión**  
Matrícula del estudiante a un año académico (gestión). Genera arancel a pagar.

**Inscripción a Materias**  
Selección de materias específicas del plan de estudios. Se validan prerrequisitos y cupos.

---

## J

**JWT (JSON Web Token)**  
Token de autenticación que contiene información del usuario codificada. Válido por 8 horas en el sistema INCOS.

**JSDoc**  
Estándar de documentación de código JavaScript mediante comentarios especiales.

---

## L

**Licencia Estudiantil**  
Permiso temporal de ausencia otorgado a un estudiante por motivos justificados:
- ENFERMEDAD
- TRABAJO
- FAMILIAR
- OTRO  
Máximo 15 días por gestión.

**Libro de Registro**  
Libro físico/digital oficial donde se registran los historiales académicos. Cada libro tiene múltiples folios.

**Logging**  
Registro de eventos del sistema en archivos de texto para debugging y auditoría.

---

## M

**Materia**  
Asignatura del plan de estudios de una carrera. Tiene código único, carga horaria y puede tener prerrequisitos.

**Middleware**  
Función que intercepta peticiones HTTP para realizar operaciones como autenticación, validación o logging.

**Migración de BD**  
Script que modifica el esquema de la base de datos de forma controlada y versionada.

**Monolito Modular**  
Arquitectura donde la aplicación es una unidad única pero organizada en módulos lógicamente independientes.

**Morosidad**  
Estado de un estudiante con deudas pendientes de pago. Bloquea inscripciones futuras.

**MySQL**  
Sistema de gestión de base de datos relacional utilizado en el proyecto.

---

## N

**Nivelación**  
Proceso de cursar nuevamente una materia reprobada. El estudiante pasa a estado NIVELACION.  
**Reglas:**
- Máximo 3 intentos de nivelación
- Sin costo adicional
- Solo puede inscribirse a materias reprobadas

**Node.js**  
Entorno de ejecución de JavaScript en el servidor, usado para el backend del sistema.

**Nota Final**  
Promedio calculado como: (SUMA TOTAL) / 4  
**Aprobación:** >= 60/100

---

## O

**ORM (Object-Relational Mapping)**  
Herramienta que mapea objetos de código a tablas de base de datos. En el proyecto: Sequelize.

---

## P

**Pasantía Laboral**  
Práctica profesional que estudiantes de 3º o 4º semestre realizan en empresas colaboradoras.  
**Requisitos:**
- Promedio >= 70
- Sin deudas
- Mínimo 240 horas

**Periodo**  
Semestre académico dentro de una carrera (1º, 2º, 3º, 4º semestre).

**Permiso**  
Acción específica que un rol puede realizar. Ejemplos: `estudiantes.crear`, `calificaciones.editar`

**Plan de Estudios**  
Conjunto estructurado de materias que conforman una carrera, organizadas por periodos.

**PM2**  
Process manager para Node.js que permite ejecutar la aplicación en producción con auto-restart y clustering.

**Prerrequisito**  
Materia que debe ser aprobada antes de poder inscribirse a otra materia. Ejemplo: Matemática I es prerrequisito de Matemática II.

**Primary Key (Clave Primaria)**  
Campo único que identifica cada registro en una tabla. En el sistema: `id` autoincremental.

---

## R

**Rate Limiting**  
Restricción de cantidad de peticiones que un cliente puede hacer en un periodo de tiempo. Previene abuso.

**RBAC (Role-Based Access Control)**  
Sistema de control de acceso basado en roles. Cada rol tiene permisos específicos.

**React**  
Librería de JavaScript para construir interfaces de usuario (frontend del sistema).

**Recuperatorio**  
Examen adicional para estudiantes que no alcanzaron nota de aprobación (< 60). Si aprueban, nota final = 60.

**Repository Pattern**  
Patrón de diseño que abstrae el acceso a datos, separando lógica de negocio de persistencia.

**REST (Representational State Transfer)**  
Estilo arquitectónico para diseñar APIs web usando HTTP.

**Rol**  
Conjunto de permisos asignado a usuarios. INCOS tiene 11 roles:
- SUPER_ADMIN
- RECTOR
- DIRECTOR_ACADEMICO
- DIRECTOR_ADMINISTRATIVO
- SECRETARIA_ACADEMICA
- SECRETARIA_ADMINISTRATIVA
- CONTADOR
- DOCENTE
- ESTUDIANTE
- DOCENTE_TUTOR
- SUPERVISOR

---

## S

**Seed**  
Datos iniciales que se insertan en la base de datos (usuarios, roles, permisos, catálogos).

**Sequelize**  
ORM para Node.js utilizado en el proyecto para interactuar con MySQL.

**Soft Delete**  
Eliminación lógica (no física) de registros marcando `deleted_at` en lugar de borrar de la BD.

**SOLID**  
Principios de diseño orientado a objetos:
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

**Stack Tecnológico**  
Conjunto de tecnologías usadas: Node.js + Express + MySQL + React + Tailwind CSS

**Supervisión Docente**  
Evaluación del desempeño de un docente en clase mediante observación directa.

---

## T

**Transacción**  
Conjunto de operaciones de BD que se ejecutan como una unidad atómica (todo o nada).

**Turno**  
Horario en que se dictan las clases:
- MAÑANA: 07:00-12:00
- TARDE: 14:00-18:00
- NOCHE: 19:00-22:00

---

## U

**Use Case (Caso de Uso)**  
Acción específica que un actor puede realizar en el sistema. Ejemplo: "Crear Estudiante", "Registrar Calificaciones".

**Usuario**  
Persona con acceso al sistema mediante credenciales. Tiene un rol asignado.

---

## V

**Validación**  
Verificación de que los datos cumplan reglas específicas antes de procesarlos.

**Value Object**  
Objeto inmutable definido por sus valores, no por identidad. Ejemplos: CI, Email, Nota.

**Versionamiento de API**  
Estrategia para mantener múltiples versiones de la API simultáneamente. Ejemplo: `/api/v1`, `/api/v2`

---

## W

**Winston**  
Librería de logging para Node.js utilizada en el proyecto.

---

## SIGLAS TÉCNICAS

| Sigla | Significado | Contexto |
|-------|-------------|----------|
| API | Application Programming Interface | Comunicación frontend-backend |
| CRUD | Create, Read, Update, Delete | Operaciones básicas |
| JWT | JSON Web Token | Autenticación |
| ORM | Object-Relational Mapping | Acceso a datos |
| RBAC | Role-Based Access Control | Autorización |
| REST | Representational State Transfer | Arquitectura de API |
| DTO | Data Transfer Object | Transferencia de datos |
| DI | Dependency Injection | Inyección de dependencias |
| CI/CD | Continuous Integration/Deployment | Automatización |
| SSL/TLS | Secure Sockets Layer/Transport Layer Security | Cifrado HTTPS |
| SQL | Structured Query Language | Lenguaje de BD |
| HTTP | HyperText Transfer Protocol | Protocolo web |
| HTTPS | HTTP Secure | HTTP con cifrado |
| JSON | JavaScript Object Notation | Formato de datos |
| CORS | Cross-Origin Resource Sharing | Seguridad web |

---

## ACRÓNIMOS DEL PROYECTO

| Acrónimo | Significado |
|----------|-------------|
| INCOS | Instituto Comercial Superior |
| EST | Estudiante (prefijo de código) |
| CONT | Contaduría General |
| ADM | Administración de Empresas |
| SIS | Sistemas Informáticos |
| SC | Santa Cruz (expedición CI) |
| LP | La Paz (expedición CI) |
| CB | Cochabamba (expedición CI) |
| RF | Requerimiento Funcional |
| RNF | Requerimiento No Funcional |
| RN | Regla de Negocio |

---

## TÉRMINOS DEL DOMINIO EDUCATIVO BOLIVIANO

**Expedición**  
Departamento donde se emitió la cédula de identidad. Ejemplos: SC (Santa Cruz), LP (La Paz), CB (Cochabamba).

**Régimen Académico**  
Sistema semestral. Cada gestión tiene 2 semestres de ~4 meses cada uno.

**Resolución Ministerial (R.M.)**  
Documento oficial del Ministerio de Educación que autoriza carreras. INCOS: R.M. 0426/2016

**Técnico Superior**  
Título otorgado a egresados de institutos técnicos después de completar 4 semestres (2 años).

**Unidad Educativa**  
Colegio de educación secundaria. En el sistema se registra como "colegio de procedencia".

---

## GLOSARIO DE BASES DE DATOS

**AUTO_INCREMENT**  
Propiedad que genera automáticamente valores secuenciales para claves primarias.

**CHARSET**  
Conjunto de caracteres. El sistema usa `utf8mb4` para soporte completo de Unicode.

**COLLATION**  
Reglas de comparación de caracteres. El sistema usa `utf8mb4_unicode_ci` (case-insensitive).

**CONSTRAINT**  
Restricción que garantiza integridad de datos. Ejemplos: NOT NULL, UNIQUE, CHECK.

**ENGINE**  
Motor de almacenamiento de MySQL. El sistema usa InnoDB (transacciones ACID).

**INDEX**  
Estructura que acelera búsquedas en tablas. Se crean en columnas frecuentemente consultadas.

**TRIGGER**  
Procedimiento que se ejecuta automáticamente ante eventos (INSERT, UPDATE, DELETE).

---

## PATRONES DE DISEÑO UTILIZADOS

**Repository Pattern**  
Abstrae acceso a datos separando lógica de negocio de persistencia.

**Factory Pattern**  
Centraliza creación de objetos complejos.

**Strategy Pattern**  
Encapsula algoritmos intercambiables (ej: diferentes tipos de descuentos).

**Middleware Pattern**  
Procesa peticiones en cadena (autenticación → validación → controlador).

**Dependency Injection**  
Invierte dependencias facilitating testing y desacoplamiento.

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Glosario inicial completo |

---

## REFERENCIAS

- 01-vision-y-alcance.md: Contexto del proyecto
- 02-requerimientos-funcionales.md: Funcionalidades
- 04-arquitectura-sistema.md: Arquitectura técnica
- 05-modelo-datos.md: Modelo de datos completo

---

**FIN DEL DOCUMENTO - 13 GLOSARIO DE TÉRMINOS**
