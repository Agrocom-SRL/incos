# 06 - DISEÑO DE API REST
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Documento

Este documento describe el diseño completo de la **API REST** del Sistema de Gestión Académica del Instituto INCOS. Define todos los endpoints, contratos de request/response, validaciones, códigos de error y ejemplos de uso.

### 1.2 Principios de Diseño

**RESTful Architecture:**
- Recursos como sustantivos (no verbos)
- Uso correcto de métodos HTTP (GET, POST, PUT, PATCH, DELETE)
- Códigos de estado HTTP apropiados
- Respuestas consistentes en formato JSON
- Versionamiento de API (v1, v2)

**Estándares:**
- **Base URL:** `https://api.incos.edu.bo/api/v1`
- **Formato:** JSON (Content-Type: application/json)
- **Autenticación:** JWT en header `Authorization: Bearer <token>`
- **Paginación:** Query params `?page=1&limit=50`
- **Filtros:** Query params `?carrera=1&estado=REGULAR`
- **Ordenamiento:** Query param `?sort=-created_at` (- = descendente)

### 1.3 Estructura de Respuestas

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": { /* objeto o array */ },
  "message": "Operación exitosa",
  "meta": {
    "timestamp": "2025-12-08T14:30:00Z",
    "requestId": "abc-123-def"
  }
}
```

**Respuesta con Paginación:**
```json
{
  "success": true,
  "data": [ /* array de objetos */ ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 850,
    "totalPages": 17,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-12-08T14:30:00Z"
  }
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos proporcionados son inválidos",
    "details": [
      {
        "field": "ci",
        "message": "El CI ya está registrado"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-08T14:30:00Z",
    "requestId": "abc-123-def"
  }
}
```

---

## 2. AUTENTICACIÓN Y AUTORIZACIÓN

### 2.1 POST /auth/login

**Descripción:** Autenticación de usuario.

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "jperez",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "def456...",
    "expiresIn": 28800,
    "user": {
      "id": 123,
      "username": "jperez",
      "email": "juan.perez@incos.edu.bo",
      "nombres": "Juan",
      "apellidos": "Pérez López",
      "rol": {
        "id": 8,
        "nombre": "DOCENTE",
        "nombreDisplay": "Docente"
      }
    }
  },
  "message": "Login exitoso"
}
```

**Errores:**
- `401` - Credenciales inválidas
- `403` - Usuario bloqueado
- `429` - Demasiados intentos

---

### 2.2 POST /auth/logout

**Descripción:** Cerrar sesión.

**Request:**
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

---

### 2.3 POST /auth/refresh-token

**Descripción:** Renovar token de acceso.

**Request:**
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "def456..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 28800
  }
}
```

---

### 2.4 POST /auth/forgot-password

**Descripción:** Solicitar recuperación de contraseña.

**Request:**
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "juan.perez@incos.edu.bo"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Se ha enviado un correo con instrucciones para recuperar tu contraseña"
}
```

---

## 3. GESTIÓN DE ESTUDIANTES

### 3.1 GET /estudiantes

**Descripción:** Listar estudiantes con filtros y paginación.

**Permisos:** `estudiantes.ver`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 100)
- `search` - Búsqueda por nombres, apellidos o CI
- `carrera` - Filtro por ID de carrera
- `estado` - Filtro por estado académico (REGULAR, NIVELACION, etc.)
- `gestion` - Filtro por gestión de ingreso
- `sort` - Ordenamiento (ej: `-created_at`, `apellido_paterno`)

**Request:**
```http
GET /api/v1/estudiantes?page=1&limit=50&carrera=1&estado=REGULAR&search=Juan
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigoEstudiante": "EST-2025-0001",
      "nombres": "Juan Carlos",
      "apellidoPaterno": "Pérez",
      "apellidoMaterno": "López",
      "ci": "12345678",
      "expedicion": "SC",
      "email": "juan.perez@gmail.com",
      "celular": "70123456",
      "carrera": {
        "id": 1,
        "nombre": "Contaduría General"
      },
      "estadoAcademico": "REGULAR",
      "gestionIngreso": "2025-1",
      "becaActiva": {
        "porcentaje": 50,
        "tipo": "Beca 50%"
      },
      "createdAt": "2025-02-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 280,
    "totalPages": 6
  }
}
```

---

### 3.2 GET /estudiantes/:id

**Descripción:** Obtener detalle completo de un estudiante.

**Permisos:** `estudiantes.ver`

**Request:**
```http
GET /api/v1/estudiantes/1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigoEstudiante": "EST-2025-0001",
    "nombres": "Juan Carlos",
    "apellidoPaterno": "Pérez",
    "apellidoMaterno": "López",
    "ci": "12345678",
    "expedicion": "SC",
    "complemento": null,
    "fechaNacimiento": "2000-05-15",
    "lugarNacimiento": "Santa Cruz de la Sierra",
    "genero": "M",
    "estadoCivil": "Soltero(a)",
    "tipoSangre": "O+",
    "idioma": "Español",
    "discapacidad": null,
    "contacto": {
      "telefonoCasa": "33312345",
      "celular": "70123456",
      "email": "juan.perez@gmail.com",
      "localidad": "Plan 3000",
      "direccionCalle": "Av. Santos Dumont",
      "direccionNumero": "123",
      "direccionReferencia": "Frente al mercado"
    },
    "emergencia": {
      "nombre": "María López de Pérez",
      "parentesco": "Madre",
      "telefono": "70987654"
    },
    "academico": {
      "carrera": {
        "id": 1,
        "codigo": "CONT",
        "nombre": "Contaduría General"
      },
      "turnoPreferencia": "MAÑANA",
      "colegioOrigen": "Colegio San Ignacio",
      "anioEgresoSecundaria": 2023,
      "gestionIngreso": "2025-1",
      "estadoAcademico": "REGULAR",
      "fechaCambioEstado": "2025-02-01",
      "motivoCambioEstado": null
    },
    "becaActiva": {
      "id": 5,
      "porcentaje": 50,
      "tipo": "Beca 50%",
      "motivo": "Situación económica",
      "fechaInicio": "2025-02-01",
      "estado": "ACTIVA"
    },
    "documentos": [
      {
        "id": 1,
        "tipo": "CI_FRENTE",
        "nombreArchivo": "ci_frente_12345678.jpg",
        "url": "/uploads/documentos/1/ci_frente_12345678.jpg",
        "fechaSubida": "2025-02-01T09:00:00Z"
      }
    ],
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": "2025-02-01T10:00:00Z"
  }
}
```

**Errores:**
- `404` - Estudiante no encontrado

---

### 3.3 POST /estudiantes

**Descripción:** Crear un nuevo estudiante.

**Permisos:** `estudiantes.crear`

**Request:**
```http
POST /api/v1/estudiantes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombres": "Juan Carlos",
  "apellidoPaterno": "Pérez",
  "apellidoMaterno": "López",
  "ci": "12345678",
  "expedicion": "SC",
  "complemento": null,
  "fechaNacimiento": "2000-05-15",
  "lugarNacimiento": "Santa Cruz de la Sierra",
  "genero": "M",
  "estadoCivilId": 1,
  "tipoSangreId": 7,
  "idiomaId": 1,
  "tipoDiscapacidadId": null,
  "telefonoCasa": "33312345",
  "celular": "70123456",
  "email": "juan.perez@gmail.com",
  "localidadId": 10,
  "direccionCalle": "Av. Santos Dumont",
  "direccionNumero": "123",
  "direccionReferencia": "Frente al mercado",
  "emergenciaNombre": "María López de Pérez",
  "emergenciaParentesco": "Madre",
  "emergenciaTelefono": "70987654",
  "carreraId": 1,
  "turnoPreferencia": "MAÑANA",
  "colegioOrigen": "Colegio San Ignacio",
  "anioEgresoSecundaria": 2023,
  "gestionIngresoId": 1,
  "becaPorcentaje": 50,
  "becaMotivo": "Situación económica familiar"
}
```

