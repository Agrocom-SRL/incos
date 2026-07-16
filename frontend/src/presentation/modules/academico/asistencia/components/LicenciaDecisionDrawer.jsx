/**
 * Drawer de detalle + decisión de una licencia estudiantil.
 *
 * Reutiliza el SHELL de drawer de calificaciones (EvaluacionDrawer): header oscuro, fondo
 * `--cuaderno-fondo`, footer verde oscuro y tarjetas `SeccionAjustes` sobre `override-card`.
 *
 * Campo ÚNICO de observaciones: aprobar / rechazar / cancelar comparten un solo textarea
 * (`observaciones`) que registra el motivo de la acción — en rechazo y cancelación es
 * obligatorio (el motivo), en aprobación es opcional (por qué se aprueba). Al presionar la
 * acción se revela el campo en blanco; al confirmar, esa observación queda como la última
 * registrada y se ve en la vista junto al estado actual.
 *
 * Acciones según estado (el backend valida cada transición):
 *  - PENDIENTE: APROBAR (con observación opcional) o RECHAZAR (motivo obligatorio).
 *  - APROBADA: CANCELAR (motivo obligatorio). La edición vive en la página de solicitud.
 *  - RECHAZADA / CANCELADA: solo lectura.
 */

import { useEffect, useState } from 'react';
import { Button, Drawer, Form, Input } from 'antd';
import {
  ApartmentOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
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

/** Modos del drawer. */
const MODO = { VISTA: 'vista', APROBAR: 'aprobar', RECHAZAR: 'rechazar', CANCELAR: 'cancelar' };

/** Config del panel de observaciones por acción. */
const PANEL = {
  [MODO.APROBAR]: {
    icon: CheckOutlined,
    titulo: 'Aprobar solicitud',
    acento: 'lic-drawer__decision--aprobacion',
    desc: 'Confirme la aprobación. Puede registrar una observación (por qué se aprueba).',
    label: 'Observaciones (opcional)',
    requerido: false,
    placeholder: 'Ej.: documentación de respaldo verificada.',
    confirmar: 'Confirmar aprobación',
    confirmarIcon: CheckOutlined,
    danger: false,
  },
  [MODO.RECHAZAR]: {
    icon: CloseOutlined,
    titulo: 'Rechazar solicitud',
    acento: 'lic-drawer__decision--rechazo',
    desc: 'Indique el motivo del rechazo.',
    label: 'Motivo del rechazo',
    requerido: true,
    placeholder: 'Ej.: la documentación de respaldo no fue presentada.',
    confirmar: 'Confirmar rechazo',
    confirmarIcon: CloseOutlined,
    danger: true,
  },
  [MODO.CANCELAR]: {
    icon: StopOutlined,
    titulo: 'Cancelar solicitud',
    acento: 'lic-drawer__decision--rechazo',
    desc: 'Indique el motivo de la cancelación. La licencia dejará de reflejarse en la planilla.',
    label: 'Motivo de la cancelación',
    requerido: true,
    placeholder: 'Ej.: el estudiante retomó asistencia antes de lo previsto.',
    confirmar: 'Confirmar cancelación',
    confirmarIcon: StopOutlined,
    danger: true,
  },
};

/** Título de la tarjeta de observaciones en la vista, según el estado. */
const TITULO_OBSERVACION = {
  [ESTADOS_LICENCIA.APROBADA]: 'Observaciones de la aprobación',
  [ESTADOS_LICENCIA.RECHAZADA]: 'Motivo del rechazo',
  [ESTADOS_LICENCIA.CANCELADA]: 'Motivo de la cancelación',
};

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

/** Footer por estado/modo. */
const DrawerFooter = ({
  modo,
  estado,
  puedeDecidir,
  puedeCancelar,
  procesando,
  onCerrar,
  onModo,
  onConfirmar,
}) => {
  // En una acción (aprobar/rechazar/cancelar): volver / confirmar.
  if (modo !== MODO.VISTA) {
    const cfg = PANEL[modo];
    return (
      <div className="cal-eval-drawer__footer">
        <Button onClick={() => onModo(MODO.VISTA)} disabled={procesando}>
          Volver
        </Button>
        <div className="cal-eval-drawer__footer-actions">
          <Button
            type="primary"
            danger={cfg.danger}
            className={cfg.danger ? undefined : 'cal-eval-drawer__btn-primary'}
            icon={<cfg.confirmarIcon />}
            loading={procesando}
            onClick={onConfirmar}
          >
            {cfg.confirmar}
          </Button>
        </div>
      </div>
    );
  }

  const esPendiente = estado === ESTADOS_LICENCIA.PENDIENTE;
  const esAprobada = estado === ESTADOS_LICENCIA.APROBADA;

  return (
    <div className="cal-eval-drawer__footer">
      <Button onClick={onCerrar} disabled={procesando}>
        Cerrar
      </Button>
      <div className="cal-eval-drawer__footer-actions">
        {esPendiente && puedeDecidir ? (
          <>
            <Button color="danger" variant="solid" icon={<CloseOutlined />} onClick={() => onModo(MODO.RECHAZAR)}>
              Rechazar
            </Button>
            <Button
              type="primary"
              className="cal-eval-drawer__btn-primary"
              icon={<CheckOutlined />}
              onClick={() => onModo(MODO.APROBAR)}
            >
              Aprobar
            </Button>
          </>
        ) : null}
        {esAprobada && puedeCancelar ? (
          <Button color="danger" variant="solid" icon={<StopOutlined />} onClick={() => onModo(MODO.CANCELAR)}>
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
  puedeCancelar = false,
  guardando = false,
  cancelando = false,
  onCerrar,
  onDecidir,
  onCancelar,
}) => {
  const [form] = Form.useForm();
  const [modo, setModo] = useState(MODO.VISTA);
  const [sesion, setSesion] = useState(null);

  const procesando = guardando || cancelando;
  // Observación registrada (campo único de la decisión).
  const observacionRegistrada = licencia?.observacionesDecision || null;

  // Reset del modo al abrir o cambiar de licencia (ajuste de estado en render, sin efecto).
  const sesionActual = open ? `${licencia?.id ?? ''}` : null;
  if (sesionActual !== sesion) {
    setSesion(sesionActual);
    setModo(MODO.VISTA);
  }

  // Al entrar/salir de una acción, el campo arranca en blanco (nueva observación).
  useEffect(() => {
    form.resetFields();
  }, [open, modo, form]);

  const cambiarModo = (nuevo) => setModo(nuevo);

  const handleConfirmar = async () => {
    const values = await form.validateFields();
    const observaciones = values.observaciones?.trim();
    let result;
    if (modo === MODO.APROBAR) {
      result = await onDecidir?.({ decision: 'APROBAR', observacionesDecision: observaciones || undefined });
    } else if (modo === MODO.RECHAZAR) {
      result = await onDecidir?.({ decision: 'RECHAZAR', observacionesDecision: observaciones });
    } else if (modo === MODO.CANCELAR) {
      result = await onCancelar?.(licencia, observaciones);
    }
    if (result?.success) onCerrar?.();
  };

  const handleCerrar = () => {
    if (!procesando) onCerrar?.();
  };

  const panel = modo !== MODO.VISTA ? PANEL[modo] : null;

  return (
    <Drawer
      title="Detalle de la licencia"
      size={540}
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
            modo={modo}
            estado={licencia.estado}
            puedeDecidir={puedeDecidir}
            puedeCancelar={puedeCancelar}
            procesando={procesando}
            onCerrar={handleCerrar}
            onModo={cambiarModo}
            onConfirmar={handleConfirmar}
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

          {/* Vista: última observación registrada según el estado. */}
          {modo === MODO.VISTA && observacionRegistrada ? (
            <Tarjeta
              icon={FileTextOutlined}
              titulo={TITULO_OBSERVACION[licencia.estado] ?? 'Observaciones'}
            >
              <Campo label="Última observación" full>
                {observacionRegistrada}
              </Campo>
            </Tarjeta>
          ) : null}

          {/* Acción: panel con el campo único de observaciones (en blanco). */}
          {panel ? (
            <SeccionAjustes
              icon={panel.icon}
              titulo={panel.titulo}
              className={`${calificacionesDrawerTarjetaClassName} lic-drawer__decision ${panel.acento}`}
            >
              <p className="cal-ajustes-drawer__section-desc">{panel.desc}</p>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="observaciones"
                  label={panel.label}
                  rules={
                    panel.requerido
                      ? [{ required: true, message: 'Indique el motivo' }]
                      : undefined
                  }
                >
                  <Input.TextArea
                    rows={3}
                    maxLength={300}
                    showCount
                    placeholder={panel.placeholder}
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
