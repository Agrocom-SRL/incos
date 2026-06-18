/**
 * Organismo: tarjeta de BANCOS autorizados (Config. de pagos · Finanzas).
 *
 * Tabla de bancos con switch de activo y editar (modal). El alta ("Agregar banco")
 * se envuelve en `PermisoGuard CREAR`; editar/toggle dependen del permiso EDITAR
 * (gobernado en las columnas). "Quitar" un banco = desactivarlo (switch), no hay
 * eliminar. Recibe props ya mapeadas; no hace fetch.
 */

import { Button, Empty, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { usePermiso } from '@application-auth';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { createBancosColumns } from '@finanzas/configuracion/config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import BancoEditModal from './BancoEditModal.jsx';

const BancosCard = ({
  bancos = [],
  metodos = [],
  saving,
  metodoNombrePorId,
  modalAbierto,
  bancoEnEdicion,
  onAbrirModal,
  onCerrarModal,
  onGuardar,
  onToggleActivo,
}) => {
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');

  const columns = createBancosColumns({
    onEditar: onAbrirModal,
    onToggleActivo,
    puedeEditar,
    saving,
    metodoNombrePorId,
  });

  return (
    <Card
      title="Bancos autorizados"
      headerColor="primary"
      variant="outlined"
      shadow={false}
      extra={
        <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="CREAR">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => onAbrirModal?.(null)}>
            Agregar banco
          </Button>
        </PermisoGuard>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={bancos}
        pagination={false}
        size="middle"
        locale={{ emptyText: <Empty description="No hay bancos autorizados" /> }}
      />

      <BancoEditModal
        open={modalAbierto}
        banco={bancoEnEdicion}
        metodos={metodos}
        saving={saving}
        onGuardar={onGuardar}
        onCancelar={onCerrarModal}
      />
    </Card>
  );
};

export default BancosCard;
