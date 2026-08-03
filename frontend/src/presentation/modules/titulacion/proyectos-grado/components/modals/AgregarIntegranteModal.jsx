/**
 * Modal: agregar integrante al proyecto de grado (TIT · T12, proyecto·EDITAR).
 *
 * Búsqueda de estudiantes en servidor (debounce) reutilizando el hook de API
 * del módulo (`useBuscarEstudiantesTit`, catálogo del plan). Excluye a los
 * integrantes ya ACTIVOS del proyecto. El backend valida duplicados igual.
 */

import { useEffect, useMemo } from 'react';
import { Form, Modal, Select, Spin, Typography } from 'antd';
import { useBuscarEstudiantesTit } from '@application-titulacion/proyectos-grado/hooks/api/useBuscarEstudiantesTit';

const { Text } = Typography;

const AgregarIntegranteModal = ({ open, onCancel, onSubmit, saving = false, integrantes = [] }) => {
  const [form] = Form.useForm();
  const busqueda = useBuscarEstudiantesTit();
  const { limpiar } = busqueda;

  useEffect(() => {
    if (open) {
      form.resetFields();
      limpiar();
    }
  }, [open, form, limpiar]);

  // Ids de integrantes ACTIVOS: no se ofrecen de nuevo en el select.
  const idsActivos = useMemo(
    () =>
      new Set(
        integrantes
          .filter((i) => i.estado === 'ACTIVO' && i.estudianteId != null)
          .map((i) => i.estudianteId),
      ),
    [integrantes],
  );

  const options = useMemo(
    () =>
      busqueda.estudiantes
        .filter((e) => !idsActivos.has(e.id))
        .map((e) => ({
          value: e.id,
          label: e.ci ? `${e.nombreCompleto} · C.I. ${e.ci}` : e.nombreCompleto,
        })),
    [busqueda.estudiantes, idsActivos],
  );

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values.estudianteId);
  };

  return (
    <Modal
      title="Agregar integrante"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Agregar"
      cancelText="Volver"
      confirmLoading={saving}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="estudianteId"
          label="Estudiante"
          rules={[{ required: true, message: 'Seleccione al estudiante' }]}
        >
          <Select
            showSearch
            filterOption={false}
            onSearch={busqueda.buscar}
            loading={busqueda.loading}
            options={options}
            notFoundContent={
              busqueda.loading ? (
                <Spin size="small" />
              ) : (
                <Text type="secondary">
                  Escriba al menos 2 caracteres para buscar por nombre o C.I.
                </Text>
              )
            }
            placeholder="Busque por nombre o C.I."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AgregarIntegranteModal;
