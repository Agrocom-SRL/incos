import { BankOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { ActionButton, StatusPill } from '@atoms';
import { buildCarreraImageUrl } from '@application-institucional/horarios/utils/buildCarreraImageUrl';
import {
    aulaParaleloLabel,
    paraleloEstadoPillClass,
} from '@application-institucional/oferta/utils/ofertaParaleloUi';
import './paralelo-gestion-context-header.css';

const { Text, Title } = Typography;

/**
 * Cabecera de contexto para `paralelo_gestion` (oferta académica y armado de horarios).
 * @param {'oferta'|'armado'} [variant='oferta'] — oferta: estado, cupo, aula; armado: datos base + hint
 */
const ParaleloGestionContextHeader = ({
    detalle,
    hint,
    variant = 'oferta',
    titleLevel = 4,
    puedeEditarAula = false,
    onAsignarAula,
}) => {
    if (!detalle) return null;

    const isOferta = variant === 'oferta';
    const imagenUrl = buildCarreraImageUrl(detalle.carreraImagenRuta);
    const periodoLabel = detalle.periodoNombre
        ? `${detalle.periodoNombre}${detalle.periodoNumero != null ? ` (n.º ${detalle.periodoNumero})` : ''}`
        : '—';
    const aulaLabel = aulaParaleloLabel(detalle);
    const tieneAula = Boolean(detalle.aulaId);
    const cupoLabel =
        detalle.cupoMinimo != null && detalle.cupoMaximo != null
            ? `${detalle.cupoMinimo}–${detalle.cupoMaximo}`
            : detalle.cupoMaximo ?? '—';

    return (
        <div className="pg-context-header">
            <Flex gap={16} align="flex-start" wrap="wrap">
                {imagenUrl ? (
                    <img
                        className="pg-context-header__img"
                        src={imagenUrl}
                        alt=""
                        width={152}
                        height={152}
                    />
                ) : null}
                <Flex vertical gap={isOferta ? 6 : 4} style={{ minWidth: 0, flex: 1 }}>
                    <Flex wrap="wrap" gap="small" align="center">
                        <Title level={titleLevel} style={{ margin: 0 }}>
                            {detalle.paraleloNombre ?? `Paralelo #${detalle.id ?? '—'}`}
                        </Title>
                        {isOferta && detalle.estado ? (
                            <StatusPill
                                label={detalle.estado}
                                className={paraleloEstadoPillClass(detalle.estado)}
                            />
                        ) : null}
                        {isOferta && detalle.turno ? (
                            <StatusPill
                                label={detalle.turno}
                                className="cfg-materia-pill cfg-materia-pill--default"
                            />
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
                        {isOferta ? (
                            <>
                                {' · '}
                                Cupo: <Text strong>{cupoLabel}</Text>
                            </>
                        ) : null}
                    </Text>
                    {isOferta ? (
                        <Flex
                            wrap="wrap"
                            gap="small"
                            align="center"
                            className="pg-context-header__aula-row"
                        >
                            <Text type="secondary">
                                Aula:{' '}
                                <Text type={tieneAula ? 'success' : 'default'} strong={tieneAula}>
                                    {tieneAula ? aulaLabel : 'Sin asignar'}
                                </Text>
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
                                <Text type="secondary" className="pg-context-header__aula-hint">
                                    Paralelo cerrado: habilítelo desde Planes vigentes para editar el
                                    aula.
                                </Text>
                            ) : null}
                        </Flex>
                    ) : (
                        <Text type="secondary">
                            Aula:{' '}
                            <Text type={tieneAula ? 'success' : 'default'} strong={tieneAula}>
                                {tieneAula ? aulaLabel : 'Sin asignar'}
                            </Text>
                        </Text>
                    )}
                    {isOferta && detalle.planNombre ? (
                        <Text type="secondary">{detalle.planNombre}</Text>
                    ) : null}
                    {detalle.paraleloDescripcion ? (
                        <Text type="secondary" className="pg-context-header__desc">
                            {detalle.paraleloDescripcion}
                        </Text>
                    ) : null}
                    {hint ? (
                        <Text type="secondary" className="pg-context-header__hint">
                            {hint}
                        </Text>
                    ) : null}
                </Flex>
            </Flex>
        </div>
    );
};

export default ParaleloGestionContextHeader;
