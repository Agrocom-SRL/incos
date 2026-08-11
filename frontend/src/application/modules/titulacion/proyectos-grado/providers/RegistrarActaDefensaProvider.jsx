/**
 * Provider: registrar el acta de defensa de un proyecto de grado (TIT ·
 * extensión 2026-08-11 — antes `RegistrarActaDefensaModal`, ahora página
 * propia: son muchos datos (fecha/hora, 3 miembros de tribunal, calificación
 * por integrante) para caber cómodo en un modal.
 *
 * Provider DELGADO (mismo patrón que `ProyectoGradoFormProvider`): solo la
 * ficha (título + integrantes activos + estado, para precargar/validar), el
 * catálogo de docentes (tribunal) y la mutación de registro — sin bitácora,
 * avances ni dictámenes, que no aplican a este formulario.
 */

import { useEffect, useMemo } from 'react';
import { useGetProyectoGrado } from '@application-titulacion/proyectos-grado/hooks/api/useGetProyectoGrado';
import { useDocentesCatalogoTitApi } from '@application-titulacion/proyectos-grado/hooks/api/useDocentesCatalogoTitApi';
import { useRegistrarActaDefensa } from '@application-titulacion/proyectos-grado/hooks/api/useRegistrarActaDefensa';
import { RegistrarActaDefensaContext } from '@application-titulacion/proyectos-grado/context/RegistrarActaDefensaContext';

export const RegistrarActaDefensaProvider = ({ children, proyectoId }) => {
  const { proyecto, loading, error, cargar } = useGetProyectoGrado();
  const docentesCatalogo = useDocentesCatalogoTitApi();
  const registrarActaDefensa = useRegistrarActaDefensa();

  const id = Number(proyectoId);
  const idValido = Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (!idValido) return;
    cargar(id);
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      proyectoId: idValido ? id : null,
      proyecto,
      loading,
      error: idValido ? error : 'Identificador de proyecto inválido',
      docentesCatalogo,
      registrarActaDefensa,
    }),
    [idValido, id, proyecto, loading, error, docentesCatalogo, registrarActaDefensa]
  );

  return (
    <RegistrarActaDefensaContext.Provider value={value}>
      {children}
    </RegistrarActaDefensaContext.Provider>
  );
};
