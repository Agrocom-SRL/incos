# 12 - GESTIÓN DE ERRORES Y LOGGING
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito

Este documento define la **estrategia de gestión de errores y logging** del Sistema de Gestión Académica del Instituto INCOS, estableciendo cómo capturar, registrar, manejar y reportar errores de manera consistente.

### 1.2 Objetivos

- **Visibilidad:** Detectar errores rápidamente
- **Trazabilidad:** Rastrear el origen y contexto de errores
- **Consistencia:** Manejo uniforme de errores en toda la aplicación
- **Seguridad:** No exponer información sensible en errores
- **Recuperabilidad:** Facilitar debugging y resolución de problemas

---

## 2. JERARQUÍA DE ERRORES

### 2.1 Clases de Error Personalizadas

```javascript
// shared/errors/AppError.js
/**
 * Clase base para todos los errores de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        statusCode: this.statusCode
      },
      timestamp: this.timestamp
    };
  }
}

module.exports = AppError;
```

### 2.2 Errores Específicos

#### ValidationError (400)
```javascript
// shared/errors/ValidationError.js
const AppError = require('./AppError');

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        details: this.details
      },
      timestamp: this.timestamp
    };
  }
}

module.exports = ValidationError;
```

**Uso:**
```javascript
throw new ValidationError('Datos de entrada inválidos', [
  { field: 'ci', message: 'El CI ya está registrado' },
  { field: 'email', message: 'El formato del email es inválido' }
]);
```

#### UnauthorizedError (401)
```javascript
// shared/errors/UnauthorizedError.js
const AppError = require('./AppError');

class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

module.exports = UnauthorizedError;
```

#### ForbiddenError (403)
```javascript
// shared/errors/ForbiddenError.js
const AppError = require('./AppError');

class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(message, 403, 'FORBIDDEN');
  }
}

module.exports = ForbiddenError;
```

#### NotFoundError (404)
```javascript
// shared/errors/NotFoundError.js
const AppError = require('./AppError');

class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

module.exports = NotFoundError;
```

**Uso:**
```javascript
throw new NotFoundError('Estudiante');
// Error: "Estudiante no encontrado"
```

#### ConflictError (409)
```javascript
// shared/errors/ConflictError.js
const AppError = require('./AppError');

class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(message, 409, 'CONFLICT');
  }
}

module.exports = ConflictError;
```

#### BusinessRuleError (422)
```javascript
// shared/errors/BusinessRuleError.js
const AppError = require('./AppError');

class BusinessRuleError extends AppError {
  constructor(message, ruleCode) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION');
    this.ruleCode = ruleCode;
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        ruleCode: this.ruleCode,
        message: this.message
      },
      timestamp: this.timestamp
    };
  }
}

module.exports = BusinessRuleError;
```

**Uso:**
```javascript
throw new BusinessRuleError(
  'El estudiante debe tener al menos 16 años',
  'RN-EST-002'
);
```

#### InternalServerError (500)
```javascript
// shared/errors/InternalServerError.js
const AppError = require('./AppError');

class InternalServerError extends AppError {
  constructor(message = 'Error interno del servidor') {
    super(message, 500, 'INTERNAL_SERVER_ERROR', false);
  }
}

module.exports = InternalServerError;
```

---

## 3. MIDDLEWARE DE MANEJO DE ERRORES

### 3.1 Error Handler Global

