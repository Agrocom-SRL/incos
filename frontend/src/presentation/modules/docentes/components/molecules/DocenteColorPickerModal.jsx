import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Flex, Input, Modal, Space, Tooltip, Typography, message } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import DocenteColorBar from '@docentes/components/atoms/DocenteColorBar';
import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';
import { allSpacing } from '@theme/tokens';
import '@docentes/styles/docente-color-picker.css';

const { Text } = Typography;

/**
 * Modal de color docente — paleta institucional + hex manual.
 */
const DocenteColorPickerModal = ({
  open,
  docenteId,
  docenteNombre,
  initialHex = '',
  onClose,
  onSaved,
  fetchColoresSugeridos,
  updateDocenteColor,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paleta, setPaleta] = useState([]);
  const [selectedHex, setSelectedHex] = useState('');
  const [manualHex, setManualHex] = useState('');

  /** Siembra la selección con el color actual y carga la paleta al abrir el modal. */
  const iniciarSeleccion = useCallback(async () => {
    const seed = sanitizeDocenteColorHex(initialHex) || '';
    setSelectedHex(seed);
    setManualHex('');
    if (!fetchColoresSugeridos) return;
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
  }, [initialHex, fetchColoresSugeridos]);

  useEffect(() => {
    if (open) iniciarSeleccion();
  }, [open, iniciarSeleccion]);

  const effectiveHex = useMemo(() => {
    const manual = sanitizeDocenteColorHex(manualHex);
    if (manual) return manual;
    return sanitizeDocenteColorHex(selectedHex);
  }, [manualHex, selectedHex]);

  const sugerirLibre = useCallback(() => {
    const libre = paleta.find((c) => c.disponible);
    if (libre?.color_hex) {
      setSelectedHex(libre.color_hex);
      setManualHex('');
      message.success('Color libre seleccionado');
    } else {
      message.warning('No hay colores libres en la paleta');
    }
  }, [paleta]);

  const onConfirm = useCallback(async () => {
    if (!effectiveHex) {
      message.warning('Seleccione un color válido');
      return;
    }
    if (docenteId && updateDocenteColor) {
      setSaving(true);
      const res = await updateDocenteColor(docenteId, effectiveHex);
      setSaving(false);
      if (!res.success) {
        message.error(typeof res.error === 'string' ? res.error : 'No se pudo guardar el color');
        return;
      }
      message.success('Color guardado');
    }
    onSaved?.(effectiveHex);
  }, [docenteId, effectiveHex, updateDocenteColor, onSaved]);

  return (
    <Modal
      open={open}
      title={
        <Space>
          <BgColorsOutlined />
          <span>Color del docente{docenteNombre ? `: ${docenteNombre}` : ''}</span>
        </Space>
      }
      onCancel={onClose}
      onOk={onConfirm}
      okText={docenteId ? 'Guardar color' : 'Aplicar color'}
      confirmLoading={saving}
      destroyOnHidden
      width={520}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: allSpacing.marginMD }}
        title="El color debe ser único entre docentes activos. Los colores ocupados muestran qué docente los usa."
      />

      <Flex justify="space-between" align="center" style={{ marginBottom: allSpacing.marginSM }}>
        <Text type="secondary">Paleta sugerida</Text>
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

      <div style={{ marginTop: allSpacing.marginLG }}>
        <Text type="secondary">Hex personalizado</Text>
        <Flex gap={allSpacing.marginSM} align="center" style={{ marginTop: allSpacing.marginXS }}>
          <DocenteColorBar hex={effectiveHex} className="docente-color-picker-preview" />
          <Input
            placeholder="#3498DB"
            value={manualHex}
            onChange={(e) => {
              setManualHex(e.target.value);
              setSelectedHex('');
            }}
            maxLength={7}
          />
        </Flex>
      </div>
    </Modal>
  );
};

export default DocenteColorPickerModal;
