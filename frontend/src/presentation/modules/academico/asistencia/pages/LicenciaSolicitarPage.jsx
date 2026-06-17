/**
 * Solicitar una licencia estudiantil (ACA-ASI-LIC-SOL · CREAR).
 *
 * Página de formulario alineada al patrón de CarreraFormPage (CFG Académico):
 * Flex.page-container → PageHeaderArea(PageHeader + BackButton) → DashboardPageShell → MainContent,
 * formulario en cards (.sd-card) con botones guardar/cancelar al pie.
 *
 * Flujo de captura (selector de inscripción):
 *   1. El usuario busca y elige un estudiante con el buscador gemelo de Becas/Pagos
 *      (`buscarEstudiantesAsignacionBeca`).
 *   2. Al elegirlo se consulta su inscripción vigente
 *      (GET /asistencia/licencias/inscripcion-vigente?estudianteId=) y se PRECARGA
 *      `inscripcionId` mostrando carrera y gestión como contexto de solo lectura.
 *   3. Si el estudiante no tiene inscripción vigente → Alert y guardado deshabilitado.
 *
 * El POST envía { inscripcionId, fechaInicio, fechaFin, motivo, detalleMotivo }.
 * El tope de 15 días/gestión y la validación de la inscripción los hace el backend;
 * aquí solo se muestra el error que devuelva.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  App,
  DatePicker,
  Flex,
  Form,
  Input,
  Select,
  Table,
} from 'antd';
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
import { DetailField } from '@atoms';
import { Button, BackButton, Text } from '@atoms';
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

const LicenciaSolicitarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = location.state?.returnListPath || LICENCIAS_PATH;

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

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busquedaInput.trim()), BUSQUEDA_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  useEffect(() => {
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
  }, [busquedaDebounced]);

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
    const [desde, hasta] = values.rango ?? [];
    const result = await crearLicencia({
      inscripcionId: Number(values.inscripcionId),
      fechaInicio: desde?.format('YYYY-MM-DD'),
      fechaFin: hasta?.format('YYYY-MM-DD'),
      motivo: values.motivo,
      detalleMotivo: values.detalleMotivo?.trim(),
    });
    if (result.success) {
      message.success('Solicitud de licencia registrada');
      navigate(returnListPath);
      return;
    }
    setSubmitError(result.error || 'No se pudo registrar la solicitud');
  }, [form, crearLicencia, message, navigate, returnListPath]);

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
          <div className="sd">
            <Alert
              type="info"
              showIcon
              title="Solicitud de licencia"
              description="Elegí al estudiante (su inscripción vigente se carga automáticamente) y definí el periodo y el motivo. La solicitud queda PENDIENTE hasta su aprobación. El tope es de 15 días por gestión (lo valida el sistema)."
            />

            <section className="sd-card">
              <div className="sd-card__head sd-card__head--cabecera">
                <span className="sd-card__title">1 · Estudiante</span>
              </div>
              <div className="sd-card__body" style={{ display: 'block' }}>
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
                    ? `Búsqueda por similitud. Escribí menos de ${BUSQUEDA_MIN_CHARS} caracteres para volver a la muestra.`
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
              </div>
            </section>

            <section className="sd-card">
              <div className="sd-card__head sd-card__head--cabecera">
                <span className="sd-card__title">2 · Inscripción vigente</span>
              </div>
              <div className="sd-card__body sd-card__body--cols-3">
                {!estudianteSel ? (
                  <DetailField label="Estudiante" span={3}>
                    Elegí primero un estudiante de la tabla anterior.
                  </DetailField>
                ) : cargandoInscripcion ? (
                  <DetailField label="Inscripción" span={3}>
                    Consultando inscripción vigente…
                  </DetailField>
                ) : inscripcionError ? (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Alert type="error" showIcon title={inscripcionError} />
                  </div>
                ) : sinInscripcion ? (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Alert
                      type="warning"
                      showIcon
                      title="El estudiante no tiene inscripción vigente"
                      description="No es posible registrar una licencia sin una inscripción en la gestión vigente."
                    />
                  </div>
                ) : (
                  <>
                    <DetailField label="Estudiante">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <UserOutlined />
                        {estudianteSel.nombreCompleto ?? '—'}
                      </Flex>
                    </DetailField>
                    <DetailField label="Código">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <IdcardOutlined />
                        {inscripcion.codigoEstudiante ?? estudianteSel.codigoEstudiante ?? '—'}
                      </Flex>
                    </DetailField>
                    <DetailField label="Inscripción">{inscripcion.inscripcionId}</DetailField>
                    <DetailField label="Carrera">
                      <Flex gap={allSpacing.marginXS} align="center">
                        <BankOutlined />
                        {inscripcion.carreraNombre ?? '—'}
                        {inscripcion.carreraCodigo ? ` · ${inscripcion.carreraCodigo}` : ''}
                      </Flex>
                    </DetailField>
                    <DetailField label="Gestión vigente" span={2}>
                      <Flex gap={allSpacing.marginXS} align="center">
                        <CalendarOutlined />
                        {inscripcion.gestionNombre ?? '—'}
                        {inscripcion.gestionAnio ? ` (${inscripcion.gestionAnio})` : ''}
                      </Flex>
                    </DetailField>
                  </>
                )}
              </div>
            </section>

            <section className="sd-card">
              <div className="sd-card__head sd-card__head--cabecera">
                <span className="sd-card__title">3 · Datos de la licencia</span>
              </div>
              <div className="sd-card__body" style={{ display: 'block' }}>
                <Form form={form} layout="vertical" disabled={!formularioHabilitado}>
                  {/* inscripcionId se precarga al resolver la inscripción vigente; oculto al usuario. */}
                  <Form.Item name="inscripcionId" hidden rules={[{ required: true }]}>
                    <Input type="hidden" />
                  </Form.Item>

                  <Form.Item
                    name="rango"
                    label="Periodo de la licencia"
                    rules={[{ required: true, message: 'Elegí el rango de fechas' }]}
                  >
                    <RangePicker style={{ maxWidth: 360, width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>

                  <Form.Item
                    name="motivo"
                    label="Motivo"
                    rules={[{ required: true, message: 'Elegí el motivo de la licencia' }]}
                  >
                    <Select
                      style={{ maxWidth: 280, width: '100%' }}
                      placeholder="Seleccioná un motivo"
                      options={MOTIVO_LICENCIA_OPTIONS}
                    />
                  </Form.Item>

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
                </Form>

                {submitError ? (
                  <Alert
                    type="error"
                    showIcon
                    title={submitError}
                    style={{ marginBottom: allSpacing.margin }}
                  />
                ) : null}

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
            </section>
          </div>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default LicenciaSolicitarPage;
