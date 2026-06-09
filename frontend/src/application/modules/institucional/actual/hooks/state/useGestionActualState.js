/**
 * Estado de la pantalla Institucional → Gestión actual.
 *
 * Muestra la gestión vigente y su estado de activación del cursado, y permite
 * iniciar la gestión académica (activación masiva INSCRITO → CURSANDO + bimestres).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useGestionActivacionApi } from '../api/useGestionActivacionApi.js';
import { gestionActivacionStatus } from '../../utils/gestionActivacionStatus.js';

export function useGestionActualState() {
  const { modal, message } = App.useApp();
  const {
    loading,
    iniciando,
    fetchGestionVigente,
    fetchEstadoActivacion,
    iniciarGestionAcademica,
  } = useGestionActivacionApi();

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [error, setError] = useState(null);
  const [gestionVigente, setGestionVigente] = useState(null);
  const [estado, setEstado] = useState(gestionActivacionStatus(null));

  const cargarEstado = useCallback(async () => {
    const estadoResult = await fetchEstadoActivacion();
    // obtenerGestionBimestres() → { success, data } | { success:false, error } | null
    const data = estadoResult?.success ? estadoResult.data : estadoResult?.data ?? null;
    setEstado(gestionActivacionStatus(data));
    return data;
  }, [fetchEstadoActivacion]);

  const cargar = useCallback(async () => {
    setCargandoInicial(true);
    setError(null);
    try {
      const vigenteResult = await fetchGestionVigente();
      if (!vigenteResult.success) {
        setError(vigenteResult.error || 'No se pudo cargar la gestión vigente.');
      } else {
        setGestionVigente(vigenteResult.data);
      }
      await cargarEstado();
    } finally {
      setCargandoInicial(false);
    }
  }, [fetchGestionVigente, cargarEstado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleActivarCursado = useCallback(() => {
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
          await cargarEstado();
        } else if (result.code === 'GESTION_YA_INICIADA') {
          message.info('La gestión académica ya estaba iniciada.');
          await cargarEstado();
        } else {
          message.error(result.error || 'No se pudo iniciar la gestión académica.');
        }
      },
    });
  }, [estado.iniciada, modal, message, iniciarGestionAcademica, cargarEstado]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Gestión actual' },
    ],
    [],
  );

  return {
    loading: cargandoInicial || loading,
    error,
    gestionVigente,
    iniciada: estado.iniciada,
    estadoLabel: estado.estadoLabel,
    estadoColor: estado.estadoColor,
    matriculasCursando: estado.matriculasCursando,
    iniciando,
    handleActivarCursado,
    breadcrumbItems,
    pageTitle: 'Gestión actual',
  };
}
