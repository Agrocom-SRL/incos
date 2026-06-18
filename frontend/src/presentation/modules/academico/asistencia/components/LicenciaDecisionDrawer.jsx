/**
 * Drawer único de una licencia estudiantil: ficha (detalle) + decisión (aprobar/rechazar).
 *
 * Reutiliza el SHELL de drawer de calificaciones (EvaluacionDrawer): header oscuro, fondo
 * `--cuaderno-fondo`, footer verde oscuro y tarjetas `SeccionAjustes` sobre `override-card`
 * (única fuente de verdad de estilo, sin duplicar CSS). Lo propio de la licencia (hero con
 * avatar + estado, pills, grilla de campos) vive en `lic-drawer` (licencias.css).
 *
 * La acción "ver" de la tabla lo abre; sobre una licencia PENDIENTE (y con permiso
 * licencia.aprobar · APROBAR) ofrece aprobar/rechazar inline. Al rechazar el motivo es
 * obligatorio; las observaciones son opcionales. La regla "solo desde PENDIENTE" y el tope de
 * días los valida el backend.
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

const DrawerFooter = ({ modo, puedeAccionar, guardando, onCerrar, onConfirmar, onModo }) => {
  const enDecision = modo !== 'idle';
  const esRechazo = modo === 'RECHAZAR';

  if (enDecision) {
    return (
      <div className="cal-eval-drawer__footer">
        <Button onClick={() => onModo('idle')} disabled={guardando}>
          Cancelar
        </Button>
        <div className="cal-eval-drawer__footer-actions">
          <Button
            type="primary"
            danger={esRechazo}
            className={esRechazo ? undefined : 'cal-eval-drawer__btn-primary'}
            icon={esRechazo ? <CloseOutlined /> : <CheckOutlined />}
            loading={guardando}
            onClick={onConfirmar}
          >
            {esRechazo ? 'Confirmar rechazo' : 'Confirmar aprobación'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cal-eval-drawer__footer">
      <Button onClick={onCerrar} disabled={guardando}>
        Cerrar
      </Button>
      {puedeAccionar ? (
        <div className="cal-eval-drawer__footer-actions">
          <Button
            color="danger"
            variant="solid"
            icon={<CloseOutlined />}
            onClick={() => onModo('RECHAZAR')}
          >
            Rechazar
          </Button>
          <Button
            type="primary"
            className="cal-eval-drawer__btn-primary"
            icon={<CheckOutlined />}
            onClick={() => onModo('APROBAR')}
          >
            Aprobar
          </Button>
        </div>
      ) : null}
    </div>
  );
};

const LicenciaDecisionDrawer = ({
  open,
  licencia = null,
  puedeDecidir = false,
  decisionInicial = null,
  guardando = false,
  onCerrar,
  onDecidir,
}) => {
  const [form] = Form.useForm();
  const [modo, setModo] = useState('idle'); // 'idle' | 'APROBAR' | 'RECHAZAR'
  const [sesion, setSesion] = useState(null);

  const esPendiente = licencia?.estado === ESTADOS_LICENCIA.PENDIENTE;
  const puedeAccionar = esPendiente && puedeDecidir;
  const tieneDecision = Boolean(licencia?.motivoRechazo || licencia?.observacionesDecision);
  const esRechazo = modo === 'RECHAZAR';
  const enDecision = modo !== 'idle';

  // Reset del modo al abrir o cambiar de licencia (ajuste de estado en render, sin efecto).
  const sesionActual = open ? `${licencia?.id ?? ''}::${decisionInicial ?? ''}` : null;
  if (sesionActual !== sesion) {
    setSesion(sesionActual);
    setModo(open && puedeAccionar && decisionInicial ? decisionInicial : 'idle');
  }

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, licencia, decisionInicial, form]);

  const handleConfirmar = async () => {
    const values = await form.validateFields();
    const payload = {
      decision: modo,
      observacionesDecision: values.observacionesDecision?.trim() || undefined,
    };
    if (esRechazo) payload.motivoRechazo = values.motivoRechazo?.trim();
    const result = await onDecidir(payload);
    if (result?.success) onCerrar?.();
  };

  const handleCerrar = () => {
    if (!guardando) onCerrar?.();
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
            modo={modo}
            puedeAccionar={puedeAccionar}
            guardando={guardando}
            onCerrar={handleCerrar}
            onConfirmar={handleConfirmar}
            onModo={setModo}
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
            <Campo label="Fecha de solicitud">
              {etiquetaDiaMesAnio(licencia.fechaSolicitud)}
            </Campo>
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

          {enDecision ? (
            <SeccionAjustes
              icon={esRechazo ? CloseOutlined : CheckOutlined}
              titulo={esRechazo ? 'Rechazar solicitud' : 'Aprobar solicitud'}
              className={`${calificacionesDrawerTarjetaClassName} lic-drawer__decision lic-drawer__decision--${
                esRechazo ? 'rechazo' : 'aprobacion'
              }`}
            >
              <p className="cal-ajustes-drawer__section-desc">
                {esRechazo
                  ? 'Indicá el motivo del rechazo. Las observaciones son opcionales.'
                  : 'Confirmá la aprobación. Podés dejar observaciones internas (opcional).'}
              </p>
              <Form form={form} layout="vertical">
                {esRechazo ? (
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
                ) : null}
                <Form.Item
                  name="observacionesDecision"
                  label={esRechazo ? 'Observaciones adicionales (opcional)' : 'Observaciones (opcional)'}
                >
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
