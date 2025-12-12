# 15 - BACKEND
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.1  
**Fecha:** Enero 2025  
**Estado:** Documento Actualizado - Estructura con Dependency Injection

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Documento

Este documento describe en detalle la arquitectura, tecnologías, estructura y estándares de desarrollo del **backend** del Sistema de Gestión Académica del Instituto INCOS Santa Cruz.

### 1.2 Alcance

El documento cubre:

- Stack tecnológico completo del backend
- Arquitectura: Clean Architecture
- Estructura de directorios y organización del código
- Tecnologías y librerías utilizadas
- Patrones de diseño aplicados
- Middleware y seguridad
- Base de datos y ORM
- Estándares de desarrollo

---

## 2. STACK TECNOLÓGICO

### 2.1 Runtime y Lenguaje

#### Node.js 20 LTS
- **Versión:** 20.x (Long Term Support)
- **Justificación:**
  - Runtime estable y de largo soporte
  - Excelente rendimiento para I/O asíncrono
  - Ecosistema npm extenso
  - Perfecto para APIs REST
  - Soporte para ES modules nativos

#### JavaScript (ES2022+)
- **Características utilizadas:**
  - ES Modules (import/export)
  - Async/Await
  - Destructuring
  - Spread operator
  - Optional chaining (?.)
  - Nullish coalescing (??)

---

### 2.2 Framework Web

#### Express.js 4.x
- **Versión:** 4.18.2
- **Justificación:**
  - Framework minimalista y flexible
  - Gran ecosistema de middleware
  - Rendimiento probado en producción
  - Documentación extensa
  - Perfecto para APIs REST

**Características utilizadas:**
- Routing
- Middleware
- Request/Response handling
- Error handling

---

### 2.3 Base de Datos

#### MySQL 8.0
- **Motor:** InnoDB
- **Justificación:**
  - Base de datos relacional robusta
  - Transacciones ACID
  - Excelente rendimiento
  - Soporte para claves foráneas
  - Triggers y stored procedures

#### Sequelize 6.x
- **Versión:** 6.35.2
- **Justificación:**
  - ORM maduro y estable para Node.js
  - Soporte completo para MySQL
  - Migraciones de esquema
  - Validaciones a nivel de modelo
  - Asociaciones y relaciones
  - Queries builder potente

**Características utilizadas:**
- Models y Migrations
- Associations (hasOne, hasMany, belongsTo, belongsToMany)
- Hooks (beforeCreate, afterUpdate, etc.)
- Scopes
- Transactions

---

### 2.4 Autenticación y Seguridad

#### jsonwebtoken (JWT)
- **Versión:** 9.0.2
- **Propósito:** Tokens de autenticación stateless
- **Configuración:**
  - Algoritmo: HS256
  - Expiración: 8 horas
  - Refresh token: (implementación futura)

#### bcryptjs
- **Versión:** 2.4.3
- **Propósito:** Hash de contraseñas
- **Configuración:**
  - Salt rounds: 10

#### express-rate-limit
- **Versión:** 7.1.5
- **Propósito:** Rate limiting anti brute force
- **Configuración:**
  - Login: 5 intentos / 15 minutos
  - API general: 100 requests / 15 minutos

#### helmet
- **Versión:** 7.1.0
- **Propósito:** Headers de seguridad HTTP
- **Protecciones:**
  - XSS Protection
  - Content Security Policy
  - HSTS
  - Frame Options

#### cors
- **Versión:** 2.8.5
- **Propósito:** Control de CORS (Cross-Origin Resource Sharing)

---

### 2.5 Validación

#### express-validator
- **Versión:** 7.0.1
- **Propósito:** Validación de inputs HTTP
- **Uso:** Validación en middlewares de rutas

#### joi
- **Versión:** 17.11.0
- **Propósito:** Validación de schemas complejos
- **Uso:** Validación de objetos y DTOs

---

### 2.6 Logging

