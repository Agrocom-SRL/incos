/**
 * P1 del Centralizador — sección de exportación por carrera (formulario).
 *
 * Tarjeta de FORMULARIO (mismo look que MateriaFormPage: `cfg-academico-form`)
 * embebida en la grilla de paralelos. Dos Selects (carrera + bimestre) habilitan
 * el botón "Exportar carrera", que descarga el libro multi-hoja de TODA la
 * carrera para el bimestre elegido.
 *
 * El endpoint recibe `paraleloGestionId` (deriva la carrera) + `bimestre`: al
 * elegir una carrera se envía un paralelo REPRESENTATIVO de esa carrera (uno
 * cualquiera de sus paralelos) junto al bimestre seleccionado.
 *
 * Atomic Design: organismo (compuesto por Card + Form + Selects + ActionButton).
 */

import { useMemo, useState } from 'react';
import { App, Card, Col, Form, Row, Select, Space, Typography } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import { useExportCentralizadorExcel } from '@application-academico/centralizador/hooks/api/useExportCentralizadorExcel.js';
import { CENTRALIZADOR_PERMISOS } from '@application-academico/centralizador/utils/centralizadorPermisos.js';

const { Text } = Typography;

// Opciones fijas de bimestre (1°–4°). El centralizador trabaja por bimestre.
const BIMESTRE_OPTIONS = [
  { value: 1, label: 'Primer bimestre' },
  { value: 2, label: 'Segundo bimestre' },
  { value: 3, label: 'Tercer bimestre' },
  { value: 4, label: 'Cuarto bimestre' },
];

const CentralizadorExportSection = ({ paralelos = [] }) => {
  const { notification } = App.useApp();
  const { exportarCarrera, loadingCarrera } = useExportCentralizadorExcel();

  const [carreraId, setCarreraId] = useState(null);
  const [bimestre, setBimestre] = useState(null);

  // Carreras únicas (Map por carreraId), guardando UN paralelo representativo
  // para derivar la carrera en el backend. Ordenadas por nombre.
  const carreras = useMemo(() => {
    const porCarrera = new Map();
    (Array.isArray(paralelos) ? paralelos : []).forEach((p) => {
      if (p?.carreraId == null || porCarrera.has(p.carreraId)) return;
      porCarrera.set(p.carreraId, {
        carreraId: p.carreraId,
        carreraNombre: p.carreraNombre,
        carreraColorHex: p.carreraColorHex,
        // Paralelo representativo: cualquiera de la carrera sirve para que el
        // endpoint resuelva la carrera completa.
        paraleloGestionId: p.paraleloGestionId,
      });
    });
    return Array.from(porCarrera.values()).sort((a, b) =>
      (a.carreraNombre ?? '').localeCompare(b.carreraNombre ?? '')
    );
  }, [paralelos]);

  const sinCarreras = carreras.length === 0;

  const carreraSeleccionada = useMemo(
    () => carreras.find((c) => c.carreraId === carreraId) ?? null,
    [carreras, carreraId]
  );

  const carreraOptions = useMemo(
    () =>
      carreras.map((c) => ({
        value: c.carreraId,
        label: (
          <Space size={allSpacing.marginSM}>
            <span
              className="cal-centralizador-export__dot"
              style={{ backgroundColor: c.carreraColorHex || undefined }}
            />
            <span style={{ fontWeight: 600 }}>{c.carreraNombre}</span>
          </Space>
        ),
        // Texto plano para que showSearch filtre por nombre de carrera.
        searchLabel: c.carreraNombre ?? '',
      })),
    [carreras]
  );

  const puedeExportar = Boolean(carreraId && bimestre);

  const handleExportar = async () => {
    const paraleloGestionId = carreraSeleccionada?.paraleloGestionId;
    if (!paraleloGestionId || !bimestre) return;

    const result = await exportarCarrera(paraleloGestionId, bimestre);
    if (result.success) {
      notification.success({
        title: 'Carrera exportada',
        description:
          'La descarga del libro Excel con todos los paralelos de la carrera se inició correctamente.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar la carrera',
        description: result.error || 'Reintente en unos segundos.',
      });
    }
  };

  return (
    <Card
      {...sectionCardProps}
      title="Exportar centralizador por carrera"
    >
      <Form
        layout="vertical"
        className="cfg-academico-form"
        disabled={sinCarreras}
      >
        <p className="cal-centralizador-export__desc">
          Elegí una carrera y un bimestre para descargar el centralizador
          completo de la carrera en un libro Excel (una hoja por paralelo).
        </p>

        <Row gutter={[allSpacing.marginLG, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Carrera" required>
              <Select
                placeholder="Seleccione una carrera"
                value={carreraId}
                onChange={setCarreraId}
                options={carreraOptions}
                showSearch
                allowClear
                disabled={sinCarreras}
                status={carreraId ? 'success' : undefined}
                optionFilterProp="searchLabel"
                filterOption={(input, option) =>
                  (option?.searchLabel ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Bimestre" required>
              <Select
                placeholder="Seleccione un bimestre"
                value={bimestre}
                onChange={setBimestre}
                options={BIMESTRE_OPTIONS}
                allowClear
                disabled={sinCarreras}
                status={bimestre ? 'success' : undefined}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="cal-centralizador-export__footer">
          <ActionButton
            permiso={CENTRALIZADOR_PERMISOS.centralizador}
            accion="EXPORTAR"
            variant="primary"
            icon={<FileExcelOutlined />}
            loading={loadingCarrera}
            disabled={!puedeExportar}
            onClick={handleExportar}
            title="Descarga toda la carrera (una hoja por paralelo) para el bimestre elegido"
          >
            {puedeExportar ? 'Exportar carrera' : 'Seleccione carrera y bimestre'}
          </ActionButton>
        </div>

        {sinCarreras ? (
          <Text type="secondary" className="cal-centralizador-export__desc">
            No hay paralelos en gestión vigente para exportar.
          </Text>
        ) : null}
      </Form>
    </Card>
  );
};

export default CentralizadorExportSection;
