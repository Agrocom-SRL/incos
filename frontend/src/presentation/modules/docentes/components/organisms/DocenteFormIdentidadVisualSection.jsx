/**
 * Sección inline de color para el wizard de docente (límites de carga en condicionLaboral).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Flex, Input, Tooltip, Typography, message } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import DocenteColorBar from '@docentes/components/atoms/DocenteColorBar';
import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';
import { useDocenteColorApi } from '@application-docentes/hooks/api/useDocenteColorApi';
import '@docentes/styles/docente-color-picker.css';

const { Text } = Typography;

const DocenteFormIdentidadVisualSection = ({ form, initialColorHex = '' }) => {
  const { fetchColoresSugeridos } = useDocenteColorApi();
  const [loading, setLoading] = useState(false);
  const [paleta, setPaleta] = useState([]);
  const [selectedHex, setSelectedHex] = useState('');
  const [manualHex, setManualHex] = useState('');

  /** Siembra la selección con el color actual del formulario y carga la paleta. */
  const iniciarSeleccion = useCallback(async () => {
    const seed = sanitizeDocenteColorHex(initialColorHex) || sanitizeDocenteColorHex(form?.getFieldValue?.('colorHex')) || '';
    setSelectedHex(seed);
    setManualHex('');
    setLoading(true);
    try {
      const res = await fetchColoresSugeridos();
      if (res.success) {
        setPaleta(res.data?.colores_sugeridos ?? []);
      } else {
        message.error(typeof res.error === 'string' ? res.error : 'No se pudo cargar la paleta');
      }
    } finally {
      setLoading(false);
    }
  }, [initialColorHex, form, fetchColoresSugeridos]);

  useEffect(() => {
    iniciarSeleccion();
  }, [iniciarSeleccion]);

  const effectiveHex = useMemo(() => {
    const manual = sanitizeDocenteColorHex(manualHex);
    if (manual) return manual;
    return sanitizeDocenteColorHex(selectedHex);
  }, [manualHex, selectedHex]);

  useEffect(() => {
    form?.setFieldValue?.('colorHex', effectiveHex || undefined);
  }, [effectiveHex, form]);

  const sugerirLibre = useCallback(() => {
    const libre = paleta.find((c) => c.disponible);
    if (libre?.color_hex) {
      setSelectedHex(libre.color_hex);
      setManualHex('');
    } else {
      message.warning('No hay colores libres en la paleta');
    }
  }, [paleta]);

  return (
    <Card
      title="Identidad visual"
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section"
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="Color obligatorio para asignar materias"
        description="El color identifica al docente en la grilla de horarios (Institucional → Gestión de horarios)."
      />

      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Text type="secondary">
          <BgColorsOutlined /> Color en horarios
        </Text>
        <Button size="small" onClick={sugerirLibre} disabled={loading}>
          Sugerir libre
        </Button>
      </Flex>

      <div className="docente-color-picker-grid">
        {paleta.map((item) => {
          const hex = sanitizeDocenteColorHex(item.color_hex);
          if (!hex) return null;
          const selected = effectiveHex === hex;
          const swatch = (
            <button
              type="button"
              key={hex}
              className={`docente-color-picker-swatch${selected ? ' docente-color-picker-swatch--selected' : ''}${item.disponible ? '' : ' docente-color-picker-swatch--used'}`}
              style={{ backgroundColor: hex }}
              disabled={!item.disponible}
              onClick={() => {
                setSelectedHex(hex);
                setManualHex('');
              }}
              aria-label={item.disponible ? `Color ${hex}` : `Color ${hex} en uso`}
            />
          );
          if (!item.disponible && item.docente_nombre) {
            return (
              <Tooltip key={hex} title={`Usado por: ${item.docente_nombre}`}>
                {swatch}
              </Tooltip>
            );
          }
          return swatch;
        })}
      </div>

      <Flex gap={8} align="center" style={{ marginTop: 16 }}>
        <DocenteColorBar hex={effectiveHex} className="docente-color-picker-preview" />
        <Input
          placeholder="#3498DB"
          value={manualHex}
          onChange={(e) => {
            setManualHex(e.target.value);
            setSelectedHex('');
          }}
          maxLength={7}
          style={{ maxWidth: 140 }}
        />
      </Flex>
    </Card>
  );
};

export default DocenteFormIdentidadVisualSection;
