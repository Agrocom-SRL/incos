import { BankOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { ActionButton, StatusPill } from '@atoms';
import { buildCarreraImageUrl } from '@application-institucional/horarios/utils/buildCarreraImageUrl';
import { aulaParaleloLabel, paraleloEstadoPillClass } from '../../utils/ofertaParaleloUi';

const { Text, Title } = Typography;

const OfertaParaleloDetalleContextHeader = ({
  detalle,
  puedeEditarAula,
  onAsignarAula,
}) => {
  if (!detalle) return null;

  const imagenUrl = buildCarreraImageUrl(detalle.carreraImagenRuta);
  const periodoLabel = detalle.periodoNombre
    ? `${detalle.periodoNombre}${detalle.periodoNumero != null ? ` (n.º ${detalle.periodoNumero})` : ''}`
    : '—';
  const aulaLabel = aulaParaleloLabel(detalle);
  const tieneAula = Boolean(detalle.aulaId);

  return (
    <div className="oferta-paralelo-detalle-context horarios-armado-context">
      <Flex gap={16} align="flex-start" wrap="wrap">
        {imagenUrl ? (
          <img
            className="horarios-armado-context__img oferta-paralelo-detalle-context__img"
            src={imagenUrl}
            alt=""
            width={152}
            height={152}
          />
        ) : null}
        <Flex vertical gap={6} style={{ minWidth: 0, flex: 1 }}>
          <Flex wrap="wrap" gap="small" align="center">
            <Title level={4} style={{ margin: 0 }}>
              {detalle.paraleloNombre ?? `Paralelo #${detalle.id}`}
            </Title>
            <StatusPill
              label={detalle.estado ?? '—'}
              className={paraleloEstadoPillClass(detalle.estado)}
            />
            {detalle.turno ? (
              <StatusPill label={detalle.turno} className="cfg-materia-pill cfg-materia-pill--default" />
            ) : null}
          </Flex>
          <Text type="secondary">
            {detalle.carreraNombre
              ? `${detalle.carreraNombre}${detalle.carreraCodigo ? ` (${detalle.carreraCodigo})` : ''}`
              : 'Carrera: —'}
          </Text>
          <Text type="secondary">
            Periodo: <Text strong>{periodoLabel}</Text>
          </Text>
          <Text type="secondary">
            Turno: <Text strong>{detalle.turno ?? '—'}</Text>
            {' · '}
            Cupo:{' '}
            <Text strong>
              {detalle.cupoMinimo != null && detalle.cupoMaximo != null
                ? `${detalle.cupoMinimo}–${detalle.cupoMaximo}`
                : detalle.cupoMaximo ?? '—'}
            </Text>
          </Text>
          <Flex wrap="wrap" gap="small" align="center" className="oferta-paralelo-detalle-context__aula-row">
            <Text type="secondary">
              Aula:{' '}
              <Text type={tieneAula ? 'success' : 'default'} strong={tieneAula}>{tieneAula ? aulaLabel : 'Sin asignar'}</Text>
            </Text>
            {puedeEditarAula ? (
              <ActionButton
                permiso="institucional.oferta.paralelo-gestion"
                accion="EDITAR"
                variant="primary"
                size="small"
                icon={<BankOutlined />}
                onClick={onAsignarAula}
              >
                {tieneAula ? 'Cambiar aula' : 'Asignar aula'}
              </ActionButton>
            ) : null}
            {!puedeEditarAula && detalle.estado === 'CERRADO' ? (
              <Text type="secondary" className="oferta-paralelo-detalle-context__aula-hint">
                Paralelo cerrado: habilítelo desde Planes vigentes para editar el aula.
              </Text>
            ) : null}
          </Flex>
          {detalle.planNombre ? (
            <Text type="secondary">{detalle.planNombre}</Text>
          ) : null}
          {detalle.paraleloDescripcion ? (
            <Text type="secondary" className="oferta-paralelo-detalle-context__desc">
              {detalle.paraleloDescripcion}
            </Text>
          ) : null}
          <Text type="secondary" className="oferta-paralelo-detalle-context__hint">
            Vincule docentes por materia en la tabla. Para marcar OFERTADO se requiere aula y oferta
            completa del periodo; docentes y bloques horarios pueden completarse después.
          </Text>
        </Flex>
      </Flex>
    </div>
  );
};

export default OfertaParaleloDetalleContextHeader;
