/**
 * Organismo: modal "Generar folios de la gestión" (listado — P1 · LibrosListPage).
 *
 * A diferencia de `GenerarFoliosModal` (que genera folios de UN paralelo desde
 * la ficha del libro), esta acción genera los folios de TODOS los paralelos
 * de la gestión elegida, de una sola vez, en el orden canónico de carrera
 * (Contaduría → Administración → Informática). Es idempotente: los paralelos
 * que ya tenían folios quedan omitidos (no es error).
 *
 * Dos fases en el mismo modal:
 *   1. Formulario (`Form`, mismo patrón de `AbrirLibroModal`) — elegir la gestión.
 *   2. Resumen — `paralelosGenerados`, `foliosCreados`, rango de folio y la
 *      lista de `omitidos` con su motivo (si hay alguno). El usuario necesita
 *      ver qué se saltó, no se descarta en silencio.
 */

import { useEffect } from 'react';
import { Form, Modal, Select, Typography } from 'antd';
import { Button } from '@atoms';
import { modalWidths } from '@theme/tokens/spacing';
import GenerarFoliosResumen from '../molecules/GenerarFoliosResumen.jsx';

const { Paragraph } = Typography;

const GenerarFoliosGestionModal = ({
  open,
  gestiones = [],
  loadingGestiones = false,
  generando = false,
  resumen = null,
  onGenerar,
  onCancelar,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ gestionId: undefined });
  }, [open, form]);

  const gestionOptions = gestiones.map((gestion) => ({
    value: gestion.id,
    label: gestion.nombre || (gestion.anio != null ? `Gestión ${gestion.anio}` : `Gestión ${gestion.id}`),
  }));

  const mostrarResumen = Boolean(resumen);

  const handleOk = () => form.submit();
  const handleFinish = (values) => onGenerar?.(values.gestionId);

  return (
    <Modal
      open={open}
      title="Generar folios de la gestión"
      onCancel={onCancelar}
      destroyOnHidden
      width={modalWidths.modalWidth}
      footer={
        mostrarResumen
          ? [
              <Button key="cerrar" variant="primary" onClick={onCancelar}>
                Cerrar
              </Button>,
            ]
          : undefined
      }
      okText="Generar folios"
      cancelText="Cancelar"
      onOk={handleOk}
      confirmLoading={generando}
    >
      {mostrarResumen ? (
        <GenerarFoliosResumen resumen={resumen} />
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Paragraph type="secondary">
            Genere los folios de todos los paralelos con oferta en la gestión elegida. Los
            paralelos que ya tengan folios vigentes se omiten (no se regeneran).
          </Paragraph>
          <Form.Item
            name="gestionId"
            label="Gestión"
            rules={[{ required: true, message: 'Seleccione la gestión' }]}
          >
            <Select
              size="large"
              placeholder="Seleccione la gestión"
              loading={loadingGestiones}
              options={gestionOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default GenerarFoliosGestionModal;
