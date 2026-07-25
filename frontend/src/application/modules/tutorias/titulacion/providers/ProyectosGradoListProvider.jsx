/**
 * Provider: lista de proyectos de grado (TUT · Titulación).
 *
 * Espejo de `CursosCapacitacionListProvider` (CAP): ensambla el hook de API
 * con `useServerPaginatedList` en modo `loadAll` (universo pequeño: orden,
 * filtros y paginación en cliente; búsqueda server-side con debounce) y
 * publica las mutaciones de la tabla (eliminar) más el catálogo de
 * modalidades para el filtro. Provider DELGADO: solo ensambla.
 */

import { useMemo } from 'react';
import { useProyectosGradoApi } from '@application-tutorias/titulacion/hooks/api/useProyectosGradoApi';
import { useProyectoGradoMutations } from '@application-tutorias/titulacion/hooks/api/useProyectoGradoMutations';
import { useModalidadesGradoApi } from '@application-tutorias/titulacion/hooks/api/useModalidadesGradoApi';
import { useServerPaginatedList } from '@application/utils';
import { ProyectosGradoListContext } from '@application-tutorias/titulacion/context/ProyectosGradoListContext';

export const ProyectosGradoListProvider = ({ children }) => {
  const { fetch: fetchProyectos } = useProyectosGradoApi();
  const { eliminarProyecto } = useProyectoGradoMutations();
  const { options: modalidadOptions, loading: loadingModalidades } = useModalidadesGradoApi();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchProyectos,
    loadAll: true,
    buildRequest: ({ page, limit, search }) => ({
      params: { page, limit, search: search || undefined },
    }),
  });

  const value = useMemo(
    () => ({
      proyectos: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      eliminarProyecto,
      modalidadOptions,
      loadingModalidades,
    }),
    [
      rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      eliminarProyecto,
      modalidadOptions,
      loadingModalidades,
    ],
  );

  return (
    <ProyectosGradoListContext.Provider value={value}>
      {children}
    </ProyectosGradoListContext.Provider>
  );
};
