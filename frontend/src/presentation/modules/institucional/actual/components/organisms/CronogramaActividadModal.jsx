import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const fmt = (d) => (d ? d.format('YYYY-MM-DD') : null);

/**
 * Alta / edición de una actividad del cronograma. El modal es dueño de su Form:
 * valida y entrega el payload a `onSubmit` (que devuelve boolean de éxito).
 */
const CronogramaActividadModal = ({
  open,
  saving,
  editing,
  periodos = [],
  catalogo = [],
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const sincronizar = (opened) => {
    if (!opened) return;
    if (editing) {
      form.setFieldsValue({
        periodoAcademicoId: editing.periodoAcademicoId,
        actividadId: editing.actividadId ?? undefined,
        nombrePersonalizado: editing.nombrePersonalizado ?? '',
        rango: [
          editing.fechaInicio ? dayjs(editing.fechaInicio) : null,
          editing.fechaFin ? dayjs(editing.fechaFin) : null,
        ],
      });
    } else {
      form.resetFields();
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const [inicio, fin] = values.rango || [];
    const nombre = values.nombrePersonalizado?.trim() || null;
    if (!values.actividadId && !nombre) {
      form.setFields([
        {
          name: 'nombrePersonalizado',
          errors: ['Elige una actividad del catálogo o escribe un nombre.'],
        },
      ]);
      return;
    }
    const payload = {
      periodoAcademicoId: values.periodoAcademicoId,
      actividadId: values.actividadId ?? null,
      nombrePersonalizado: nombre,
      fechaInicio: fmt(inicio),
      fechaFin: fmt(fin),
    };
    const ok = await onSubmit(payload);
    if (ok) form.resetFields();
  };

  return (
    <Modal
      title={editing ? 'Editar actividad' : 'Nueva actividad'}
      open={open}
      onOk={handleOk}
      confirmLoading={saving}
      onCancel={onCancel}
      okText="Guardar"
      cancelText="Cancelar"
      destroyOnHidden
      afterOpenChange={sincronizar}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="periodoAcademicoId"
          label="Etapa / periodo"
          rules={[{ required: true, message: 'Seleccione la etapa.' }]}
        >
          <Select
            placeholder="Selecciona la etapa"
            options={periodos.map((p) => ({ value: p.periodoAcademicoId, label: p.nombre }))}
          />
        </Form.Item>

        <Form.Item name="actividadId" label="Actividad del catálogo (opcional)">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Selecciona una actividad del catálogo"
            options={catalogo.map((a) => ({ value: a.id, label: a.nombre }))}
          />
        </Form.Item>

        <Form.Item
          name="nombrePersonalizado"
          label="Nombre personalizado (opcional)"
          tooltip="Si lo dejas vacío se usa el nombre del catálogo."
        >
          <Input maxLength={200} placeholder="Ej.: Presentación de notas del 1er bimestre" />
        </Form.Item>

        <Form.Item
          name="rango"
          label="Fechas (deja la segunda vacía si es de un solo día)"
          rules={[
            {
              validator: (_, value) =>
                value && value[0]
                  ? Promise.resolve()
                  : Promise.reject(new Error('Indique al menos la fecha de inicio.')),
            },
          ]}
        >
          <RangePicker allowEmpty={[false, true]} style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CronogramaActividadModal;
