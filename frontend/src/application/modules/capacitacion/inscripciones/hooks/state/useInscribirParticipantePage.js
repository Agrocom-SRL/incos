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
 * EDICIÓN (mismo formulario): si la página se monta dentro de
 * `InscripcionCapacitacionDetailProvider` (ruta CAP-INSCRIPCIONES-EDITAR) el hook precarga la
 * inscripción en los mismos pasos: participante y curso quedan elegidos y bloqueados (solo
 * lectura) y solo se pueden cambiar el grupo (`PUT /:id`) y los requisitos entregados
 * (`PUT /:id/requisitos`). No hay pago inicial; los pagos se gestionan desde la ficha.
 *
 * Los pasos comparten un único `Form` de AntD (`WizardForm` lo crea y
 * desmonta del DOM el contenido de los pasos no activos, pero conserva sus
 * valores en el store del form). Por eso el submit final usa
 * `form.getFieldsValue(true)` (no `validateFields()` sin argumentos) para no
 * perder los campos del participante nuevo, capturados en el paso 1.
 */

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useInscribirParticipanteContext } from '@application-capacitacion/inscripciones/hooks/context/useInscribirParticipanteContext';
import { InscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/context/InscripcionCapacitacionDetailContext';
import {
  buildInscripcionPayload,
  mapFormValuesToPagoInicialPayload,
  mapRequisitosToPayload,
} from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';
import { buildConceptoOptions } from '@application-capacitacion/utils/capacitacionCatalogos';
import {
  montosCobradosCurso,
  motivoGrupoNoEditable,
  resolverGrupoInicial,
  validarGrupoElegido,
} from '@application-capacitacion/utils/inscripcionGrupos';
import { mapFormValuesToParticipantePayload } from '@application-capacitacion/participantes/mappers/participanteMapper';
import { createInscribirParticipanteWizardSteps } from '@capacitacion/inscripciones/config/inscribirParticipanteWizardSteps';
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

  // Contexto de la ficha: solo existe al EDITAR una inscripción (`null` en el alta).
  const edicionCtx = useContext(InscripcionCapacitacionDetailContext);
  const esEdicion = Boolean(edicionCtx);
  const inscripcionEdit = edicionCtx?.inscripcion ?? null;

  const {
    participantes: participantesBusqueda,
    loadingBusqueda,
    errorBusqueda,
    buscarParticipantes,
    sugeridos: sugeridosLanding,
    loadingSugeridos,
    cargarSugeridos,
    cursos: cursosCatalogo,
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
  const detallePath = edicionCtx?.inscripcionId
    ? inscripcionCapDetallePath(edicionCtx.inscripcionId)
    : returnListPath;

  /**
   * Landing del paso 1: se dispara una sola vez al montar el hook (el wizard
   * arranca siempre en modo búsqueda/EXISTENTE), no en cada cambio de modo.
   * En la edición el participante ya viene elegido: no hay landing.
   */
  useEffect(() => {
    if (!esEdicion) cargarSugeridos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breadcrumbItems = useMemo(
    () =>
      esEdicion
        ? [
            { title: 'Inicio', href: '/' },
            { title: 'Capacitación' },
            { title: 'Inscripciones', href: returnListPath },
            { title: 'Detalle de inscripción', href: detallePath },
            { title: 'Editar inscripción' },
          ]
        : [
            { title: 'Inicio', href: '/' },
            { title: 'Capacitación' },
            { title: 'Inscripciones', href: returnListPath },
            { title: 'Inscribir participante' },
          ],
    [esEdicion, returnListPath, detallePath],
  );

  const handleVolver = useCallback(() => {
    if (esEdicion) {
      navigate(detallePath, { state: { returnListPath, menuSidebarKey } });
      return;
    }
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [esEdicion, navigate, detallePath, returnListPath, menuSidebarKey]);

  /** Requisitos entregados al abrir la edición (para saber si cambiaron). */
  const requisitosIniciales = useMemo(
    () => (inscripcionEdit?.requisitos ?? []).filter((r) => r.entregado).map((r) => r.requisitoId),
    [inscripcionEdit],
  );

  /**
   * Edición: precarga UNA vez la inscripción en los mismos estados del alta (participante, curso,
   * grupo y requisitos) y pide la ficha del curso para los grupos y requisitos del paso 3.
   */
  const hidratadaRef = useRef(null);
  useEffect(() => {
    if (!esEdicion || !inscripcionEdit || hidratadaRef.current === inscripcionEdit.id) return;
    hidratadaRef.current = inscripcionEdit.id;
    setParticipanteSeleccionado({
      id: inscripcionEdit.participanteId,
      nombreCompleto: inscripcionEdit.participanteNombreCompleto,
      ci: inscripcionEdit.participanteCi,
      ciCompleto: inscripcionEdit.participanteCiCompleto,
      celular: inscripcionEdit.participanteCelular,
      email: inscripcionEdit.participanteEmail,
      cursoActualId: null,
    });
    setCursoSeleccionadoId(inscripcionEdit.capacitacionId);
    setCapacitacionGrupoId(inscripcionEdit.capacitacionGrupoId);
    setRequisitosEntregados(requisitosIniciales);
    if (inscripcionEdit.capacitacionId != null) cargarCursoDetalle(inscripcionEdit.capacitacionId);
  }, [esEdicion, inscripcionEdit, requisitosIniciales, cargarCursoDetalle]);

  /** Búsqueda de participante: envuelve `buscarParticipantes` para saber si ya se intentó buscar. */
  const handleBuscarParticipantes = useCallback(
    (query) => {
      if (esEdicion) return; // el participante de una inscripción no se cambia
      setSearchText(String(query ?? '').trim());
      buscarParticipantes(query);
    },
    [esEdicion, buscarParticipantes],
  );

  const handleSeleccionarParticipante = useCallback(
    (participante) => {
      if (esEdicion || !participante?.id) return;
      setParticipanteSeleccionado(participante);
    },
    [esEdicion],
  );

  /**
   * Sin tabs: el paso "Participante" arranca siempre en búsqueda. Si la
   * búsqueda no encuentra a nadie, el header de la tarjeta ofrece "Crear
   * nuevo participante" (ver `wizardSteps`); si ya está en modo nuevo, ofrece
   * volver a la búsqueda. Ambos casos limpian el estado del otro modo.
   */
  const handleCrearNuevoParticipante = useCallback(() => {
    if (esEdicion) return;
    setModoParticipante(MODO_PARTICIPANTE.NUEVO);
    setParticipanteSeleccionado(null);
  }, [esEdicion]);

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
    participantesBusqueda.length === 0;

  /** Ficha del curso elegido (solo si ya cargó la del id actual: evita mostrar la del anterior). */
  const cursoFicha = cursoDetalle?.id === cursoSeleccionadoId ? cursoDetalle : null;

  /** Cursos del paso 2: el catálogo en el alta; en la edición, solo el curso de la inscripción. */
  const cursos = useMemo(
    () => (esEdicion ? (cursoFicha ? [cursoFicha] : []) : cursosCatalogo),
    [esEdicion, cursoFicha, cursosCatalogo],
  );

  /** Curso elegido (para el resumen de costo/cupo/horarios). */
  const cursoSeleccionado = useMemo(
    () => cursos.find((c) => c.id === cursoSeleccionadoId) ?? null,
    [cursos, cursoSeleccionadoId],
  );
  // Cada grupo lleva su matrícula efectiva (la propia o la del curso); `null` si el curso no la cobra.
  const gruposCurso = useMemo(
    () =>
      (cursoFicha?.grupos ?? []).map((g) => ({
        ...g,
        matricula: cursoFicha?.cobraMatricula ? (g.costoMatricula ?? cursoFicha.costoMatricula) : null,
      })),
    [cursoFicha],
  );
  const requisitosCurso = useMemo(() => cursoFicha?.requisitos ?? [], [cursoFicha]);
  /** Grupo elegido (para el resumen de cierre); `null` si aún no se eligió. */
  const grupoSeleccionado = useMemo(
    () => gruposCurso.find((g) => g.id === capacitacionGrupoId) ?? null,
    [gruposCurso, capacitacionGrupoId],
  );

  /**
   * Cambiar de curso reinicia lo que depende de él (grupo, requisitos, pago) y
   * carga su ficha. Con un único grupo disponible se preselecciona.
   */
  const handleCursoChange = useCallback(
    async (value) => {
      if (esEdicion) return; // el curso de una inscripción no se cambia
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
    [esEdicion, form, cargarCursoDetalle],
  );

  /** Acceso directo (dashboard): el curso llega elegido en `location.state.cursoId`. */
  const cursoIdInicial = location.state?.cursoId ?? null;
  useEffect(() => {
    if (!esEdicion && cursoIdInicial != null) handleCursoChange(Number(cursoIdInicial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Saldo máximo por concepto: solo los conceptos que el curso cobra (los demás valen 0).
   * Con costo del curso externo (entidad certificadora) solo se cobra la matrícula.
   */
  const saldosPorConcepto = useMemo(() => montosCobradosCurso(cursoSeleccionado, grupoSeleccionado), [cursoSeleccionado, grupoSeleccionado]);
  const conceptoOptions = useMemo(() => buildConceptoOptions(saldosPorConcepto), [saldosPorConcepto]);

  /**
   * El paso «Pago inicial» solo existe si el curso cobra algo (no es
   * gratuito). Es siempre opcional: no hace falta pagar para inscribir.
   */
  const ofrecePago = !esEdicion && conceptoOptions.length > 0;

  /** Edición: por qué el grupo no se puede cambiar (inscripción retirada/anulada o curso sin grupos). */
  const grupoMotivoDeshabilitado = useMemo(
    () =>
      esEdicion && inscripcionEdit && !loadingCursoDetalle && cursoFicha
        ? motivoGrupoNoEditable(inscripcionEdit, gruposCurso)
        : null,
    [esEdicion, inscripcionEdit, loadingCursoDetalle, cursoFicha, gruposCurso],
  );

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
   * Pasos del wizard: los arma `createInscribirParticipanteWizardSteps` (config
   * de presentación, gemelo de `createInscripcionNuevaWizardSteps` de
   * Matrícula). El botón "Crear nuevo participante" (JSX) lo inyecta la página
   * como `headerActions` del paso 1 para no mezclar JSX en este hook.
   *
   * El paso "Pago inicial" SOLO se incluye si el curso elegido cobra algo
   * (`ofrecePago`); el paso 3 «Grupo y requisitos» siempre existe (muestra
   * estados vacíos si el curso no define grupos ni requisitos).
   */
  const wizardSteps = useMemo(
    () =>
      createInscribirParticipanteWizardSteps({
        modoParticipante,
        ofrecePago,
        edicion: esEdicion,
        grupoMotivoDeshabilitado,
      }),
    [modoParticipante, ofrecePago, esEdicion, grupoMotivoDeshabilitado],
  );

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
      if (stepNumber === 4 && ofrecePago && registrarPagoInicial) {
        return form
          .validateFields(['concepto', 'monto', 'fechaPago', 'metodoPagoId', 'cuentaPagoId'])
          .then(() => {
            const { monto } = mapFormValuesToPagoInicialPayload(form.getFieldsValue(true));
            if (!Number.isFinite(monto) || monto <= 0) {
              return Promise.reject(new Error('Indique un monto válido para el pago inicial'));
            }
            return undefined;
          });
      }
      return Promise.resolve();
    },
    [
      form,
      modoParticipante,
      participanteSeleccionado,
      cursoSeleccionadoId,
      gruposCurso,
      capacitacionGrupoId,
      ofrecePago,
      registrarPagoInicial,
    ],
  );

  /**
   * `WizardForm` la llama cuando `onValidateBeforeNext` rechaza: expone el
   * mensaje junto al footer del paso (no como toast) y, si el rechazo trae
   * campos de `Form` con error, desplaza la vista al primero.
   */
  const handleValidationError = useCallback(
    (err) => {
      setStepError(err?.message || 'Revise los datos del paso actual');
      const primerCampo = err?.errorFields?.[0]?.name;
      if (primerCampo) {
        form.scrollToField(primerCampo, { behavior: 'smooth', block: 'center' });
      }
    },
    [form],
  );

  /**
   * Submit: arma el payload EXACTO del backend y ejecuta la inscripción.
   * participante EXISTENTE → participanteId; NUEVO → objeto participante.
   *
   * IMPORTANTE: el paso 1 (datos del participante nuevo) ya está desmontado
   * del DOM al llegar aquí (paso 3), por lo que `form.validateFields()` sin
   * argumentos NO lo revalida ni lo incluye. Se usa `form.getFieldsValue(true)`
   * para leer TODOS los valores (incluidos los de pasos ya desmontados), y se
   * valida explícitamente solo el paso de pago (campos actualmente montados).
   *
   * Los errores de validación van a `stepError` (junto al footer); los toasts
   * quedan solo para el resultado del servidor.
   */
  const handleFinish = useCallback(async () => {
    setStepError('');

    if (esEdicion) {
      const mensajeGrupoEdit = validarGrupoElegido(gruposCurso, capacitacionGrupoId);
      if (mensajeGrupoEdit) {
        setStepError(mensajeGrupoEdit);
        return;
      }
      const cambiaGrupo =
        !grupoMotivoDeshabilitado &&
        capacitacionGrupoId != null &&
        capacitacionGrupoId !== (inscripcionEdit?.capacitacionGrupoId ?? null);
      const cambiaRequisitos =
        requisitosEntregados.length !== requisitosIniciales.length ||
        requisitosEntregados.some((id) => !requisitosIniciales.includes(id));
      const irAlDetalle = () =>
        navigate(detallePath, { replace: true, state: { returnListPath, menuSidebarKey } });

      if (!cambiaGrupo && !cambiaRequisitos) {
        message.info('No hay cambios que guardar.');
        irAlDetalle();
        return;
      }
      if (cambiaGrupo) {
        const result = await edicionCtx.actualizarInscripcion({ capacitacionGrupoId });
        if (!result?.success) {
          message.error(result?.error || 'No se pudo cambiar el grupo', DURACION_MENSAJE_ERROR);
          return;
        }
      }
      if (cambiaRequisitos) {
        const checklist = (inscripcionEdit?.requisitos ?? []).map((r) => ({
          ...r,
          entregado: requisitosEntregados.includes(r.requisitoId),
        }));
        const result = await edicionCtx.guardarRequisitos(mapRequisitosToPayload(checklist));
        if (!result?.success) {
          message.error(result?.error || 'No se pudieron guardar los requisitos', DURACION_MENSAJE_ERROR);
          return;
        }
      }
      message.success('Inscripción actualizada correctamente');
      irAlDetalle();
      return;
    }

    if (!cursoSeleccionadoId) {
      setStepError('Seleccione el curso al que se inscribe el participante');
      return;
    }
    if (modoParticipante === MODO_PARTICIPANTE.EXISTENTE && !participanteSeleccionado?.id) {
      setStepError('Busque y seleccione al participante, o regístrelo como nuevo');
      return;
    }

    const mensajeGrupo = validarGrupoElegido(gruposCurso, capacitacionGrupoId);
    if (mensajeGrupo) {
      setStepError(mensajeGrupo);
      return;
    }

    if (ofrecePago && registrarPagoInicial) {
      try {
        await form.validateFields(['concepto', 'monto', 'fechaPago', 'metodoPagoId', 'cuentaPagoId']);
      } catch (err) {
        handleValidationError(err);
        setStepError('Revise los campos obligatorios del pago inicial');
        return;
      }
    }

    const values = form.getFieldsValue(true);

    let pagoInicial = null;
    if (ofrecePago && registrarPagoInicial) {
      pagoInicial = mapFormValuesToPagoInicialPayload(values);
      if (!Number.isFinite(pagoInicial.monto) || pagoInicial.monto <= 0) {
        setStepError('Indique un monto válido para el pago inicial');
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
      // `descargarFormulario`: la ficha baja el formulario una sola vez, solo tras crear.
      navigate(inscripcionCapDetallePath(inscripcionId), {
        state: { returnListPath, menuSidebarKey, descargarFormulario: true },
      });
    } else {
      handleVolver();
    }
  }, [
    esEdicion,
    edicionCtx,
    inscripcionEdit,
    requisitosIniciales,
    grupoMotivoDeshabilitado,
    detallePath,
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
    handleValidationError,
    navigate,
    returnListPath,
    menuSidebarKey,
    handleVolver,
  ]);

  return {
    // Layout
    esEdicion,
    pageTitle: esEdicion ? 'Editar inscripción' : 'Inscribir participante',
    finishLabel: esEdicion ? 'Guardar cambios' : 'Registrar inscripción',
    permisoAccion: esEdicion ? 'EDITAR' : 'CREAR',
    loadingFicha: esEdicion ? Boolean(edicionCtx.loading) : false,
    errorFicha: esEdicion ? edicionCtx.error || null : null,
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
    participantes: esEdicion ? [] : participantesBusqueda,
    loadingBusqueda,
    errorBusqueda,
    searchText,
    searchAttempted: searchText.length >= 2,
    buscarParticipantes: handleBuscarParticipantes,
    // En la edición la «lista» es solo el participante de la inscripción (ya elegido y bloqueado).
    sugeridos: esEdicion ? [participanteSeleccionado].filter(Boolean) : sugeridosLanding,
    loadingSugeridos: esEdicion ? false : loadingSugeridos,
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
    grupoSeleccionado,
    grupoMotivoDeshabilitado,
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
    cursoExterno: Boolean(cursoSeleccionado?.pagoCursoExterno),
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
    metodoPagoId,
    reglasMetodo,
    handleMetodoPagoChange,
    // Submit
    handleFinish,
    inscribiendo: esEdicion
      ? Boolean(edicionCtx.actualizandoInscripcion || edicionCtx.guardandoRequisitos)
      : inscribiendo,
  };
};