**Validaciones:**
- `nombres`: requerido, min 2 caracteres, max 100
- `apellidoPaterno`: requerido, min 2 caracteres, max 100
- `ci`: requerido, único (con expedición), 7-9 dígitos
- `expedicion`: requerido, valores: SC, LP, CB, TJ, BN, PD, OR, PT, CH
- `fechaNacimiento`: requerido, edad >= 17 años
- `genero`: requerido, valores: M, F, OTRO
- `celular`: requerido, 7-8 dígitos
- `email`: opcional, formato email válido, único
- `carreraId`: requerido, existe
- `gestionIngresoId`: requerido, existe
- `becaPorcentaje`: opcional, 0-100

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 851,
    "codigoEstudiante": "EST-2025-0851",
    "nombres": "Juan Carlos",
    "apellidoPaterno": "Pérez",
    "apellidoMaterno": "López",
    "ci": "12345678",
    "expedicion": "SC",
    "estadoAcademico": "REGULAR",
    "createdAt": "2025-12-08T15:00:00Z"
  },
  "message": "Estudiante creado correctamente"
}
```

**Errores:**
- `400` - Datos inválidos (validaciones fallidas)
- `409` - CI ya registrado
- `403` - Sin permisos

---

### 3.4 PUT /estudiantes/:id

**Descripción:** Actualizar datos de un estudiante.

**Permisos:** `estudiantes.editar`

**Request:**
```http
PUT /api/v1/estudiantes/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "celular": "70999888",
  "email": "nuevo.email@gmail.com",
  "direccionCalle": "Nueva dirección",
  "direccionNumero": "456"
}
```

**Campos NO Actualizables (requieren aprobación especial):**
- `ci`, `expedicion`, `complemento`
- `nombres`, `apellidoPaterno`, `apellidoMaterno`
- `fechaNacimiento`
- `carreraId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "celular": "70999888",
    "email": "nuevo.email@gmail.com",
    "updatedAt": "2025-12-08T15:30:00Z"
  },
  "message": "Estudiante actualizado correctamente"
}
```

**Errores:**
- `400` - Datos inválidos
- `404` - Estudiante no encontrado
- `403` - Sin permisos o intento de modificar campo no permitido

---

### 3.5 PATCH /estudiantes/:id/estado

**Descripción:** Cambiar estado académico del estudiante.

**Permisos:** `estudiantes.cambiar_estado`

**Request:**
```http
PATCH /api/v1/estudiantes/1/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "nuevoEstado": "EGRESADO",
  "motivo": "Culminó satisfactoriamente todos los requisitos académicos",
  "observaciones": "Sin observaciones"
}
```

**Validaciones:**
- `nuevoEstado`: requerido, valores: REGULAR, NIVELACION, RETIRADO, EGRESADO, ABANDONO
- `motivo`: requerido, min 10 caracteres
- Verificar transiciones válidas según reglas de negocio

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "estadoAnterior": "REGULAR",
    "estadoNuevo": "EGRESADO",
    "fechaCambio": "2025-12-08",
    "motivo": "Culminó satisfactoriamente todos los requisitos académicos"
  },
  "message": "Estado académico actualizado correctamente"
}
```

---

### 3.6 POST /estudiantes/:id/becas

**Descripción:** Asignar beca a un estudiante.

**Permisos:** `estudiantes.becas.gestionar`

**Request:**
```http
POST /api/v1/estudiantes/1/becas
Authorization: Bearer <token>
Content-Type: application/json

{
  "becaDescuentoId": 4,
  "gestionId": 1,
  "motivo": "Excelencia académica",
  "fechaInicio": "2025-08-01",
  "fechaFin": null,
  "documentosRespaldo": "Certificado de notas, carta de solicitud"
}
```

