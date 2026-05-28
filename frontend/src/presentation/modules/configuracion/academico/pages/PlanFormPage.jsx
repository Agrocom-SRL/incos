/**
 * Edición de metadatos del plan de estudios (página completa).
 */

import { Alert, Flex, Form, Input, InputNumber, Spin, Switch } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, Card } from '@atoms';
import { usePlanForm } from '@application-configuracion/academico/hooks';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const { TextArea } = Input;

const PlanFormPage = () => {
  const {
    form,
    isInvalidId,
    loading,
    submitLoading,
    error,
    breadcrumbItems,
    handleVolver,
    handleSubmit,
    initialValues,
  } = usePlanForm();

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Editar plan"
            breadcrumbItems={breadcrumbItems}
            actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
          />
        }
      >
        <Alert type="error" showIcon message="Identificador de plan inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Editar plan de estudio"
          breadcrumbItems={breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
        />
      }
    >
      <div className="cfg-academico-page">
        <Spin spinning={loading} tip="Cargando plan…">
          <Flex vertical gap="large" style={{ width: '100%' }}>
            {error ? <Alert type="error" showIcon message={error} /> : null}

            <Form
              form={form}
              layout="vertical"
              className="cfg-academico-form-card"
              initialValues={initialValues}
              disabled={loading || submitLoading}
            >
              <Card
                title="Datos del plan"
                headerColor="primary"
                variant="outlined"
                shadow={false}
                className="cfg-academico-resumen-card"
              >
                <Form.Item
                  name="nombre_plan"
                  label="Nombre del plan"
                  rules={[{ required: true, message: 'Ingrese el nombre' }]}
                >
                  <Input maxLength={200} />
                </Form.Item>
                <Form.Item name="resolucion_ministerial" label="Resolución ministerial">
                  <Input maxLength={100} placeholder="Ej. RM 0210/2023" />
                </Form.Item>
                <Form.Item name="documento_ruta" label="Ruta del documento">
                  <Input maxLength={500} />
                </Form.Item>
                <Flex gap={16} wrap="wrap">
                  <Form.Item
                    name="duracion_anios"
                    label="Duración (años)"
                    style={{ minWidth: 140, flex: 1 }}
                  >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    name="horas_semana"
                    label="Horas por semana"
                    rules={[{ required: true, message: 'Requerido' }]}
                    style={{ minWidth: 140, flex: 1 }}
                  >
                    <InputNumber min={1} max={80} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    name="carga_horaria_total"
                    label="Carga horaria total"
                    style={{ minWidth: 140, flex: 1 }}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Flex>
                <Flex gap={16} wrap="wrap">
                  <Form.Item name="horas_mes" label="Horas/mes" style={{ minWidth: 120, flex: 1 }}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="horas_anio" label="Horas/año" style={{ minWidth: 120, flex: 1 }}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Flex>
                <Form.Item name="observaciones" label="Observaciones">
                  <TextArea rows={3} maxLength={2000} />
                </Form.Item>
                <Form.Item name="activo" label="Activo" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Card>
            </Form>

            <Flex justify="flex-end" gap={8}>
              <ActionButton variant="default" onClick={handleVolver} disabled={submitLoading}>
                Cancelar
              </ActionButton>
              <ActionButton
                permiso="configuracion.plan-estudio"
                accion="EDITAR"
                variant="primary"
                loading={submitLoading}
                onClick={handleSubmit}
              >
                Guardar
              </ActionButton>
            </Flex>
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default PlanFormPage;
