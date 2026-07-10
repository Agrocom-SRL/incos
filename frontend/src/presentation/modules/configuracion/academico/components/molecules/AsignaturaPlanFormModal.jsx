/**
 * Molécula: alta/edición de una asignatura del plan dentro de un periodo.
 * En alta se elige la materia del catálogo (no asignada aún al periodo);
 * en edición la materia queda fija — solo se ajustan horas semanales y modalidad
 * (mismo límite que `UpdateAsignaturaPlanUseCase`, que no permite reasignar materia).
 */

import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select } from 'antd';

const AsignaturaPlanFormModal = ({
  open,
  mode = 'create',
  loading = false,
  initialValues,
  materiasOptions = [],
  materiaLabel,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        materiaId: initialValues?.materiaId ?? undefined,
        horasSemanales: initialValues?.horasSemanales ?? undefined,
        modalidad: initialValues?.modalidad ?? '',
      });
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const ok = await onSubmit({
      materia_id: !isEdit ? Number(values.materiaId) : undefined,
      horas_semanales: Number(values.horasSemanales),
      modalidad: values.modalidad?.trim() || undefined,
    });
    if (ok) form.resetFields();
  };

  return (
    <Modal
      title={isEdit ? 'Editar asignatura del periodo' : 'Agregar asignatura al periodo'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isEdit ? 'Guardar' : 'Agregar'}
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        {isEdit ? (
          <Form.Item label="Materia">
            <Input value={materiaLabel} disabled />
          </Form.Item>
        ) : (
          <Form.Item
            name="materiaId"
            label="Materia"
            rules={[{ required: true, message: 'Seleccione la materia' }]}
          >
            <Select
              showSearch
              placeholder="Seleccione una materia del catálogo"
              optionFilterProp="label"
              options={materiasOptions.map((m) => ({
                value: m.id,
                label: m.sigla ? `${m.sigla} — ${m.nombre}` : m.nombre,
              }))}
              notFoundContent="No hay materias disponibles para este periodo"
            />
          </Form.Item>
        )}
        <Form.Item
          name="horasSemanales"
          label="Horas semanales"
          rules={[{ required: true, message: 'Las horas semanales son requeridas' }]}
        >
          <InputNumber min={1} max={60} style={{ width: '100%' }} placeholder="4" />
        </Form.Item>
        <Form.Item name="modalidad" label="Modalidad (opcional)">
          <Input placeholder="REGULAR" maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AsignaturaPlanFormModal;
