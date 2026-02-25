/**
 * EstudianteTraspasoStepContent - Paso dinámico para datos de Traspaso (tabla traspasos)
 *
 * Solo se muestra cuando tipo de admisión es TRASPASO.
 * Campos según 16-traspasos.sql: institución origen, carrera origen, año cursado,
 * régimen origen, acta compromiso, carrera destino, plan estudio destino, periodo destino, etc.
 *
 * @param {Object} form - Instancia del formulario
 * @param {Object} section - Config de la sección (title, fields)
 */

import { Card } from 'antd';

const EstudianteTraspasoStepContent = ({ form, section }) => {
  return (
    <Card
      title={
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          {section?.title ?? 'Datos de Traspaso'}
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
        Formulario de datos específicos de traspaso (institución origen, carrera origen, año cursado, régimen, acta de compromiso, carrera destino, etc.). Los campos se implementarán según la tabla traspasos.
      </p>
    </Card>
  );
};

export default EstudianteTraspasoStepContent;
