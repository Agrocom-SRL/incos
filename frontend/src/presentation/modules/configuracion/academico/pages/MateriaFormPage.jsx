/**
 * ABM Materia — página completa (patrón PoliticaInstitucionalPage).
 */

import { Alert, Flex, Form, Input, Select, Spin, Switch } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, Card } from '@atoms';
import { useMateriaForm } from '@application-configuracion/academico/hooks';
import {
  CLASIFICACION_MATERIA_OPTIONS,
  TIPOS_MATERIA_OPTIONS,
} from '@application-configuracion/academico/config/materiaFormConstants';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const MateriaFormPage = ({ mode = 'create' }) => {
  const {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    loading,
    submitLoading,
    error,
    initialValues,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  } = useMateriaForm(mode);

  if (isInvalidEditId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title={pageTitle}
            breadcrumbItems={breadcrumbItems}
            actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
          />
        }
      >
        <Alert type="error" showIcon message="Identificador de materia inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title={pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
        />
      }
    >
      <div className="cfg-academico-page">
        <Spin spinning={loading} tip="Cargando materia…">
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
                title="Datos de la materia"
                headerColor="primary"
                variant="outlined"
                shadow={false}
                className="cfg-academico-resumen-card"
              >
                <Form.Item
                  name="sigla"
                  label="Sigla"
                  rules={[{ required: true, message: 'Ingrese la sigla' }, { min: 2 }]}
                >
                  <Input placeholder="Ej. PRG-102" maxLength={50} style={{ fontFamily: 'monospace' }} />
                </Form.Item>
                <Form.Item
                  name="nombre"
                  label="Nombre"
                  rules={[{ required: true, message: 'Ingrese el nombre' }, { min: 2 }]}
                >
                  <Input placeholder="Nombre completo" maxLength={255} />
                </Form.Item>
                <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Seleccione el tipo' }]}>
                  <Select options={TIPOS_MATERIA_OPTIONS} placeholder="Seleccione…" />
                </Form.Item>
                <Form.Item name="clasificacion" label="Clasificación">
                  <Select
                    allowClear
                    showSearch
                    placeholder="Seleccione o escriba"
                    options={CLASIFICACION_MATERIA_OPTIONS}
                    mode="tags"
                    maxCount={1}
                  />
                </Form.Item>
                <Form.Item
                  name="objetivos"
                  label="Objetivos / descripción"
                  extra="Se guarda en el campo objetivos del catálogo."
                >
                  <Input.TextArea rows={4} placeholder="Objetivos de aprendizaje (opcional)" />
                </Form.Item>
                <Form.Item name="activo" label="Activa" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Card>

              <Flex className="cfg-academico-page__actions">
                <ActionButton
                  permiso="configuracion.materia"
                  accion={permisoAccion}
                  variant="primary"
                  size="large"
                  loading={submitLoading}
                  onClick={handleSubmit}
                >
                  Guardar materia
                </ActionButton>
              </Flex>
            </Form>
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default MateriaFormPage;
