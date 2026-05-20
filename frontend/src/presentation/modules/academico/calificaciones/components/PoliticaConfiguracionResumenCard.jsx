/**
 * Resumen tipo recibo (estilo pagos) de la ponderación y política vigente.
 */

import { Tag, Typography } from 'antd';
import { CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { POLITICAS_ASISTENCIA } from '@application-academico/calificaciones/utils/politicasAsistencia.js';
import { sumaPesos } from '@application-academico/calificaciones/utils/politicaPorcentajeUtils.js';

const { Text } = Typography;

const etiquetaAsistencia = (codigo) =>
  POLITICAS_ASISTENCIA.find((p) => p.value === codigo)?.label ?? codigo ?? '—';

const FilaResumen = ({ label, value, valueStyle, labelStyle }) => (
  <div className="cal-politica-resumen__fila">
    <Text className="cal-politica-resumen__label" style={labelStyle}>
      {label}
    </Text>
    <Text className="cal-politica-resumen__valor" style={valueStyle}>
      {value}
    </Text>
  </div>
);

const PoliticaConfiguracionResumenCard = ({
  gestionNombre,
  configurada,
  cuotaTeorico,
  cuotaPractico,
  pesosBimestres,
  evaluacionesFinalesDisponibles,
  politicaAsistenciaDefault,
  notaMinimaAprobacion,
  ultimaModificacion,
  sumaCuota,
  sumaBimestres,
}) => {
  const finalesActivas = (evaluacionesFinalesDisponibles ?? []).filter(
    (e) => e.habilitadaInstitucional,
  );
  const cuotaOk = Math.abs(sumaCuota - 100) <= 0.01;
  const bimOk = Math.abs(sumaBimestres - 100) <= 0.01;
  const pad = politicaAsistenciaDefault ?? {};

  return (
    <Card className="cal-politica-resumen-card" styles={{ body: { padding: '24px' } }}>
      <FlexResumenHeader
        gestionNombre={gestionNombre}
        configurada={configurada}
        ultimaModificacion={ultimaModificacion}
      />

      <div className="cal-politica-resumen__divider" />

      <FilaResumen
        label="Cuota teórico / práctico (bimestre)"
        value={`${Number(cuotaTeorico).toFixed(1)}% · ${Number(cuotaPractico).toFixed(1)}%`}
      />
      <FilaResumen
        label="Suma cuota"
        value={`${sumaCuota.toFixed(1)}% / 100%`}
        valueStyle={{ color: cuotaOk ? '#196b45' : '#d97706', fontWeight: 600 }}
      />

      <div className="cal-politica-resumen__divider cal-politica-resumen__divider--light" />

      <Text className="cal-politica-resumen__subtitulo">Peso en nota anual</Text>
      {[1, 2, 3, 4].map((n, i) => (
        <FilaResumen
          key={n}
          label={`Bimestre ${n}`}
          value={`${Number(pesosBimestres?.[i] ?? 0).toFixed(1)}%`}
        />
      ))}
      <FilaResumen
        label="Suma bimestres"
        value={`${sumaBimestres.toFixed(1)}% / 100%`}
        valueStyle={{ color: bimOk ? '#196b45' : '#d97706', fontWeight: 600 }}
      />

      {finalesActivas.length > 0 ? (
        <>
          <div className="cal-politica-resumen__divider cal-politica-resumen__divider--light" />
          <Text className="cal-politica-resumen__subtitulo">Evaluaciones finales (catálogo)</Text>
          {finalesActivas.map((e) => (
            <FilaResumen key={e.codigo} label={e.nombre} value="Habilitada" valueStyle={{ color: '#196b45' }} />
          ))}
        </>
      ) : null}

      <div className="cal-politica-resumen__divider cal-politica-resumen__divider--light" />

      <Text className="cal-politica-resumen__subtitulo">Asistencia (default)</Text>
      <FilaResumen label="Modo" value={etiquetaAsistencia(pad.politica)} />
      {pad.politica === 'COMPUTA_NOTA' ? (
        <FilaResumen
          label="Peso en nota práctica"
          value={`${Number(pad.pesoAsistencia ?? 0).toFixed(1)}%`}
          labelStyle={{ color: '#52c41a' }}
        />
      ) : null}
      {pad.politica === 'CAUSA_REPROBACION' ? (
        <>
          <FilaResumen
            label="Asistencia mínima exigida"
            value={`${Number(pad.minimoAsistencia ?? 0).toFixed(1)}%`}
          />
          <FilaResumen
            label="Nota si reprueba por asistencia"
            value={Number(pad.notaReprobada ?? 0).toFixed(1)}
            labelStyle={{ color: '#cf1322' }}
          />
        </>
      ) : null}

      <div className="cal-politica-resumen__divider" />

      <FilaResumen
        label="Nota mínima para aprobar"
        value={Number(notaMinimaAprobacion ?? 61).toFixed(1)}
        valueStyle={{ fontSize: 18, fontWeight: 700, color: '#196b45' }}
      />
      <FilaResumen
        label="Escala de calificación"
        value="100 puntos (bimestres + finales según curso)"
        valueStyle={{ color: '#595959', fontSize: 14 }}
      />
    </Card>
  );
};

const FlexResumenHeader = ({ gestionNombre, configurada, ultimaModificacion }) => (
  <div>
    <div className="cal-politica-resumen__titulo">Detalle de la configuración</div>
    <div className="cal-politica-resumen__fila cal-politica-resumen__fila--gestion">
      <Text>Gestión {gestionNombre}</Text>
      {configurada ? (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Guardada
        </Tag>
      ) : (
        <Tag color="warning">Borrador (sin guardar)</Tag>
      )}
    </div>
    {ultimaModificacion?.updatedAt ? (
      <div className="cal-politica-resumen__meta">
        <HistoryOutlined />
        <Text type="secondary">
          {ultimaModificacion.updatedByNombre
            ? `${ultimaModificacion.updatedByNombre} · `
            : ''}
          {new Date(ultimaModificacion.updatedAt).toLocaleDateString('es-BO', {
            dateStyle: 'medium',
          })}
        </Text>
      </div>
    ) : null}
  </div>
);

export default PoliticaConfiguracionResumenCard;
