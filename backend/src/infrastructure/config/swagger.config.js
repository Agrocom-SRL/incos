import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { serverConfig } from './server.config.js';

// Obtener el directorio actual del módulo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta raíz del proyecto (subir 4 niveles desde infrastructure/config)
const projectRoot = join(__dirname, '../../../../');

/**
 * Configuración de Swagger/OpenAPI
 * Genera documentación automática desde comentarios JSDoc
 */

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Instituto INCOS',
            version: '1.0.0',
            description: 'Sistema de Gestión Académica - Instituto INCOS Santa Cruz',
            contact: {
                name: 'Soporte Técnico',
                email: 'sistema@incos.edu.bo',
            },
            license: {
                name: 'Privado',
            },
        },
        servers: [
            {
                url: `${serverConfig.appUrl}/api/v1`,
                description: 'Servidor de Desarrollo',
            },
            {
                url: 'https://api.incos.edu.bo/api/v1',
                description: 'Servidor de Producción',
            },
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
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    example: 'Error message',
                                },
                                code: {
                                    type: 'string',
                                    example: 'ERROR_CODE',
                                },
                                details: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            field: {
                                                type: 'string',
                                            },
                                            message: {
                                                type: 'string',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            type: 'object',
                        },
                        message: {
                            type: 'string',
                            example: 'Operación exitosa',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Estudiantes',
                description: 'Gestión de estudiantes',
            },
            {
                name: 'Catálogos',
                description: 'Endpoints de catálogos y datos de referencia',
            },
            {
                name: 'Health',
                description: 'Endpoints de salud y estado del sistema',
            },
        ],
    },
    apis: [
        join(projectRoot, 'src/presentation/routes/**/*.js'),
        join(projectRoot, 'src/presentation/controllers/**/*.js'),
    ], // Rutas donde buscar documentación JSDoc (rutas absolutas)
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

