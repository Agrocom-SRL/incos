/**
 * Estado de la página Control de bimestres (acciones de Gestión actual).
 *
 * Acciones:
 * - Iniciar gestión académica (INSCRITO → CURSANDO + bimestres) si no está iniciada.
 * - Cerrar el bimestre vigente (valida notas faltantes; el cierre efectivo en backend
 *   está en preparación, por lo que se informa al usuario).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGestionActivacionApi } from '../api/useGestionActivacionApi.js';
import { gestionActivacionStatus } from '../../utils/gestionActivacionStatus.js';
import { resolverFaseGestion } from '../../utils/resolverFaseGestion.js';
import { actualPaths } from '../../config/paths.js';

export function useControlBimestresState() {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const {
    iniciando,
    fetchEstadoActivacion,
    iniciarGestionAcademica,
    validarCierreBimestre,
    cerrarBimestreGestion,
  } = useGestionActivacionApi();

  const [loading, setLoading] = useState(true);
  const [estadoPayload, setEstadoPayload] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [validacion, setValidacion] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchEstadoActivacion();
      setEstadoPayload(result?.success ? result.data : result?.data ?? null);
    } finally {
      setLoading(false);
    }
  }, [fetchEstadoActivacion]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const estado = useMemo(() => gestionActivacionStatus(estadoPayload), [estadoPayload]);
  const bimestreVigente = estadoPayload?.bimestreVigente ?? null;
  const fase = useMemo(
    () =>
      resolverFaseGestion({
        gestionIniciada: Boolean(estadoPayload?.gestionIniciada),
        bimestres: estadoPayload?.bimestres ?? [],
        bimestreVigente,
      }),
    [estadoPayload, bimestreVigente],
  );

  const handleIniciarGestion = useCallback(() => {
    if (estado.iniciada) return;
    modal.confirm({
      title: 'Iniciar gestión académica',
      content:
        'Se activará el cursado de toda la gestión vigente: las matrículas pasarán a ' +
        'CURSANDO y se abrirán los 4 bimestres. Esta acción no se puede deshacer. ¿Continuar?',
      okText: 'Activar cursado',
      cancelText: 'Cancelar',
      onOk: async () => {
        const result = await iniciarGestionAcademica();
        if (result.success) {
          message.success('Gestión académica iniciada. El cursado está activo.');
          await cargar();
        } else if (result.code === 'GESTION_YA_INICIADA') {
          message.info('La gestión académica ya estaba iniciada.');
          await cargar();
        } else {
          message.error(result.error || 'No se pudo iniciar la gestión académica.');
        }
      },
    });
  }, [estado.iniciada, modal, message, iniciarGestionAcademica, cargar]);

  const handleValidarCierre = useCallback(async () => {
    if (!bimestreVigente) return;
    const result = await validarCierreBimestre(bimestreVigente);
    if (result.success) {
      setValidacion(result.data);
    } else {
      message.error(result.error || 'No se pudo validar el cierre del bimestre.');
    }
  }, [bimestreVigente, validarCierreBimestre, message]);

  const handleCerrarBimestre = useCallback(() => {
    if (!bimestreVigente) return;
    modal.confirm({
      title: `Cerrar bimestre ${bimestreVigente}`,
      content:
        'Se consolidará el bimestre y se habilitará el siguiente. Se validará que no haya ' +
        'notas pendientes. ¿Continuar?',
      okText: 'Cerrar bimestre',
      cancelText: 'Cancelar',
      onOk: async () => {
        setCerrando(true);
        try {
          const result = await cerrarBimestreGestion(bimestreVigente);
          if (result.success && result.data?.preparacion) {
            message.info('El cierre de bimestre está en preparación en el servidor.');
          } else if (result.success) {
            message.success(`Bimestre ${bimestreVigente} cerrado.`);
            await cargar();
          } else if (result.code === 'CIERRE_BLOQUEADO') {
            setValidacion(result.validacion ?? null);
            message.error('Hay cursos con notas pendientes que impiden el cierre.');
          } else {
            message.error(result.error || 'No se pudo cerrar el bimestre.');
          }
        } finally {
          setCerrando(false);
        }
      },
    });
  }, [bimestreVigente, modal, message, cerrarBimestreGestion, cargar]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Gestión actual', href: actualPaths.root() },
      { title: 'Control de bimestres' },
    ],
    [],
  );

  return {
    loading,
    iniciada: estado.iniciada,
    estadoLabel: estado.estadoLabel,
    estadoColor: estado.estadoColor,
    bimestreVigente,
    fase,
    iniciando,
    cerrando,
    validacion,
    handleIniciarGestion,
    handleValidarCierre,
    handleCerrarBimestre,
    breadcrumbItems,
    pageTitle: 'Control de bimestres',
    goToPanel: useCallback(() => navigate(actualPaths.root()), [navigate]),
  };
}
