/**
 * Organismo: tarjeta de CUENTAS de pago (Config. de pagos · Finanzas).
 *
 * Tabla de cuentas con switch de activo, editar (modal con subida de QR) y alta
 * ("Agregar cuenta", envuelta en `PermisoGuard CREAR`). "Quitar" una cuenta =
 * desactivarla (switch), no hay eliminar. Recibe props ya mapeadas; no hace fetch.
 */

import { Button, Empty, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { usePermiso } from '@application-auth';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { createCuentasColumns } from '@finanzas/configuracion/config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import CuentaEditModal from './CuentaEditModal.jsx';

const CuentasCard = ({
  cuentas = [],
  metodos = [],
  bancos = [],
  saving,
  metodoNombrePorId,
  modalAbierto,
  cuentaEnEdicion,
  onAbrirModal,
  onCerrarModal,
  onGuardar,
  onToggleActivo,
}) => {
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');

  const columns = createCuentasColumns({
    onEditar: onAbrirModal,
    onToggleActivo,
    puedeEditar,
    saving,
    metodoNombrePorId,
  });

  return (
    <Card
      title="Cuentas de pago"
      headerColor="primary"
      variant="outlined"
      shadow={false}
      extra={
        <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="CREAR">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => onAbrirModal?.(null)}>
            Agregar cuenta
          </Button>
        </PermisoGuard>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={cuentas}
        pagination={false}
        size="middle"
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <Empty description="No hay cuentas de pago" /> }}
      />

      <CuentaEditModal
        open={modalAbierto}
        cuenta={cuentaEnEdicion}
        metodos={metodos}
        bancos={bancos}
        saving={saving}
        onGuardar={onGuardar}
        onCancelar={onCerrarModal}
      />
    </Card>
  );
};

export default CuentasCard;
