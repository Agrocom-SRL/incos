/**
 * Resumen de política: vista en vivo (gestión vigente) o referencia de gestión anterior con botón copiar.
 */

import { Tag, Typography } from 'antd';
import { CheckCircleOutlined, CopyOutlined, HistoryOutlined } from '@ant-design/icons';
import { Button, Card } from '@atoms';
import { POLITICAS_ASISTENCIA } from '@application-academico/calificaciones/utils/politicasAsistencia.js';

const { Text, Paragraph } = Typography;

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
  variant = 'vigente',
  gestionVigenteNombre,
  gestionNombre,
  configurada,
  cuotaTeorico,
  cuotaPractico,
  pesosBimestres,
  politicaAsistenciaDefault,
  notaMinimaAprobacion,
  ultimaModificacion,
  sumaCuota,
  sumaBimestres,
  onUsarConfiguracion,
  usarConfiguracionDisabled = false,
}) => {
  const esReferenciaAnterior = variant === 'anterior';
  const cuotaOk = Math.abs(sumaCuota - 100) <= 0.01;
  const bimOk = Math.abs(sumaBimestres - 100) <= 0.01;
  const pad = politicaAsistenciaDefault ?? {};

  return (
    <Card
      className={`cal-politica-resumen-card${esReferenciaAnterior ? ' cal-politica-resumen-card--anterior' : ''}`}
      styles={{ body: { padding: '24px' } }}
    >
      <ResumenHeader
        esReferenciaAnterior={esReferenciaAnterior}
        gestionNombre={gestionNombre}
        gestionVigenteNombre={gestionVigenteNombre}
        configurada={configurada}
        ultimaModificacion={ultimaModificacion}
      />

      <div className="cal-politica-resumen__divider" />

      <FilaResumen
        label="Ponderación teórico / práctico (gestión)"
        value={`${Number(cuotaTeorico)} pts teórico · ${Number(cuotaPractico)} pts práctico`}
      />
      <FilaResumen
        label="Suma ponderación"
        value={`${sumaCuota.toFixed(1)}% / 100%`}
        valueStyle={{ color: cuotaOk ? '#196b45' : '#d97706', fontWeight: 600 }}
      />

      <div className="cal-politica-resumen__divider cal-politica-resumen__divider--light" />

      <Text className="cal-politica-resumen__subtitulo">Ponderación en nota anual</Text>
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

      <div className="cal-politica-resumen__divider cal-politica-resumen__divider--light" />

      <Text className="cal-politica-resumen__subtitulo">Asistencia</Text>
      <FilaResumen label="Modo" value={etiquetaAsistencia(pad.politica)} />
      {pad.politica === 'COMPUTA_NOTA' ? (
        <FilaResumen
          label="Ponderación en nota final"
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
        value="100 puntos (suma ponderada de los 4 bimestres)"
        valueStyle={{ color: '#595959', fontSize: 14 }}
      />

      {esReferenciaAnterior && onUsarConfiguracion ? (
        <Button
          variant="primary"
          icon={<CopyOutlined />}
          onClick={onUsarConfiguracion}
          disabled={usarConfiguracionDisabled}
          className="cal-politica-resumen__btn-copiar"
          block
        >
          Copiar y guardar configuración
        </Button>
      ) : null}
    </Card>
  );
};

const ResumenHeader = ({
  esReferenciaAnterior,
  gestionNombre,
  gestionVigenteNombre,
  configurada,
  ultimaModificacion,
}) => (
  <div>
    <div className="cal-politica-resumen__titulo">
      {esReferenciaAnterior ? 'Configuración de la gestión anterior' : 'Detalle de la configuración'}
    </div>
    {esReferenciaAnterior ? (
      <Paragraph type="secondary" className="cal-politica-resumen__desc-anterior">
        Referencia de <Text strong>{gestionNombre}</Text>. Puede copiar y guardar la misma configuración
        en <Text strong>{gestionVigenteNombre}</Text> con un solo clic.
      </Paragraph>
    ) : null}
    <div className="cal-politica-resumen__fila cal-politica-resumen__fila--gestion">
      <Text>{gestionNombre}</Text>
      {esReferenciaAnterior ? (
        <Tag color="processing">Gestión anterior</Tag>
      ) : configurada ? (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Guardada
        </Tag>
      ) : (
        <Tag color="warning">Borrador (sin guardar)</Tag>
      )}
    </div>
    {!esReferenciaAnterior && ultimaModificacion?.updatedAt ? (
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
