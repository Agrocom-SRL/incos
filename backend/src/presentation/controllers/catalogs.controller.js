/**
 * Controller para catálogos
 * Endpoints simples para obtener datos de catálogos (carreras, gestiones, municipios, etc.)
 * 
 * NOTA: Implementación directa - importa repositorios directamente sin contenedor DI
 */

import { logger } from '../../shared/logger.js';
import { sequelize } from '../../infrastructure/database/config/sequelize.js';

// Importar modelos para asegurar su inicialización
import '../../infrastructure/database/models/Pais.js';
import '../../infrastructure/database/models/Idioma.js';
import '../../infrastructure/database/models/TipoDiscapacidad.js';
import '../../infrastructure/database/models/Municipio.js';
import '../../infrastructure/database/models/Documentacion.js';
import '../../infrastructure/database/models/Carrera.js';
import '../../infrastructure/database/models/Gestion.js';
import '../../infrastructure/database/models/Departamento.js';
import '../../infrastructure/database/models/Provincia.js';

// Importar repositorios directamente
import { CareerRepository } from '../../infrastructure/repositories/CareerRepository.js';
import { ManagementRepository } from '../../infrastructure/repositories/ManagementRepository.js';
import { CountryRepository } from '../../infrastructure/repositories/CountryRepository.js';
import { DepartmentRepository } from '../../infrastructure/repositories/DepartmentRepository.js';
import { ProvinceRepository } from '../../infrastructure/repositories/ProvinceRepository.js';
import { MunicipalityRepository } from '../../infrastructure/repositories/MunicipalityRepository.js';
import { LanguageRepository } from '../../infrastructure/repositories/LanguageRepository.js';
import { DisabilityTypeRepository } from '../../infrastructure/repositories/DisabilityTypeRepository.js';
import { DocumentacionRepository } from '../../infrastructure/repositories/DocumentacionRepository.js';

// Crear instancias de repositorios
const careerRepository = new CareerRepository();
const managementRepository = new ManagementRepository();
const countryRepository = new CountryRepository();
const departmentRepository = new DepartmentRepository();
const provinceRepository = new ProvinceRepository();
const municipalityRepository = new MunicipalityRepository();
const languageRepository = new LanguageRepository();
const disabilityTypeRepository = new DisabilityTypeRepository();
const documentacionRepository = new DocumentacionRepository();

/**
 * GET /api/v1/catalogs/carreras
 * Obtener lista de carreras activas
 */
export const getCarreras = async (req, res, next) => {
  try {
    logger.debug('[Catalogs] Obteniendo carreras...');
    const result = await careerRepository.findAll({}, null, null);
    logger.debug('[Catalogs] Resultado de findAll:', { 
      hasResult: !!result, 
      hasCareers: !!(result?.careers),
      careersCount: result?.careers?.length || 0,
      resultKeys: result ? Object.keys(result) : [],
      resultType: typeof result,
    });
    
    if (!result) {
      logger.warn('[Catalogs] Resultado de findAll es null o undefined');
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Carreras obtenidas correctamente (vacío)',
      });
    }
    
    const carreras = (result.careers || []).map(career => ({
      id: career.id,
      codigo: career.code,
      nombre: career.name,
    }));

    res.status(200).json({
      success: true,
      data: carreras,
      message: 'Carreras obtenidas correctamente',
    });
  } catch (error) {
    logger.error('Error al obtener carreras', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original?.message,
      sql: error.sql,
      sqlState: error.original?.sqlState,
      sqlCode: error.original?.code,
    });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/gestiones
 * Obtener lista de gestiones activas
 */