**Validaciones:**
- `becaDescuentoId`: requerido, existe
- `motivo`: requerido, min 10 caracteres
- Si porcentaje >= 50%, `documentosRespaldo` es requerido
- Si porcentaje = 100%, requiere aprobación del Rector

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "estudianteId": 1,
    "porcentaje": 75,
    "estado": "ACTIVA",
    "fechaInicio": "2025-08-01",
    "requiereAprobacionRector": true,
    "estadoAprobacion": "PENDIENTE"
  },
  "message": "Beca asignada. Pendiente de aprobación del Rector."
}
```

---

### 3.7 POST /estudiantes/:id/licencias

**Descripción:** Solicitar licencia estudiantil.

**Permisos:** `estudiantes.licencias.solicitar` (el propio estudiante) o `estudiantes.licencias.gestionar`

**Request:**
```http
POST /api/v1/estudiantes/1/licencias
Authorization: Bearer <token>
Content-Type: multipart/form-data

tipoLicencia: ENFERMEDAD
motivo: Hospitalización por apendicitis
fechaInicio: 2025-12-10
fechaFin: 2025-12-20
documentos: [archivo1.pdf, archivo2.jpg]
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "tipoLicencia": "ENFERMEDAD",
    "fechaInicio": "2025-12-10",
    "fechaFin": "2025-12-20",
    "diasTotales": 11,
    "estado": "PENDIENTE"
  },
  "message": "Solicitud de licencia creada. Pendiente de revisión."
}
```

---

### 3.8 GET /estudiantes/:id/historial-academico

**Descripción:** Obtener historial académico completo del estudiante.

**Permisos:** `estudiantes.ver` o ser el propio estudiante

**Request:**
```http
GET /api/v1/estudiantes/1/historial-academico
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": 1,
      "nombreCompleto": "Juan Carlos Pérez López",
      "ci": "12345678-SC",
      "carrera": "Contaduría General"
    },
    "inscripciones": [
      {
        "gestion": "2025-1",
        "periodo": "1º Semestre",
        "turno": "MAÑANA",
        "materias": [
          {
            "id": 1,
            "codigo": "CONT-101",
            "nombre": "Introducción a la Contabilidad",
            "docente": "Lic. María García",
            "calificaciones": {
              "nota1erParcial": 85,
              "nota2doParcial": 78,
              "sumaParciales": 163,
              "nota3erParcial": 80,
              "notaPractico": 90,
              "sumaTotal": 333,
              "notaFinal": 83.25,
              "recuperatorio": null
            },
            "estado": "APROBADO",
            "asistencia": 95
          }
        ],
        "promedioGestion": 78.5,
        "materiasAprobadas": 5,
        "materiasReprobadas": 0
      }
    ],
    "resumen": {
      "promedioGeneral": 78.5,
      "totalMateriasAprobadas": 5,
      "totalMaterias": 24,
      "porcentajeAvance": 20.83,
      "cargaHorariaAcumulada": 400
    }
  }
}
```

---

## 4. GESTIÓN DE INSCRIPCIONES

### 4.1 POST /inscripciones

**Descripción:** Inscribir estudiante a una gestión académica.

**Permisos:** `inscripciones.crear`

**Request:**
```http
POST /api/v1/inscripciones
Authorization: Bearer <token>
Content-Type: application/json

{
  "estudianteId": 1,
  "gestionId": 2,
  "carreraId": 1,
  "periodoId": 2,
  "turno": "TARDE"
}
```

**Validaciones:**
- Estudiante en estado REGULAR o NIVELACION
- Gestión en estado INSCRIPCION_ABIERTA
- Estudiante sin deudas pendientes (o con plan de pago)
- No puede estar inscrito en dos gestiones simultáneas

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 450,
    "estudianteId": 1,
    "gestion": "2025-2",
    "carrera": "Contaduría General",
    "periodo": "2º Semestre",
    "turno": "TARDE",
    "arancelBase": 1500.00,
    "descuentoPorcentaje": 50.00,
    "descuentoMonto": 750.00,
    "arancelNeto": 750.00,
    "estado": "ACTIVA",
    "fechaInscripcion": "2025-07-15"
  },
  "message": "Inscripción creada correctamente"
}
```

**Errores:**
- `400` - Validaciones fallidas
- `409` - Ya está inscrito en esta gestión
- `403` - Tiene deudas pendientes o estado académico no permite inscripción

---

### 4.2 POST /inscripciones/:id/materias

