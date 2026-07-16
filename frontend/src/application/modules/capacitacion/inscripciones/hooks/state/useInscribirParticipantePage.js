/**
 * Hook de pantalla: inscribir participante a un curso de capacitación
 * (CAP · capacitacion.inscripcion CREAR).
 *
 * Espejo de `usePagosRegistrarPage` (Finanzas): flujo INLINE completo —
 * participante (existente por búsqueda O nuevo con datos mínimos) → curso →
 * pago inicial OPCIONAL (switch) → submit en UNA transacción del backend
 * (`createInscripcionCapacitacionValidator`: participanteId XOR participante,
 * capacitacionId, pagoInicial?).
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useInscribirParticipanteContext } from '@application-capacitacion/inscripciones/hooks/context/useInscribirParticipanteContext';
import { mapFormValuesToPagoPayload } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';
import { mapFormValuesToParticipantePayload } from '@application-capacitacion/participantes/mappers/participanteMapper';
import {
  buildReglasMetodo,
  findMetodoCodigo,
} from '@finanzas/pagos/config/registrarFormConfig';
import {
  INSCRIPCIONES_CAP_LIST_PATH,
  CAP_INSCRIPCIONES_MENU_KEY,
  inscripcionCapDetallePath,
} from '@application-capacitacion/config/paths';

const DURACION_MENSAJE_ERROR = 8;

/** Modo del paso participante: buscar uno existente o registrar uno nuevo. */
export const MODO_PARTICIPANTE = { EXISTENTE: 'existente', NUEVO: 'nuevo' };

export const useInscribirParticipantePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const {
    participantes,
    loadingBusqueda,
    errorBusqueda,
    buscarParticipantes,
    limpiarBusqueda,
    cursos,
    loadingCursos,
    errorCursos,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
    inscribir,
    inscribiendo,
  } = useInscribirParticipanteContext();

  /** Modo participante (existente/nuevo), selección y estado del pago inicial. */
  const [modoParticipante, setModoParticipante] = useState(MODO_PARTICIPANTE.EXISTENTE);
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState(null);
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [conPagoInicial, setConPagoInicial] = useState(false);
  const [metodoPagoId, setMetodoPagoId] = useState(null);

  const returnListPath = location.state?.returnListPath || INSCRIPCIONES_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_INSCRIPCIONES_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Inscripciones', href: returnListPath },
      { title: 'Inscribir participante' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  /** Cambia entre "existente" y "nuevo" (limpia selección y búsqueda). */
  const handleModoParticipanteChange = useCallback(
    (modo) => {
      setModoParticipante(modo);
      setParticipanteSeleccionado(null);
      limpiarBusqueda();
    },
    [limpiarBusqueda],
  );

  const handleSeleccionarParticipante = useCallback((participante) => {
    if (!participante?.id) return;
    setParticipanteSeleccionado(participante);
  }, []);

  const handleCambiarParticipante = useCallback(() => {
    setParticipanteSeleccionado(null);
    limpiarBusqueda();
  }, [limpiarBusqueda]);

  /** Curso elegido en el Select (para el resumen de costo/cupo/horarios). */
  const cursoSeleccionado = useMemo(
    () => cursos.find((c) => c.id === cursoSeleccionadoId) ?? null,
    [cursos, cursoSeleccionadoId],
  );

  const handleCursoChange = useCallback((value) => {
    setCursoSeleccionadoId(value ?? null);
  }, []);

  /** Toggle del pago inicial (opcional); al apagarlo limpia sus campos. */
  const handleConPagoInicialChange = useCallback(
    (checked) => {
      setConPagoInicial(checked);
      if (!checked) {
        setMetodoPagoId(null);
        form.setFieldsValue({
          monto: undefined,
          fechaPago: undefined,
          metodoPagoId: undefined,
          cuentaPagoId: undefined,
          observaciones: undefined,
        });
      }
    },
    [form],
  );

  /** Al cambiar de método, limpia la cuenta (deja de aplicar). */
  const handleMetodoPagoChange = useCallback(
    (value) => {
      setMetodoPagoId(value);
      form.setFieldsValue({ cuentaPagoId: undefined });
    },
    [form],
  );

  // Reglas derivadas del método (compartidas con Finanzas).
  const metodoCodigo = useMemo(
    () => findMetodoCodigo(metodosPago, metodoPagoId),
    [metodosPago, metodoPagoId],
  );
  const reglasMetodo = useMemo(() => buildReglasMetodo(metodoCodigo), [metodoCodigo]);

  /**
   * Submit: arma el payload EXACTO del backend y ejecuta la inscripción.
   * participante EXISTENTE → participanteId; NUEVO → objeto participante.
   */
  const handleFinish = useCallback(async () => {
    if (!cursoSeleccionadoId) {
      message.error('Seleccione el curso al que se inscribe el participante');
      return;
    }
    if (modoParticipante === MODO_PARTICIPANTE.EXISTENTE && !participanteSeleccionado?.id) {
      message.error('Busque y seleccione al participante, o regístrelo como nuevo');
      return;
    }

    let values;
    try {
      values = await form.validateFields();
    } catch {
      message.error('Revise los campos obligatorios del formulario');
      return;
    }

    const payload = { capacitacionId: Number(cursoSeleccionadoId) };
    if (modoParticipante === MODO_PARTICIPANTE.EXISTENTE) {
      payload.participanteId = Number(participanteSeleccionado.id);
    } else {
      payload.participante = mapFormValuesToParticipantePayload(values);
    }
    if (conPagoInicial) {
      const pagoInicial = mapFormValuesToPagoPayload(values);
      if (!Number.isFinite(pagoInicial.monto) || pagoInicial.monto <= 0) {
        message.error('Indique un monto válido para el pago inicial');
        return;
      }
      payload.pagoInicial = pagoInicial;
    }

    const result = await inscribir(payload);
    if (!result?.success) {
      message.error(
        result?.error || 'No se pudo registrar la inscripción',
        DURACION_MENSAJE_ERROR,
      );
      return;
    }

    message.success(
      conPagoInicial
        ? 'Inscripción y pago inicial registrados'
        : 'Inscripción registrada correctamente',
    );

    const raw = result.data?.inscripcionCapacitacion ?? result.data;
    const inscripcionId = raw?.id ?? null;
    if (inscripcionId) {
      navigate(inscripcionCapDetallePath(inscripcionId), {
        state: { returnListPath, menuSidebarKey },
      });
    } else {
      handleVolver();
    }
  }, [
    cursoSeleccionadoId,
    modoParticipante,
    participanteSeleccionado,
    conPagoInicial,
    form,
    inscribir,
    message,
    navigate,
    returnListPath,
    menuSidebarKey,
    handleVolver,
  ]);

  return {
    // Layout
    breadcrumbItems,
    handleVolver,
    form,
    // Paso 1: participante
    modoParticipante,
    handleModoParticipanteChange,
    participantes,
    loadingBusqueda,
    errorBusqueda,
    buscarParticipantes,
    participanteSeleccionado,
    handleSeleccionarParticipante,
    handleCambiarParticipante,
    // Paso 2: curso
    cursos,
    loadingCursos,
    errorCursos,
    cursoSeleccionadoId,
    cursoSeleccionado,
    handleCursoChange,
    // Paso 3: pago inicial opcional
    conPagoInicial,
    handleConPagoInicialChange,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
    metodoPagoId,
    reglasMetodo,
    handleMetodoPagoChange,
    // Submit
    handleFinish,
    inscribiendo,
  };
};
