/**
 * AsignacionBecaResumen - Organism del paso "Confirmación" de asignar beca
 *
 * Single Responsibility: Mostrar el resumen compacto de lo que se va a confirmar
 * (estudiante | beca en paneles gemelos) y el campo de motivo de la solicitud.
 *
 * Atomic Design: Organism
 * - Sección PLANA dentro del workspace de formulario (`FormWorkspaceSection`):
 *   la tarjeta, el título y la descripción los pone la sección del workspace
 *   en la página — aquí no va ninguna `Card` anidada.
 * - Reemplaza en esta página a StudentInfoSection + SelectedBecaSection:
 *   mismos datos, presentación compacta (sin cards apiladas ni iconos
 *   circulares gigantes). El foco del paso es escribir el motivo (autoFocus).
 * - Panel estudiante: molécula global EstudianteResumenPanel (compartida con
 *   registrar pago). Estilos en resumen-panels.css (.resumen-panel*) y
 *   becas-asignar.css (.beca-card__pct).
 *
 * @param {Object} student - { codigoEstudiante, nombreCompleto, ciCompleto }
 * @param {Object} beca - { nombre, codigo, porcentaje, descripcion }
 * @param {boolean} isEditMode - En edición no se muestran los datos autogenerados
 *   de una solicitud nueva (fecha de solicitud / estado inicial Pendiente)
 */

import { Flex, Form, Input, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { EstudianteResumenPanel } from '@molecules';
import { getBecaIcon } from '../utils/becaIcon';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

// Fecha de solicitud de una asignación nueva: siempre hoy (la fija el backend al crear)
const formatFechaHoy = () =>
  new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });

const AsignacionBecaResumen = ({ student, beca, isEditMode = false }) => {
  if (!beca) return null;

  return (
    <Flex vertical gap="large">
      <div className="resumen-panels">
        {/* Panel estudiante (molécula compartida con registrar pago) */}
        <EstudianteResumenPanel student={student} />

        {/* Panel beca/descuento */}
        <div className="resumen-panel">
          <div className="resumen-panel__head">
            <span className="resumen-panel__label">
              {getBecaIcon(beca)} Beca o descuento
            </span>
            <span className="beca-card__pct">{beca.porcentaje}%</span>
          </div>
          <Text className="resumen-panel__titulo">{beca.nombre}</Text>
          {beca.descripcion ? (
            <Paragraph className="resumen-panel__desc">{beca.descripcion}</Paragraph>
          ) : null}
          {!isEditMode ? (
            <div className="resumen-panel__meta">
              <span className="resumen-panel__meta-item">
                <CalendarOutlined /> Solicitud: {formatFechaHoy()}
              </span>
              <StatusPill
                label="Pendiente"
                className="cfg-materia-pill cfg-materia-pill--clasificacion"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* No usar Form aquí: ya estamos dentro del Form del padre; solo Form.Item para no anidar <form> */}
      <Form.Item
        name="observaciones"
        label="Motivo / Observaciones"
        tooltip="Ingrese el motivo de la solicitud de beca (ej.: madre soltera, escasos recursos, etc.)"
        rules={[{ required: true, message: 'Por favor ingrese el motivo de la solicitud' }]}
      >
        <TextArea
          rows={4}
          autoFocus
          placeholder="Ingrese el motivo de la solicitud de beca..."
          maxLength={500}
          showCount
        />
      </Form.Item>
    </Flex>
  );
};

export default AsignacionBecaResumen;
