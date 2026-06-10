/**
 * Estado de la página Control de bimestres (configuración del ciclo lectivo).
 *
 * Responsabilidades:
 * - Estado de activación de la gestión (iniciar / cerrar bimestre).
 * - Configuración de periodos/etapas: edición de fechas (con preview en vivo en el
 *   calendario anual) y CRUD de etapas no estructurales.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGestionActivacionApi } from '../api/useGestionActivacionApi.js';
import { usePeriodosGestionApi } from '../api/usePeriodosGestionApi.js';
import { gestionActivacionStatus } from '../../utils/gestionActivacionStatus.js';
import { resolverFaseGestion } from '../../utils/resolverFaseGestion.js';
import { mapPeriodoLectura, anioDelCalendario } from '../../utils/periodosCalendario.js';
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
  const { fetchPeriodos, actualizarFechasPeriodo, crearEtapaPeriodo, eliminarEtapaPeriodo } =
    usePeriodosGestionApi();

  const [loading, setLoading] = useState(true);
  const [estadoPayload, setEstadoPayload] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [validacion, setValidacion] = useState(null);

  // Configuración de periodos
  const [gestion, setGestion] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [dirtyIds, setDirtyIds] = useState(() => new Set());
  const [guardando, setGuardando] = useState(false);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [estadoRes, periodosRes] = await Promise.all([
        fetchEstadoActivacion(),
        fetchPeriodos(),
      ]);
      setEstadoPayload(estadoRes?.success ? estadoRes.data : estadoRes?.data ?? null);
      if (periodosRes?.success && periodosRes.data) {
        setGestion(periodosRes.data.gestion ?? null);
        setPeriodos((periodosRes.data.periodos ?? []).map(mapPeriodoLectura));
        setDirtyIds(new Set());
      }
    } finally {
      setLoading(false);
    }
  }, [fetchEstadoActivacion, fetchPeriodos]);

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

  const anioCalendario = useMemo(() => anioDelCalendario(gestion), [gestion]);

  // --- Edición de fechas de periodos -----------------------------------------
  const setRangoPeriodo = useCallback((id, fechaInicio, fechaFin) => {
    setPeriodos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, fechaInicio, fechaFin } : p)),
    );
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const guardarFechas = useCallback(async () => {
    if (dirtyIds.size === 0) return;
    setGuardando(true);
    try {
      const objetivos = periodos.filter((p) => dirtyIds.has(p.id));
      const resultados = await Promise.all(
        objetivos.map((p) =>
          actualizarFechasPeriodo(p.id, { fechaInicio: p.fechaInicio, fechaFin: p.fechaFin }),
        ),
      );
      const fallidos = resultados.filter((r) => !r.success);
      if (fallidos.length === 0) {
        message.success('Fechas actualizadas correctamente.');
        await cargar();
      } else {
        message.error(fallidos[0].error || 'No se pudieron guardar todas las fechas.');
      }
    } finally {
      setGuardando(false);
    }
  }, [dirtyIds, periodos, actualizarFechasPeriodo, message, cargar]);

  // --- CRUD de etapas --------------------------------------------------------
  const crearEtapa = useCallback(
    async (payload) => {
      setCreando(true);
      try {
        const result = await crearEtapaPeriodo(payload);
        if (result.success) {
          message.success('Etapa creada.');
          await cargar();
          return true;
        }
        message.error(result.error || 'No se pudo crear la etapa.');
        return false;
      } finally {
        setCreando(false);
      }
    },
    [crearEtapaPeriodo, message, cargar],
  );

  const eliminarEtapa = useCallback(
    (periodo) => {
      modal.confirm({
        title: `Eliminar etapa “${periodo.nombre}”`,
        content: 'La etapa se quitará del calendario. Las actividades asociadas no se borran.',
        okText: 'Eliminar',
        okButtonProps: { danger: true },
        cancelText: 'Cancelar',
        onOk: async () => {
          const result = await eliminarEtapaPeriodo(periodo.id);
          if (result.success) {
            message.success('Etapa eliminada.');
            await cargar();
          } else {
            message.error(result.error || 'No se pudo eliminar la etapa.');
          }
        },
      });
    },
    [modal, message, eliminarEtapaPeriodo, cargar],
  );

  // --- Activación / cierre (existente) ---------------------------------------
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
    // activación
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
    // configuración de periodos
    gestion,
    periodos,
    anioCalendario,
    dirtyCount: dirtyIds.size,
    guardando,
    creando,
    setRangoPeriodo,
    guardarFechas,
    crearEtapa,
    eliminarEtapa,
    // navegación
    breadcrumbItems,
    pageTitle: 'Control de bimestres',
    goToPanel: useCallback(() => navigate(actualPaths.root()), [navigate]),
  };
}