#### winston
- **Versión:** 3.11.0
- **Propósito:** Logger estructurado
- **Niveles:** error, warn, info, debug
- **Transports:**
  - Console (desarrollo)
  - File (producción)
  - Daily rotate file (logs diarios)

#### winston-daily-rotate-file
- **Versión:** 4.7.1
- **Propósito:** Rotación diaria de logs

#### morgan
- **Versión:** 1.10.0
- **Propósito:** HTTP request logger
- **Formato:** Combined (dev) / Common (prod)

---

### 2.7 Utilidades

#### dotenv
- **Versión:** 16.3.1
- **Propósito:** Variables de entorno

#### date-fns
- **Versión:** 3.0.6
- **Propósito:** Manipulación de fechas

#### uuid
- **Versión:** 9.0.1
- **Propósito:** Generación de UUIDs

#### multer
- **Versión:** 1.4.5-lts.1
- **Propósito:** Upload de archivos

#### compression
- **Versión:** 1.7.4
- **Propósito:** Compresión gzip de respuestas

#### express-async-errors
- **Versión:** 3.1.1
- **Propósito:** Manejo automático de errores en async handlers

---

## 3. ARQUITECTURA: CLEAN ARCHITECTURE

### 3.1 Principios

El backend sigue estrictamente los principios de **Clean Architecture**:

1. **Independencia de frameworks:** El dominio no depende de Express
2. **Testeable:** Lógica de negocio puede testearse sin dependencias externas
3. **Independencia de UI:** La lógica no depende de cómo se expone (HTTP, CLI, etc.)
4. **Independencia de BD:** El dominio no depende de Sequelize
5. **Independencia de agentes externos:** APIs externas son abstracciones

### 3.2 Capas de la Arquitectura

```
src/
├── domain/                    # Domain Layer (Lógica de negocio pura)
│   ├── entities/             # Entidades del dominio
│   │   ├── BaseEntity.js      # Clase base para todas las entidades
│   │   ├── Student.js
│   │   ├── Career.js
│   │   └── ...
│   ├── interfaces/           # Interfaces (repositorios, servicios)
│   │   ├── repositories/
│   │   │   ├── IRepository.js # Interfaz base para repositorios
│   │   │   └── ...
│   │   └── services/
│   ├── services/             # Servicios de dominio
│   ├── value-objects/        # Value Objects
│   └── constants/            # Constantes del dominio
│
├── application/              # Application Layer (Casos de uso)
│   ├── use-cases/           # Casos de uso específicos
│   │   ├── Estudiantes/
│   │   │   └── RegisterStudentUseCase.js
│   │   ├── Inscripciones/
│   │   ├── Calificaciones/
│   │   └── ...
│   ├── dtos/                # Data Transfer Objects
│   │   ├── request/
│   │   └── response/
│   ├── mappers/             # Mappers (Entity ↔ DTO)
│   ├── utils/               # Utilidades de aplicación
│   └── validators/          # Validadores de aplicación
│
├── infrastructure/           # Infrastructure Layer
│   ├── config/              # Configuraciones
│   │   └── database.js      # Config de base de datos
│   ├── container/           # Dependency Injection Container
│   │   ├── Container.js     # Contenedor de DI
│   │   ├── index.js         # Punto de entrada del container
│   │   └── modules/         # Módulos de registro
│   │       ├── repositories.container.js
│   │       ├── estudiantes.container.js
│   │       └── ...
│   ├── database/            # Implementaciones de BD
│   │   ├── config/
│   │   │   └── sequelize.js # Configuración de Sequelize
│   │   └── models/          # Sequelize Models
│   ├── repositories/        # Implementaciones de repositorios
│   │   ├── BaseRepository.js # Clase base con Template Method
│   │   ├── StudentRepository.js
│   │   └── ...
│   └── external/            # Servicios externos
│       ├── email/
│       ├── pdf/
│       └── storage/
│
├── presentation/            # Presentation Layer
│   ├── controllers/         # Controladores HTTP (separados por funcionalidad)
│   │   ├── estudiantes/
│   │   │   ├── index.js
│   │   │   ├── create.controller.js
│   │   │   ├── list.controller.js
│   │   │   ├── getById.controller.js
│   │   │   ├── update.controller.js
│   │   │   ├── status.controller.js
│   │   │   ├── becas.controller.js
│   │   │   └── licencias.controller.js
│   │   └── ...
│   ├── routes/              # Definición de rutas
│   │   ├── index.js
│   │   └── student.routes.js
│   ├── middleware/          # Middleware personalizado
│   │   ├── errorHandler.middleware.js
│   │   ├── logger.middleware.js
│   │   ├── notFound.middleware.js
│   │   └── validation.middleware.js
│   └── validators/          # Validadores de request
│       └── estudiantes/
│           ├── create.validator.js
│           ├── list.validator.js
│           └── ...
│
├── shared/                  # Código compartido
│   ├── AppError.js          # Jerarquía de errores
│   └── logger.js            # Logger configurado
│
├── app.js                   # Configuración de Express
└── server.js                # Punto de entrada
```

