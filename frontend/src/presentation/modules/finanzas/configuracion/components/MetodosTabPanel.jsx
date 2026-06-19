/**
 * Panel del tab «Métodos de pago» (Config. de pagos · Finanzas).
 *
 * Lista los 4 métodos fijos (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO) como filas
 * (`Flex`, no `<List>` nuevo): código + nombre, `StatusPill` de estado, switch de
 * activo (PUT directo) y editar nombre (abre `MetodoDrawer`). Sin crear/eliminar.
 * Los controles se gobiernan por permiso EDITAR. Recibe props ya mapeadas; no hace fetch.
 */

import { Empty, Flex, Switch, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Button, Text } from '@atoms';
import StatusPill from '@atoms/StatusPill';
import { usePermiso } from '@application-auth';
import { allSpacing } from '@theme/tokens';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { getActivoPill } from '@finanzas/configuracion/config/configPagosPills';
import MetodoDrawer from './MetodoDrawer.jsx';
import '../styles/config-pagos.css';

const MetodosTabPanel = ({
  metodos = [],
  saving,
  onToggleActivo,
  drawerAbierto,
  metodoEnEdicion,
  onAbrirDrawer,
  onCerrarDrawer,
  onGuardar,
}) => {
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');

  return (
    <div className="cfg-pagos-panel">
      {metodos.length === 0 ? (
        <Empty description="No hay métodos de pago configurados" />
      ) : (
        <Flex vertical gap={allSpacing.marginSM} style={{ width: '100%' }}>
          {metodos.map((metodo) => {
            const pill = getActivoPill(!!metodo.activo);
            return (
              <div key={metodo.id} className="cfg-pagos-metodo-row">
                <div className="cfg-pagos-metodo-row__id">
                  <Tag>{metodo.codigo}</Tag>
                  <Text ellipsis>{metodo.nombre}</Text>
                </div>
                <div className="cfg-pagos-metodo-row__actions">
                  <StatusPill label={pill.label} className={pill.className} />
                  <Switch
                    checked={!!metodo.activo}
                    disabled={!puedeEditar || saving}
                    checkedChildren="Activo"
                    unCheckedChildren="Inactivo"
                    onChange={(checked) => onToggleActivo?.(metodo, checked)}
                  />
                  <Button
                    variant="warning"
                    size="small"
                    icon={<EditOutlined />}
                    disabled={!puedeEditar}
                    onClick={() => onAbrirDrawer?.(metodo)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            );
          })}
        </Flex>
      )}

      <MetodoDrawer
        open={drawerAbierto}
        metodo={metodoEnEdicion}
        saving={saving}
        onGuardar={onGuardar}
        onCancelar={onCerrarDrawer}
      />
    </div>
  );
};

export default MetodosTabPanel;