```javascript
// presentation/middleware/errorHandler.middleware.js
const logger = require('../../config/logger');
const AppError = require('../../shared/errors/AppError');

function errorHandler(err, req, res, next) {
  // Log del error
  logError(err, req);

  // Si el error ya es operacional (AppError), usarlo directamente
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details
      },
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `El ${field} ya está registrado`
      },
      timestamp: new Date().toISOString()
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Error inesperado (no operacional)
  logger.error('Error inesperado:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // En producción, no exponer detalles internos
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      },
      timestamp: new Date().toISOString()
    });
  }

  // En desarrollo, mostrar stack trace
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message,
      stack: err.stack
    },
    timestamp: new Date().toISOString()
  });
}

function logError(err, req) {
  const errorLog = {
    message: err.message,
    statusCode: err.statusCode || 500,
    errorCode: err.errorCode || 'UNKNOWN_ERROR',
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  };

  if (err.statusCode && err.statusCode < 500) {
    logger.warn('Error del cliente:', errorLog);
  } else {
    logger.error('Error del servidor:', {
      ...errorLog,
      stack: err.stack
    });
  }
}

module.exports = errorHandler;
```

### 3.2 Not Found Handler

```javascript
// presentation/middleware/notFound.middleware.js
const NotFoundError = require('../../shared/errors/NotFoundError');

function notFoundHandler(req, res, next) {
  throw new NotFoundError(`Ruta ${req.originalUrl}`);
}

module.exports = notFoundHandler;
```

### 3.3 Async Error Wrapper

```javascript
// shared/utils/asyncHandler.js
/**
 * Wrapper para capturar errores en funciones asíncronas
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
```

**Uso:**
```javascript
const asyncHandler = require('../utils/asyncHandler');

router.get('/estudiantes/:id', asyncHandler(async (req, res) => {
  const estudiante = await estudianteService.obtenerPorId(req.params.id);
  
  if (!estudiante) {
    throw new NotFoundError('Estudiante');
  }
  
  res.json({
    success: true,
    data: estudiante
  });
}));
```

---

## 4. LOGGING

### 4.1 Configuración de Winston

```javascript
// config/logger.js
const winston = require('winston');
const path = require('path');

const logDir = process.env.LOG_DIR || 'logs';

// Niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Colores para consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Formato personalizado
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Formato para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transports
const transports = [
  // Consola (solo en desarrollo)
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }),

  // Archivo de errores
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 52428800, // 50MB
    maxFiles: 30
  }),

  // Archivo general
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: logFormat,
    maxsize: 52428800, // 50MB
    maxFiles: 30
  })
];

// Logger principal
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Stream para Morgan (HTTP logs)
logger.stream = {
  write: (message) => logger.http(message.trim())
};

module.exports = logger;
```

### 4.2 Middleware de HTTP Logging (Morgan)

```javascript
// presentation/middleware/logger.middleware.js
const morgan = require('morgan');
const logger = require('../../config/logger');

// Formato personalizado
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

const morganFormat = ':method :url :status :response-time ms - :user-id';

const httpLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req) => {
    // No loguear health checks en producción
    return process.env.NODE_ENV === 'production' && req.url === '/api/v1/health';
  }
});

module.exports = httpLogger;
```

### 4.3 Uso del Logger

#### En Controladores
```javascript
const logger = require('../../config/logger');

class EstudianteController {
  async crear(req, res, next) {
    try {
      logger.info('Creando estudiante', {
        userId: req.user.id,
        data: { ci: req.body.ci, carreraId: req.body.carreraId }
      });

      const estudiante = await this.crearEstudianteUseCase.execute(req.body);

      logger.info('Estudiante creado exitosamente', {
        estudianteId: estudiante.id,
        userId: req.user.id
      });

      res.status(201).json({
        success: true,
        data: estudiante
      });
    } catch (error) {
      next(error);
    }
  }
}
```

#### En Services
```javascript
const logger = require('../../config/logger');

class EstudianteService {
  async crearEstudiante(data) {
    try {
      // Validar CI duplicado
      const existente = await this.repository.findByCI(data.ci);
      
      if (existente) {
        logger.warn('Intento de crear estudiante con CI duplicado', {
          ci: data.ci
        });
        throw new ConflictError('El CI ya está registrado');
      }

      const estudiante = await this.repository.save(data);

      logger.debug('Estudiante guardado en BD', { id: estudiante.id });

      return estudiante;
    } catch (error) {
      logger.error('Error al crear estudiante', {
        error: error.message,
        data: { ci: data.ci }
      });
      throw error;
    }
  }
}
```