export const getGestiones = async (req, res, next) => {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    logger.debug(`[Catalogs] [${requestId}] 🔍🔍🔍 INICIO: Obteniendo gestiones...`);
    logger.debug(`[Catalogs] [${requestId}] 📍 Paso 1: Función getGestiones iniciada`, {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
      },
    });
    
    logger.debug(`[Catalogs] [${requestId}] 📍 Paso 2: Verificando managementRepository...`, {
      hasRepository: !!managementRepository,
      repositoryType: typeof managementRepository,
      hasFindAll: typeof managementRepository?.findAll === 'function',
    });
    
    // Intentar obtener gestiones con manejo de errores detallado
    let result;
    try {
      logger.debug(`[Catalogs] [${requestId}] 📍 Paso 3: Llamando a managementRepository.findAll...`, {
        params: {},
        timestamp: new Date().toISOString(),
      });
      
      const repoStartTime = Date.now();
      result = await managementRepository.findAll({}, null, null);
      const repoEndTime = Date.now();
      
      logger.debug(`[Catalogs] [${requestId}] 📍 Paso 4: managementRepository.findAll completado`, {
        duration: `${repoEndTime - repoStartTime}ms`,
        timestamp: new Date().toISOString(),
      });
      
      logger.debug(`[Catalogs] [${requestId}] 📍 Paso 5: Analizando resultado de findAll...`, { 
        hasResult: !!result,
        resultType: typeof result,
        isArray: Array.isArray(result),
        isNull: result === null,
        isUndefined: result === undefined,
        resultConstructor: result?.constructor?.name,
        resultKeys: result ? Object.keys(result) : [],
        resultStringified: JSON.stringify(result).substring(0, 500),
      });
      
      logger.debug(`[Catalogs] [${requestId}] 📍 Paso 6: Verificando estructura de resultado...`, {
        hasManagements: !!(result?.managements),
        managementsType: typeof result?.managements,
        managementsIsArray: Array.isArray(result?.managements),
        managementsCount: result?.managements?.length || 0,
        hasManagementsProperty: 'managements' in (result || {}),
      });
      
      if (result?.managements) {
        logger.debug(`[Catalogs] [${requestId}] 📍 Paso 7: Analizando array de managements...`, {
          length: result.managements.length,
          firstItem: result.managements[0] ? {
            id: result.managements[0].id,
            code: result.managements[0].code,
            year: result.managements[0].year,
            allKeys: Object.keys(result.managements[0] || {}),
            fullItem: JSON.stringify(result.managements[0]).substring(0, 300),
          } : null,
          sampleManagement: result.managements[0] ? {
            id: result.managements[0].id,
            code: result.managements[0].code,
            year: result.managements[0].year,
            hasCode: !!result.managements[0].code,
            hasYear: result.managements[0].year !== undefined && result.managements[0].year !== null,
            codeType: typeof result.managements[0].code,
            yearType: typeof result.managements[0].year,
          } : null,
        });
      }
    } catch (repoError) {
      logger.error(`[Catalogs] [${requestId}] ✗✗✗ ERROR en managementRepository.findAll:`, {
        error: repoError.message,
        errorName: repoError.name,
        errorCode: repoError.code,
        stack: repoError.stack,
        original: repoError.original?.message,
        originalStack: repoError.original?.stack,
        sql: repoError.sql,
        sqlState: repoError.original?.sqlState,
        sqlCode: repoError.original?.code,
        sqlMessage: repoError.original?.message,
        fullError: JSON.stringify(repoError, Object.getOwnPropertyNames(repoError)).substring(0, 1000),
      });
      throw repoError;
    }
    
    logger.debug(`[Catalogs] [${requestId}] 📍 Paso 8: Verificando si result es null/undefined...`, {
      isNull: result === null,
      isUndefined: result === undefined,
      hasResult: !!result,
    });
    
    if (!result) {
      logger.warn(`[Catalogs] [${requestId}] ⚠️ Resultado de findAll es null o undefined`);
      logger.debug(`[Catalogs] [${requestId}] 📍 Paso 9: Retornando respuesta vacía`);
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Gestiones obtenidas correctamente (vacío)',
      });
    }
    
    logger.debug(`[Catalogs] [${requestId}] 📍 Paso 10: Iniciando mapeo de gestiones...`, {
      hasManagements: !!(result.managements),
      managementsLength: result.managements?.length || 0,
    });
    
    // Mapear gestiones con validación
    let gestiones = [];
    try {
      const mapStartTime = Date.now();
      const rawManagements = result.managements || [];
      
      logger.debug(`[Catalogs] [${requestId}] 📍 Paso 11: Procesando ${rawManagements.length} gestiones...`);
      
      gestiones = rawManagements.map((gestion, index) => {
        logger.debug(`[Catalogs] [${requestId}] 📍 Paso 11.${index + 1}: Procesando gestión ${index}...`, {
          hasGestion: !!gestion,
          gestionType: typeof gestion,
          gestionKeys: gestion ? Object.keys(gestion) : [],
        });
        
        // Validar que la gestión tenga los campos necesarios
        if (!gestion) {
          logger.warn(`[Catalogs] [${requestId}] ⚠️ Gestión nula encontrada en el índice ${index}`);
          return null;
        }
        
        logger.debug(`[Catalogs] [${requestId}] 📍 Paso 11.${index + 1}.1: Validando campos de gestión ${index}...`, {
          hasId: gestion.id !== undefined && gestion.id !== null,
          idValue: gestion.id,
          idType: typeof gestion.id,
          hasCode: gestion.code !== undefined,
          codeValue: gestion.code,
          codeType: typeof gestion.code,
          hasYear: gestion.year !== undefined,
          yearValue: gestion.year,
          yearType: typeof gestion.year,
        });
        
        // Validar campos requeridos
        if (gestion.id === undefined || gestion.id === null) {
          logger.warn(`[Catalogs] [${requestId}] ⚠️ Gestión sin ID en el índice ${index}:`, {
            gestion: JSON.stringify(gestion).substring(0, 200),
            allKeys: Object.keys(gestion),
          });
          return null;
        }
        
        const mappedGestion = {
          id: gestion.id,
          codigo: gestion.code || null,
          anio: gestion.year || null,
        };
        
        logger.debug(`[Catalogs] [${requestId}] 📍 Paso 11.${index + 1}.2: Gestión ${index} mapeada:`, mappedGestion);
        
        return mappedGestion;
      }).filter(gestion => gestion !== null); // Filtrar nulos
      
      const mapEndTime = Date.now();
      
      logger.debug(`[Catalogs] [${requestId}] 📍 Paso 12: Mapeo completado`, {
        duration: `${mapEndTime - mapStartTime}ms`,
        total: gestiones.length,
        filtered: rawManagements.length - gestiones.length,
        sample: gestiones[0] || null,
        firstThree: gestiones.slice(0, 3),
      });
    } catch (mapError) {
      logger.error(`[Catalogs] [${requestId}] ✗✗✗ ERROR al mapear gestiones:`, {
        error: mapError.message,
        errorName: mapError.name,
        stack: mapError.stack,
        resultManagements: result?.managements?.length || 0,
        fullError: JSON.stringify(mapError, Object.getOwnPropertyNames(mapError)).substring(0, 1000),
      });
      throw mapError;
    }

    logger.debug(`[Catalogs] [${requestId}] 📍 Paso 13: Preparando respuesta JSON...`, {
      gestionesCount: gestiones.length,
      responseSize: JSON.stringify(gestiones).length,
    });

    const response = {
      success: true,
      data: gestiones,
      message: 'Gestiones obtenidas correctamente',
    };
    
    const endTime = Date.now();
    logger.debug(`[Catalogs] [${requestId}] 📍 Paso 14: Enviando respuesta`, {
      totalDuration: `${endTime - startTime}ms`,
      statusCode: 200,
      dataLength: gestiones.length,
    });

    res.status(200).json(response);
    
    logger.debug(`[Catalogs] [${requestId}] ✅✅✅ FIN: getGestiones completado exitosamente`);
  } catch (error) {
    const endTime = Date.now();
    logger.error(`[Catalogs] [${requestId}] ✗✗✗ ERROR FINAL al obtener gestiones`, { 
      totalDuration: `${endTime - startTime}ms`,
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
      stack: error.stack,
      original: error.original?.message,
      originalStack: error.original?.stack,
      sql: error.sql,
      sqlState: error.original?.sqlState,
      sqlCode: error.original?.code,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)).substring(0, 2000),
    });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/paises
 * Obtener lista de países activos
 */
