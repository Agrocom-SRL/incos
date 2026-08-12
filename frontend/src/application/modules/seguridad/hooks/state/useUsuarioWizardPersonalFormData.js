/**
 * Catálogos y cascada geográfica (departamento → provincia → municipio) para la ficha personal
 * del wizard de alta de usuario (SEG), reutilizando los mismos hooks de datos que el registro de estudiantes.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Form } from 'antd';
import { useStudentCatalogApi, useStudentGeographicApi } from '@application-matricula/admision/hooks/api';
import { transformToOptions } from '@application/utils';
import { EXPEDICIONES } from '@infrastructure/config/constants';

/**
 * @param {import('antd').FormInstance} form
 * @returns {{ resolveOptions: (key: string) => Array<{label: string, value: unknown}>, catalogLoading: boolean }}
 */
export function useUsuarioWizardPersonalFormData(form) {
  const catalog = useStudentCatalogApi(0);
  const geo = useStudentGeographicApi();

  const { estadosCiviles = [], generos = [], loading: catalogLoading } = catalog;

  const {
    departamentos = [],
    provincias = [],
    municipios = [],
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
  } = geo;

  useEffect(() => {
    loadDepartamentos();
  }, [loadDepartamentos]);

  const depId = Form.useWatch(['personal', 'departamentoId'], form);
  const provId = Form.useWatch(['personal', 'provinciaId'], form);

  const depInitRef = useRef(false);
  const prevDepIdRef = useRef(undefined);

  useEffect(() => {
    if (!form) return;
    if (!depInitRef.current) {
      depInitRef.current = true;
      prevDepIdRef.current = depId;
      loadProvincias(depId || null, 'origen');
      const initialProv = form.getFieldValue(['personal', 'provinciaId']);
      if (initialProv) {
        loadMunicipios(initialProv, 'origen');
      } else {
        loadMunicipios(null, 'origen');
      }
      return;
    }
    if (prevDepIdRef.current === depId) {
      return;
    }
    prevDepIdRef.current = depId;
    if (depId) {
      loadProvincias(depId, 'origen');
    } else {
      loadProvincias(null, 'origen');
    }
    form.setFieldValue(['personal', 'provinciaId'], undefined);
    form.setFieldValue(['personal', 'municipalityId'], undefined);
    loadMunicipios(null, 'origen');
  }, [depId, form, loadProvincias, loadMunicipios]);

  const provInitRef = useRef(false);
  const prevProvIdRef = useRef(undefined);

  useEffect(() => {
    if (!form) return;
    if (!provInitRef.current) {
      provInitRef.current = true;
      prevProvIdRef.current = provId;
      if (provId) {
        loadMunicipios(provId, 'origen');
      } else {
        loadMunicipios(null, 'origen');
      }
      return;
    }
    if (prevProvIdRef.current === provId) {
      return;
    }
    prevProvIdRef.current = provId;
    if (provId) {
      loadMunicipios(provId, 'origen');
    } else {
      loadMunicipios(null, 'origen');
    }
    form.setFieldValue(['personal', 'municipalityId'], undefined);
  }, [provId, form, loadMunicipios]);

  const resolveOptions = useMemo(
    () => (key) => {
      switch (key) {
        case 'expediciones':
          return transformToOptions('generic', EXPEDICIONES);
        case 'estadosCiviles':
          return transformToOptions('generic', estadosCiviles);
        case 'generos':
          return transformToOptions('generic', generos);
        case 'departamentos':
          return transformToOptions('generic', departamentos);
        case 'provincias':
          return transformToOptions('generic', provincias);
        case 'municipios':
          return transformToOptions('generic', municipios);
        default:
          return [];
      }
    },
    [estadosCiviles, generos, departamentos, provincias, municipios]
  );

  return { resolveOptions, catalogLoading };
}