---

## 5. AUDITORÍA DE OPERACIONES

### 5.1 Middleware de Auditoría

```javascript
// presentation/middleware/audit.middleware.js
const logger = require('../../config/logger');
const { Auditoria } = require('../../infrastructure/database/models');

async function auditMiddleware(req, res, next) {
  // Solo auditar operaciones de modificación
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Capturar datos de la request
  const originalSend = res.json;
  
  res.json = function(data) {
    // Solo auditar respuestas exitosas
    if (data.success && res.statusCode < 400) {
      // Registrar en BD de forma asíncrona (no bloquear response)
      setImmediate(() => {
        registrarAuditoria(req, res, data).catch(err => {
          logger.error('Error al registrar auditoría', { error: err.message });
        });
      });
    }

    originalSend.call(this, data);
  };

  next();
}

async function registrarAuditoria(req, res, responseData) {
  try {
    const accion = mapearMetodoAAccion(req.method);
    const { tabla, registroId } = extraerInfoDeUrl(req.originalUrl);

    await Auditoria.create({
      usuarioId: req.user?.id,
      accion,
      tabla,
      registroId,
      valoresAnteriores: null, // Se puede implementar para UPDATE
      valoresNuevos: req.method !== 'DELETE' ? req.body : null,
      ipCliente: req.ip,
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    logger.error('Error en auditoría', { error: error.message });
  }
}

function mapearMetodoAAccion(method) {
  const map = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };
  return map[method] || 'UNKNOWN';
}

function extraerInfoDeUrl(url) {
  // Extraer tabla y ID de la URL
  // Ejemplo: /api/v1/estudiantes/123 → { tabla: 'estudiantes', registroId: 123 }
  const match = url.match(/\/api\/v1\/(\w+)(?:\/(\d+))?/);
  
  return {
    tabla: match?.[1] || null,
    registroId: match?.[2] ? parseInt(match[2]) : null
  };
}

module.exports = auditMiddleware;
```

---

## 6. MONITOREO Y ALERTAS

### 6.1 Health Check Endpoint

```javascript
// presentation/routes/health.routes.js
const express = require('express');
const router = express.Router();
const { Estudiante } = require('../../infrastructure/database/models');

router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  };

  try {
    // Verificar conexión a BD
    await Estudiante.findOne({ limit: 1 });
    health.database = 'OK';
  } catch (error) {
    health.database = 'ERROR';
    health.status = 'ERROR';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

### 6.2 Detección de Errores Críticos

```javascript
// config/monitoring.js
const logger = require('./logger');

// Contador de errores por minuto
let errorCount = 0;
let lastReset = Date.now();

function trackError(error) {
  // Resetear contador cada minuto
  const now = Date.now();
  if (now - lastReset > 60000) {
    errorCount = 0;
    lastReset = now;
  }

  errorCount++;

  // Alerta si hay más de 10 errores por minuto
  if (errorCount > 10) {
    logger.error('⚠️ ALERTA: Tasa de errores elevada', {
      errorCount,
      lastMinute: true
    });
    
    // Enviar notificación (email, SMS, Slack, etc.)
    enviarAlertaCritica('Tasa de errores elevada: ' + errorCount);
  }
}

function enviarAlertaCritica(mensaje) {
  // TODO: Implementar notificación (email, SMS, etc.)
  logger.error('🚨 ALERTA CRÍTICA:', { mensaje });
}

