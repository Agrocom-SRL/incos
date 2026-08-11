/**
 * Provider: alta/edición de un proyecto de grado (TIT · Titulación).
 *
 * Provider DELGADO (espejo de `CursoCapacitacionFormProvider`): ensambla la
 * ficha (solo edición, para precargar titular/integrantes), las mutaciones y
 * los catálogos reutilizados del plan — modalidades (T2) y carreras. El
 * catálogo de docentes y la asignación de tutor NO viven aquí (2026-08-11):
 * ese flujo es exclusivo de la ficha (`ProyectoGradoDetailProvider`,
 * `AsignarTutorModal`). La orquestación del formulario vive en
 * `useProyectoGradoFormPage`.
 */

import { useEffect, useMemo } from 'react';
import { useGetProyectoGrado } from '@application-titulacion/proyectos-grado/hooks/api/useGetProyectoGrado';
import { useProyectoGradoMutations } from '@application-titulacion/proyectos-grado/hooks/api/useProyectoGradoMutations';
import { useModalidadesGradoApi } from '@application-titulacion/proyectos-grado/hooks/api/useModalidadesGradoApi';
import { useCarrerasCatalogoTitApi } from '@application-titulacion/proyectos-grado/hooks/api/useCarrerasCatalogoTitApi';
import { ProyectoGradoFormContext } from '@application-titulacion/proyectos-grado/context/ProyectoGradoFormContext';

export const ProyectoGradoFormProvider = ({ children, proyectoId = null }) => {
  const { proyecto, loading: loadingProyecto, error: errorProyecto, cargar } = useGetProyectoGrado();
  const { saving, guardarProyecto } = useProyectoGradoMutations();
  const modalidades = useModalidadesGradoApi();
  const carrerasCatalogo = useCarrerasCatalogoTitApi();

  const id = proyectoId != null ? Number(proyectoId) : null;
  const idValido = id != null && Number.isFinite(id) && id > 0;

  // Solo el modo edición precarga la ficha (titular + integrantes incluidos).
  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      proyectoId: idValido ? id : null,
      proyecto,
      loadingProyecto: idValido ? loadingProyecto : false,
      errorProyecto,
      saving,
      guardarProyecto,
      // Catálogos
      modalidadOptions: modalidades.options,
      modalidadById: modalidades.modalidadById,
      loadingModalidades: modalidades.loading,
      carreras: carrerasCatalogo.carreras,
      loadingCarreras: carrerasCatalogo.loading,
      carrerasDisponible: carrerasCatalogo.disponible,
    }),
    [
      idValido,
      id,
      proyecto,
      loadingProyecto,
      errorProyecto,
      saving,
      guardarProyecto,
      modalidades,
      carrerasCatalogo,
    ],
  );

  return (
    <ProyectoGradoFormContext.Provider value={value}>
      {children}
    </ProyectoGradoFormContext.Provider>
  );
};
