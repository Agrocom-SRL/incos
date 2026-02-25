/**
 * EstudianteTransitabilidadStepContent - Paso dinámico para datos de Transitabilidad (tabla transitabilidades)
 *
 * Solo se muestra cuando tipo de admisión es TRANSITABILIDAD.
 * Campos según 15-transitabilidades.sql: institución origen, carrera origen, año conclusión,
 * carrera destino, plan estudio destino, régimen estudios, acepta compromiso, etc.
 *
 * @param {Object} form - Instancia del formulario
 * @param {Object} section - Config de la sección (title, fields)
 */

import { Card } from 'antd';

const EstudianteTransitabilidadStepContent = ({ form, section }) => {
  return (
    <Card
      title={
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          {section?.title ?? 'Datos de Transitabilidad'}
        </span>
      }
      style={{
        marginTop: 24,
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <p style={{ color: '#8c8c8c' }}>
        Formulario de datos específicos de transitabilidad (institución origen, carrera origen, año conclusión, carrera destino, etc.). Los campos se implementarán según la tabla transitabilidades.
      </p>
    </Card>
  );
};

export default EstudianteTransitabilidadStepContent;