---

### 3.3 Domain Layer (`domain/`)

**Responsabilidad:** Contiene la lógica de negocio pura, independiente de frameworks y tecnologías.

#### 3.3.1 BaseEntity (Entidad Base)

Todas las entidades extienden de `BaseEntity`, que proporciona campos comunes de auditoría y métodos de utilidad.

**Características:**
- Campos de auditoría: `id`, `active`, `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`
- Métodos: `isActive()`, `isDeleted()`, `activate()`, `deactivate()`, `softDelete()`, `restore()`

**Ejemplo:**
```javascript
// domain/entities/BaseEntity.js
export class BaseEntity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedBy = data.deletedBy || null;
  }

  isActive() {
    return this.active === true;
  }

  isDeleted() {
    return this.deletedAt !== null;
  }

  softDelete(userId = null) {
    this.deletedAt = new Date();
    this.deletedBy = userId;
    this.active = false;
  }
}
```

#### 3.3.2 Entities (Entidades)

Las entidades extienden de `BaseEntity` y representan las entidades del dominio con su lógica de negocio.

**Ejemplo:**
```javascript
// domain/entities/Student.js
import { BaseEntity } from './BaseEntity.js';

export class Student extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.ci = data.ci;
    this.expedicion = data.expedicion;
    this.nombres = data.nombres;
    this.apellidoPaterno = data.apellidoPaterno;
    this.apellidoMaterno = data.apellidoMaterno;
    this.carreraId = data.carreraId;
    this.estadoAcademico = data.estadoAcademico;
  }

  get fullName() {
    return `${this.nombres} ${this.apellidoPaterno} ${this.apellidoMaterno || ''}`.trim();
  }

  canEnroll(gestion) {
    // Lógica de negocio: ¿Puede inscribirse?
    if (this.estadoAcademico === 'EGRESADO') {
      return false;
    }
    if (this.hasDebts()) {
      return false;
    }
    return true;
  }

  hasDebts() {
    // Lógica para verificar deudas
    return false; // Implementación real
  }
}
```

#### 3.3.2 Interfaces (Repositorios)

Definen contratos que deben cumplir las implementaciones. Todas las interfaces de repositorio extienden de `IRepository`, que define los métodos base comunes.

**IRepository (Interfaz Base):**
```javascript
// domain/interfaces/repositories/IRepository.js
export class IRepository {
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  async findAll(filters, page, limit) {
    throw new Error('Method findAll must be implemented');
  }

  async create(data, userId) {
    throw new Error('Method create must be implemented');
  }

  async update(id, data, userId) {
    throw new Error('Method update must be implemented');
  }

  async delete(id, userId) {
    throw new Error('Method delete must be implemented');
  }

  async search(searchTerm, options) {
    throw new Error('Method search must be implemented');
  }

  async count(filters) {
    throw new Error('Method count must be implemented');
  }
}
```

