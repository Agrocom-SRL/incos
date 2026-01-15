/**
 * ScholarshipsSection - Organism para mostrar la sección de becas asignadas del estudiante
 * 
 * Single Responsibility: Mostrar todas las asignaciones de becas del estudiante
 * 
 * Atomic Design: Organism
 * - Combina molecules (StudentInfoItem) y atoms (Card, Row, Col, Divider, Tag)
 * 
 * @param {Array} scholarships - Array de asignaciones de becas del estudiante
 */

import { Row, Col, Divider, Tag } from 'antd';
import { 
  GiftOutlined,
  PercentageOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Card } from '@atoms';
import { StudentInfoItem } from '../molecules';

// Helper para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

// Helper para obtener color del tag según estado
const getEstadoColor = (estado) => {
  const estados = {
    'PENDIENTE': 'orange',
    'ACTIVA': 'green',
    'FINALIZADA': 'blue',
    'RECHAZADA': 'red'
  };
  return estados[estado] || 'default';
};

// Helper para formatear estado
const formatEstado = (estado) => {
  if (!estado) return 'N/A';
  const estados = {
    'PENDIENTE': 'Pendiente',
    'ACTIVA': 'Activa',
    'FINALIZADA': 'Finalizada',
    'RECHAZADA': 'Rechazada'
  };
  return estados[estado] || estado;
};

const ScholarshipsSection = ({ scholarships }) => {
  if (!scholarships || scholarships.length === 0) return null;

  return (
    <Card
      title="Becas Asignadas"
      style={{ marginBottom: '24px' }}
      headerColor="error"
    >
      {scholarships.map((scholarship, index) => (
        <div key={scholarship.id || index}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<GiftOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Tipo de Beca"
                value={scholarship.scholarshipName || scholarship.scholarshipCode}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<PercentageOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Porcentaje de Descuento"
                value={scholarship.scholarshipPercentage ? `${scholarship.scholarshipPercentage}%` : 'N/A'}
                valueColor="var(--color-primary-hover, #196b45)"
                valueFontSize="20px"
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<CalendarOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Fecha de Solicitud"
                value={formatDate(scholarship.requestDate || scholarship.fechaSolicitud)}
              />
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '16px',
                backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-secondary, #e8e8e8)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-info, #196b45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {scholarship.state === 'ACTIVA' ? (
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  ) : scholarship.state === 'PENDIENTE' ? (
                    <ClockCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  ) : scholarship.state === 'RECHAZADA' ? (
                    <CloseCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  ) : (
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #8c8c8c)', display: 'block', marginBottom: '4px' }}>
                    Estado
                  </span>
                  <Tag color={getEstadoColor(scholarship.state || scholarship.estado)} style={{ fontSize: '16px', padding: '4px 12px' }}>
                    {formatEstado(scholarship.state || scholarship.estado)}
                  </Tag>
                </div>
              </div>
            </Col>
            {scholarship.managementYear && (
              <Col xs={24} sm={12}>
                <StudentInfoItem
                  icon={<CalendarOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                  label="Gestión"
                  value={scholarship.managementCode || scholarship.managementYear || 'N/A'}
                />
              </Col>
            )}
            {scholarship.documentsComplete !== undefined && (
              <Col xs={24} sm={12}>
                <StudentInfoItem
                  icon={<FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                  label="Documentos Completos"
                  value={scholarship.documentsComplete || scholarship.documentosCompletos ? 'Sí' : 'No'}
                />
              </Col>
            )}
            {scholarship.observations && (
              <Col xs={24}>
                <StudentInfoItem
                  icon={<FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                  label="Observaciones"
                  value={scholarship.observations}
                />
              </Col>
            )}
          </Row>
          {index < scholarships.length - 1 && (
            <Divider style={{ margin: '24px 0' }} />
          )}
        </div>
      ))}
    </Card>
  );
};

export default ScholarshipsSection;