**Descripción:** Inscribir estudiante a materias específicas.

**Permisos:** `inscripciones_materias.gestionar`

**Request:**
```http
POST /api/v1/inscripciones/450/materias
Authorization: Bearer <token>
Content-Type: application/json

{
  "materias": [
    {
      "materiaId": 5,
      "cursoId": 12
    },
    {
      "materiaId": 6,
      "cursoId": 13
    }
  ]
}
```

**Validaciones:**
- Prerrequisitos aprobados
- Cupo disponible en el curso
- Sin solapamiento de horarios

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "inscripcionId": 450,
    "materiasInscritas": 2,
    "detalles": [
      {
        "materia": "Contabilidad Intermedia",
        "curso": "Grupo A",
        "docente": "Lic. Pedro Ramírez",
        "turno": "TARDE",
        "horario": "14:00-16:00 (Lun-Mie-Vie)"
      },
      {
        "materia": "Matemática Financiera",
        "curso": "Grupo B",
        "docente": "Lic. Ana Torres",
        "turno": "TARDE",
        "horario": "16:00-18:00 (Mar-Jue)"
      }
    ]
  },
  "message": "Inscripción a materias realizada correctamente"
}
```

**Errores:**
- `400` - Validaciones fallidas (prerrequisitos, cupo, horario)
- `404` - Inscripción no encontrada

---

### 4.3 GET /inscripciones/:id/horario

**Descripción:** Obtener horario del estudiante.

**Permisos:** `inscripciones.ver` o ser el propio estudiante

**Request:**
```http
GET /api/v1/inscripciones/450/horario
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "inscripcionId": 450,
    "estudiante": "Juan Carlos Pérez López",
    "gestion": "2025-2",
    "turno": "TARDE",
    "horario": {
      "LUNES": [
        {
          "horaInicio": "14:00",
          "horaFin": "16:00",
          "materia": "Contabilidad Intermedia",
          "docente": "Lic. Pedro Ramírez",
          "aula": "A-201"
        }
      ],
      "MARTES": [
        {
          "horaInicio": "16:00",
          "horaFin": "18:00",
          "materia": "Matemática Financiera",
          "docente": "Lic. Ana Torres",
          "aula": "B-105"
        }
      ],
      "MIERCOLES": [
        {
          "horaInicio": "14:00",
          "horaFin": "16:00",
          "materia": "Contabilidad Intermedia",
          "docente": "Lic. Pedro Ramírez",
          "aula": "A-201"
        }
      ],
      "JUEVES": [
        {
          "horaInicio": "16:00",
          "horaFin": "18:00",
          "materia": "Matemática Financiera",
          "docente": "Lic. Ana Torres",
          "aula": "B-105"
        }
      ],
      "VIERNES": [
        {
          "horaInicio": "14:00",
          "horaFin": "16:00",
          "materia": "Contabilidad Intermedia",
          "docente": "Lic. Pedro Ramírez",
          "aula": "A-201"
        }
      ]
    },
    "totalHorasSemana": 10
  }
}
```

---

### 4.4 DELETE /inscripciones/:id

**Descripción:** Anular inscripción.

**Permisos:** `inscripciones.anular`

**Request:**
```http
DELETE /api/v1/inscripciones/450
Authorization: Bearer <token>
Content-Type: application/json

{
  "motivo": "Retiro voluntario del estudiante",
  "observaciones": "Problemas personales"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "inscripcionId": 450,
    "estado": "ANULADA",
    "fechaAnulacion": "2025-12-08",
    "aplicaDevolucion": true,
    "montoDevolucion": 750.00
  },
  "message": "Inscripción anulada correctamente"
}
```

---

## 5. GESTIÓN DE CALIFICACIONES

### 5.1 POST /calificaciones

**Descripción:** Registrar calificaciones de estudiantes (por lote).

**Permisos:** `calificaciones.registrar`

**Request:**
```http
POST /api/v1/calificaciones
Authorization: Bearer <token>
Content-Type: application/json

