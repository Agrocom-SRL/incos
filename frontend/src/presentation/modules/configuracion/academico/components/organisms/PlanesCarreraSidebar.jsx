/**
 * Selector de carreras — tarjetas con borde de color (patrón política asistencia).
 */

import { Flex, Radio, Typography } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import {
  buildCarreraChipStyle,
  formatResolucionLabel,
} from '@application-configuracion/academico/utils/planDocumentoTheme';

const { Text, Paragraph } = Typography;

const PlanesCarreraSidebar = ({ carreras, selectedCarreraId, onSelectCarrera }) => (
  <Radio.Group
    className="cfg-planes-carrera-radio"
    value={selectedCarreraId != null ? String(selectedCarreraId) : undefined}
    onChange={(e) => onSelectCarrera(Number(e.target.value))}
    style={{ width: '100%' }}
  >
    <div className="cfg-planes-carrera-grid" role="tablist" aria-label="Carreras">
      {carreras.map((c) => {
        const accent = sanitizeDocenteColorHex(c.colorHex ?? c.color_hex);
        const selected = selectedCarreraId === c.id;
        const chipStyle = buildCarreraChipStyle(c.colorHex ?? c.color_hex, selected);
        const resolucion = c.planVigente?.resolucion_ministerial;

        return (
          <Radio.Button
            key={c.id}
            value={String(c.id)}
            className="cfg-planes-carrera-option"
            style={{
              borderColor: chipStyle.borderColor,
              background: chipStyle.background,
            }}
          >
            <Flex align="flex-start" gap={12} className="cfg-planes-carrera-option__inner">
              <ReadOutlined
                className="cfg-planes-carrera-option__icon"
                style={{ color: chipStyle.accentColor }}
              />
              <div className="cfg-planes-carrera-option__text">
                <Text strong className="cfg-planes-carrera-option__codigo">
                  {c.codigo}
                </Text>
                <Paragraph type="secondary" className="cfg-planes-carrera-option__resolucion">
                  {resolucion ? formatResolucionLabel(resolucion) : 'Sin plan vigente'}
                </Paragraph>
              </div>
              {accent ? (
                <span
                  className="cfg-planes-carrera-option__accent"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
              ) : null}
            </Flex>
          </Radio.Button>
        );
      })}
    </div>
  </Radio.Group>
);

export default PlanesCarreraSidebar;
