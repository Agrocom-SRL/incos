/**
 * Drawer de edición del NOMBRE de un método de pago (Config. de pagos · Finanzas).
 *
 * Los 4 métodos son fijos (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO): el código no se
 * edita; solo el nombre visible. El estado activo/inactivo se gobierna desde la
 * tabla (acción extra). Drawer AntD6 (`open`) con el shell compartido de
 * calificaciones (`cal-ajustes-drawer`). Recibe handlers ya mapeados (no hace fetch).
 */

import { useEffect } from 'react';
import { Drawer, Form, Input } from 'antd';
import { CheckOutlined, TagsOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import SeccionAjustes from '@academico/calificaciones/components/ajustes/SeccionAjustes.jsx';
import {
  CALIFICACIONES_DRAWER_Z_INDEX,
  calificacionesDrawerClassNames,
  calificacionesDrawerRootClassName,
  calificacionesDrawerSectionClassName,
  calificacionesDrawerStyles,
  calificacionesDrawerTarjetaClassName,
} from '@academico/calificaciones/utils/calificacionesDrawerLayout.js';
import '@academico/calificaciones/styles/calificaciones.css';

const MetodoDrawer = ({ open, metodo, saving, onGuardar, onCancelar }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && metodo) {
      form.setFieldsValue({ nombre: metodo.nombre });
    }
  }, [open, metodo, form]);

  const handleFinish = (values) => {
    onGuardar?.(metodo.id, { nombre: values.nombre?.trim() });
  };

  const handleCerrar = () => {
    if (!saving) onCancelar?.();
  };

  return (
    <Drawer
      title={`Editar método${metodo?.codigo ? ` · ${metodo.codigo}` : ''}`}
      size={520}
      open={open}
      onClose={handleCerrar}
      destroyOnHidden
      rootClassName={calificacionesDrawerRootClassName}
      className={calificacionesDrawerSectionClassName}
      classNames={calificacionesDrawerClassNames}
      zIndex={CALIFICACIONES_DRAWER_Z_INDEX}
      styles={calificacionesDrawerStyles()}
      footer={
        <div className="cal-eval-drawer__footer">
          <Button onClick={handleCerrar} disabled={saving}>
            Cancelar
          </Button>
          <div className="cal-eval-drawer__footer-actions">
            <Button
              type="primary"
              className="cal-eval-drawer__btn-primary"
              icon={<CheckOutlined />}
              loading={saving}
              onClick={() => form.submit()}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      }
    >
      <div className="cal-eval-drawer__bloques">
        <SeccionAjustes
          icon={TagsOutlined}
          titulo="Nombre del método"
          className={calificacionesDrawerTarjetaClassName}
        >
          <p className="cal-ajustes-drawer__section-desc">
            El código del método es fijo. Editá únicamente el nombre con el que se muestra a los
            estudiantes al registrar un pago.
          </p>
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item
              name="nombre"
              label="Nombre visible"
              rules={[{ required: true, message: 'Ingrese el nombre del método' }]}
            >
              <Input size="large" placeholder="Nombre visible del método" maxLength={100} />
            </Form.Item>
          </Form>
        </SeccionAjustes>
      </div>
    </Drawer>
  );
};

export default MetodoDrawer;
