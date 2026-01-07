import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getEnv } from './env.validator.js';
import { serverConfig } from './server.config.js';

// Obtener el directorio actual del módulo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta raíz del proyecto (subir 4 niveles desde infrastructure/config)
const projectRoot = join(__dirname, '../../../../');

/**
 * Configuración de Swagger/OpenAPI
 * Genera documentación automática desde comentarios JSDoc
 * 
 * Usa variables de entorno para configuración dinámica según el entorno
 */

// Configuración desde variables de entorno
const apiTitle = getEnv('API_TITLE', 'API Instituto INCOS');
const apiVersion = getEnv('API_VERSION', '1.0.0');
const apiDescription = getEnv('API_DESCRIPTION', 'Sistema de Gestión Académica - Instituto INCOS Santa Cruz');
const apiContactName = getEnv('API_CONTACT_NAME', 'Soporte Técnico');
const apiContactEmail = getEnv('API_CONTACT_EMAIL', 'sistema@incos.edu.bo');
const apiLicenseName = getEnv('API_LICENSE_NAME', 'Privado');
const apiProductionUrl = getEnv('API_PRODUCTION_URL', 'https://incos.wiiz.com.bo/api/v1');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: apiTitle,
            version: apiVersion,
            description: apiDescription,
            contact: {
                name: apiContactName,
                email: apiContactEmail,
            },
            license: {
                name: apiLicenseName,
            },
        },
        servers: [
            {
                url: `${serverConfig.appUrl}/api/v1`,
                description: serverConfig.isDevelopment
                    ? 'Servidor de Desarrollo'
                    : serverConfig.isProduction
                        ? 'Servidor de Producción'
                        : 'Servidor',
            },
            ...(serverConfig.isDevelopment ? [{
                url: apiProductionUrl,
                description: 'Servidor de Producción',
            }] : []),
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtenido del endpoint de autenticación',
                },
            },
        },
    },
    apis: [
        join(projectRoot, 'src/presentation/routes/**/*.js'),
        join(projectRoot, 'src/presentation/controllers/**/*.js'),
    ], // Rutas donde buscar documentación JSDoc (rutas absolutas)
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

