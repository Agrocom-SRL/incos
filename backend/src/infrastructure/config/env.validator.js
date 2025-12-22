import 'dotenv/config';

/**
 * Validador de variables de entorno
 * Valida que todas las variables requeridas estén presentes y sean del tipo correcto
 */

const requiredEnvVars = {
    // Base de datos (requeridas)
    DB_HOST: 'string',
    DB_PORT: 'number',
    DB_NAME: 'string',
    DB_USER: 'string',
    // DB_PASSWORD es opcional en desarrollo

    // Servidor
    PORT: 'number',
    NODE_ENV: 'enum:development,production,test',
};

const optionalEnvVars = {
    // Base de datos
    DB_PASSWORD: 'string',
    DB_DIALECT: 'string',
    DB_LOGGING: 'boolean',
    DB_POOL_MAX: 'number',
    DB_POOL_MIN: 'number',
    DB_POOL_ACQUIRE: 'number',
    DB_POOL_IDLE: 'number',

    // JWT
    JWT_SECRET: 'string',
    JWT_EXPIRES_IN: 'string',
    JWT_REFRESH_SECRET: 'string',
    JWT_REFRESH_EXPIRES_IN: 'string',

    // CORS
    CORS_ORIGIN: 'string',
    CORS_CREDENTIALS: 'boolean',

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: 'number',
    RATE_LIMIT_MAX_REQUESTS: 'number',
    RATE_LIMIT_LOGIN_MAX: 'number',

    // Logging
    LOG_LEVEL: 'enum:error,warn,info,debug',
    LOG_DIR: 'string',
    LOG_FILE: 'string',
    LOG_MAX_SIZE: 'string',
    LOG_MAX_FILES: 'number',

    // Uploads
    UPLOAD_DIR: 'string',
    MAX_FILE_SIZE: 'number',
    ALLOWED_FILE_TYPES: 'string',

    // Email
    SMTP_HOST: 'string',
    SMTP_PORT: 'number',
    SMTP_SECURE: 'boolean',
    SMTP_USER: 'string',
    SMTP_PASSWORD: 'string',
    SMTP_FROM: 'string',

    // Seguridad
    BCRYPT_SALT_ROUNDS: 'number',
    HELMET_ENABLED: 'boolean',
    TRUST_PROXY: 'boolean',

    // Aplicación
    APP_NAME: 'string',
    APP_URL: 'string',
    FRONTEND_URL: 'string',

    // Paginación
    DEFAULT_PAGE_SIZE: 'number',
    MAX_PAGE_SIZE: 'number',

    // Session
    SESSION_SECRET: 'string',
    SESSION_TIMEOUT: 'number',

    // Redis
    REDIS_ENABLED: 'boolean',
    REDIS_HOST: 'string',
    REDIS_PORT: 'number',
    REDIS_PASSWORD: 'string',
    REDIS_DB: 'number',

    // Backup
    BACKUP_DIR: 'string',
    BACKUP_RETENTION_DAYS: 'number',
};

/**
 * Valida el tipo de una variable
 */
function validateType(key, value, type) {
    if (!value) return; // Si no existe, no validar tipo

    if (type.startsWith('enum:')) {
        const allowedValues = type.split(':')[1].split(',');
        if (!allowedValues.includes(value)) {
            throw new Error(
                `Variable ${key} debe ser uno de: ${allowedValues.join(', ')}. Recibido: ${value}`
            );
        }
        return;
    }

    switch (type) {
        case 'string':
            if (typeof value !== 'string') {
                throw new Error(`Variable ${key} debe ser string. Recibido: ${typeof value}`);
            }
            break;
        case 'number':
            if (isNaN(Number(value))) {
                throw new Error(`Variable ${key} debe ser número. Recibido: ${value}`);
            }
            break;
        case 'boolean':
            if (!['true', 'false', '1', '0'].includes(value?.toLowerCase())) {
                throw new Error(`Variable ${key} debe ser boolean (true/false). Recibido: ${value}`);
            }
            break;
        default:
            break;
    }
}

/**
 * Valida todas las variables de entorno requeridas
 */
export function validateEnv() {
    const errors = [];
    const nodeEnv = process.env.NODE_ENV || 'development';

    // Validar variables requeridas
    Object.entries(requiredEnvVars).forEach(([key, type]) => {
        const value = process.env[key];

        // DB_PASSWORD es opcional en desarrollo
        if (!value && key === 'DB_PASSWORD' && nodeEnv === 'development') {
            return;
        }

        if (!value) {
            errors.push(`Variable de entorno requerida no encontrada: ${key}`);
            return;
        }

        try {
            validateType(key, value, type);
        } catch (error) {
            errors.push(error.message);
        }
    });

    // Validar variables opcionales (solo si existen)
    Object.entries(optionalEnvVars).forEach(([key, type]) => {
        const value = process.env[key];
        if (value) {
            try {
                validateType(key, value, type);
            } catch (error) {
                errors.push(error.message);
            }
        }
    });

    // Si hay errores, mostrarlos y salir
    if (errors.length > 0) {
        console.error('\n❌ Errores en variables de entorno:\n');
        errors.forEach((error) => console.error(`  - ${error}`));
        console.error('\n💡 Revisa tu archivo .env\n');
        process.exit(1);
    }

    console.log('Variables de entorno validadas correctamente');
}

/**
 * Obtiene una variable de entorno con valor por defecto
 */
export function getEnv(key, defaultValue = undefined) {
    return process.env[key] ?? defaultValue;
}

/**
 * Obtiene una variable de entorno como número
 */
export function getEnvAsNumber(key, defaultValue = 0) {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
}

/**
 * Obtiene una variable de entorno como booleano
 */
export function getEnvAsBoolean(key, defaultValue = false) {
    const value = process.env[key]?.toLowerCase();
    if (!value) return defaultValue;
    return ['true', '1', 'yes'].includes(value);
}