export const getPaises = async (req, res, next) => {
  try {
    logger.debug('[Catalogs] Obteniendo paises...');
    const result = await countryRepository.findAll({}, null, null);
    logger.debug('[Catalogs] Resultado de findAll:', { 
      hasResult: !!result, 
      hasCountries: !!(result?.countries),
      countriesCount: result?.countries?.length || 0,
      resultKeys: result ? Object.keys(result) : [],
      resultType: typeof result,
    });
    
    if (!result) {
      logger.warn('[Catalogs] Resultado de findAll es null o undefined');
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Países obtenidos correctamente (vacío)',
      });
    }
    
    const paises = (result.countries || []).map(pais => ({
      id: pais.id,
      nombre: pais.name,
      codigoIso: pais.isoCode,
    }));

    res.status(200).json({
      success: true,
      data: paises,
      message: 'Países obtenidos correctamente',
    });
  } catch (error) {
    logger.error('Error al obtener países', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original?.message,
      sql: error.sql,
      sqlState: error.original?.sqlState,
      sqlCode: error.original?.code,
    });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/departamentos
 * Obtener lista de departamentos activos
 * Query params: paisId (opcional) - Filtrar por país
 */
export const getDepartamentos = async (req, res, next) => {
  try {
    const { paisId } = req.query;
    
    let result;
    if (paisId) {
      // Filtrar por país usando el método específico del repositorio
      result = await departmentRepository.findByPaisId(parseInt(paisId));
    } else {
      // Obtener todos los departamentos
      result = await departmentRepository.findAll({}, null, null);
    }
    
    const departamentos = (result.departments || result || []).map(depto => ({
      id: depto.id,
      nombre: depto.name,
      paisId: depto.countryId,
      codigo: depto.code,
    }));

    res.status(200).json({
      success: true,
      data: departamentos,
      message: 'Departamentos obtenidos correctamente',
    });
  } catch (error) {
    logger.error('Error al obtener departamentos', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original?.message,
      sql: error.sql,
    });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/provincias
 * Obtener lista de provincias activas
 * Query params: departamentoId (opcional) - Filtrar por departamento
 */
export const getProvincias = async (req, res, next) => {
  try {
    logger.debug('[Catalogs] Obteniendo provincias...', { departamentoId: req.query.departamentoId });
    const { departamentoId } = req.query;
    
    let result;
    if (departamentoId) {
      // Filtrar por departamento usando el método específico del repositorio
      result = await provinceRepository.findByDepartamentoId(parseInt(departamentoId));
    } else {
      // Obtener todas las provincias
      result = await provinceRepository.findAll({}, null, null);
    }
    
    logger.debug('[Catalogs] Resultado de provincias:', { 
      hasResult: !!result, 
      hasProvinces: !!(result?.provinces),
      provincesCount: result?.provinces?.length || result?.length || 0 
    });
    
    const provincias = (result.provinces || result || []).map(prov => ({
      id: prov.id,
      nombre: prov.name,
      departamentoId: prov.departmentId,
      codigo: prov.code,
    }));

    res.status(200).json({
      success: true,
      data: provincias,
      message: 'Provincias obtenidas correctamente',
    });
  } catch (error) {
    logger.error('Error al obtener provincias', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original?.message,
      sql: error.sql,
      sqlState: error.original?.sqlState,
      sqlCode: error.original?.code,
      departamentoId: req.query.departamentoId,
    });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/municipios
 * Obtener lista de municipios activos
 * Query params: provinciaId (opcional) - Filtrar por provincia
 */
export const getMunicipios = async (req, res, next) => {
  try {
    const { provinciaId } = req.query;
    logger.debug('[Catalogs] Obteniendo municipios...', { provinciaId });
    
    let result;
    if (provinciaId) {
      // Filtrar por provincia usando el método específico del repositorio
      result = await municipalityRepository.findByProvinciaId(parseInt(provinciaId));
      logger.debug('[Catalogs] Resultado de findByProvinciaId:', { 
        hasResult: !!result,
        isArray: Array.isArray(result),
        count: result?.length || 0,
      });
      
      // findByProvinciaId retorna un array directamente
      const municipios = (result || []).map(municipio => ({
        id: municipio.id,
        nombre: municipio.name,
        provinciaId: municipio.provinceId,
        codigo: municipio.code,
      }));

      return res.status(200).json({
        success: true,
        data: municipios,
        message: 'Municipios obtenidos correctamente',
      });
    } else {
      // Obtener todos los municipios
      result = await municipalityRepository.findAll({}, null, null);
      logger.debug('[Catalogs] Resultado de findAll:', { 
        hasResult: !!result,
        hasMunicipalities: !!(result?.municipalities),
        municipalitiesCount: result?.municipalities?.length || 0,
        resultKeys: result ? Object.keys(result) : [],
        resultType: typeof result,
      });
      
      if (!result) {
        logger.warn('[Catalogs] Resultado de findAll es null o undefined');
        return res.status(200).json({
          success: true,
          data: [],
          message: 'Municipios obtenidos correctamente (vacío)',
        });
      }
      
      const municipios = (result.municipalities || []).map(municipio => ({
        id: municipio.id,
        nombre: municipio.name,
        provinciaId: municipio.provinceId,
        codigo: municipio.code,
      }));

      return res.status(200).json({
        success: true,
        data: municipios,
        message: 'Municipios obtenidos correctamente',
      });
    }
  } catch (error) {
    logger.error('Error al obtener municipios', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original?.message,
      sql: error.sql,
    });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/idiomas
 * Obtener lista de idiomas activos
 * 
 * VERSIÓN DE PRUEBA: Usa consulta SQL directa para aislar problemas del contenedor
 */
export const getIdiomas = async (req, res, next) => {
  try {
    logger.debug('[Catalogs] Obteniendo idiomas...');
    
    // Usar repositorio directamente
    try {
      logger.debug('[Catalogs] Usando repositorio de idiomas...');
      const result = await languageRepository.findAll({}, null, null);
      logger.debug('[Catalogs] Resultado de findAll:', { 
        hasResult: !!result, 
        hasLanguages: !!(result?.languages),
        languagesCount: result?.languages?.length || 0,
        resultKeys: result ? Object.keys(result) : [],
        resultType: typeof result,
      });
      
      if (!result) {
        logger.warn('[Catalogs] Resultado de findAll es null o undefined');
        return res.status(200).json({
          success: true,
          data: [],
          message: 'Idiomas obtenidos correctamente (vacío)',
        });
      }
      
      const idiomas = (result.languages || []).map(idioma => ({
        id: idioma.id,
        nombre: idioma.name,
      }));

      return res.status(200).json({
        success: true,
        data: idiomas,
        message: 'Idiomas obtenidos correctamente',
      });
    } catch (repoError) {
      logger.warn('[Catalogs] Error con repositorio, intentando SQL directo:', {
        error: repoError.message,
        stack: repoError.stack,
      });
      
      // FALLBACK: Consulta SQL directa
      logger.debug('[Catalogs] Ejecutando consulta SQL directa...');
      const [results] = await sequelize.query(
        'SELECT id, nombre FROM idiomas WHERE activo = 1 ORDER BY nombre ASC',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      logger.debug('[Catalogs] Resultado SQL directo:', { 
        count: results?.length || 0,
        sample: results?.[0] 
      });
      
      const idiomas = (results || []).map(row => ({
        id: row.id,
        nombre: row.nombre,
      }));

      return res.status(200).json({
        success: true,
        data: idiomas,
        message: 'Idiomas obtenidos correctamente (modo fallback)',
        _debug: {
          method: 'sql_direct',
          originalError: repoError.message,
        },
      });
    }
  } catch (error) {
    logger.error('Error al obtener idiomas', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original?.message,
      sql: error.sql,
      sqlState: error.original?.sqlState,
      sqlCode: error.original?.code,
    });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/tipos-discapacidad
 * Obtener lista de tipos de discapacidad activos
 */
export const getTiposDiscapacidad = async (req, res, next) => {
  try {
    logger.debug('[Catalogs] Obteniendo tipos de discapacidad...');
    const result = await disabilityTypeRepository.findAll({}, null, null);
    logger.debug('[Catalogs] Resultado de findAll:', { 
      hasResult: !!result, 
      hasDisabilityTypes: !!(result?.disabilityTypes),
      disabilityTypesCount: result?.disabilityTypes?.length || 0,
      resultKeys: result ? Object.keys(result) : [],
      resultType: typeof result,
    });
    
    if (!result) {
      logger.warn('[Catalogs] Resultado de findAll es null o undefined');
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Tipos de discapacidad obtenidos correctamente (vacío)',
      });
    }
    
    const tipos = (result.disabilityTypes || []).map(tipo => ({
      id: tipo.id,
      nombre: tipo.name,
    }));

    res.status(200).json({
      success: true,
      data: tipos,
      message: 'Tipos de discapacidad obtenidos correctamente',
    });
  } catch (error) {
    logger.error('Error al obtener tipos de discapacidad', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original?.message,
      sql: error.sql,
      sqlState: error.original?.sqlState,
      sqlCode: error.original?.code,
    });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/documentacion-inscripcion
 * Obtener lista de documentos requeridos para inscripción
 * Query params: tipo (opcional) - Filtrar por tipo de documento (default: INSCRIPCION)
 */
export const getDocumentacionInscripcion = async (req, res, next) => {
  try {
    const { tipo = 'INSCRIPCION' } = req.query;
    logger.debug('[Catalogs] Obteniendo documentación de inscripción...', { tipo });
    
    // Usar repositorio para obtener documentos por tipo
    const documentos = await documentacionRepository.findByTipoDocumento(tipo, {
      includeInactive: false,
    });
    logger.debug('[Catalogs] Documentos encontrados:', { 
      tipo,
      total: documentos?.length || 0,
      isArray: Array.isArray(documentos),
    });
    
    if (!documentos || !Array.isArray(documentos)) {
      logger.warn('[Catalogs] Resultado de findByTipoDocumento no es un array válido');
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Documentos requeridos obtenidos correctamente (vacío)',
      });
    }
    
    logger.info('[Catalogs] Documentos de inscripción encontrados', {
      tipo,
      total: documentos.length,
      documentos: documentos.map(doc => ({
        id: doc.id,
        nombre: doc.name,
        tipoDocumento: doc.documentType,
        aceptaFotocopia: doc.acceptsPhotocopy,
        requerido: doc.required,
        orden: doc.order,
        descripcion: doc.description,
        activo: doc.active,
      })),
    });
    
    // Enviar TODOS los campos de la tabla documentacion al frontend
    const result = documentos.map(doc => ({
      id: doc.id,
      nombre: doc.name,
      tipoDocumento: doc.documentType,
      aceptaFotocopia: doc.acceptsPhotocopy,
      requerido: doc.required,
      orden: doc.order,
      descripcion: doc.description,
      // Incluir activo para debugging (aunque no se use en el formulario)
      activo: doc.active,
    }));

    res.status(200).json({
      success: true,
      data: result,
      message: 'Documentos requeridos obtenidos correctamente',
    });
  } catch (error) {
    logger.error('Error al obtener documentación de inscripción', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code,
      original: error.original?.message,
      sql: error.sql,
      tipo,
    });
    next(error);
  }
};

