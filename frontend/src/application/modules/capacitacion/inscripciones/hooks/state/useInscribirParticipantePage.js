/**
 * Hook de pantalla: inscribir participante a un curso de capacitación
 * (CAP · capacitacion.inscripcion CREAR).
 *
 * Wizard por pestañas (`WizardForm variant="tabs"`, gemelo de
 * `useSeguridadUsuarioCreatePage`): participante (existente por búsqueda O
 * nuevo con datos mínimos) → curso → pago inicial → submit en UNA transacción
 * del backend (`createInscripcionCapacitacionValidator`: participanteId XOR
 * participante, capacitacionId, pagoInicial?).
 *
 * Reglas de pago por cuotas (definitivas, ver backend
 * `CreateInscripcionCapacitacionUseCase`):
 * - Curso GRATUITO (costo ≤ 0): el paso "Pago inicial" NO EXISTE en el wizard
 *   (se omite del todo, `wizardSteps` no lo incluye) — no hay nada que cobrar.
 * - Curso CON COSTO: el pago inicial es OBLIGATORIO, ya no existe la opción
 *   de omitirlo. Si el monto ingresado no cubre el costo total, el propio
 *   formulario (`PagoCapacitacionFormFields`) exige una fecha de compromiso.
 *
 * Los pasos comparten un único `Form` de AntD (`WizardForm` lo crea y
 * desmonta del DOM el contenido de los pasos no activos, pero conserva sus
 * valores en el store del form). Por eso el submit final usa
 * `form.getFieldsValue(true)` (no `validateFields()` sin argumentos) para no
 * perder los campos del participante nuevo, capturados en el paso 1.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useInscribirParticipanteContext } from '@application-capacitacion/inscripciones/hooks/context/useInscribirParticipanteContext';
import { mapFormValuesToPagoInicialPayload } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';
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
    sugeridos,
    loadingSugeridos,
    cargarSugeridos,
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
  const [searchText, setSearchText] = useState('');
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [metodoPagoId, setMetodoPagoId] = useState(null);
  /** Error puntual del paso actual (validación al avanzar), mostrado por WizardForm. */
  const [stepError, setStepError] = useState('');

  const returnListPath = location.state?.returnListPath || INSCRIPCIONES_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_INSCRIPCIONES_MENU_KEY;

  /**
   * Landing del paso 1: se dispara una sola vez al montar el hook (el wizard
   * arranca siempre en modo búsqueda/EXISTENTE), no en cada cambio de modo.
   */
  useEffect(() => {
    cargarSugeridos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  /** Búsqueda de participante: envuelve `buscarParticipantes` para saber si ya se intentó buscar. */
  const handleBuscarParticipantes = useCallback(
    (query) => {
      setSearchText(String(query ?? '').trim());
      buscarParticipantes(query);
    },
    [buscarParticipantes],
  );

  const handleSeleccionarParticipante = useCallback((participante) => {
    if (!participante?.id) return;
    setParticipanteSeleccionado(participante);
  }, []);

  /**
   * Sin tabs: el paso "Participante" arranca siempre en búsqueda. Si la
   * búsqueda no encuentra a nadie, el header de la tarjeta ofrece "Crear
   * nuevo participante" (ver `wizardSteps`); si ya está en modo nuevo, ofrece
   * volver a la búsqueda. Ambos casos limpian el estado del otro modo.
   */
  const handleCrearNuevoParticipante = useCallback(() => {
    setModoParticipante(MODO_PARTICIPANTE.NUEVO);
    setParticipanteSeleccionado(null);
  }, []);

  const handleVolverABusqueda = useCallback(() => {
    setModoParticipante(MODO_PARTICIPANTE.EXISTENTE);
    form.setFieldsValue({
      ci: undefined,
      expedicion: undefined,
      nombres: undefined,
      apellidoPaterno: undefined,
      apellidoMaterno: undefined,
      celular: undefined,
      email: undefined,
    });
  }, [form]);

  /** True cuando ya se buscó (≥2 caracteres) y la búsqueda no encontró a nadie. */
  const participanteNoEncontrado =
    modoParticipante === MODO_PARTICIPANTE.EXISTENTE &&
    !participanteSeleccionado &&
    !loadingBusqueda &&
    searchText.length >= 2 &&
    participantes.length === 0;

  /** Curso elegido en el Select (para el resumen de costo/cupo/horarios). */
  const cursoSeleccionado = useMemo(
    () => cursos.find((c) => c.id === cursoSeleccionadoId) ?? null,
    [cursos, cursoSeleccionadoId],
  );

  const handleCursoChange = useCallback((value) => {
    setCursoSeleccionadoId(value ?? null);
  }, []);

  /**
   * Un curso sin costo (Bs 0) no tiene nada que cobrar: el paso "Pago
   * inicial" del wizard directamente no se incluye (ver `wizardSteps`). Un
   * curso con costo siempre exige el pago inicial (ya no es opcional).
   */
  const requierePago = Number(cursoSeleccionado?.costo ?? 0) > 0;

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
   * Pasos del wizard (un `sectionKey` por paso; contenido 100% custom, ver
   * página). `description` es texto plano (dato), no JSX — la página arma el
   * `headerActions` (botón "Crear nuevo participante" / "Buscar participante")
   * y lo inyecta sobre el paso 1 antes de pasarlo a `WizardForm`, para no
   * mezclar JSX en este hook de estado.
   *
   * El paso "Pago inicial" SOLO se incluye si el curso elegido tiene costo
   * (`requierePago`): un curso gratuito no tiene nada que cobrar, así que el
   * wizard queda en 2 pasos y "Curso" pasa a ser el último (la página no
   * intenta avanzar más allá de él, ver `handleCursoSeleccionarYAvanzar`).
   */
  const wizardSteps = useMemo(() => {
    const steps = [
      {
        title: 'Participante',
        formTitle: 'Inscribir participante',
        description:
          modoParticipante === MODO_PARTICIPANTE.NUEVO
            ? 'Registre los datos mínimos del participante nuevo; se guardará junto con la inscripción.'
            : 'Busque un participante ya registrado por CI, nombre o celular. Si no existe, podrá registrarlo desde aquí.',
        sections: ['participante'],
        config: { participante: {} },
      },
      {
        title: 'Curso',
        formTitle: 'Inscribir participante',
        description:
          'Elija el curso de capacitación al que se inscribe. El cupo es informativo: no bloquea la inscripción.',
        sections: ['curso'],
        config: { curso: {} },
      },
    ];
    if (requierePago) {
      steps.push({
        title: 'Pago inicial',
        formTitle: 'Inscribir participante',
        description:
          'El curso tiene costo: registre el pago inicial (puede ser parcial). Si no cubre el costo total, indique la fecha de compromiso para cancelar el saldo.',
        sections: ['pago'],
        config: { pago: {} },
      });
    }
    return steps;
  }, [modoParticipante, requierePago]);

  /**
   * Validación al avanzar de paso (`WizardForm` la invoca antes de "Siguiente").
   * Paso 1 (participante): campos reales del `Form` en modo NUEVO; selección en
   * memoria (no es campo de `Form`) en modo EXISTENTE. Paso 2 (curso): selección
   * en memoria. Paso 3 (pago): sin validación aquí, se valida al finalizar.
   */
  const onValidateBeforeNext = useCallback(
    (stepNumber) => {
      setStepError('');
      if (stepNumber === 1) {
        if (modoParticipante === MODO_PARTICIPANTE.NUEVO) {
          return form.validateFields([
            'ci',
            'expedicion',
            'nombres',
            'apellidoPaterno',
            'apellidoMaterno',
            'celular',
            'email',
          ]);
        }
        if (!participanteSeleccionado?.id) {
          return Promise.reject(
            new Error('Busque y seleccione un participante, o cambie a «Nuevo participante»'),
          );
        }
        return Promise.resolve();
      }
      if (stepNumber === 2) {
        if (!cursoSeleccionadoId) {
          return Promise.reject(new Error('Seleccione el curso al que se inscribe el participante'));
        }
        return Promise.resolve();
      }
      return Promise.resolve();
    },
    [form, modoParticipante, participanteSeleccionado, cursoSeleccionadoId],
  );

  /** `WizardForm` la llama cuando `onValidateBeforeNext` rechaza; expone el mensaje en el footer del paso. */
  const handleValidationError = useCallback((err) => {
    setStepError(err?.message || 'Revise los datos del paso actual');
  }, []);

  /**
   * Submit: arma el payload EXACTO del backend y ejecuta la inscripción.
   * participante EXISTENTE → participanteId; NUEVO → objeto participante.
   *
   * IMPORTANTE: el paso 1 (datos del participante nuevo) ya está desmontado
   * del DOM al llegar aquí (paso 3), por lo que `form.validateFields()` sin
   * argumentos NO lo revalida ni lo incluye. Se usa `form.getFieldsValue(true)`
   * para leer TODOS los valores (incluidos los de pasos ya desmontados), y se
   * valida explícitamente solo el paso de pago (campos actualmente montados).
   */
  const handleFinish = useCallback(async () => {
    setStepError('');
    if (!cursoSeleccionadoId) {
      message.error('Seleccione el curso al que se inscribe el participante');
      return;
    }
    if (modoParticipante === MODO_PARTICIPANTE.EXISTENTE && !participanteSeleccionado?.id) {
      message.error('Busque y seleccione al participante, o regístrelo como nuevo');
      return;
    }

    if (requierePago) {
      try {
        // 'fechaCompromiso' solo está montado si el monto ingresado queda parcial
        // (ver PagoCapacitacionFormFields); validarlo aquí no falla si no aplica.
        await form.validateFields(['monto', 'fechaPago', 'metodoPagoId', 'cuentaPagoId', 'fechaCompromiso']);
      } catch {
        message.error('Revise los campos obligatorios del pago inicial');
        return;
      }
    }

    const values = form.getFieldsValue(true);

    const payload = { capacitacionId: Number(cursoSeleccionadoId) };
    if (modoParticipante === MODO_PARTICIPANTE.EXISTENTE) {
      payload.participanteId = Number(participanteSeleccionado.id);
    } else {
      payload.participante = mapFormValuesToParticipantePayload(values);
    }
    if (requierePago) {
      const pagoInicial = mapFormValuesToPagoInicialPayload(values);
      if (!Number.isFinite(pagoInicial.monto) || pagoInicial.monto <= 0) {
        message.error('Indique un monto válido para el pago inicial');
        return;
      }
      const costoCurso = Number(cursoSeleccionado?.costo ?? 0);
      const quedaParcial = pagoInicial.monto < costoCurso;
      if (quedaParcial && !pagoInicial.fechaCompromiso) {
        message.error(
          'Indique la fecha de compromiso: el pago inicial no cubre el costo total del curso',
        );
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
      requierePago
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
    requierePago,
    cursoSeleccionado,
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
    // Wizard
    wizardSteps,
    onValidateBeforeNext,
    handleValidationError,
    stepError,
    // Paso 1: participante
    modoParticipante,
    participanteNoEncontrado,
    handleCrearNuevoParticipante,
    handleVolverABusqueda,
    participantes,
    loadingBusqueda,
    errorBusqueda,
    searchText,
    searchAttempted: searchText.length >= 2,
    buscarParticipantes: handleBuscarParticipantes,
    sugeridos,
    loadingSugeridos,
    participanteSeleccionado,
    handleSeleccionarParticipante,
    // Paso 2: curso
    cursos,
    loadingCursos,
    errorCursos,
    cursoSeleccionadoId,
    cursoSeleccionado,
    handleCursoChange,
    // Paso 3: pago inicial (obligatorio si el curso tiene costo; omitido si es gratuito)
    requierePago,
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
