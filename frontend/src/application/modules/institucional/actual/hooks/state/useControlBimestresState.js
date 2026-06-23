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
import { buildBimestresApertura } from '../../utils/bimestresApertura.js';
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
    abrirBimestreGestion,
  } = useGestionActivacionApi();
  const { fetchPeriodos, actualizarFechasPeriodo, crearEtapaPeriodo, eliminarEtapaPeriodo } =
    usePeriodosGestionApi();

  const [loading, setLoading] = useState(true);
  const [estadoPayload, setEstadoPayload] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [abriendo, setAbriendo] = useState(false);
  // Número del bimestre sobre el que se ejecuta abrir/cerrar (para spinner por fila).
  const [bimestreEnAccion, setBimestreEnAccion] = useState(null);
  // Validación de cierre indexada por número de bimestre.
  const [validacionPorBimestre, setValidacionPorBimestre] = useState({});
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

  // Filas de la sección "Apertura y cierre de bimestres": estado de calendario
  // (por fecha) + estado institucional + habilitación de cada acción.
  const bimestresApertura = useMemo(
    () =>
      buildBimestresApertura(estadoPayload?.bimestres ?? [], {
        iniciada: Boolean(estadoPayload?.gestionIniciada),
      }),
    [estadoPayload],
  );

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
  const ejecutarIniciarGestion = useCallback(async () => {
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
  }, [iniciarGestionAcademica, message, cargar]);

  const handleIniciarGestion = useCallback(() => {
    if (estado.iniciada) return;
    // Sin diálogo de confirmación: solo el modal de progreso bloqueante
    // (IniciarGestionProgressModal) mientras `iniciando` es true.
    ejecutarIniciarGestion();
  }, [estado.iniciada, ejecutarIniciarGestion]);

  // Valida si un bimestre puede cerrarse (cursos con notas faltantes). Acepta un
  // número explícito; si se omite, usa el bimestre vigente (compatibilidad).
  const handleValidarCierre = useCallback(
    async (numero = bimestreVigente) => {
      if (!numero) return;
      const result = await validarCierreBimestre(numero);
      if (result.success) {
        setValidacion(result.data);
        setValidacionPorBimestre((prev) => ({ ...prev, [numero]: result.data }));
      } else {
        message.error(result.error || 'No se pudo validar el cierre del bimestre.');
      }
    },
    [bimestreVigente, validarCierreBimestre, message],
  );

  // Cierra un bimestre (EN_CURSO → CERRADO). Acepta un número explícito; si se
  // omite, usa el bimestre vigente (compatibilidad con la pantalla anterior).
  const handleCerrarBimestre = useCallback(
    (numero = bimestreVigente) => {
      if (!numero) return;
      modal.confirm({
        title: `Cerrar bimestre ${numero}`,
        content:
          'Se consolidará el bimestre y se habilitará el siguiente. Se validará que no haya ' +
          'notas pendientes. ¿Continuar?',
        okText: 'Cerrar bimestre',
        cancelText: 'Cancelar',
        onOk: async () => {
          setCerrando(true);
          setBimestreEnAccion(numero);
          try {
            const result = await cerrarBimestreGestion(numero);
            if (result.success) {
              const cerrados = result.data?.cerrados ?? 0;
              message.success(`Bimestre ${numero} cerrado (${cerrados} cursos).`);
              setValidacion(null);
              setValidacionPorBimestre((prev) => {
                const next = { ...prev };
                delete next[numero];
                return next;
              });
              await cargar();
            } else if (result.code === 'CIERRE_BLOQUEADO') {
              setValidacion(result.validacion ?? null);
              setValidacionPorBimestre((prev) => ({
                ...prev,
                [numero]: result.validacion ?? null,
              }));
              message.error('Hay cursos con notas pendientes que impiden el cierre.');
            } else {
              message.error(result.error || 'No se pudo cerrar el bimestre.');
            }
          } finally {
            setCerrando(false);
            setBimestreEnAccion(null);
          }
        },
      });
    },
    [bimestreVigente, modal, message, cerrarBimestreGestion, cargar],
  );

  // Abre un bimestre (PENDIENTE → EN_CURSO). El backend bloquea con
  // BIMESTRE_FUTURO si la fecha de inicio del calendario aún no llegó.
  const handleAbrirBimestre = useCallback(
    (numero) => {
      if (!numero) return;
      modal.confirm({
        title: `Abrir bimestre ${numero}`,
        content:
          'Se habilitará el registro de calificaciones del bimestre para todos los cursos ' +
          'de la gestión. ¿Continuar?',
        okText: 'Abrir bimestre',
        cancelText: 'Cancelar',
        onOk: async () => {
          setAbriendo(true);
          setBimestreEnAccion(numero);
          try {
            const result = await abrirBimestreGestion(numero);
            if (result.success) {
              const abiertos = result.data?.abiertos ?? 0;
              message.success(`Bimestre ${numero} abierto (${abiertos} cursos).`);
              await cargar();
            } else if (result.code === 'BIMESTRE_FUTURO') {
              message.warning(
                result.error || `El bimestre ${numero} aún no inicia según el calendario.`,
              );
            } else {
              message.error(result.error || 'No se pudo abrir el bimestre.');
            }
          } finally {
            setAbriendo(false);
            setBimestreEnAccion(null);
          }
        },
      });
    },
    [modal, message, abrirBimestreGestion, cargar],
  );

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
    abriendo,
    bimestreEnAccion,
    validacion,
    validacionPorBimestre,
    bimestresApertura,
    handleIniciarGestion,
    handleValidarCierre,
    handleCerrarBimestre,
    handleAbrirBimestre,
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