**Interfaces Específicas:**
```javascript
// domain/interfaces/repositories/IStudentRepository.js
import { IRepository } from './IRepository.js';

export class IStudentRepository extends IRepository {
  async findByCI(ci, expedicion) {
    throw new Error('Method findByCI must be implemented');
  }

  async findByCode(codigoEstudiante) {
    throw new Error('Method findByCode must be implemented');
  }
}
```

#### 3.3.3 Services (Servicios de Dominio)

Lógica de negocio que no pertenece naturalmente a una entidad.

**Ejemplo:**
```javascript
// domain/services/GradeCalculator.js
export class GradeCalculator {
  static calculateFinalGrade(nota1er, nota2do, nota3er, practico) {
    const suma = (nota1er || 0) + (nota2do || 0) + (nota3er || 0) + (practico || 0);
    const componentes = [nota1er, nota2do, nota3er, practico].filter(n => n !== null).length;
    return componentes > 0 ? suma / componentes : null;
  }

  static isApproved(notaFinal, notaRecuperatorio) {
    if (notaRecuperatorio !== null && notaRecuperatorio >= 60) {
      return true;
    }
    return notaFinal >= 60;
  }
}
```

---

### 3.4 Application Layer (`application/`)

**Responsabilidad:** Orquesta los casos de uso, coordinando entre el dominio y la infraestructura.

#### 3.4.1 Use Cases

Cada caso de uso representa una acción de usuario o sistema.

**Ejemplo:**
```javascript
// application/use-cases/estudiantes/RegisterStudentUseCase.js
export class RegisterStudentUseCase {
  constructor({ studentRepository, validateCIUseCase, logger }) {
    this.studentRepository = studentRepository;
    this.validateCIUseCase = validateCIUseCase;
    this.logger = logger;
  }

  async execute(studentData) {
    // 1. Validar CI único
    const existingStudent = await this.studentRepository.findByCI(
      studentData.ci,
      studentData.expedicion
    );
    if (existingStudent) {
      throw new Error('Ya existe un estudiante con este CI');
    }

    // 2. Validar edad mínima (17 años)
    const age = this.calculateAge(studentData.fechaNacimiento);
    if (age < 17) {
      throw new Error('El estudiante debe tener al menos 17 años');
    }

    // 3. Crear entidad de dominio
    const student = new Student(studentData);

    // 4. Generar código de estudiante
    student.codigoEstudiante = this.generateStudentCode(studentData.gestionIngreso);

    // 5. Persistir
    const savedStudent = await this.studentRepository.create(student);

    this.logger.info('Estudiante registrado', { studentId: savedStudent.id });

    return savedStudent;
  }

  calculateAge(fechaNacimiento) {
    // Implementación
  }

  generateStudentCode(gestion) {
    // Implementación: EST-YYYY-NNNN
  }
}
```

#### 3.4.2 DTOs (Data Transfer Objects)

Objetos planos para transferir datos entre capas.

**Ejemplo:**
```javascript
// application/dtos/request/RegisterStudentDTO.js
export class RegisterStudentDTO {
  constructor(data) {
    this.nombres = data.nombres;
    this.apellidos = data.apellidos;
    this.ci = data.ci;
    this.expedicion = data.expedicion;
    this.fechaNacimiento = data.fechaNacimiento;
    this.carreraId = data.carreraId;
    // ...
  }

  static fromRequest(req) {
    return new RegisterStudentDTO(req.body);
  }
}
```

---

### 3.5 Infrastructure Layer (`infrastructure/`)

**Responsabilidad:** Implementaciones concretas de las interfaces del dominio.

#### 3.5.1 Dependency Injection Container

El sistema utiliza un **Container de Dependency Injection** personalizado para gestionar las dependencias de forma centralizada.