module.exports = { trackError };
```

---

## 7. CÓDIGOS DE ERROR DOCUMENTADOS

### 7.1 Catálogo de Códigos

| Código | HTTP | Descripción | Acción Sugerida |
|--------|------|-------------|-----------------|
| **AUTENTICACIÓN** |
| AUTH_001 | 401 | Credenciales inválidas | Verificar username y password |
| AUTH_002 | 401 | Token JWT expirado | Renovar token o iniciar sesión nuevamente |
| AUTH_003 | 401 | Token JWT inválido | Iniciar sesión nuevamente |
| AUTH_004 | 403 | Sin permisos suficientes | Solicitar permisos al administrador |
| AUTH_005 | 429 | Usuario bloqueado temporalmente | Esperar 15 minutos |
| **VALIDACIÓN** |
| VAL_001 | 400 | Datos de entrada inválidos | Verificar formato de datos |
| VAL_002 | 409 | CI duplicado | Usar otro CI o verificar si ya existe |
| VAL_003 | 409 | Email duplicado | Usar otro email |
| VAL_004 | 400 | Fecha inválida | Verificar formato (YYYY-MM-DD) |
| VAL_005 | 400 | Campo requerido faltante | Incluir campo obligatorio |
| **REGLAS DE NEGOCIO** |
| BIZ_001 | 422 | Prerrequisitos no cumplidos | Aprobar materias previas |
| BIZ_002 | 422 | Conflicto de horarios | Elegir otro turno u horario |
| BIZ_003 | 422 | Cupo lleno | Seleccionar otro curso |
| BIZ_004 | 422 | Estado académico no permite operación | Cambiar estado académico |
| BIZ_005 | 422 | Tiene deudas pendientes | Pagar deudas |
| BIZ_006 | 422 | Beca requiere aprobación del Rector | Esperar aprobación |
| BIZ_007 | 422 | Nota fuera de rango (0-100) | Ingresar nota válida |
| BIZ_008 | 422 | Solo puede inscribirse a materias de su semestre | Verificar plan de estudios |
| **BASE DE DATOS** |
| DB_001 | 500 | Error de conexión a BD | Contactar soporte técnico |
| DB_002 | 500 | Error de transacción | Reintentar operación |
| DB_003 | 500 | Constraint violation | Verificar integridad de datos |
| **SISTEMA** |
| SYS_001 | 500 | Error interno del servidor | Contactar soporte técnico |
| SYS_002 | 503 | Servicio temporalmente no disponible | Reintentar en unos minutos |
| SYS_003 | 404 | Recurso no encontrado | Verificar URL o ID |

---

## 8. MEJORES PRÁCTICAS

### 8.1 Qué Loguear

✅ **SÍ Loguear:**
- Inicio y fin de operaciones importantes
- Errores y excepciones
- Intentos de acceso no autorizado
- Cambios en datos críticos (calificaciones, estados)
- Operaciones de auditoría (CREATE, UPDATE, DELETE)
- Métricas de rendimiento

❌ **NO Loguear:**
- Contraseñas (NUNCA)
- Tokens completos (JWT)
- Datos personales sensibles (CI completo)
- Información de tarjetas de crédito
- Claves API

### 8.2 Niveles de Log

```javascript
// ERROR: Errores que requieren atención inmediata
logger.error('Error crítico al procesar pago', { error: err.message });

// WARN: Situaciones anómalas pero no críticas
logger.warn('Intento de login con credenciales incorrectas', { username });

// INFO: Operaciones importantes exitosas
logger.info('Usuario autenticado', { userId, username });

// HTTP: Requests HTTP
logger.http('GET /api/v1/estudiantes 200 45ms');

// DEBUG: Información detallada para debugging (solo desarrollo)
logger.debug('Consulta SQL ejecutada', { query, params });
```

### 8.3 Contexto en Logs

```javascript
// ✅ CORRECTO: Log con contexto
logger.error('Error al crear estudiante', {
  error: err.message,
  userId: req.user.id,
  data: { ci: req.body.ci, carreraId: req.body.carreraId },
  timestamp: new Date().toISOString()
});

// ❌ INCORRECTO: Log sin contexto
logger.error('Error');
```

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Estrategia inicial de errores y logging |

---

**FIN DEL DOCUMENTO - 12 GESTIÓN DE ERRORES Y LOGGING**
