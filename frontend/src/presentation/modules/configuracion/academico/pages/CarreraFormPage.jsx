/**
 * ABM Carrera — página completa (patrón PoliticaInstitucionalPage).
 */

import { Alert, ColorPicker, Flex, Form, Input, Spin, Switch } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, Card } from '@atoms';
import { useCarreraForm } from '@application-configuracion/academico/hooks';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const CarreraFormPage = ({ mode = 'create' }) => {
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
  } = useCarreraForm(mode);

  const imagenRuta = Form.useWatch('imagenRuta', form);

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
        <Alert type="error" showIcon message="Identificador de carrera inválido" />
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
        <Spin spinning={loading} tip="Cargando carrera…">
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
                title="Datos de la carrera"
                headerColor="primary"
                variant="outlined"
                shadow={false}
                className="cfg-academico-resumen-card"
              >
                <Form.Item
                  name="codigo"
                  label="Código"
                  rules={[{ required: true, message: 'Ingrese el código' }, { min: 2 }]}
                >
                  <Input placeholder="Ej. SIS-INF" maxLength={50} />
                </Form.Item>
                <Form.Item
                  name="nombre"
                  label="Nombre"
                  rules={[{ required: true, message: 'Ingrese el nombre' }, { min: 2 }]}
                >
                  <Input placeholder="Nombre de la carrera" maxLength={255} />
                </Form.Item>
                <Form.Item name="areaFormacion" label="Área de formación">
                  <Input placeholder="Ej. COMERCIAL Y SERVICIOS" maxLength={150} />
                </Form.Item>
                <Form.Item name="tituloOtorgado" label="Título otorgado">
                  <Input placeholder="Título profesional" maxLength={250} />
                </Form.Item>
                <Form.Item
                  name="colorHex"
                  label="Color identificador"
                  extra="Formato hexadecimal (#RRGGBB) para chips y dashboards."
                  getValueFromEvent={(color) => (color ? color.toHexString() : undefined)}
                >
                  <ColorPicker format="hex" showText />
                </Form.Item>
                <Form.Item
                  name="imagenRuta"
                  label="Imagen (ruta o URL)"
                  extra="Ruta relativa en el servidor o URL pública."
                >
                  <Input placeholder="/uploads/carreras/..." maxLength={500} />
                </Form.Item>
                {imagenRuta ? (
                  <img
                    src={imagenRuta}
                    alt="Vista previa"
                    style={{ maxWidth: 120, maxHeight: 80, objectFit: 'contain', marginBottom: 16 }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <Form.Item name="descripcion" label="Descripción">
                  <Input.TextArea rows={4} placeholder="Perfil profesional (opcional)" />
                </Form.Item>
                <Form.Item name="activo" label="Activa" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Card>

              <Flex className="cfg-academico-page__actions">
                <ActionButton
                  permiso="configuracion.carrera"
                  accion={permisoAccion}
                  variant="primary"
                  size="large"
                  loading={submitLoading}
                  onClick={handleSubmit}
                >
                  Guardar carrera
                </ActionButton>
              </Flex>
            </Form>
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default CarreraFormPage;