**Container:**
```javascript
// infrastructure/container/Container.js
export class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  register(name, factory, singleton = true) {
    this.services.set(name, { factory, singleton });
    return this;
  }

  resolve(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }
    
    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    const instance = typeof service.factory === 'function'
      ? service.factory(this)
      : service.factory;

    if (service.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }
}
```

**Registro de Módulos:**
```javascript
// infrastructure/container/modules/repositories.container.js
export function registerRepositoriesModule(container) {
  container.register('studentRepository', () => new StudentRepository(), true);
  container.register('careerRepository', () => new CareerRepository(), true);
  // ... más repositorios
  return container;
}

// infrastructure/container/modules/estudiantes.container.js
export function registerEstudiantesModule(container) {
  container.register(
    'estudiantes.registerStudentUseCase',
    (c) => new RegisterStudentUseCase({
      studentRepository: c.resolve('studentRepository'),
      logger: c.resolve('logger'),
    }),
    true
  );

  container.register(
    'estudiantes.createStudentController',
    (c) => new CreateStudentController({
      registerStudentUseCase: c.resolve('estudiantes.registerStudentUseCase'),
    }),
    true
  );
  return container;
}
```

**Uso:**
```javascript
import container from './infrastructure/container/index.js';

const controller = container.resolve('estudiantes.createStudentController');
```

#### 3.5.2 BaseRepository (Patrón Template Method)

Todos los repositorios extienden de `BaseRepository`, que implementa el patrón **Template Method** para proporcionar funcionalidad común.

**Características:**
- Métodos template: `findAll()`, `create()`, `update()`, `delete()`, `search()`, `count()`
- Métodos abstractos: `getModel()`, `toEntity()`, `buildWhereClause()`, `getSearchFields()`, `mapDataToModel()`
- Manejo automático de soft delete (con `paranoid: true` en Sequelize)
- Filtrado automático de registros activos/inactivos
- Paginación integrada

**Ejemplo:**
```javascript
// infrastructure/repositories/BaseRepository.js
import { IRepository } from '../../domain/interfaces/repositories/IRepository.js';

export class BaseRepository extends IRepository {
  // Métodos abstractos que deben implementarse
  getModel() {
    throw new Error('Method getModel must be implemented');
  }

  toEntity(model) {
    throw new Error('Method toEntity must be implemented');
  }

  getSearchFields() {
    throw new Error('Method getSearchFields must be implemented');
  }

  // Métodos template con lógica común
  async findAll(filters = {}, page = null, limit = null) {
    const Model = this.getModel();
    const where = {
      ...this.buildWhereClause(filters),
    };

    if (!filters.includeInactive) {
      where.activo = true;
    }

    if (filters.search) {
      const searchFields = this.getSearchFields();
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${filters.search}%` },
      }));
    }

    // ... lógica de paginación y ordenamiento
    const rows = await Model.findAll(options);
    return {
      [this.getCollectionName()]: rows.map((model) => this.toEntity(model)),
      total: rows.length,
    };
  }
}
```

**Implementación Específica:**
```javascript
// infrastructure/repositories/StudentRepository.js
import { BaseRepository } from './BaseRepository.js';
import { Student } from '../../domain/entities/Student.js';
import { Student as StudentModel } from '../database/models/Student.js';

export class StudentRepository extends BaseRepository {
  getModel() {
    return StudentModel;
  }

  toEntity(model) {
    if (!model) return null;
    return new Student({
      id: model.id,
      ci: model.ci,
      nombres: model.nombres,
      // ... mapear campos
    });
  }

  getSearchFields() {
    return ['nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci'];
  }

  getCollectionName() {
    return 'students';
  }

