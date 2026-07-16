/**
 * Provider: inscribir participante a un curso de capacitación (CAP).
 *
 * Espejo de `PagosRegistrarProvider` (Finanzas): ensambla la búsqueda de
 * participantes, el catálogo de cursos activos, los catálogos de pago
 * COMPARTIDOS (`usePaymentCatalogsApi`, no se reimplementa el fetch) y la
 * mutación de inscripción. La orquestación de pantalla (modo nuevo/existente,
 * pago inicial, submit) vive en `useInscribirParticipantePage`.
 */

import { useMemo } from 'react';
import { useBuscarParticipantes } from '@application-capacitacion/inscripciones/hooks/api/useBuscarParticipantes';
import { useCursosCapacitacionOptions } from '@application-capacitacion/inscripciones/hooks/api/useCursosCapacitacionOptions';
import { useInscripcionCapacitacionMutations } from '@application-capacitacion/inscripciones/hooks/api/useInscripcionCapacitacionMutations';
import { usePaymentCatalogsApi } from '@application-finanzas/hooks/api/usePaymentCatalogsApi';
import { InscribirParticipanteContext } from '@application-capacitacion/inscripciones/context/InscribirParticipanteContext';

export const InscribirParticipanteProvider = ({ children }) => {
  const busqueda = useBuscarParticipantes();
  const cursosOptions = useCursosCapacitacionOptions();
  const mutations = useInscripcionCapacitacionMutations();
  const catalogos = usePaymentCatalogsApi();

  const value = useMemo(
    () => ({
      // Búsqueda de participantes existentes
      participantes: busqueda.participantes,
      loadingBusqueda: busqueda.loading,
      errorBusqueda: busqueda.error,
      buscarParticipantes: busqueda.buscar,
      limpiarBusqueda: busqueda.limpiar,
      // Cursos activos disponibles
      cursos: cursosOptions.cursos,
      loadingCursos: cursosOptions.loading,
      errorCursos: cursosOptions.error,
      // Catálogos de pago (compartidos con Finanzas)
      metodosPago: catalogos.metodosPago,
      cuentasPago: catalogos.cuentasPago,
      loadingCatalogos: catalogos.loading,
      errorCatalogos: catalogos.error,
      // Mutación
      inscribir: mutations.inscribir,
      inscribiendo: mutations.inscribiendo,
    }),
    [busqueda, cursosOptions, catalogos, mutations],
  );

  return (
    <InscribirParticipanteContext.Provider value={value}>
      {children}
    </InscribirParticipanteContext.Provider>
  );
};
