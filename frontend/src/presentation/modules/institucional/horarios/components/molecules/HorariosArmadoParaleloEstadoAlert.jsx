import { Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { allSpacing } from '@theme/tokens';
import { mensajeParaleloGestionNoEditable } from '@application-institucional/horarios/utils/paraleloGestionHorarioEditable';

/**
 * Aviso cuando paralelo_gestion está PUBLICADO/CERRADO (el bulk de bloques fallará en servidor).
 */
const HorariosArmadoParaleloEstadoAlert = ({ estado, paraleloGestionId, style }) => {
  const navigate = useNavigate();
  const s = String(estado || '')
    .trim()
    .toUpperCase();
  if (!s || (s !== 'PUBLICADO' && s !== 'CERRADO')) return null;

  const type = s === 'PUBLICADO' ? 'warning' : 'info';

  return (
    <Alert
      type={type}
      showIcon
      style={style}
      title={`Paralelo en estado ${s}`}
      description={
        <Space orientation="vertical" size={allSpacing.marginSM} style={{ width: '100%' }}>
          <span>{mensajeParaleloGestionNoEditable(s)}</span>
          <Space wrap>
            <Button size="small" onClick={() => navigate('/institucional/oferta')}>
              Ir a Oferta académica
            </Button>
            {paraleloGestionId ? (
              <Button
                size="small"
                onClick={() =>
                  navigate(`/institucional/horarios/publicacion?pg=${paraleloGestionId}`)
                }
              >
                Ver publicación de horarios
              </Button>
            ) : null}
          </Space>
        </Space>
      }
    />
  );
};

export default HorariosArmadoParaleloEstadoAlert;