  // Métodos específicos adicionales
  async findByCI(ci, expedicion) {
    const model = await this.getModel().findOne({
      where: { ci, expedicion },
    });
    return this.toEntity(model);
  }
}
```

#### 3.5.3 Database Models (Sequelize)

**Ejemplo:**
```javascript
// infrastructure/database/models/Student.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codigoEstudiante: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  ci: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  expedicion: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // ... más campos
}, {
  tableName: 'estudiantes',
  timestamps: true,
  underscored: false,
});
```


---

### 3.6 Presentation Layer (`presentation/`)

**Responsabilidad:** Maneja las peticiones HTTP y responde al cliente.

#### 3.6.1 Controllers (Separados por Funcionalidad)

Los controllers están organizados por funcionalidad, no por entidad. Cada endpoint tiene su propio controller.

**Estructura:**
```
presentation/controllers/estudiantes/
├── index.js                    # Exportaciones centralizadas
├── create.controller.js        # POST /estudiantes
├── list.controller.js          # GET /estudiantes
├── getById.controller.js       # GET /estudiantes/:id
├── update.controller.js        # PUT /estudiantes/:id
├── status.controller.js        # PATCH /estudiantes/:id/estado
├── becas.controller.js         # POST /estudiantes/:id/becas
└── licencias.controller.js     # POST /estudiantes/:id/licencias
```

**Ejemplo de Controller:**
```javascript
// presentation/controllers/estudiantes/create.controller.js
import { RegisterStudentUseCase } from '../../../application/use-cases/Estudiantes/RegisterStudentUseCase.js';
import { RegisterStudentDTO } from '../../../application/dtos/request/RegisterStudentDTO.js';
import { StudentResponseDTO } from '../../../application/dtos/response/StudentResponseDTO.js';

export class CreateStudentController {
  constructor({ registerStudentUseCase }) {
    this.registerStudentUseCase = registerStudentUseCase;
  }