{
  "cursoId": 12,
  "tipoParcial": "1ER_PARCIAL",
  "calificaciones": [
    {
      "inscripcionMateriaId": 100,
      "nota": 85.00
    },
    {
      "inscripcionMateriaId": 101,
      "nota": 78.50
    },
    {
      "inscripcionMateriaId": 102,
      "nota": 92.00
    }
  ]
}
```

**Validaciones:**
- `tipoParcial`: valores: 1ER_PARCIAL, 2DO_PARCIAL, 3ER_PARCIAL, PRACTICO, RECUPERATORIO
- `nota`: rango 0-100
- Docente asignado al curso

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "cursoId": 12,
    "tipoParcial": "1ER_PARCIAL",
    "calificacionesRegistradas": 3,
    "promedioGrupo": 85.17
  },
  "message": "Calificaciones registradas correctamente"
}
```

**Errores:**
- `400` - Notas fuera de rango o datos inválidos
- `403` - Docente no asignado a este curso

---

### 5.2 PUT /calificaciones/:id

**Descripción:** Modificar una calificación.

**Permisos:** `calificaciones.editar`

**Request:**
```http
PUT /api/v1/calificaciones/100
Authorization: Bearer <token>
Content-Type: application/json

{
  "campo": "nota_1er_parcial",
  "nuevoValor": 90.00,
  "motivo": "Error de transcripción"
}
```

**Validaciones:**
- Si modificación > 48 horas, requiere aprobación de Director Académico
- `motivo` requerido

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "inscripcionMateriaId": 100,
    "campo": "nota_1er_parcial",
    "valorAnterior": 85.00,
    "valorNuevo": 90.00,
    "requiereAprobacion": false,
    "fechaModificacion": "2025-12-08T16:00:00Z"
  },
  "message": "Calificación modificada correctamente"
}
```

---

### 5.3 GET /calificaciones/curso/:cursoId

**Descripción:** Obtener todas las calificaciones de un curso.

**Permisos:** `calificaciones.ver` (docente del curso) o `calificaciones.ver_todas`

**Request:**
```http
GET /api/v1/calificaciones/curso/12
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "curso": {
      "id": 12,
      "materia": "Contabilidad Intermedia",
      "nombre": "Grupo A",
      "docente": "Lic. Pedro Ramírez",
      "gestion": "2025-2"
    },
    "estudiantes": [
      {
        "inscripcionMateriaId": 100,
        "estudiante": {
          "id": 1,
          "nombreCompleto": "Juan Carlos Pérez López",
          "codigo": "EST-2025-0001"
        },
        "calificaciones": {
          "nota1erParcial": 85.00,
          "nota2doParcial": 78.00,
          "sumaParciales": 163.00,
          "nota3erParcial": 80.00,
          "notaPractico": 90.00,
          "sumaTotal": 333.00,
          "notaFinal": 83.25,
          "recuperatorio": null
        },
        "estado": "APROBADO",
        "asistencia": {
          "asistencias": 28,
          "faltas": 2,
          "porcentaje": 93.33
        }
      }
    ],
    "estadisticas": {
      "totalEstudiantes": 32,
      "promedioGrupo": 75.50,
      "aprobados": 28,
      "reprobados": 4,
      "tasaAprobacion": 87.50
    }
  }
}
```

---

### 5.4 POST /calificaciones/cerrar-periodo

**Descripción:** Cerrar periodo académico (no permite más modificaciones).

**Permisos:** `calificaciones.cerrar_periodo`

**Request:**
```http
POST /api/v1/calificaciones/cerrar-periodo
Authorization: Bearer <token>
Content-Type: application/json

{
  "gestionId": 1,
  "periodoId": 1
}
```

**Validaciones:**
- Todas las materias del periodo deben tener calificaciones completas
- Todos los recuperatorios finalizados

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gestion": "2025-1",
    "periodo": "1º Semestre",
    "estadoAnterior": "ABIERTO",
    "estadoNuevo": "CERRADO",
    "fechaCierre": "2025-06-30",
    "estadisticas": {
      "totalEstudiantes": 850,
      "aprobados": 780,
      "reprobados": 70,
      "enNivelacion": 70
    }
  },
  "message": "Periodo cerrado correctamente"
}
```

