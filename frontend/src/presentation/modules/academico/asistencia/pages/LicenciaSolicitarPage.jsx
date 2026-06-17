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
import { Alert, App, Col, DatePicker, Flex, Form, Input, Row, Select, Switch, Table } from 'antd';
import {
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
import { DetailField, Button, BackButton, Text } from '@atoms';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import { allSpacing } from '@theme/tokens';
import { useCasesFactory } from '@container';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { useLicenciaCrearApi } from '@application-academico/asistencia/hooks/api/useLicenciaCrearApi.js';
import { useInscripcionVigenteApi } from '@application-academico/asistencia/hooks/api/useInscripcionVigenteApi.js';
import { LICENCIAS_PATH } from '@application-academico/asistencia/utils/asistenciaPaths.js';
import { MOTIVO_LICENCIA_OPTIONS } from '@application-academico/asistencia/utils/licenciasMotivos.js';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { RangePicker } = DatePicker;

const BUSQUEDA_DEBOUNCE_MS = 400;
const BUSQUEDA_MIN_CHARS = 2;
const PRELIM_LIMIT = 10;

/** Sección con el mismo shell visual que el formulario de CFG Académico. */
const Seccion = ({ title, actions = null, children }) => (
  <section className="cfg-academico-workspace cfg-academico-form-workspace">
    <header className="cfg-academico-workspace__header">
      <ListPanelHeader title={title} actions={actions} />
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
  // Entrada desde la planilla: el estudiante viene fijado → no se muestra el buscador.
  const entradaConEstudiante = Boolean(estudiantePrecargado?.id);

  const { crearLicencia, loading: enviando } = useLicenciaCrearApi();
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
  // Licencia de un solo día: alterna entre DatePicker único (fechaInicio) y RangePicker.
  const [unSoloDia, setUnSoloDia] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busquedaInput.trim()), BUSQUEDA_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  useEffect(() => {
    // No se busca si el estudiante vino fijado desde la planilla (no hay buscador).
    if (entradaConEstudiante) return undefined;
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
  }, [busquedaDebounced, entradaConEstudiante]);

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

  const columnasEstudiantes = useMemo(
    () => [
      {
        title: 'Estudiante',
        key: 'nombre',
        render: (_, r) => (
          <Flex gap={allSpacing.marginXS} align="start">
            <UserOutlined />
            <div>
              <Text strong>{r.nombreCompleto ?? '—'}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <IdcardOutlined style={{ marginRight: allSpacing.marginXS }} />
                  {r.codigoEstudiante ?? '—'}
                  {r.ci ? ` · CI ${r.ci}` : ''}
                </Text>
              </div>
            </div>
          </Flex>
        ),
      },
      {
        title: 'Carrera',
        key: 'carrera',
        ellipsis: true,
        render: (_, r) => <Text>{r.carreraNombre ?? '—'}</Text>,
      },
      {
        title: '',
        key: 'accion',
        width: 140,
        render: (_, r) => (
          <Button
            variant={estudianteSel?.id === r.id ? 'primary' : 'outline'}
            size="small"
            loading={cargandoInscripcion && estudianteSel?.id === r.id}
            onClick={() => handleElegirEstudiante(r)}
          >
            {estudianteSel?.id === r.id ? 'Elegido' : 'Elegir'}
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
    let fechaInicio;
    let fechaFin;
    if (unSoloDia) {
      // Un solo día: fechaFin = fechaInicio (el backend exige ambas).
      fechaInicio = values.fechaInicio?.format('YYYY-MM-DD');
      fechaFin = fechaInicio;
    } else {
      const [desde, hasta] = values.rango ?? [];
      fechaInicio = desde?.format('YYYY-MM-DD');
      // Rango con solo fecha inicial (allowEmpty) → también se trata como un único día.
      fechaFin = (hasta ?? desde)?.format('YYYY-MM-DD');
    }
    const result = await crearLicencia({
      inscripcionId: Number(values.inscripcionId),
      fechaInicio,
      fechaFin,
      motivo: values.motivo,
      detalleMotivo: values.detalleMotivo?.trim(),
    });
    if (result.success) {
      message.success('Solicitud de licencia registrada');
      navigate(returnListPath);
      return;
    }
    setSubmitError(result.error || 'No se pudo registrar la solicitud');
  }, [form, crearLicencia, message, navigate, returnListPath, unSoloDia]);

  const esBusquedaActiva = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;
  const formularioHabilitado = tieneInscripcion && !enviando;

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Solicitar licencia estudiantil"
          breadcrumbItems={breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap="middle" className="cfg-academico-page__stack">
            <Alert
              type="info"
              showIcon
              title="Solicitud de licencia"
              description="Elegí al estudiante (su inscripción vigente se carga automáticamente) y definí el periodo y el motivo. La solicitud queda PENDIENTE hasta su aprobación. El tope es de 15 días por gestión (lo valida el sistema)."
            />

            {!entradaConEstudiante ? (
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
                    ? `Búsqueda por similitud. Borrá el texto para volver a la muestra.`
                    : `Muestra de hasta ${PRELIM_LIMIT} estudiantes. Escribí al menos ${BUSQUEDA_MIN_CHARS} caracteres para buscar.`}
                </Text>
                <Table
                  rowKey={(r) => r.id}
                  loading={buscando}
                  columns={columnasEstudiantes}
                  dataSource={estudiantes}
                  size="middle"
                  pagination={esBusquedaActiva ? { pageSize: 10, hideOnSinglePage: true } : false}
                  rowClassName={(r) => (estudianteSel?.id === r.id ? 'ant-table-row-selected' : '')}
                  locale={{ emptyText: buscando ? 'Cargando…' : 'Sin resultados.' }}
                />
              </Seccion>
            ) : null}

            <Seccion title="Inscripción vigente">
              {!estudianteSel ? (
                <Text type="secondary">Elegí primero un estudiante de la tabla anterior.</Text>
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

            <Seccion title="Datos de la licencia">
              <Form form={form} layout="vertical" disabled={!formularioHabilitado}>
                {/* inscripcionId se precarga al resolver la inscripción vigente; oculto al usuario. */}
                <Form.Item name="inscripcionId" hidden rules={[{ required: true }]}>
                  <Input type="hidden" />
                </Form.Item>

                <Row gutter={[24, 0]}>
                  <Col xs={24} md={12}>
                    <Flex
                      align="center"
                      gap={allSpacing.marginXS}
                      style={{ marginBottom: allSpacing.marginXS }}
                    >
                      <Switch
                        size="small"
                        checked={unSoloDia}
                        onChange={setUnSoloDia}
                        disabled={!formularioHabilitado}
                      />
                      <Text type="secondary">Licencia de un solo día</Text>
                    </Flex>
                    {unSoloDia ? (
                      <Form.Item
                        name="fechaInicio"
                        label="Fecha de la licencia"
                        rules={[{ required: true, message: 'Elegí la fecha de la licencia' }]}
                      >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        name="rango"
                        label="Periodo de la licencia"
                        rules={[{ required: true, message: 'Elegí el rango de fechas' }]}
                      >
                        <RangePicker
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                          allowEmpty={[true, true]}
                        />
                      </Form.Item>
                    )}
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="motivo"
                      label="Motivo"
                      rules={[{ required: true, message: 'Elegí el motivo de la licencia' }]}
                    >
                      <Select placeholder="Seleccioná un motivo" options={MOTIVO_LICENCIA_OPTIONS} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="detalleMotivo"
                      label="Detalle del motivo"
                      rules={[{ required: true, message: 'Describí el motivo de la licencia' }]}
                    >
                      <Input.TextArea
                        rows={3}
                        maxLength={300}
                        showCount
                        placeholder="Describí brevemente el motivo de la solicitud."
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
                    Enviar solicitud
                  </Button>
                </Flex>
              </div>
            </Seccion>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default LicenciaSolicitarPage;
