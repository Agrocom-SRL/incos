/**
 * Controller para catálogos
 * Endpoints simples para obtener datos de catálogos (carreras, gestiones, municipios, etc.)
 * 
 * NOTA: Implementación directa - importa repositorios directamente sin contenedor DI
 */

import { logger } from '../../shared/logger.js';
import { sequelize } from '../../infrastructure/database/config/sequelize.js';

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
      careersCount: result?.careers?.length || 0 
    });
    
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
  try {
    logger.debug('[Catalogs] Obteniendo gestiones...');
    const result = await managementRepository.findAll({}, null, null);
    logger.debug('[Catalogs] Resultado de findAll:', { 
      hasResult: !!result, 
      hasManagements: !!(result?.managements),
      managementsCount: result?.managements?.length || 0 
    });
    
    const gestiones = (result.managements || []).map(gestion => ({
      id: gestion.id,
      codigo: gestion.code,
      anio: gestion.year,
    }));

    res.status(200).json({
      success: true,
      data: gestiones,
      message: 'Gestiones obtenidas correctamente',
    });
  } catch (error) {
    logger.error('Error al obtener gestiones', { 
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
      countriesCount: result?.countries?.length || 0 
    });
    
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
    
    let result;
    if (provinciaId) {
      // Filtrar por provincia usando el método específico del repositorio
      result = await municipalityRepository.findByProvinciaId(parseInt(provinciaId));
    } else {
      // Obtener todos los municipios
      result = await municipalityRepository.findAll({}, null, null);
    }
    
    const municipios = (result.municipalities || result || []).map(municipio => ({
      id: municipio.id,
      nombre: municipio.name,
      provinciaId: municipio.provinceId,
      codigo: municipio.code,
    }));

    res.status(200).json({
      success: true,
      data: municipios,
      message: 'Municipios obtenidos correctamente',
    });
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
    logger.debug('[Catalogs] Obteniendo idiomas (modo prueba - SQL directo)...');
    
    // Usar repositorio directamente
    try {
      logger.debug('[Catalogs] Usando repositorio de idiomas...');
      const result = await languageRepository.findAll({}, null, null);
      logger.debug('[Catalogs] Resultado de findAll:', { 
        hasResult: !!result, 
        hasLanguages: !!(result?.languages),
        languagesCount: result?.languages?.length || 0 
      });
      
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
      disabilityTypesCount: result?.disabilityTypes?.length || 0 
    });
    
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
      total: documentos?.length || 0 
    });
    
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
        activo: doc.activo,
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
      activo: doc.activo,
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

