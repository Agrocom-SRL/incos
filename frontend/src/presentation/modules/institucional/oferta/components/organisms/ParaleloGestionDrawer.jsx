import { useState } from 'react';
import {
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';

const { Text } = Typography;
import { ActionButton } from '@atoms';

const ParaleloGestionDrawer = ({
  open,
  paraleloId,
  detalle,
  ofertaCursos,
  asignaturasFaltantes = [],
  aulas,
  onClose,
  onRefresh,
  crearOfertaCursoManual,
  eliminarOfertaCurso,
  updateParaleloGestion,
}) => {
  const [form] = Form.useForm();
  const [manualOpen, setManualOpen] = useState(false);

  const onSave = async () => {
    const values = await form.validateFields();
    const res = await updateParaleloGestion(paraleloId, {
      aula_id: values.aulaId ?? null,
      cupo_maximo: values.cupoMaximo,
      cupo_minimo: values.cupoMinimo,
      observaciones: values.observaciones ?? null,
    });
    if (res?.success) {
      await onRefresh();
    }
  };

  const onAgregarManual = async (values) => {
    const res = await crearOfertaCursoManual({
      paralelo_gestion_id: paraleloId,
      asignatura_plan_id: values.asignaturaPlanId,
    });
    if (res?.success) {
      setManualOpen(false);
      await onRefresh();
    }
  };

  const opcionesAsignatura = asignaturasFaltantes.map((a) => ({
    value: a.asignaturaPlanId,
    label: a.materiaNombre
      ? `${a.materiaCodigo ? `${a.materiaCodigo} — ` : ''}${a.materiaNombre}${
          a.horasSemanales ? ` (${a.horasSemanales} h)` : ''
        }`
      : `Asignatura #${a.asignaturaPlanId}`,
  }));

  return (
    <Drawer
      title={detalle?.paraleloNombre ?? 'Paralelo de gestión'}
      width={640}
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        <ActionButton permiso="institucional.oferta.paralelo-gestion" accion="EDITAR" onClick={onSave}>
          Guardar
        </ActionButton>
      }
    >
      {detalle ? (
        <>
          <Descriptions size="small" column={1} bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Paralelo maestro">{detalle.paraleloNombre}</Descriptions.Item>
            <Descriptions.Item label="Periodo">{detalle.periodoNombre ?? detalle.periodoId}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag>{detalle.estado}</Tag>
            </Descriptions.Item>
          </Descriptions>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              aulaId: detalle.aulaId,
              cupoMaximo: detalle.cupoMaximo,
              cupoMinimo: detalle.cupoMinimo,
              observaciones: detalle.observaciones,
            }}
            key={detalle.id}
          >
            <Form.Item name="aulaId" label="Aula">
              <Select
                allowClear
                options={aulas.map((a) => ({
                  value: a.id,
                  label: a.codigo ? `${a.codigo} — ${a.nombre}` : a.nombre,
                }))}
              />
            </Form.Item>
            <Form.Item name="cupoMaximo" label="Cupo máximo">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="cupoMinimo" label="Cupo mínimo">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="observaciones" label="Observaciones">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>

          <Space style={{ marginBottom: 12 }}>
            <Text strong>Oferta de cursos</Text>
            <ActionButton
              permiso="institucional.oferta.cursos"
              accion="CREAR"
              size="small"
              onClick={() => setManualOpen(true)}
            >
              Agregar curso manual
            </ActionButton>
          </Space>

          <Table
            size="small"
            rowKey="id"
            pagination={false}
            dataSource={ofertaCursos}
            columns={[
              { title: 'Materia', dataIndex: 'materiaNombre', key: 'materia' },
              { title: 'Horas', dataIndex: 'horasSemanales', width: 70 },
              { title: 'Estado', dataIndex: 'estado', width: 110 },
              {
                title: '',
                key: 'del',
                width: 80,
                render: (_, row) => (
                  <ActionButton
                    permiso="institucional.oferta.cursos"
                    accion="ELIMINAR"
                    danger
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const res = await eliminarOfertaCurso(row.id);
                      if (res?.success) await onRefresh();
                    }}
                  >
                    Quitar
                  </ActionButton>
                ),
              },
            ]}
          />

          <Modal
            title="Curso manual"
            open={manualOpen}
            onCancel={() => setManualOpen(false)}
            footer={null}
            destroyOnClose
          >
            {opcionesAsignatura.length === 0 ? (
              <Text type="secondary">
                No hay asignaturas faltantes según el validador. La oferta del periodo está completa o
                aún no se generó.
              </Text>
            ) : (
              <Form layout="vertical" onFinish={onAgregarManual}>
                <Form.Item
                  name="asignaturaPlanId"
                  label="Asignatura del plan"
                  rules={[{ required: true, message: 'Seleccione una asignatura' }]}
                >
                  <Select
                    showSearch
                    placeholder="Materia faltante en la oferta"
                    optionFilterProp="label"
                    options={opcionesAsignatura}
                  />
                </Form.Item>
                <ActionButton
                  permiso="institucional.oferta.cursos"
                  accion="CREAR"
                  type="primary"
                  htmlType="submit"
                  block
                >
                  Agregar
                </ActionButton>
              </Form>
            )}
          </Modal>
        </>
      ) : null}
    </Drawer>
  );
};

export default ParaleloGestionDrawer;
