/**
 * Solicitar una licencia estudiantil (ACA-ASI-LIC-SOL · CREAR).
 *
 * Página de formulario alineada al patrón de CFG Académico (CarreraFormPage):
 * Flex.page-container → PageHeaderArea(PageHeader + BackButton) → DashboardPageShell →
 * MainContent → stack de secciones `cfg-academico-workspace` (header con ListPanelHeader
 * + body), footer (Cancelar/Enviar) dentro de la última sección.
 *
 * Flujo de captura del estudiante:
 *   - Si se llega desde la planilla con un estudiante en location.state, se PRECARGA
 *     y NO se muestra el buscador (se va directo a inscripción + datos); hay un botón
 *     "Cambiar estudiante" para revelar el buscador.
 *   - Si se entra directo a /solicitar, se muestra el buscador (gemelo de Becas/Pagos).
 *   Al elegir estudiante se consulta su inscripción vigente y se precarga `inscripcionId`.
 *
 * El POST envía { inscripcionId, fechaInicio, fechaFin, motivo, detalleMotivo }.
 * El tope de 15 días/gestión y la validación de inscripción los hace el backend.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, App, Col, Flex, Form, Input, Row, Select, Switch, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  IdcardOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { DetailField, Button, BackButton, FieldDatePicker, Text } from '@atoms';
import IdentidadCelda from '@atoms/IdentidadCelda';
import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';
import { cfgFormColProps } from '@organisms/CfgFormWorkspace';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { allSpacing } from '@theme/tokens';
import { useCasesFactory } from '@container';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { useLicenciaCrearApi } from '@application-academico/asistencia/hooks/api/useLicenciaCrearApi.js';
import { useLicenciaEditarApi } from '@application-academico/asistencia/hooks/api/useLicenciaEditarApi.js';
import { useInscripcionVigenteApi } from '@application-academico/asistencia/hooks/api/useInscripcionVigenteApi.js';
import { LICENCIAS_PATH } from '@application-academico/asistencia/utils/asistenciaPaths.js';
import { MOTIVO_LICENCIA_OPTIONS } from '@application-academico/asistencia/utils/licenciasMotivos.js';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const BUSQUEDA_DEBOUNCE_MS = 400;
const BUSQUEDA_MIN_CHARS = 2;
const PRELIM_LIMIT = 10;

/** Sección con el mismo shell visual que el formulario de CFG Académico (título + lede + body). */
const Seccion = ({ title, actions = null, descripcion = null, children }) => (
  <section className="cfg-academico-workspace cfg-academico-form-workspace">
    <header className="cfg-academico-workspace__header">
      <ListPanelHeader title={title} actions={actions} />
      {descripcion ? (
        <Typography.Paragraph type="secondary" className="cfg-academico-workspace__desc">
          {descripcion}
        </Typography.Paragraph>
      ) : null}
    </header>
    <div className="cfg-academico-form-workspace__body">{children}</div>
  </section>
);

const LicenciaSolicitarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = location.state?.returnListPath || LICENCIAS_PATH;
  const estudiantePrecargado = location.state?.estudiante;
  // Modo edición: la lista manda la licencia completa por location.state (sin re-fetch).
  const licenciaEditar = location.state?.licencia;
  const esEdicion = Boolean(licenciaEditar?.id);
  // Entrada desde la planilla: el estudiante viene fijado → no se muestra el buscador.
  const entradaConEstudiante = Boolean(estudiantePrecargado?.id);

  const { crearLicencia, loading: creando } = useLicenciaCrearApi();
  const { editarLicencia, loading: editando } = useLicenciaEditarApi();
  const enviando = creando || editando;
  const {
    inscripcion,
    loading: cargandoInscripcion,
    error: inscripcionError,
    consultarInscripcion,
    limpiarInscripcion,
  } = useInscripcionVigenteApi();

  // ---- Buscador de estudiantes (reutiliza el use-case del flujo de becas/pagos) ----
  const [busquedaInput, setBusquedaInput] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [buscando, setBuscando] = useState(true);
  const [busquedaError, setBusquedaError] = useState(null);
  const [estudianteSel, setEstudianteSel] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  // Licencia de un solo día (por defecto): muestra solo "inicio"; al desactivar aparece "fin".
  // En edición arranca según el rango de la licencia (init perezoso, sin efecto).
  const [unSoloDia, setUnSoloDia] = useState(() =>
    esEdicion ? licenciaEditar.fechaInicio === licenciaEditar.fechaFin : true,
  );

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busquedaInput.trim()), BUSQUEDA_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  // Prefill del formulario en modo edición (setFieldsValue es del form, no estado React).
  const prefillEdicionHecho = useRef(false);
  useEffect(() => {
    if (!esEdicion || prefillEdicionHecho.current) return;
    prefillEdicionHecho.current = true;
    form.setFieldsValue({
      inscripcionId: licenciaEditar.inscripcionId,
      motivo: licenciaEditar.motivo,
      detalleMotivo: licenciaEditar.detalleMotivo,
      fechaInicio: licenciaEditar.fechaInicio ? dayjs(licenciaEditar.fechaInicio) : null,
      fechaFin: licenciaEditar.fechaFin ? dayjs(licenciaEditar.fechaFin) : null,
    });
  }, [esEdicion, licenciaEditar, form]);

  useEffect(() => {
    // No se busca si el estudiante vino fijado desde la planilla ni en modo edición.
    if (entradaConEstudiante || esEdicion) return undefined;
    let cancelado = false;
    (async () => {
      setBuscando(true);
      setBusquedaError(null);
      try {
        const uc = useCasesFactory.buscarEstudiantesAsignacionBeca();
        const esBusqueda = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;
        const result = esBusqueda
          ? await uc.ejecutar({ q: busquedaDebounced, limit: 50 })
          : await uc.ejecutar({ preliminar: true, limit: PRELIM_LIMIT });
        if (cancelado) return;
        if (!result?.success) {
          setEstudiantes([]);
          setBusquedaError(result?.error || 'No se pudo cargar la lista de estudiantes');
          return;
        }
        setEstudiantes(Array.isArray(result.data) ? result.data : []);
      } catch (e) {
        if (!cancelado) {
          setEstudiantes([]);
          setBusquedaError(e?.message || 'Error al cargar estudiantes');
        }
      } finally {
        if (!cancelado) setBuscando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [busquedaDebounced, entradaConEstudiante, esEdicion]);

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-ASI-LIC-SOL', 'ACA-ASI', null),
    [],
  );

  const handleVolver = useCallback(() => navigate(returnListPath), [navigate, returnListPath]);

  // Al elegir estudiante: resolver su inscripción vigente y precargar inscripcionId.
  const handleElegirEstudiante = useCallback(
    async (estudiante) => {
      setEstudianteSel(estudiante);
      setSubmitError(null);
      form.setFieldsValue({ inscripcionId: undefined });
      limpiarInscripcion();
      const result = await consultarInscripcion(estudiante.id);
      if (result.success && result.inscripcion?.inscripcionId) {
        form.setFieldsValue({ inscripcionId: result.inscripcion.inscripcionId });
      }
    },
    [form, consultarInscripcion, limpiarInscripcion],
  );

  // Volver al buscador: deselecciona el estudiante y limpia la inscripción resuelta.
  const handleCambiarEstudiante = useCallback(() => {
    setEstudianteSel(null);
    setSubmitError(null);
    limpiarInscripcion();
    form.setFieldsValue({ inscripcionId: undefined });
  }, [form, limpiarInscripcion]);

  // Precarga desde la planilla de asistencia (location.state.estudiante), una sola vez.
  const precargaHecha = useRef(false);
  useEffect(() => {
    if (precargaHecha.current) return;
    if (!estudiantePrecargado?.id) return;
    precargaHecha.current = true;
    handleElegirEstudiante({
      id: estudiantePrecargado.id,
      nombreCompleto: estudiantePrecargado.nombre,
      codigoEstudiante: estudiantePrecargado.codigo,
    });
  }, [estudiantePrecargado, handleElegirEstudiante]);

  // Columnas con el lenguaje visual de la tabla de licencias (numeración + identidad
  // multilínea + carrera), mostrando solo lo exclusivo del estudiante. El periodo y el
  // paralelo no vienen del buscador: se resuelven al elegir (bloque "Inscripción vigente").
  const columnasEstudiantes = useMemo(
    () => [
      {
        title: '#',
        key: 'nro',
        width: 56,
        align: 'center',
        render: (_v, _r, index) => index + 1,
      },
      {
        title: 'Estudiante',
        key: 'nombre',
        render: (_, r) => (
          <IdentidadCelda codigo={r.codigoEstudiante} nombre={r.nombreCompleto} />
        ),
      },
      {
        title: 'Carrera',
        key: 'carrera',
        ellipsis: true,
        render: (_, r) => (
          <IdentidadCelda
            codigo={r.carreraCodigo}
            nombre={(r.carreraNombre || 'Sin carrera').toUpperCase()}
            accentColor={sanitizeDocenteColorHex(r.carreraColorHex) || undefined}
          />
        ),
      },
      {
        title: 'Acción',
        key: 'accion',
        width: 160,
        align: 'right',
        render: (_, r) => (
          <Button
            variant="primary"
            size="small"
            loading={cargandoInscripcion && estudianteSel?.id === r.id}
            onClick={() => handleElegirEstudiante(r)}
          >
            Seleccionar
          </Button>
        ),
      },
    ],
    [estudianteSel, handleElegirEstudiante, cargandoInscripcion],
  );

  const tieneInscripcion = Boolean(inscripcion?.inscripcionId);
  const sinInscripcion = Boolean(estudianteSel) && !cargandoInscripcion && !tieneInscripcion;

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    const values = await form.validateFields();
    // Un solo día (default): fechaFin = fechaInicio. Con rango: campo "fin" aparte.
    const fechaInicio = values.fechaInicio?.format('YYYY-MM-DD');
    const fechaFin = unSoloDia ? fechaInicio : values.fechaFin?.format('YYYY-MM-DD');

    const result = esEdicion
      ? await editarLicencia(licenciaEditar.id, {
          fechaInicio,
          fechaFin,
          motivo: values.motivo,
          detalleMotivo: values.detalleMotivo?.trim(),
        })
      : await crearLicencia({
          inscripcionId: Number(values.inscripcionId),
          fechaInicio,
          fechaFin,
          motivo: values.motivo,
          detalleMotivo: values.detalleMotivo?.trim(),
        });

    if (result.success) {
      message.success(esEdicion ? 'Licencia actualizada' : 'Solicitud de licencia registrada');
      navigate(returnListPath);
      return;
    }
    setSubmitError(
      result.error || (esEdicion ? 'No se pudo editar la licencia' : 'No se pudo registrar la solicitud'),
    );
  }, [
    form,
    esEdicion,
    editarLicencia,
    licenciaEditar,
    crearLicencia,
    message,
    navigate,
    returnListPath,
    unSoloDia,
  ]);

  const esBusquedaActiva = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;
  const formularioHabilitado = esEdicion ? !enviando : tieneInscripcion && !enviando;
  const col = cfgFormColProps(12);

  // Bloques excluyentes: en edición o con estudiante fijado se ocultan el buscador; sin
  // estudiante elegido se muestra SOLO el buscador; al elegir uno aparecen los datos.
  const mostrarBuscador = !esEdicion && !entradaConEstudiante && !estudianteSel;

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={esEdicion ? 'Editar licencia estudiantil' : 'Solicitar licencia estudiantil'}
          breadcrumbItems={breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap="middle" className="cfg-academico-page__stack">
            {mostrarBuscador ? (
              <Seccion title="Estudiante">
                <Input.Search
                  allowClear
                  placeholder="Nombre, apellidos, código o CI…"
                  value={busquedaInput}
                  onChange={(e) => setBusquedaInput(e.target.value)}
                  loading={buscando}
                  style={{ maxWidth: 480, marginBottom: allSpacing.marginSM }}
                />
                {busquedaError ? (
                  <Alert
                    type="error"
                    showIcon
                    title={busquedaError}
                    style={{ marginBottom: allSpacing.marginSM }}
                  />
                ) : null}
                <Text
                  type="secondary"
                  style={{ display: 'block', marginBottom: allSpacing.marginSM }}
                >
                  {esBusquedaActiva
                    ? `Búsqueda por similitud. Borre el texto para volver a la muestra.`
                    : `Muestra de hasta ${PRELIM_LIMIT} estudiantes. Escriba al menos ${BUSQUEDA_MIN_CHARS} caracteres para buscar.`}
                </Text>
                <Table
                  rowKey={(r) => r.id}
                  loading={buscando}
                  columns={columnasEstudiantes}
                  dataSource={estudiantes}
                  size="middle"
                  pagination={esBusquedaActiva ? { pageSize: 10, hideOnSinglePage: true } : false}
                  locale={{ emptyText: buscando ? 'Cargando…' : 'Sin resultados.' }}
                />
              </Seccion>
            ) : (
              <>
                <Seccion
                  title="Inscripción vigente"
                  actions={
                    !esEdicion && !entradaConEstudiante ? (
                      <Button variant="outline" size="small" onClick={handleCambiarEstudiante}>
                        Cambiar estudiante
                      </Button>
                    ) : null
                  }
                >
              {esEdicion ? (
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Estudiante">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <UserOutlined />
                        {licenciaEditar.estudianteNombre ?? '—'}
                      </Flex>
                    </DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Código">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <IdcardOutlined />
                        {licenciaEditar.codigoEstudiante ?? '—'}
                      </Flex>
                    </DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Carrera">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <BankOutlined />
                        {licenciaEditar.carreraNombre ?? '—'}
                        {licenciaEditar.carreraCodigo ? ` · ${licenciaEditar.carreraCodigo}` : ''}
                      </Flex>
                    </DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Periodo del plan">
                      {licenciaEditar.periodoNombre ?? '—'}
                    </DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Paralelo">
                      {licenciaEditar.paraleloNombre ? (
                        <Flex gap={allSpacing.marginXS} align="center">
                          <ApartmentOutlined />
                          {licenciaEditar.paraleloNombre}
                        </Flex>
                      ) : (
                        '—'
                      )}
                    </DetailField>
                  </Col>
                </Row>
              ) : !estudianteSel ? (
                <Text type="secondary">Elija primero un estudiante de la tabla anterior.</Text>
              ) : cargandoInscripcion ? (
                <Text type="secondary">Consultando inscripción vigente…</Text>
              ) : inscripcionError ? (
                <Alert type="error" showIcon title={inscripcionError} />
              ) : sinInscripcion ? (
                <Alert
                  type="warning"
                  showIcon
                  title="El estudiante no tiene inscripción vigente"
                  description="No es posible registrar una licencia sin una inscripción en la gestión vigente."
                />
              ) : (
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Estudiante">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <UserOutlined />
                        {estudianteSel.nombreCompleto ?? '—'}
                      </Flex>
                    </DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Código">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <IdcardOutlined />
                        {inscripcion.codigoEstudiante ?? estudianteSel.codigoEstudiante ?? '—'}
                      </Flex>
                    </DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Inscripción">{inscripcion.inscripcionId}</DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Carrera">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <BankOutlined />
                        {inscripcion.carreraNombre ?? '—'}
                        {inscripcion.carreraCodigo ? ` · ${inscripcion.carreraCodigo}` : ''}
                      </Flex>
                    </DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Periodo del plan">
                      {inscripcion.periodoNombre ?? '—'}
                    </DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Paralelo">
                      {inscripcion.paraleloNombre ? (
                        <Flex gap={allSpacing.marginXS} align="center">
                          <ApartmentOutlined />
                          {inscripcion.paraleloNombre}
                        </Flex>
                      ) : (
                        '—'
                      )}
                    </DetailField>
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    <DetailField label="Gestión vigente">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <CalendarOutlined />
                        {inscripcion.gestionNombre ?? '—'}
                        {inscripcion.gestionAnio ? ` (${inscripcion.gestionAnio})` : ''}
                      </Flex>
                    </DetailField>
                  </Col>
                </Row>
              )}
                </Seccion>

            <Seccion
              title="Datos de la licencia"
              descripcion="Defina el motivo y las fechas. Por defecto la licencia ocupa un solo día; desactive el interruptor para indicar una fecha de fin. El tope es de 15 días por gestión (lo valida el sistema)."
            >
              <Form
                form={form}
                layout="vertical"
                disabled={!formularioHabilitado}
                // En creación, la licencia arranca con la fecha de hoy (un solo día); en
                // edición las fechas las precarga el efecto de prefill desde la licencia.
                initialValues={esEdicion ? undefined : { fechaInicio: dayjs() }}
              >
                {/* inscripcionId se precarga al resolver la inscripción vigente; oculto al usuario. */}
                <Form.Item name="inscripcionId" hidden rules={[{ required: true }]}>
                  <Input type="hidden" />
                </Form.Item>

                <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
                  <Col {...col}>
                    <Form.Item
                      name="motivo"
                      label="Motivo"
                      rules={[{ required: true, message: 'Elija el motivo de la licencia' }]}
                      className="form-field form-field--vertical"
                    >
                      <Select placeholder="Seleccione un motivo" options={MOTIVO_LICENCIA_OPTIONS} />
                    </Form.Item>
                  </Col>

                  <Col {...col}>
                    <Form.Item
                      label="¿Licencia de un solo día?"
                      className="form-field form-field--vertical"
                    >
                      <Flex align="center" gap={allSpacing.marginXS}>
                        <Switch
                          checked={unSoloDia}
                          onChange={setUnSoloDia}
                          disabled={!formularioHabilitado}
                        />
                        <Text type="secondary">
                          {unSoloDia ? 'Sí, ocupa un solo día' : 'No, tiene fecha de fin'}
                        </Text>
                      </Flex>
                    </Form.Item>
                  </Col>

                  <Col {...col}>
                    <Form.Item
                      name="fechaInicio"
                      label="Inicio de la licencia"
                      rules={[{ required: true, message: 'Elija la fecha de inicio' }]}
                      className="form-field form-field--vertical"
                    >
                      <FieldDatePicker placeholder="dd-mm-aaaa" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>

                  {!unSoloDia ? (
                    <Col {...col}>
                      <Form.Item
                        name="fechaFin"
                        label="Fin del periodo de la licencia"
                        rules={[{ required: true, message: 'Elija la fecha de fin' }]}
                        className="form-field form-field--vertical"
                      >
                        <FieldDatePicker placeholder="dd-mm-aaaa" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  ) : null}

                  <Col xs={24}>
                    <Form.Item
                      name="detalleMotivo"
                      label="Detalle del motivo"
                      rules={[{ required: true, message: 'Describa el motivo de la licencia' }]}
                      className="form-field form-field--vertical"
                    >
                      <Input.TextArea
                        rows={3}
                        maxLength={300}
                        showCount
                        placeholder="Describa brevemente el motivo de la solicitud."
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>

              {submitError ? (
                <Alert
                  type="error"
                  showIcon
                  title={submitError}
                  style={{ marginTop: allSpacing.marginSM }}
                />
              ) : null}

              <div className="cfg-academico-form-workspace__footer">
                <Flex justify="space-between" align="center" gap={allSpacing.marginSM} wrap="wrap">
                  <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                    Los campos marcados con <Text type="danger">*</Text> son obligatorios.
                  </Text>
                  <Flex justify="flex-end" gap={allSpacing.marginSM}>
                    <Button variant="outline" onClick={handleVolver} disabled={enviando}>
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      icon={<SendOutlined />}
                      loading={enviando}
                      disabled={!formularioHabilitado}
                      onClick={handleSubmit}
                    >
                      {esEdicion ? 'Guardar cambios' : 'Enviar solicitud'}
                    </Button>
                  </Flex>
                </Flex>
              </div>
            </Seccion>
              </>
            )}
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default LicenciaSolicitarPage;