---

## 6. GESTIÓN DE PASANTÍAS

### 6.1 POST /pasantias/asignaciones

**Descripción:** Asignar estudiante a pasantía.

**Permisos:** `pasantias.gestionar`

**Request:**
```http
POST /api/v1/pasantias/asignaciones
Authorization: Bearer <token>
Content-Type: application/json

{
  "estudianteId": 1,
  "empresaId": 5,
  "docenteSupervisorId": 8,
  "puestoArea": "Asistente Contable",
  "fechaInicio": "2025-09-01",
  "fechaFin": "2025-12-15",
  "horasTotalesRequeridas": 240
}
```

**Validaciones:**
- Estudiante en 3º o 4º semestre
- Promedio >= 70
- Sin deudas académicas

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "estudiante": "Juan Carlos Pérez López",
    "empresa": "Contadores Asociados S.R.L.",
    "supervisor": "Lic. María García",
    "fechaInicio": "2025-09-01",
    "fechaFin": "2025-12-15",
    "estado": "PROGRAMADA"
  },
  "message": "Pasantía asignada correctamente"
}
```

---

### 6.2 POST /pasantias/:id/evaluacion

**Descripción:** Registrar evaluación de pasantía.

**Permisos:** `pasantias.evaluar`

**Request:**
```http
POST /api/v1/pasantias/25/evaluacion
Authorization: Bearer <token>
Content-Type: application/json

{
  "descripcionTrabajo": "El estudiante se desempeñó como asistente contable...",
  "principalesActividades": "Registro de operaciones diarias, conciliaciones bancarias...",
  "nivelDesempeno": "ALTO",
  "fortalezas": "Responsabilidad, puntualidad, iniciativa",
  "areasMejora": "Dominio de software contable avanzado",
  "sugerencias": "Continuar con formación en NIIF",
  "firmaEmpresa": "base64_firma_empresa",
  "fechaEvaluacion": "2025-12-15"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "pasantiaId": 25,
    "nivelDesempeno": "ALTO",
    "fechaEvaluacion": "2025-12-15",
    "pdfUrl": "/downloads/pasantias/evaluacion_25.pdf"
  },
  "message": "Evaluación registrada correctamente"
}
```

---

## 7. GESTIÓN DE REPORTES

### 7.1 GET /reportes/rendimiento-academico

**Descripción:** Reporte de rendimiento académico.

**Permisos:** `reportes.academicos`

**Query Parameters:**
- `gestionId` (requerido)
- `carreraId` (opcional)
- `periodoId` (opcional)
- `materiaId` (opcional)

**Request:**
```http
GET /api/v1/reportes/rendimiento-academico?gestionId=1&carreraId=1
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gestion": "2025-1",
    "carrera": "Contaduría General",
    "estadisticas": {
      "totalEstudiantes": 280,
      "promedioGeneral": 74.5,
      "tasaAprobacion": 88.5,
      "tasaReprobacion": 11.5,
      "estudiantesExcelencia": 45,
      "estudiantesRiesgo": 15
    },
    "porMateria": [
      {
        "materia": "Introducción a la Contabilidad",
        "promedio": 78.5,
        "aprobados": 260,
        "reprobados": 20,
        "tasaAprobacion": 92.86
      }
    ],
    "ranking": [
      {
        "posicion": 1,
        "estudiante": "María Fernández",
        "codigo": "EST-2025-0050",
        "promedio": 95.5
      }
    ]
  }
}
```

---

### 7.2 GET /reportes/morosidad

**Descripción:** Reporte de estudiantes con pagos pendientes.

**Permisos:** `reportes.financieros`

**Request:**
```http
GET /api/v1/reportes/morosidad?gestionId=1&minMonto=100
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalEstudiantes": 45,
    "montoTotalPendiente": 33750.00,
    "estudiantes": [
      {
        "estudiante": {
          "id": 1,
          "nombreCompleto": "Juan Pérez López",
          "codigo": "EST-2025-0001",
          "celular": "70123456"
        },
        "inscripcion": {
          "gestion": "2025-1",
          "arancelNeto": 750.00
        },
        "deuda": {
          "montoPendiente": 450.00,
          "pagado": 300.00,
          "diasMora": 30
        }
      }
    ]
  }
}
```

---

## 8. CÓDIGOS DE ESTADO HTTP

### Respuestas Exitosas (2xx)
- `200 OK` - Operación exitosa (GET, PUT, PATCH, DELETE)
- `201 Created` - Recurso creado (POST)
- `204 No Content` - Operación exitosa sin contenido (DELETE)

### Errores de Cliente (4xx)
- `400 Bad Request` - Datos inválidos o validaciones fallidas
- `401 Unauthorized` - No autenticado (token inválido o ausente)
- `403 Forbidden` - No autorizado (sin permisos)
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (CI duplicado, inscripción existente)
- `422 Unprocessable Entity` - Errores de lógica de negocio
- `429 Too Many Requests` - Rate limit excedido

### Errores de Servidor (5xx)
- `500 Internal Server Error` - Error del servidor
- `503 Service Unavailable` - Servicio no disponible

---

## 9. CÓDIGOS DE ERROR PERSONALIZADOS

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo del error"
  }
}
```

