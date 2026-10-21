/**
 * Hook de pantalla: inscribir participante a un curso de capacitación
 * (CAP · capacitacion.inscripcion CREAR).
 *
 * Wizard por pestañas (`WizardForm variant="tabs"`, gemelo de
 * `useSeguridadUsuarioCreatePage`): participante (existente por búsqueda O
 * nuevo con datos mínimos) → curso → horario y requisitos → pago inicial
 * OPCIONAL → submit en UNA transacción del backend
 * (`createInscripcionCapacitacionValidator`).
 *
 * Reglas (extensión matrícula/horarios):
 * - Se puede inscribir con requisitos o pagos pendientes: la inscripción queda
 *   PENDIENTE y pasa a INSCRITO con matrícula + curso cancelados y los
 *   requisitos obligatorios entregados (ver `calcularPendientesInscripcion`).
 * - El paso «Grupo y requisitos» toma `grupos[]`/`requisitos[]` de la ficha del
 *   curso elegido; el grupo es `capacitacionGrupoId` (un solo grupo se
 *   preselecciona; con ≥2 es obligatorio).
 * - El pago inicial es opcional (interruptor) y lleva `concepto`
 *   (MATRICULA | CURSO) y solo ofrece los conceptos que el curso cobra; el paso
 *   no existe si el curso es gratuito.
 *   El comprobante se adjunta después desde la ficha.
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
import {
  buildInscripcionPayload,
  mapFormValuesToPagoInicialPayload,
} from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';
import { buildConceptoOptions } from '@application-capacitacion/utils/capacitacionCatalogos';
import {
  montosCobradosCurso,
  resolverGrupoInicial,
  validarGrupoElegido,
} from '@application-capacitacion/utils/inscripcionGrupos';
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
    cursoDetalle,
    loadingCursoDetalle,
    errorCursoDetalle,
    cargarCursoDetalle,
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
  /** Paso «Horario y requisitos»: grupo elegido y requisitos ya entregados al inscribir. */
  const [capacitacionGrupoId, setCapacitacionGrupoId] = useState(null);
  const [requisitosEntregados, setRequisitosEntregados] = useState([]);
  /** Pago inicial opcional: apagado por defecto. */
  const [registrarPagoInicial, setRegistrarPagoInicial] = useState(false);
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

  /** Ficha del curso elegido (solo si ya cargó la del id actual: evita mostrar la del anterior). */
  const cursoFicha = cursoDetalle?.id === cursoSeleccionadoId ? cursoDetalle : null;
  const gruposCurso = useMemo(() => cursoFicha?.grupos ?? [], [cursoFicha]);
  const requisitosCurso = useMemo(() => cursoFicha?.requisitos ?? [], [cursoFicha]);

  /**
   * Cambiar de curso reinicia lo que depende de él (grupo, requisitos, pago) y
   * carga su ficha. Con un único grupo disponible se preselecciona.
   */
  const handleCursoChange = useCallback(
    async (value) => {
      setCursoSeleccionadoId(value ?? null);
      setCapacitacionGrupoId(null);
      setRequisitosEntregados([]);
      setRegistrarPagoInicial(false);
      form.setFieldsValue({ concepto: undefined, monto: undefined });
      if (!value) return;
      const result = await cargarCursoDetalle(value);
      if (result?.success) {
        setCapacitacionGrupoId(resolverGrupoInicial(result.data?.grupos));
      }
    },
    [form, cargarCursoDetalle],
  );

  /** Saldo máximo por concepto: solo los conceptos que el curso cobra (los demás valen 0). */
  const saldosPorConcepto = useMemo(() => montosCobradosCurso(cursoSeleccionado), [cursoSeleccionado]);
  const conceptoOptions = useMemo(() => buildConceptoOptions(saldosPorConcepto), [saldosPorConcepto]);

  /**
   * El paso «Pago inicial» solo existe si el curso cobra algo (no es
   * gratuito). Es siempre opcional: no hace falta pagar para inscribir.
   */
  const ofrecePago = conceptoOptions.length > 0;

  /** Activa/desactiva el pago inicial; al activar sugiere el primer concepto con costo. */
  const handleTogglePagoInicial = useCallback(
    (activo) => {
      setRegistrarPagoInicial(activo);
      if (activo && !form.getFieldValue('concepto')) {
        form.setFieldsValue({ concepto: conceptoOptions[0]?.value });
      }
    },
    [form, conceptoOptions],
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
   * Pasos del wizard (un `sectionKey` por paso; contenido 100% custom, ver
   * página). `description` es texto plano (dato), no JSX — la página arma el
   * `headerActions` (botón "Crear nuevo participante" / "Buscar participante")
   * y lo inyecta sobre el paso 1 antes de pasarlo a `WizardForm`, para no
   * mezclar JSX en este hook de estado.
   *
   * El paso "Pago inicial" SOLO se incluye si el curso elegido cobra algo
   * (`ofrecePago`); el paso 3 «Horario y requisitos» siempre existe (muestra
   * estados vacíos si el curso no define grupos ni requisitos).
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
      {
        title: 'Grupo y requisitos',
        formTitle: 'Inscribir participante',
        description:
          'Elija el grupo del participante (con sus horarios) y marque los requisitos que ya entrega. Puede inscribirlo con requisitos pendientes: quedará en estado «Pendiente».',
        sections: ['inscripcion'],
        config: { inscripcion: {} },
      },
    ];
    if (ofrecePago) {
      steps.push({
        title: 'Pago inicial',
        formTitle: 'Inscribir participante',
        description:
          'Opcional. La matrícula se paga en secretaría del instituto y el costo del curso a la entidad certificadora; puede registrar un pago ahora o hacerlo después desde la ficha de la inscripción.',
        sections: ['pago'],
        config: { pago: {} },
      });
    }
    return steps;
  }, [modoParticipante, ofrecePago]);

  /**
   * Validación al avanzar de paso (`WizardForm` la invoca antes de "Siguiente").
   * Paso 1 (participante): campos reales del `Form` en modo NUEVO; selección en
   * memoria (no es campo de `Form`) en modo EXISTENTE. Paso 2 (curso): selección
   * en memoria. Paso 3 (grupo/requisitos): el grupo es obligatorio con ≥2 grupos.
   * Paso 4 (pago): se valida al finalizar.
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
      if (stepNumber === 3) {
        const mensaje = validarGrupoElegido(gruposCurso, capacitacionGrupoId);
        return mensaje ? Promise.reject(new Error(mensaje)) : Promise.resolve();
      }
      if (stepNumber === 2) {
        if (!cursoSeleccionadoId) {
          return Promise.reject(new Error('Seleccione el curso al que se inscribe el participante'));
        }
        return Promise.resolve();
      }
      return Promise.resolve();
    },
    [form, modoParticipante, participanteSeleccionado, cursoSeleccionadoId, gruposCurso, capacitacionGrupoId],
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

    const mensajeGrupo = validarGrupoElegido(gruposCurso, capacitacionGrupoId);
    if (mensajeGrupo) {
      message.error(mensajeGrupo);
      return;
    }

    if (ofrecePago && registrarPagoInicial) {
      try {
        await form.validateFields(['concepto', 'monto', 'fechaPago', 'metodoPagoId', 'cuentaPagoId']);
      } catch {
        message.error('Revise los campos obligatorios del pago inicial');
        return;
      }
    }

    const values = form.getFieldsValue(true);

    let pagoInicial = null;
    if (ofrecePago && registrarPagoInicial) {
      pagoInicial = mapFormValuesToPagoInicialPayload(values);
      if (!Number.isFinite(pagoInicial.monto) || pagoInicial.monto <= 0) {
        message.error('Indique un monto válido para el pago inicial');
        return;
      }
    }

    const payload = buildInscripcionPayload({
      cursoId: cursoSeleccionadoId,
      participanteId:
        modoParticipante === MODO_PARTICIPANTE.EXISTENTE ? participanteSeleccionado.id : null,
      participanteNuevo:
        modoParticipante === MODO_PARTICIPANTE.NUEVO
          ? mapFormValuesToParticipantePayload(values)
          : null,
      capacitacionGrupoId,
      requisitosEntregados,
      pagoInicial,
    });

    const result = await inscribir(payload);
    if (!result?.success) {
      message.error(
        result?.error || 'No se pudo registrar la inscripción',
        DURACION_MENSAJE_ERROR,
      );
      return;
    }

    message.success(
      pagoInicial ? 'Inscripción y pago inicial registrados' : 'Inscripción registrada correctamente',
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
    ofrecePago,
    registrarPagoInicial,
    gruposCurso,
    capacitacionGrupoId,
    requisitosEntregados,
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
    // Paso 3: horario (grupo) y requisitos del curso elegido
    cursoFicha,
    loadingCursoDetalle,
    errorCursoDetalle,
    gruposCurso,
    requisitosCurso,
    capacitacionGrupoId,
    setCapacitacionGrupoId,
    requisitosEntregados,
    setRequisitosEntregados,
    // Paso 4: pago inicial opcional (omitido si el curso no cobra nada)
    ofrecePago,
    registrarPagoInicial,
    handleTogglePagoInicial,
    saldosPorConcepto,
    conceptoOptions,
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
