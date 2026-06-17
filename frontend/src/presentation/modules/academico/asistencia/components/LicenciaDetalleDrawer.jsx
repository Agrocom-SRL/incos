/**
 * Drawer de detalle de una licencia estudiantil (solo lectura) — organismo.
 *
 * Resuelve el caso "detalle" sin una ruta ficha aparte (coherente con la decisión inline):
 * muestra los campos del contrato y, si la licencia ya tiene decisión, su motivo de rechazo
 * y observaciones. Reusa el layout/estilo de los drawers de Académico.
 */

import { Drawer, Tag } from 'antd';
import { CalendarOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField } from '@atoms';
import {
  CALIFICACIONES_DRAWER_Z_INDEX,
  calificacionesDrawerClassNames,
  calificacionesDrawerRootClassName,
  calificacionesDrawerSectionClassName,
  calificacionesDrawerStyles,
} from '@academico/calificaciones/utils/calificacionesDrawerLayout.js';
import {
  formatEstadoLicencia,
  tagColorEstadoLicencia,
} from '@application-academico/asistencia/utils/licenciasEstados.js';
import { formatMotivoLicencia } from '@application-academico/asistencia/utils/licenciasMotivos.js';
import {
  etiquetaRangoFechas,
  etiquetaDiaMesAnio,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';

const LicenciaDetalleDrawer = ({ abierto, licencia = null, onCerrar }) => {
  const tieneDecision = Boolean(licencia?.motivoRechazo || licencia?.observacionesDecision);

  return (
    <Drawer
      title="Detalle de la licencia"
      size={520}
      open={abierto}
      onClose={onCerrar}
      destroyOnHidden
      rootClassName={calificacionesDrawerRootClassName}
      className={calificacionesDrawerSectionClassName}
      classNames={calificacionesDrawerClassNames}
      zIndex={CALIFICACIONES_DRAWER_Z_INDEX}
      styles={calificacionesDrawerStyles()}
    >
      {licencia ? (
        <div className="sd">
          <DetailInfoCard title="Estudiante" icon={<UserOutlined />} cols={1}>
            <DetailField label="Nombre completo">{licencia.estudianteNombre}</DetailField>
            <DetailField label="Estado">
              <Tag color={tagColorEstadoLicencia(licencia.estado)}>
                {formatEstadoLicencia(licencia.estado)}
              </Tag>
            </DetailField>
          </DetailInfoCard>

          <DetailInfoCard title="Periodo solicitado" icon={<CalendarOutlined />} cols={2}>
            <DetailField label="Rango de fechas">
              {etiquetaRangoFechas(licencia.fechaInicio, licencia.fechaFin)}
            </DetailField>
            <DetailField label="Total de días">{licencia.totalDias}</DetailField>
            <DetailField label="Fecha de solicitud">
              {etiquetaDiaMesAnio(licencia.fechaSolicitud)}
            </DetailField>
            <DetailField label="Motivo">{formatMotivoLicencia(licencia.motivo)}</DetailField>
            <DetailField label="Detalle del motivo" span={2}>
              {licencia.detalleMotivo}
            </DetailField>
          </DetailInfoCard>

          {tieneDecision ? (
            <DetailInfoCard title="Decisión" icon={<FileTextOutlined />} cols={1}>
              <DetailField label="Motivo del rechazo">{licencia.motivoRechazo}</DetailField>
              <DetailField label="Observaciones">{licencia.observacionesDecision}</DetailField>
            </DetailInfoCard>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
};

export default LicenciaDetalleDrawer;
