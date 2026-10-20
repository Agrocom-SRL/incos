/**
 * EstudianteResumenPanel - Panel compacto de identidad del estudiante
 *
 * Single Responsibility: Mostrar quién es el estudiante (nombre, código, C.I.)
 * dentro de un panel de resumen compartido.
 *
 * Atomic Design: Molecule (global)
 * - Compartida por los flujos gemelos de matrícula (asignar beca, registrar pago)
 *   como mitad "estudiante" de los paneles `.resumen-panels`.
 * - `children` (opcional): contenido extra propio del flujo al pie del panel
 *   (p. ej. el descuento por beca del estudiante en registrar pago).
 * - Estilos en styles/components/organisms/resumen-panels.css (.resumen-panel*).
 *
 * @param {Object} student - { codigoEstudiante, nombreCompleto, ciCompleto }
 * @param {ReactNode} children - Contenido extra al pie del panel (opcional)
 */

import { Typography } from 'antd';
import { BarcodeOutlined, IdcardOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const EstudianteResumenPanel = ({ student, children = null }) => (
  <div className="resumen-panel">
    <span className="resumen-panel__label">
      <UserOutlined /> Estudiante
    </span>
    <Text className="resumen-panel__titulo">{student?.nombreCompleto || 'N/A'}</Text>
    <div className="resumen-panel__meta">
      <span className="resumen-panel__meta-item">
        <BarcodeOutlined /> Código {student?.codigoEstudiante || 'N/A'}
      </span>
      <span className="resumen-panel__meta-item">
        <IdcardOutlined /> C.I. {student?.ciCompleto || 'N/A'}
      </span>
    </div>
    {children}
  </div>
);

export default EstudianteResumenPanel;
