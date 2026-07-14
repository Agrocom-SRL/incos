/**
 * Organismo: cierre del bimestre vigente. Valida notas pendientes y consolida el
 * bimestre para habilitar el siguiente (el cierre efectivo en backend está en
 * preparación).
 */

import { Alert, Card, Flex, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';

const { Paragraph, Text } = Typography;

const CerrarBimestreCard = ({
  iniciada,
  bimestreVigente,
  fase,
  cerrando,
  validacion,
  onValidarCierre,
  onCerrarBimestre,
}) => (
  <Card title="Cerrar bimestre vigente" size="small">
    <Flex vertical gap="middle">
      <Paragraph type="secondary" style={{ margin: 0 }}>
        {iniciada
          ? fase?.mensaje ||
            'Valide que no haya notas pendientes y cierre el bimestre para habilitar el siguiente.'
          : 'Disponible una vez iniciada la gestión.'}
      </Paragraph>

      {validacion ? (
        validacion.puedeCerrar ? (
          <Alert
            type="success"
            showIcon
            title="El bimestre puede cerrarse"
            description="No hay cursos con notas pendientes."
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            title={<strong>Notas pendientes impiden el cierre</strong>}
            description={
              <Flex vertical gap="small">
                {(validacion.cursosConNotasFaltantes || []).map((c) => (
                  <Text key={c.asignacionId}>
                    {c.materia} · {c.docente} ({c.paralelo}) — {c.cantidadFaltantes} sin nota
                  </Text>
                ))}
              </Flex>
            }
          />
        )
      ) : null}

      <Flex gap="small" wrap>
        <ActionButton
          permiso="institucional.gestion.actual"
          accion="EDITAR"
          onClick={onValidarCierre}
          disabled={!iniciada || !bimestreVigente}
        >
          Validar cierre
        </ActionButton>
        <ActionButton
          permiso="institucional.gestion.actual"
          accion="EDITAR"
          variant="primary"
          icon={<LockOutlined />}
          loading={cerrando}
          disabled={!iniciada || !bimestreVigente}
          onClick={onCerrarBimestre}
        >
          {bimestreVigente ? `Cerrar bimestre ${bimestreVigente}` : 'Cerrar bimestre'}
        </ActionButton>
      </Flex>
    </Flex>
  </Card>
);

export default CerrarBimestreCard;
