/**
 * Placeholder para secciones del curso aún no implementadas (finales, nivelación).
 */

import { Button, Card, Typography } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { consolidadoCursoPath } from '@application-academico/calificaciones/utils/calificacionesPaths.js';

const { Paragraph, Title } = Typography;

const CursoSeccionPlaceholder = ({ docenteId, asignacionId, titulo, descripcion }) => {
  const navigate = useNavigate();

  return (
    <Card className="cal-curso-placeholder">
      <div className="cal-curso-placeholder__inner">
        <FileSearchOutlined className="cal-curso-placeholder__icon" />
        <Title level={4}>{titulo}</Title>
        <Paragraph type="secondary">
          {descripcion ?? 'Esta sección estará disponible en una próxima fase.'}
        </Paragraph>
        <Button type="primary" onClick={() => navigate(consolidadoCursoPath(docenteId, asignacionId))}>
          ← Volver al curso
        </Button>
      </div>
    </Card>
  );
};

export default CursoSeccionPlaceholder;
