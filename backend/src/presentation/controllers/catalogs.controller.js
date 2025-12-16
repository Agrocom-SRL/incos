/**
 * Controller para catálogos
 * Endpoints simples para obtener datos de catálogos (carreras, gestiones, municipios, etc.)
 * 
 * NOTA: Implementación rápida para presentación - usa repositorios directamente
 */

import { logger } from '../../shared/logger.js';
import container from '../../infrastructure/container/index.js';

/**
 * GET /api/v1/catalogs/carreras
 * Obtener lista de carreras activas
 */
export const getCarreras = async (req, res, next) => {
  try {
    const careerRepository = container.resolve('careerRepository');
    const result = await careerRepository.findAll({}, null, null);
    
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
    logger.error('Error al obtener carreras', { error: error.message, stack: error.stack });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/gestiones
 * Obtener lista de gestiones activas
 */
export const getGestiones = async (req, res, next) => {
  try {
    const managementRepository = container.resolve('managementRepository');
    const result = await managementRepository.findAll({}, null, null);
    
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
    logger.error('Error al obtener gestiones', { error: error.message, stack: error.stack });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/paises
 * Obtener lista de países activos
 */
export const getPaises = async (req, res, next) => {
  try {
    const countryRepository = container.resolve('countryRepository');
    const result = await countryRepository.findAll({}, null, null);
    
    const paises = (result.countries || []).map(pais => ({
      id: pais.id,
      nombre: pais.name,
      codigo: pais.code,
      codigoIso: pais.isoCode,
    }));

    res.status(200).json({
      success: true,
      data: paises,
      message: 'Países obtenidos correctamente',
    });
  } catch (error) {
    logger.error('Error al obtener países', { error: error.message, stack: error.stack });
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
    const departmentRepository = container.resolve('departmentRepository');
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
    logger.error('Error al obtener departamentos', { error: error.message, stack: error.stack });
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
    const provinceRepository = container.resolve('provinceRepository');
    const { departamentoId } = req.query;
    
    let result;
    if (departamentoId) {
      // Filtrar por departamento usando el método específico del repositorio
      result = await provinceRepository.findByDepartamentoId(parseInt(departamentoId));
    } else {
      // Obtener todas las provincias
      result = await provinceRepository.findAll({}, null, null);
    }
    
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
    logger.error('Error al obtener provincias', { error: error.message, stack: error.stack });
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
    const municipalityRepository = container.resolve('municipalityRepository');
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
    logger.error('Error al obtener municipios', { error: error.message, stack: error.stack });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/idiomas
 * Obtener lista de idiomas activos
 */
export const getIdiomas = async (req, res, next) => {
  try {
    const languageRepository = container.resolve('languageRepository');
    const result = await languageRepository.findAll({}, null, null);
    
    const idiomas = (result.languages || []).map(idioma => ({
      id: idioma.id,
      nombre: idioma.name,
    }));

    res.status(200).json({
      success: true,
      data: idiomas,
      message: 'Idiomas obtenidos correctamente',
    });
  } catch (error) {
    logger.error('Error al obtener idiomas', { error: error.message, stack: error.stack });
    next(error);
  }
};

/**
 * GET /api/v1/catalogs/tipos-discapacidad
 * Obtener lista de tipos de discapacidad activos
 */
export const getTiposDiscapacidad = async (req, res, next) => {
  try {
    const disabilityTypeRepository = container.resolve('disabilityTypeRepository');
    const result = await disabilityTypeRepository.findAll({}, null, null);
    
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
    logger.error('Error al obtener tipos de discapacidad', { error: error.message, stack: error.stack });
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
    const documentacionRepository = container.resolve('documentacionRepository');
    
    // Usar repositorio para obtener documentos por tipo
    const documentos = await documentacionRepository.findByTipoDocumento(tipo, {
      includeInactive: false,
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
    logger.error('Error al obtener documentación de inscripción', { error: error.message, stack: error.stack });
    next(error);
  }
};

