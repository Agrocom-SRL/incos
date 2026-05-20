/**
 * Tarjeta de estado de un bimestre en el tablero.
 */

import { Button, Card, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  LockOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const ESTADO_CONFIG = {
  CERRADO: {
    color: 'default',
    label: 'Cerrado',
    icon: <CheckCircleOutlined />,
    className: 'tablero-bim__card--cerrado',
  },
  EN_CURSO: {
    color: 'success',
    label: 'En curso',
    icon: <PlayCircleOutlined />,
    className: 'tablero-bim__card--vigente',
  },
  BLOQUEADO: {
    color: 'default',
    label: 'Bloqueado',
    icon: <LockOutlined />,
    className: 'tablero-bim__card--bloqueado',
  },
};

const formatearFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

const BimestreGestionCard = ({
  bimestre,
  esVigente,
  puedeIniciarGestion,
  onIniciarGestion,
  onCerrar,
  accionando,
}) => {
  const cfg = ESTADO_CONFIG[bimestre.estado] ?? ESTADO_CONFIG.BLOQUEADO;
  const esPrimero = bimestre.numero === 1;

  return (
    <Card
      size="small"
      className={['tablero-bim__card', cfg.className, esVigente ? 'tablero-bim__card--activo' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="tablero-bim__head">
        <span className="tablero-bim__numero">Bimestre {bimestre.numero}</span>
        <Tag icon={cfg.icon} color={cfg.color}>
          {cfg.label}
        </Tag>
      </div>

      {bimestre.fechaInicio ? (
        <Text type="secondary" className="tablero-bim__fecha">
          Inicio: {formatearFecha(bimestre.fechaInicio)}
        </Text>
      ) : null}
      {bimestre.fechaCierre ? (
        <Text type="secondary" className="tablero-bim__fecha">
          Cierre: {formatearFecha(bimestre.fechaCierre)}
        </Text>
      ) : null}

      {esPrimero && bimestre.matriculasTransicionadas != null ? (
        <Paragraph type="secondary" className="tablero-bim__detalle">
          {bimestre.matriculasTransicionadas} matrículas INSCRITO → CURSANDO
        </Paragraph>
      ) : null}

      <div className="tablero-bim__actions">
        {puedeIniciarGestion && esPrimero ? (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={accionando}
            onClick={onIniciarGestion}
            className="tablero-bim__btn-primary"
          >
            Iniciar Bimestre 1
          </Button>
        ) : null}

        {bimestre.estado === 'EN_CURSO' && esVigente ? (
          <Button
            danger
            icon={<StopOutlined />}
            loading={accionando}
            onClick={() => onCerrar(bimestre.numero)}
          >
            Cerrar bimestre
          </Button>
        ) : null}

        {bimestre.estado === 'BLOQUEADO' ? (
          <Text type="secondary" className="tablero-bim__bloqueado-msg">
            Se habilita al cerrar el bimestre anterior
          </Text>
        ) : null}
      </div>
    </Card>
  );
};

export default BimestreGestionCard;
