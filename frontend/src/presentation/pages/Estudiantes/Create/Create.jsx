// src/presentation/pages/Estudiantes/Create/Create.jsx
import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Switch, InputNumber, message, Card, Row, Col, Space, Typography, Flex } from 'antd';
import dayjs from 'dayjs';
import studentRepository from '@repo-impl/StudentRepository.js';
import { useNavigate } from 'react-router-dom';
import { MainContent, InfoSidebar } from '@organisms';
import { StudentsSummaryCard, HelpGuideCard } from '@molecules';
import { componentConfig } from '@config/theme/components';
import { allColors } from '@config/theme/colors';
import { allSpacing } from '@config/theme/spacing';
import { typography } from '@config/theme/typography';
import '@styles/pages/estudiantes-create.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

// Helper para crear el estilo de las Cards de sección
const getSectionCardProps = (title) => ({
  className: 'estudiantes-create-section-card',
  style: {
    backgroundColor: componentConfig.Card.colorBgContainer,
    borderRadius: `${componentConfig.Card.borderRadius}px`,
    boxShadow: componentConfig.Card.boxShadow,
    border: `1px solid ${allColors.colorBorder}`,
    marginBottom: `${allSpacing.marginLG}px`,
  },
  title: (
    <span
      className="estudiantes-create-section-title"
      style={{
        color: allColors.colorPrimary,
        fontSize: `${typography.fontSizeHeading5}px`,
        fontWeight: typography.fontWeightStrong,
      }}
    >
      {title}
    </span>
  ),
  type: 'inner',
});

const EstudiantesCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tieneDiscapacidad, setTieneDiscapacidad] = useState(false);
  const [stats, setStats] = useState({
    todayStudents: 0,
    monthStudents: 0,
    totalStudents: 0,
  });

  // Opciones para los select
  const expediciones = ['SC', 'LP', 'CB', 'TJ', 'BN', 'PD', 'OR', 'PT', 'CH'];
  const generos = ['MASCULINO', 'FEMENINO', 'OTRO'];
  const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Cargar estadísticas de estudiantes
  useEffect(() => {
    const loadStats = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // TODO: Implementar llamadas a la API para obtener estadísticas reales
        // Por ahora usamos valores de ejemplo
        setStats({
          todayStudents: 5,
          monthStudents: 127,
          totalStudents: 1543,
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    loadStats();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Formatear fecha de nacimiento
      const formattedValues = {
        ...values,
        fechaNacimiento: values.fechaNacimiento
          ? values.fechaNacimiento.format('YYYY-MM-DD')
          : null,
      };

      // Remover campos undefined
      Object.keys(formattedValues).forEach((key) => {
        if (formattedValues[key] === undefined || formattedValues[key] === null || formattedValues[key] === '') {
          delete formattedValues[key];
        }
      });

      const result = await studentRepository.register(formattedValues);

      if (result.success) {
        message.success('Estudiante registrado correctamente');
        
        // Actualizar estadísticas
        setStats((prev) => ({
          ...prev,
          todayStudents: prev.todayStudents + 1,
          monthStudents: prev.monthStudents + 1,
          totalStudents: prev.totalStudents + 1,
        }));

        form.resetFields();
        setTieneDiscapacidad(false);
        
        // Opcional: redirigir a la lista de estudiantes
        setTimeout(() => {
          navigate('/estudiantes');
        }, 1500);
      } else {
        // Mostrar errores de validación del servidor
        if (result.validationErrors) {
          const fields = Object.keys(result.validationErrors);
          fields.forEach((field) => {
            form.setFields([
              {
                name: field,
                errors: [result.validationErrors[field]],
              },
            ]);
          });
          message.error('Por favor, corrige los errores en el formulario');
        } else {
          message.error(result.error || 'Error al registrar el estudiante');
        }
      }
    } catch (error) {
      message.error('Error inesperado al registrar el estudiante');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Por favor, completa todos los campos requeridos');
  };

  return (
    <Flex
      gap="large"
      align="flex-start"
      style={{ width: '100%', height: '100%' }}
      className="dashboard-container"
    >
      {/* Contenido Principal - 70% en lg+, expandible en menores */}
      <MainContent style={{ flex: 1 }}>
        <Card
        className="estudiantes-create-card"
        style={{
          backgroundColor: componentConfig.Card.colorBgContainer,
          borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
          boxShadow: componentConfig.Card.boxShadow,
          padding: `${componentConfig.Card.paddingLG}px`,
        }}
      >
        <Title
          level={3}
          className="estudiantes-create-title"
          style={{
            color: allColors.colorPrimary,
            fontSize: `${typography.fontSizeHeading3}px`,
            fontWeight: typography.fontWeightStrong,
            margin: 0,
            marginBottom: `${allSpacing.marginLG}px`,
          }}
        >
          Registrar Nuevo Estudiante
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            nacionalidad: 'Boliviana',
            tieneDiscapacidad: false,
          }}
        >
          {/* Datos Personales Básicos */}
          <Card {...getSectionCardProps('Datos Personales Básicos')}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Nombres"
                  name="nombres"
                  rules={[
                    { required: true, message: 'Los nombres son requeridos' },
                    { min: 2, message: 'Los nombres deben tener al menos 2 caracteres' },
                    { max: 150, message: 'Los nombres no pueden exceder 150 caracteres' },
                  ]}
                >
                  <Input placeholder="Ingrese los nombres" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Apellido Paterno"
                  name="apellidoPaterno"
                  rules={[
                    { required: true, message: 'El apellido paterno es requerido' },
                    { min: 2, message: 'El apellido paterno debe tener al menos 2 caracteres' },
                    { max: 100, message: 'El apellido paterno no puede exceder 100 caracteres' },
                  ]}
                >
                  <Input placeholder="Ingrese el apellido paterno" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Apellido Materno"
                  name="apellidoMaterno"
                  rules={[
                    { max: 100, message: 'El apellido materno no puede exceder 100 caracteres' },
                  ]}
                >
                  <Input placeholder="Ingrese el apellido materno" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="CI"
                  name="ci"
                  rules={[
                    { required: true, message: 'El CI es requerido' },
                    { pattern: /^\d{7,9}$/, message: 'El CI debe tener entre 7 y 9 dígitos' },
                  ]}
                >
                  <Input placeholder="Ej: 12345678" maxLength={9} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Expedición"
                  name="expedicion"
                  rules={[
                    { required: true, message: 'La expedición es requerida' },
                  ]}
                >
                  <Select placeholder="Seleccione la expedición">
                    {expediciones.map((exp) => (
                      <Option key={exp} value={exp}>
                        {exp}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Fecha de Nacimiento"
                  name="fechaNacimiento"
                  rules={[
                    { required: true, message: 'La fecha de nacimiento es requerida' },
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    disabledDate={(current) => {
                      // No permitir fechas futuras y validar edad mínima (17 años)
                      if (current && current > dayjs().endOf('day')) {
                        return true;
                      }
                      // Validar que tenga al menos 17 años
                      const minDate = dayjs().subtract(17, 'year');
                      return current && current > minDate;
                    }}
                    placeholder="Seleccione la fecha de nacimiento"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Género"
                  name="genero"
                  rules={[
                    { required: true, message: 'El género es requerido' },
                  ]}
                >
                  <Select placeholder="Seleccione el género">
                    {generos.map((gen) => (
                      <Option key={gen} value={gen}>
                        {gen}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Estado Civil"
                  name="estadoCivilId"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="ID de estado civil"
                    min={1}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Nacionalidad"
                  name="nacionalidad"
                >
                  <Input placeholder="Ej: Boliviana" defaultValue="Boliviana" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Municipio de Nacimiento (ID)"
                  name="municipioNacimientoId"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="ID del municipio"
                    min={1}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Ciudad de Nacimiento"
                  name="ciudadNacimiento"
                >
                  <Input placeholder="Ingrese la ciudad de nacimiento" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Idioma Natal (ID)"
                  name="idiomaNatalId"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="ID del idioma"
                    min={1}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Tipo de Sangre"
                  name="tipoSangre"
                >
                  <Select placeholder="Seleccione el tipo de sangre" allowClear>
                    {tiposSangre.map((tipo) => (
                      <Option key={tipo} value={tipo}>
                        {tipo}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="¿Tiene Discapacidad?"
                  name="tieneDiscapacidad"
                  valuePropName="checked"
                >
                  <Switch
                    checked={tieneDiscapacidad}
                    onChange={setTieneDiscapacidad}
                  />
                </Form.Item>
              </Col>

              {tieneDiscapacidad && (
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    label="Tipo de Discapacidad (ID)"
                    name="tipoDiscapacidadId"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="ID del tipo de discapacidad"
                      min={1}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Card>

          {/* Datos de Contacto */}
          <Card {...getSectionCardProps('Datos de Contacto')}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Email Personal"
                  name="emailPersonal"
                  rules={[
                    { type: 'email', message: 'El email debe tener un formato válido' },
                  ]}
                >
                  <Input placeholder="ejemplo@correo.com" type="email" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Celular"
                  name="celular"
                  rules={[
                    { required: true, message: 'El celular es requerido' },
                    { pattern: /^\d{7,8}$/, message: 'El celular debe tener entre 7 y 8 dígitos' },
                  ]}
                >
                  <Input placeholder="Ej: 72345678" maxLength={8} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Teléfono Fijo"
                  name="telefonoFijo"
                  rules={[
                    { pattern: /^\d{7,8}$/, message: 'El teléfono fijo debe tener entre 7 y 8 dígitos' },
                  ]}
                >
                  <Input placeholder="Ej: 4234567" maxLength={8} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Dirección"
                  name="direccion"
                >
                  <Input placeholder="Ingrese la dirección" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Municipio de Residencia (ID)"
                  name="municipioResidenciaId"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="ID del municipio"
                    min={1}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Zona"
                  name="zona"
                >
                  <Input placeholder="Ingrese la zona" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Datos Académicos */}
          <Card {...getSectionCardProps('Datos Académicos')}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Carrera (ID)"
                  name="carreraId"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="ID de la carrera"
                    min={1}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Gestión de Ingreso (ID)"
                  name="gestionIngresoId"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="ID de la gestión"
                    min={1}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Unidad Educativa de Procedencia"
                  name="unidadEducativaProcedencia"
                  rules={[
                    { max: 200, message: 'No puede exceder 200 caracteres' },
                  ]}
                >
                  <Input placeholder="Nombre de la unidad educativa" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Año de Egreso de Secundaria"
                  name="anioEgresoSecundaria"
                  rules={[
                    {
                      type: 'number',
                      min: 1950,
                      max: new Date().getFullYear(),
                      message: 'El año debe ser válido',
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Ej: 2020"
                    min={1950}
                    max={new Date().getFullYear()}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Promedio Anual"
                  name="promedioAnual"
                  rules={[
                    {
                      type: 'number',
                      min: 0,
                      max: 100,
                      message: 'El promedio debe estar entre 0 y 100',
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Ej: 85.5"
                    min={0}
                    max={100}
                    step={0.1}
                    precision={2}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Becas */}
          <Card {...getSectionCardProps('Becas y Descuentos')}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Beca/Descuento (ID)"
                  name="becaDescuentoId"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="ID de la beca/descuento"
                    min={1}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
                <Form.Item
                  label="Motivo de la Beca"
                  name="becaMotivo"
                  rules={[
                    { min: 10, message: 'El motivo debe tener al menos 10 caracteres' },
                  ]}
                >
                  <TextArea
                    placeholder="Ingrese el motivo de la beca"
                    rows={3}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Observaciones */}
          <Card {...getSectionCardProps('Observaciones')}>
            <Form.Item name="observaciones">
              <TextArea
                placeholder="Ingrese observaciones adicionales"
                rows={4}
              />
            </Form.Item>
          </Card>

          {/* Botones de Acción */}
          <Form.Item className="estudiantes-create-actions">
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  backgroundColor: componentConfig.Button.colorPrimary,
                  borderColor: componentConfig.Button.colorPrimaryBorder,
                  color: componentConfig.Button.colorPrimaryText,
                  borderRadius: `${componentConfig.Button.borderRadius}px`,
                  height: `${componentConfig.Button.controlHeightLG}px`,
                  paddingInline: `${componentConfig.Button.paddingInline}px`,
                  fontWeight: typography.fontWeightStrong,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = componentConfig.Button.colorPrimaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = componentConfig.Button.colorPrimary;
                }}
              >
                Registrar Estudiante
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setTieneDiscapacidad(false);
                }}
                size="large"
                style={{
                  backgroundColor: allColors.colorBgContainer,
                  borderColor: allColors.colorBorder,
                  color: allColors.colorText,
                  borderRadius: `${componentConfig.Button.borderRadius}px`,
                  height: `${componentConfig.Button.controlHeightLG}px`,
                  paddingInline: `${componentConfig.Button.paddingInline}px`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = allColors.colorBgElevated;
                  e.currentTarget.style.borderColor = allColors.colorPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = allColors.colorBgContainer;
                  e.currentTarget.style.borderColor = allColors.colorBorder;
                }}
              >
                Limpiar Formulario
              </Button>
              <Button
                onClick={() => navigate('/estudiantes')}
                size="large"
                style={{
                  backgroundColor: allColors.colorBgContainer,
                  borderColor: allColors.colorBorder,
                  color: allColors.colorText,
                  borderRadius: `${componentConfig.Button.borderRadius}px`,
                  height: `${componentConfig.Button.controlHeightLG}px`,
                  paddingInline: `${componentConfig.Button.paddingInline}px`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = allColors.colorBgElevated;
                  e.currentTarget.style.borderColor = allColors.colorPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = allColors.colorBgContainer;
                  e.currentTarget.style.borderColor = allColors.colorBorder;
                }}
              >
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
        </Card>
      </MainContent>

      {/* Resumen de Información - 30% en lg+ (min-width 300px), col-12 en menores */}
      <InfoSidebar>
        <StudentsSummaryCard
          todayStudents={stats.todayStudents}
          monthStudents={stats.monthStudents}
          totalStudents={stats.totalStudents}
        />
        <HelpGuideCard />
      </InfoSidebar>
    </Flex>
  );
};

export default EstudiantesCreate;