  async handle(req, res, next) {
    try {
      const dto = RegisterStudentDTO.fromRequest(req);
      const userId = req.user?.id || req.user?.userId;

      const student = await this.registerStudentUseCase.execute(dto, userId);
      const responseDTO = StudentResponseDTO.fromEntity(student);

      res.status(201).json({
        success: true,
        data: responseDTO,
        message: 'Estudiante creado correctamente',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
```

**Ventajas de esta estructura:**
- ✅ Separación de responsabilidades: cada controller tiene una única responsabilidad
- ✅ Facilidad de testing: controllers pequeños y enfocados
- ✅ Mantenibilidad: cambios en un endpoint no afectan otros
- ✅ Escalabilidad: fácil agregar nuevos endpoints

#### 3.6.2 Routes

Las rutas resuelven los controllers desde el Container de DI.

**Ejemplo:**
```javascript
// presentation/routes/student.routes.js
import express from 'express';
import container from '../../infrastructure/container/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { registerStudentSchema } from '../validators/estudiantes/create.validator.js';

const router = express.Router();

// Resolver controllers desde el container
const createController = container.resolve('estudiantes.createStudentController');
const listController = container.resolve('estudiantes.listStudentsController');
const getByIdController = container.resolve('estudiantes.getStudentByIdController');

router.post(
  '/',
  authMiddleware,
  validateRequest(registerStudentSchema),
  (req, res, next) => createController.handle(req, res, next)
);

router.get(
  '/',
  authMiddleware,
  (req, res, next) => listController.handle(req, res, next)
);

router.get(
  '/:id',
  authMiddleware,
  (req, res, next) => getByIdController.handle(req, res, next)
);

export default router;
```

#### 3.6.3 Middleware

**Auth Middleware:**
```javascript
// presentation/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

**Error Handler:**
```javascript
// presentation/middleware/errorHandler.middleware.js
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  logger.error('Error en request', {
    error: message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
```

---

## 4. BASE DE DATOS

### 4.1 Estructura de Scripts SQL

Los scripts SQL están organizados en `backend/database/`:

```
database/
├── 01-schemas/              # Scripts DDL (CREATE TABLE)
│   ├── 01-base.sql
│   ├── 02-catalogos-geograficos.sql
│   ├── 03-catalogos-referencia.sql
│   ├── 04-sistema-seguridad.sql
│   ├── 05-estructura-academica-parte1.sql
│   ├── 05-estructura-academica-parte2.sql
│   ├── 06-estudiantes-parte1.sql
│   ├── 06-estudiantes-parte2.sql
│   ├── 07-inscripciones-parte1.sql
│   ├── 07-inscripciones-parte2.sql
│   ├── 10-pagos.sql
│   ├── 11-modulos-operativos-parte1.sql
│   ├── 11-modulos-operativos-parte2.sql
│   ├── 12-indices.sql
│   ├── 12-sincronizacion.sql
│   └── 13-indices-optimizacion.sql
│
├── 02-seeders/              # Datos iniciales
├── 03-views/                # Vistas de BD
├── 04-stored-procedures/    # Procedimientos almacenados
├── 05-triggers/             # Triggers
│   └── 06-estudiantes-triggers.sql
├── 06-functions/            # Funciones
├── 07-migrations/           # Migraciones versionadas (Sequelize)
└── 08-rollback/             # Scripts de rollback
```

### 4.2 Características de la Base de Datos

- **Normalización:** 3FN (Tercera Forma Normal)
- **Soft Delete:** Campos `deleted_at` en tablas críticas
- **Auditoría:** Campos estándar (`created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_by`)
- **Foreign Keys:** `ON DELETE SET NULL` (no cascadas)
- **Sin UNIQUE:** Constraints UNIQUE removidos según requerimientos
- **Generated Columns:** Campos calculados automáticamente
- **Índices:** Optimizados para consultas frecuentes

### 4.3 Conexión a Base de Datos

**Configuración:** `config/database.js`

```javascript
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);
```

---

## 5. SEGURIDAD

### 5.1 Autenticación JWT

**Flujo:**
1. Usuario envía credenciales (`/auth/login`)
2. Backend valida credenciales
3. Genera token JWT con payload: `{ userId, role, permissions }`
4. Devuelve token al frontend
5. Frontend incluye token en header `Authorization: Bearer <token>`
6. Middleware `authMiddleware` valida token en cada request

### 5.2 Autorización (RBAC)

**Roles:** 11 roles predefinidos
- SUPER_ADMIN, RECTOR, DIRECTOR_ACADEMICO, DIRECTOR_ADMINISTRATIVO
- SECRETARIA_ACADEMICA, SECRETARIA_ADMINISTRATIVA, CONTADOR
- DOCENTE, ESTUDIANTE, DOCENTE_TUTOR, SUPERVISOR

**Permisos:** 70+ permisos granulares organizados por módulo

**Middleware de autorización:**
```javascript
export const requirePermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions;
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }
    next();
  };
};
```

### 5.3 Validación de Inputs

**Estrategia en dos capas:**
1. **express-validator:** Validación en middleware de rutas
2. **Joi:** Validación en DTOs/Use Cases

### 5.4 Protección contra Ataques

- **SQL Injection:** Sequelize ORM (queries parametrizadas)
- **XSS:** Helmet.js + sanitización de inputs
- **CSRF:** (Implementación futura)
- **Rate Limiting:** express-rate-limit
- **Brute Force:** Rate limiting en login

---

## 6. MANEJO DE ERRORES

### 6.1 Jerarquía de Errores

```javascript
// shared/errors/AppError.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403, 'FORBIDDEN');
  }
}
```

### 6.2 Códigos de Error Estándar

| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| VALIDATION_ERROR | 400 | Error de validación de datos |
| UNAUTHORIZED | 401 | No autenticado |
| FORBIDDEN | 403 | No autorizado |
| NOT_FOUND | 404 | Recurso no encontrado |
| CONFLICT | 409 | Conflicto (ej: CI duplicado) |
| INTERNAL_ERROR | 500 | Error interno del servidor |

---

## 7. LOGGING Y AUDITORÍA

### 7.1 Logging con Winston

**Configuración:** `config/logger.js`

```javascript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});
```

### 7.2 Auditoría

**Tabla de auditoría:** Registra todas las operaciones críticas:
- Creación, modificación, eliminación de estudiantes
- Cambios en calificaciones
- Modificaciones de inscripciones
- Cambios de estado académico
- Accesos y autenticaciones

---

## 8. TESTING

### 8.1 Herramientas

- **Jest:** Framework de testing
- **Supertest:** Testing de APIs HTTP
- **Sequelize Test Helpers:** Helpers para testing de BD

### 8.2 Tipos de Tests

- **Unit Tests:** Lógica de negocio (use cases, services, entities)
- **Integration Tests:** Flujos completos (registro de estudiante, login)
- **E2E Tests:** (Futuro) Tests end-to-end

**Ejemplo de test:**
```javascript
// tests/unit/use-cases/RegisterStudentUseCase.test.js
import { RegisterStudentUseCase } from '../../../src/application/use-cases/estudiantes/RegisterStudentUseCase.js';

describe('RegisterStudentUseCase', () => {
  it('debe registrar un estudiante nuevo', async () => {
    const useCase = new RegisterStudentUseCase(/* mocks */);
    const result = await useCase.execute(validStudentData);
    expect(result.codigoEstudiante).toMatch(/^EST-\d{4}-\d{4}$/);
  });
});
```

---

## 9. DEPLOYMENT

### 9.1 Variables de Entorno

**`.env.example`:**
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=instituto_incos
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=8h

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### 9.2 Scripts de Deployment

**PM2 (Process Manager):**
```bash
npm run pm2:start      # Iniciar en producción
npm run pm2:stop       # Detener
npm run pm2:restart    # Reiniciar
npm run pm2:logs       # Ver logs
```

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 9.3 Health Check

**Endpoint:** `GET /health`

```javascript
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: sequelize.authenticate() ? 'connected' : 'disconnected',
  });
});
```

---

## 10. ESTÁNDARES DE DESARROLLO

### 10.1 Linting y Formatting

- **ESLint:** Configurado con reglas de Airbnb Base
- **Prettier:** Formateo automático

**Comandos:**
```bash
npm run lint          # Verificar errores
npm run lint:fix      # Corregir automáticamente
npm run format        # Formatear código
```

### 10.2 Convenciones de Código

- **Nombres de archivos:** camelCase para archivos JS (`studentRepository.js`)
- **Nombres de clases:** PascalCase (`RegisterStudentUseCase`)
- **Nombres de funciones:** camelCase (`registerStudent`)
- **Constantes:** UPPER_SNAKE_CASE (`JWT_SECRET`)

### 10.3 Estructura de Archivos

- **Use Cases:** Un archivo por caso de uso
- **Controllers:** Un controlador por módulo/entidad
- **Routes:** Un archivo de rutas por módulo
- **Models:** Un modelo por tabla de BD

---

## 11. RECURSOS Y ENLACES

### 11.1 Documentación Oficial

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [JWT](https://jwt.io/)
- [Jest](https://jestjs.io/)

### 11.2 Documentación del Proyecto

- Ver [README.md](../backend/README.md) del backend
- Ver [09-estandares-codigo.md](09-estandares-codigo.md) para estándares completos
- Ver [05-modelo-datos.md](05-modelo-datos.md) para estructura de BD

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción de Cambios |
|---------|-------|-------|------------------------|
| 1.0 | 2025-01-XX | Equipo de Desarrollo | Versión inicial - Documentación completa del backend |
| 1.1 | 2025-01-XX | Equipo de Desarrollo | Actualización estructural: Dependency Injection Container, BaseRepository con Template Method, BaseEntity, Controllers separados por funcionalidad |

---

## REFERENCIAS

- [04-arquitectura-sistema.md](04-arquitectura-sistema.md) - Arquitectura general del sistema
- [09-estandares-codigo.md](09-estandares-codigo.md) - Estándares de código
- [05-modelo-datos.md](05-modelo-datos.md) - Estructura de base de datos
- backend/README.md - README específico del backend

---

**FIN DEL DOCUMENTO - 15 BACKEND**
