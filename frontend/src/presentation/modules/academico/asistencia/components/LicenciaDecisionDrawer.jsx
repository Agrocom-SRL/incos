/**
 * Drawer de detalle + decisión de una licencia estudiantil.
 *
 * Reutiliza el SHELL de drawer de calificaciones (EvaluacionDrawer): header oscuro, fondo
 * `--cuaderno-fondo`, footer verde oscuro y tarjetas `SeccionAjustes` sobre `override-card`
 * (única fuente de verdad de estilo, sin duplicar CSS). Lo propio de la licencia (hero con
 * avatar + estado, pills, grilla de campos) vive en `lic-drawer` (licencias.css).
 *
 * Acciones según estado (el backend valida cada transición):
 *  - PENDIENTE: APROBAR (directo, sin confirmación), RECHAZAR (con motivo obligatorio) y
 *    EDITAR (no abre formulario aquí: navega a la página de solicitud en modo edición, vía
 *    `onEditar` — el drawer NO carga lógica de formulario).
 *  - APROBADA: solo CANCELAR la solicitud (+ cerrar).
 *  - RECHAZADA / CANCELADA: solo lectura (cerrar).
 */

import { useEffect, useState } from 'react';
import { App, Button, Drawer, Form, Input } from 'antd';
import {
  ApartmentOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  IdcardOutlined,
  SolutionOutlined,
  StopOutlined,
} from '@ant-design/icons';
import StatusPill from '@atoms/StatusPill';
import SeccionAjustes from '@academico/calificaciones/components/ajustes/SeccionAjustes.jsx';
import {
  CALIFICACIONES_DRAWER_Z_INDEX,
  calificacionesDrawerClassNames,
  calificacionesDrawerRootClassName,
  calificacionesDrawerSectionClassName,
  calificacionesDrawerStyles,
  calificacionesDrawerTarjetaClassName,
} from '@academico/calificaciones/utils/calificacionesDrawerLayout.js';
import {
  formatEstadoLicencia,
  ESTADOS_LICENCIA,
} from '@application-academico/asistencia/utils/licenciasEstados.js';
import { formatMotivoLicencia } from '@application-academico/asistencia/utils/licenciasMotivos.js';
import { getMotivoPillClass, getEstadoTextClass } from '@application-academico/asistencia/utils/licenciaPills.js';
import {
  etiquetaRangoFechas,
  etiquetaDiaMesAnio,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';
import '@academico/calificaciones/styles/calificaciones.css';
import '../styles/licencias.css';

const inicialesDe = (nombre) =>
  String(nombre || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'E';

const Campo = ({ label, children, full = false }) => (
  <div className={`lic-drawer__field${full ? ' lic-drawer__field--full' : ''}`}>
    <span className="lic-drawer__field-label">{label}</span>
    <span className="lic-drawer__field-value">{children ?? '—'}</span>
  </div>
);

const Tarjeta = ({ icon, titulo, children, className }) => (
  <SeccionAjustes
    icon={icon}
    titulo={titulo}
    className={[calificacionesDrawerTarjetaClassName, className].filter(Boolean).join(' ')}
  >
    <div className="lic-drawer__grid">{children}</div>
  </SeccionAjustes>
);

/** Footer por estado/modo. La aprobación es directa (sin paso de confirmación). */
const DrawerFooter = ({
  enRechazo,
  estado,
  puedeDecidir,
  puedeEditar,
  puedeCancelar,
  guardando,
  cancelando,
  onCerrar,
  onModoRechazo,
  onCancelarRechazo,
  onAprobar,
  onConfirmarRechazo,
  onEditar,
  onCancelarSolicitud,
}) => {
  const ocupado = guardando || cancelando;

  // Rechazo: confirmar rechazo / cancelar.
  if (enRechazo) {
    return (
      <div className="cal-eval-drawer__footer">
        <Button onClick={onCancelarRechazo} disabled={ocupado}>
          Cancelar
        </Button>
        <div className="cal-eval-drawer__footer-actions">
          <Button
            type="primary"
            danger
            icon={<CloseOutlined />}
            loading={guardando}
            onClick={onConfirmarRechazo}
          >
            Confirmar rechazo
          </Button>
        </div>
      </div>
    );
  }

  const esPendiente = estado === ESTADOS_LICENCIA.PENDIENTE;
  const esAprobada = estado === ESTADOS_LICENCIA.APROBADA;

  return (
    <div className="cal-eval-drawer__footer">
      <Button onClick={onCerrar} disabled={ocupado}>
        Cerrar
      </Button>
      <div className="cal-eval-drawer__footer-actions">
        {esPendiente && puedeEditar ? (
          <Button variant="outlined" color="gold" icon={<EditOutlined />} onClick={onEditar}>
            Editar
          </Button>
        ) : null}
        {esPendiente && puedeDecidir ? (
          <>
            <Button color="danger" variant="solid" icon={<CloseOutlined />} onClick={onModoRechazo}>
              Rechazar
            </Button>
            <Button
              type="primary"
              className="cal-eval-drawer__btn-primary"
              icon={<CheckOutlined />}
              loading={guardando}
              onClick={onAprobar}
            >
              Aprobar
            </Button>
          </>
        ) : null}
        {esAprobada && puedeCancelar ? (
          <Button
            color="danger"
            variant="solid"
            icon={<StopOutlined />}
            loading={cancelando}
            onClick={onCancelarSolicitud}
          >
            Cancelar solicitud
          </Button>
        ) : null}
      </div>
    </div>
  );
};

const LicenciaDecisionDrawer = ({
  open,
  licencia = null,
  puedeDecidir = false,
  puedeEditar = false,
  puedeCancelar = false,
  guardando = false,
  cancelando = false,
  onCerrar,
  onDecidir,
  onEditar,
  onCancelar,
}) => {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [enRechazo, setEnRechazo] = useState(false);
  const [sesion, setSesion] = useState(null);

  const tieneDecision = Boolean(licencia?.motivoRechazo || licencia?.observacionesDecision);

  // Reset del modo al abrir o cambiar de licencia (ajuste de estado en render, sin efecto).
  const sesionActual = open ? `${licencia?.id ?? ''}` : null;
  if (sesionActual !== sesion) {
    setSesion(sesionActual);
    setEnRechazo(false);
  }

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, licencia, form]);

  const handleAprobar = async () => {
    const result = await onDecidir?.({ decision: 'APROBAR' });
    if (result?.success) onCerrar?.();
  };

  const handleConfirmarRechazo = async () => {
    const values = await form.validateFields();
    const result = await onDecidir?.({
      decision: 'RECHAZAR',
      motivoRechazo: values.motivoRechazo?.trim(),
      observacionesDecision: values.observacionesDecision?.trim() || undefined,
    });
    if (result?.success) onCerrar?.();
  };

  const handleCancelarSolicitud = () => {
    modal.confirm({
      title: 'Cancelar la solicitud de licencia',
      icon: <StopOutlined />,
      content: (
        <span>
          La licencia de <strong>{licencia?.estudianteNombre ?? 'el estudiante'}</strong> pasará a
          estado <strong>Cancelada</strong> y dejará de reflejarse en la planilla. Esta acción no se
          puede deshacer.
        </span>
      ),
      okText: 'Cancelar solicitud',
      okButtonProps: { danger: true },
      cancelText: 'Volver',
      onOk: async () => {
        const result = await onCancelar?.(licencia);
        if (result?.success) onCerrar?.();
      },
    });
  };

  const ocupado = guardando || cancelando;
  const handleCerrar = () => {
    if (!ocupado) onCerrar?.();
  };

  return (
    <Drawer
      title="Detalle de la licencia"
      width={540}
      open={open}
      onClose={handleCerrar}
      destroyOnHidden
      rootClassName={calificacionesDrawerRootClassName}
      className={`${calificacionesDrawerSectionClassName} lic-drawer`}
      classNames={calificacionesDrawerClassNames}
      zIndex={CALIFICACIONES_DRAWER_Z_INDEX}
      styles={calificacionesDrawerStyles()}
      footer={
        licencia ? (
          <DrawerFooter
            enRechazo={enRechazo}
            estado={licencia.estado}
            puedeDecidir={puedeDecidir}
            puedeEditar={puedeEditar}
            puedeCancelar={puedeCancelar}
            guardando={guardando}
            cancelando={cancelando}
            onCerrar={handleCerrar}
            onModoRechazo={() => setEnRechazo(true)}
            onCancelarRechazo={() => setEnRechazo(false)}
            onAprobar={handleAprobar}
            onConfirmarRechazo={handleConfirmarRechazo}
            onEditar={() => onEditar?.(licencia)}
            onCancelarSolicitud={handleCancelarSolicitud}
          />
        ) : null
      }
    >
      {licencia ? (
        <div className="cal-eval-drawer__bloques lic-drawer__bloques">
          <div className="lic-drawer__hero">
            <span className="lic-drawer__avatar">{inicialesDe(licencia.estudianteNombre)}</span>
            <div className="lic-drawer__hero-info">
              <span className="lic-drawer__hero-name">
                {licencia.estudianteNombre ?? 'Estudiante'}
              </span>
              <span className="lic-drawer__hero-meta">
                <IdcardOutlined /> {licencia.codigoEstudiante ?? '—'}
                {licencia.carreraNombre ? ` · ${licencia.carreraNombre}` : ''}
              </span>
              <span className={`lic-drawer__hero-estado ${getEstadoTextClass(licencia.estado)}`}>
                <span className="licencia-estudiante-cell__dot" aria-hidden />
                {formatEstadoLicencia(licencia.estado)}
              </span>
            </div>
          </div>

          <Tarjeta icon={BankOutlined} titulo="Inscripción">
            <Campo label="Carrera" full>
              {licencia.carreraNombre ?? '—'}
              {licencia.carreraCodigo ? ` · ${licencia.carreraCodigo}` : ''}
            </Campo>
            <Campo label="Periodo del plan">{licencia.periodoNombre}</Campo>
            <Campo label="Paralelo">
              {licencia.paraleloNombre ? (
                <span className="lic-drawer__inline">
                  <ApartmentOutlined /> {licencia.paraleloNombre}
                </span>
              ) : (
                '—'
              )}
            </Campo>
          </Tarjeta>

          <Tarjeta icon={CalendarOutlined} titulo="Periodo de la licencia">
            <Campo label="Rango de fechas" full>
              {etiquetaRangoFechas(licencia.fechaInicio, licencia.fechaFin)}
            </Campo>
            <Campo label="Total de días">
              <span className="lic-drawer__inline">
                <FieldTimeOutlined /> {licencia.totalDias ?? '—'} día(s)
              </span>
            </Campo>
            <Campo label="Fecha de solicitud">{etiquetaDiaMesAnio(licencia.fechaSolicitud)}</Campo>
          </Tarjeta>

          <Tarjeta icon={SolutionOutlined} titulo="Motivo">
            <Campo label="Categoría" full>
              <StatusPill
                label={formatMotivoLicencia(licencia.motivo)}
                className={getMotivoPillClass(licencia.motivo)}
              />
            </Campo>
            <Campo label="Detalle del motivo" full>
              {licencia.detalleMotivo}
            </Campo>
          </Tarjeta>

          {tieneDecision ? (
            <Tarjeta icon={FileTextOutlined} titulo="Decisión registrada">
              <Campo label="Motivo del rechazo" full>
                {licencia.motivoRechazo}
              </Campo>
              <Campo label="Observaciones" full>
                {licencia.observacionesDecision}
              </Campo>
            </Tarjeta>
          ) : null}

          {enRechazo ? (
            <SeccionAjustes
              icon={CloseOutlined}
              titulo="Rechazar solicitud"
              className={`${calificacionesDrawerTarjetaClassName} lic-drawer__decision lic-drawer__decision--rechazo`}
            >
              <p className="cal-ajustes-drawer__section-desc">
                Indicá el motivo del rechazo. Las observaciones son opcionales.
              </p>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="motivoRechazo"
                  label="Motivo del rechazo"
                  rules={[{ required: true, message: 'Indicá por qué se rechaza la licencia' }]}
                >
                  <Input.TextArea
                    rows={3}
                    maxLength={300}
                    showCount
                    placeholder="Ej.: la documentación de respaldo no fue presentada."
                  />
                </Form.Item>
                <Form.Item name="observacionesDecision" label="Observaciones adicionales (opcional)">
                  <Input.TextArea
                    rows={3}
                    maxLength={300}
                    showCount
                    placeholder="Notas internas sobre la decisión."
                  />
                </Form.Item>
              </Form>
            </SeccionAjustes>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
};

export default LicenciaDecisionDrawer;