**Catálogo de Códigos:**

| Código | Descripción |
|--------|-------------|
| `VALIDATION_ERROR` | Error de validación de datos |
| `UNAUTHORIZED` | No autenticado |
| `FORBIDDEN` | Sin permisos |
| `NOT_FOUND` | Recurso no encontrado |
| `DUPLICATE_CI` | CI ya registrado |
| `DUPLICATE_EMAIL` | Email ya registrado |
| `INVALID_CREDENTIALS` | Credenciales inválidas |
| `USER_BLOCKED` | Usuario bloqueado |
| `INSUFFICIENT_PERMISSIONS` | Sin permisos suficientes |
| `BUSINESS_RULE_VIOLATION` | Violación de regla de negocio |
| `PREREQUISITE_NOT_MET` | Prerrequisito no cumplido |
| `COURSE_FULL` | Curso sin cupo |
| `SCHEDULE_CONFLICT` | Conflicto de horarios |
| `ALREADY_ENROLLED` | Ya inscrito |
| `PENDING_DEBT` | Deuda pendiente |
| `INVALID_STATE_TRANSITION` | Transición de estado inválida |
| `PERIOD_CLOSED` | Periodo cerrado |
| `RATE_LIMIT_EXCEEDED` | Límite de peticiones excedido |
| `INTERNAL_ERROR` | Error interno del servidor |

---

## 10. RATE LIMITING

**Límites por Endpoint:**

| Endpoint | Límite |
|----------|--------|
| POST /auth/login | 5 requests / 15 min (por IP) |
| POST /auth/forgot-password | 3 requests / hora (por email) |
| Endpoints generales | 100 requests / hora (por usuario) |
| Endpoints de reportes | 10 requests / hora (por usuario) |

**Header de Respuesta:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

---

## 11. VERSIONAMIENTO

**URL Base:** `/api/v1`

**Futuras Versiones:**
- v2: Cambios breaking (URL: `/api/v2`)
- Deprecación con 6 meses de anticipación
- Soporte de 2 versiones simultáneas

**Header de Versión (alternativo):**
```
Accept: application/vnd.incos.v1+json
```

---

## 12. PAGINACIÓN

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 50, max: 100)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 850,
    "totalPages": 17,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Header de Link (estilo GitHub):**
```
Link: <https://api.incos.edu.bo/api/v1/estudiantes?page=2>; rel="next",
      <https://api.incos.edu.bo/api/v1/estudiantes?page=17>; rel="last"
```

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Versión inicial - API REST completa documentada |

---

## REFERENCIAS

- 02-requerimientos-funcionales.md: Funcionalidades base
- 04-arquitectura-sistema.md: Stack tecnológico
- 05-modelo-datos.md: Modelo de datos completo
- RESTful API Design Best Practices
- JSON:API Specification

---

**FIN DEL DOCUMENTO - 06 DISEÑO DE API REST**
