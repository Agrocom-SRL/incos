/**
 * Hook: useEstudianteGeographicFormLogic
 * 
 * Single Responsibility: Gestionar la lógica específica del formulario geográfico de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Hook de lógica específica para campos geográficos de estudiantes
 * - Maneja limpieza de campos y carga de datos geográficos basados en cambios de campos
 * 
 * Este hook:
 * - Limpia campos cuando cambia tipoOrigen (BOLIVIANA/EXTRANJERA)
 * - Carga departamentos cuando se selecciona BOLIVIANA
 * - Carga provincias cuando cambia departamentoId
 * - Carga municipios cuando cambia provinciaId
 * - Limpia campos dependientes cuando cambian campos padre
 * 
 * Usado por: EstudiantesRegister (página específica)
 */

import { useEffect, useMemo } from 'react';
import { Form } from 'antd';

/**
 * Hook para gestionar la lógica del formulario geográfico de estudiantes
 * 
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Object} loaders - Objeto con funciones de carga
 * @param {Array} paises - Array de países para buscar Bolivia
 * @returns {void}
 */
export const useEstudianteGeographicFormLogic = (form, loaders, paises = []) => {
  const { loadDepartamentos, loadProvincias, loadMunicipios } = loaders || {};
  
  // Observar campos específicos para carga de datos y limpieza
  const tipoOrigen = Form.useWatch('tipoOrigen', form);
  const departamentoId = Form.useWatch('departamentoId', form);
  const provinciaId = Form.useWatch('provinciaId', form);

  // Encontrar el ID de Bolivia
  const boliviaId = useMemo(() => {
    const bolivia = paises.find(pais => {
      const codigoIso = pais.codigo_iso || pais.codigoIso || '';
      const nombre = pais.nombre || '';
      return codigoIso.toUpperCase() === 'BOL' || nombre.toUpperCase() === 'BOLIVIA';
    });
    return bolivia?.id || null;
  }, [paises]);

  // Limpiar campos y cargar datos cuando cambia tipoOrigen
  useEffect(() => {
    if (!tipoOrigen || !form) return;

    if (tipoOrigen === 'BOLIVIANA') {
      // Limpiar campos de extranjera
      form.setFieldsValue({
        paisId: undefined,
        ciudadNacimiento: undefined,
      });
      
      // Cargar todos los departamentos si hay una función de carga
      if (loadDepartamentos && typeof loadDepartamentos === 'function') {
        loadDepartamentos();
      }
    } else if (tipoOrigen === 'EXTRANJERA') {
      // Limpiar campos de boliviana
      form.setFieldsValue({
        departamentoId: undefined,
        provinciaId: undefined,
        municipioId: undefined,
        localidadComunidad: undefined,
      });
    }
  }, [tipoOrigen, form, loadDepartamentos, boliviaId]);

  // Cargar provincias cuando cambia departamentoId
  useEffect(() => {
    if (!form) return;
    
    // Si no hay departamento seleccionado, limpiar provincias y municipios
    if (!departamentoId) {
      // Limpiar campos de provincia y municipio
      form.setFieldsValue({
        provinciaId: undefined,
        municipioId: undefined,
      });
      // Limpiar listas de provincias y municipios
      if (loadProvincias && typeof loadProvincias === 'function') {
        loadProvincias(null); // Esto limpia las listas
      }
      if (loadMunicipios && typeof loadMunicipios === 'function') {
        loadMunicipios(null); // Esto limpia la lista de municipios
      }
      return;
    }
    
    // Si hay departamento, cargar provincias y limpiar dependientes
    if (loadProvincias && typeof loadProvincias === 'function') {
      loadProvincias(departamentoId);
      // Limpiar provincia y municipio cuando cambia el departamento
      form.setFieldsValue({
        provinciaId: undefined,
        municipioId: undefined,
      });
      // Limpiar lista de municipios explícitamente
      if (loadMunicipios && typeof loadMunicipios === 'function') {
        loadMunicipios(null);
      }
    }
  }, [departamentoId, loadProvincias, loadMunicipios, form]);

  // Cargar municipios cuando cambia provinciaId
  useEffect(() => {
    if (!provinciaId) return;
    
    if (loadMunicipios && typeof loadMunicipios === 'function') {
      loadMunicipios(provinciaId);
    }
  }, [provinciaId, loadMunicipios]);
};

