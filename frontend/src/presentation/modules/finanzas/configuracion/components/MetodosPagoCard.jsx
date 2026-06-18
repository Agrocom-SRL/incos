/**
 * Organismo: tarjeta de MÉTODOS de pago (Config. de pagos · Finanzas).
 *
 * Lista los 4 métodos fijos (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO) como filas
 * (`Flex`, no `<List>` nuevo): cada fila muestra código + nombre, un switch de
 * activo (PUT directo) y un botón de editar nombre (abre `MetodoEditModal`). Sin
 * crear/eliminar. Los controles se gobiernan por permiso EDITAR.
 *
 * Recibe props ya mapeadas (métodos, handlers, estado de modal); no hace fetch.
 */

import { Button, Empty, Flex, Switch, Tag, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { usePermiso } from '@application-auth';
import { allSpacing } from '@theme/tokens';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import MetodoEditModal from './MetodoEditModal.jsx';

const { Text } = Typography;

const MetodosPagoCard = ({
  metodos = [],
  saving,
  onToggleActivo,
  modalAbierto,
  metodoEnEdicion,
  onAbrirModal,
  onCerrarModal,
  onGuardar,
}) => {
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');

  return (
    <Card title="Métodos de pago" headerColor="primary" variant="outlined" shadow={false}>
      {metodos.length === 0 ? (
        <Empty description="No hay métodos de pago configurados" />
      ) : (
        <Flex vertical gap={allSpacing.marginSM} style={{ width: '100%' }}>
          {metodos.map((metodo) => (
            <Flex
              key={metodo.id}
              align="center"
              justify="space-between"
              gap={allSpacing.margin}
              style={{
                padding: `${allSpacing.marginSM}px ${allSpacing.margin}px`,
                border: '1px solid var(--color-border-secondary, var(--color-border))',
                borderRadius: allSpacing.borderRadius,
              }}
            >
              <Flex align="center" gap={allSpacing.marginSM} style={{ minWidth: 0 }}>
                <Tag>{metodo.codigo}</Tag>
                <Text ellipsis>{metodo.nombre}</Text>
              </Flex>
              <Flex align="center" gap={allSpacing.margin}>
                <Switch
                  checked={!!metodo.activo}
                  disabled={!puedeEditar || saving}
                  checkedChildren="Activo"
                  unCheckedChildren="Inactivo"
                  onChange={(checked) => onToggleActivo?.(metodo, checked)}
                />
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  disabled={!puedeEditar}
                  onClick={() => onAbrirModal?.(metodo)}
                >
                  Editar
                </Button>
              </Flex>
            </Flex>
          ))}
        </Flex>
      )}

      <MetodoEditModal
        open={modalAbierto}
        metodo={metodoEnEdicion}
        saving={saving}
        onGuardar={onGuardar}
        onCancelar={onCerrarModal}
      />
    </Card>
  );
};

export default MetodosPagoCard;
