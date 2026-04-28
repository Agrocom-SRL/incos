/**
 * Provider: búsqueda en cliente sobre la lista de docentes (todos los campos mapeados + IDs).
 */

import { useCallback, useMemo } from 'react';
import { useDocentesContext } from '@application-docentes/hooks';
import { useTableData } from '@molecules';
import { DocentesListContext } from '@application-docentes/context/DocentesListContext';
import docenteRepository from '@implementations/DocenteRepository';

/** Campos visibles y ocultos usados por el buscador (misma idea que admisión/becas). */
const collectDocenteSearchFields = (d) =>
  [
    d.nombreCompleto,
    d.ciCompleto,
    d.nombres,
    d.apellidoPaterno,
    d.apellidoMaterno,
    d.ci,
    d.expedicion,
    d.celular,
    d.telefono,
    d.emailPersonal,
    d.tituloProfesional,
    d.especialidad,
    d.nivelAcademico,
    d.tipoContrato,
    d.estadoLaboral,
    d.genero,
    d.nacionalidad,
    d.direccion,
    d.zona,
    d.observaciones,
    d.institucionEgreso,
    d.anioEgreso != null ? String(d.anioEgreso) : null,
    d.aniosExperiencia != null ? String(d.aniosExperiencia) : null,
    d.fechaContratacion,
    d.fechaRetiro,
    d.id != null ? String(d.id) : null,
    d.userId != null ? String(d.userId) : null,
    d.civilStatusId != null ? String(d.civilStatusId) : null,
  ].filter((v) => v != null && String(v).trim() !== '');

export const DocentesListProvider = ({ children }) => {
  const { docentes: docentesData, loading, error, refetch } = useDocentesContext();

  const getSearchFields = useMemo(() => (d) => collectDocenteSearchFields(d), []);

  const { searchText, setSearchText, filteredData } = useTableData(docentesData, getSearchFields);

  const deleteDocente = useCallback(async (id) => docenteRepository.eliminar(id), []);

  const value = {
    docentes: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    deleteDocente,
  };

  return <DocentesListContext.Provider value={value}>{children}</DocentesListContext.Provider>;
};
