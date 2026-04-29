/**
 * Plan habilitado — grid tipo inscripciones (carrera) + alerta de gestión (no en el título de cada tarjeta).
 */

import { useEffect, useMemo } from 'react';
import { Card } from '@atoms';
import { Alert, Row, Col, Typography } from 'antd';
import InscripcionesCarreraSelectionSection from '@inscripciones/components/organisms/InscripcionesCarreraSelectionSection';

const { Text, Paragraph } = Typography;

const PLAN_FIELD = 'planHabilitadoId';

const accentFromId = (id) => {
  const hues = ['#196b45', '#1890ff', '#722ed1', '#13c2c2', '#d48806'];
  const n = Number(id);
  if (!Number.isFinite(n)) return '#196b45';
  return hues[Math.abs(n) % hues.length];
};

function mapPlanesToCardItems(planes) {
  return (planes || []).map((p) => {
    const carreraCodigo = p.carreraCodigo ?? p.carrera_codigo;
    const carreraNombre = p.carreraNombre ?? p.carrera_nombre;
    const imagen =
      p.carreraImagenRuta ?? p.carrera_imagen_ruta ?? p.imagenRuta ?? p.imagen_ruta ?? null;
    const colorCareer = p.carreraColorHex ?? p.carrera_color_hex;
    const subline = [carreraCodigo, carreraNombre].filter(Boolean).join(' · ');
    return {
      id: p.id,
      nombre: p.nombre || `Plan habilitado #${p.id}`,
      codigo:
        subline ||
        (p.planEstudioId != null ? `Plan est. ${p.planEstudioId}` : '') ||
        p.gestionCodigo ||
        '',
      imagenRuta: imagen,
      colorHex: colorCareer || accentFromId(p.id),
    };
  });
}

export default function DocentesAsignacionPlanSection({
  form,
  planes = [],
  gestionPlanId,
  onGestionPlanChange,
  loadingPlanes = false,
  errorPlanes = null,
}) {
  const planCards = useMemo(() => mapPlanesToCardItems(planes), [planes]);
  const selected = useMemo(
    () => planes.find((p) => Number(p.id) === Number(gestionPlanId)) ?? null,
    [planes, gestionPlanId]
  );

  const gestionResumen = useMemo(() => {
    if (!planes.length) return null;
    const ids = new Set(planes.map((p) => p.gestionId).filter((x) => x != null));
    if (ids.size === 1) {
      const ref = planes[0];
      const parts = [
        ref.gestionNombre || ref.gestionCodigo,
        ref.gestionAnio != null ? `Año ${ref.gestionAnio}` : null,
      ].filter(Boolean);
      return parts.length ? parts.join(' · ') : null;
    }
    return 'Varias gestiones académicas';
  }, [planes]);

  useEffect(() => {
    if (!form) return;
    if (gestionPlanId != null && gestionPlanId !== '') {
      form.setFieldsValue({ [PLAN_FIELD]: gestionPlanId });
    } else {
      form.setFieldsValue({ [PLAN_FIELD]: undefined });
    }
  }, [form, gestionPlanId]);

  return (
    <Card
      title="Plan habilitado en la gestión"
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section daa-asignacion-section"
    >
      <Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 12 }}>
        Elegí la <Text strong>habilitación gestión + plan de estudios</Text>. El nombre de la tarjeta es el plan
        habilitado; la gestión y el contexto académico se muestran arriba.
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Alert
            type="info"
            showIcon
            style={{ borderRadius: 8 }}
            title="Gestión académica y oferta"
            description={
              selected ? (
                <>
                  <Text strong>
                    {[selected.gestionNombre || selected.gestionCodigo, selected.gestionAnio != null ? `(${selected.gestionAnio})` : null]
                      .filter(Boolean)
                      .join(' ')}
                  </Text>
                  <div style={{ marginTop: 6 }}>
                    Plan habilitado seleccionado: <Text>{selected.nombre || '—'}</Text>
                  </div>
                </>
              ) : (
                <>
                  {gestionResumen ? (
                    <span>
                      Catálogo actual: <Text strong>{gestionResumen}</Text>. Las tarjetas muestran solo el nombre del
                      plan habilitado (sin repetir la gestión en cada opción).
                    </span>
                  ) : (
                    'Cargá los planes habilitados activos para esta asignación.'
                  )}
                </>
              )
            }
          />
        </Col>
        <Col xs={24} md={12}>
          <Alert
            type="success"
            showIcon
            style={{ borderRadius: 8 }}
            title="Solo planes activos"
            description="Se listan habilitaciones vigentes (gestión + plan) marcadas como activas en el sistema."
          />
        </Col>
      </Row>

      <InscripcionesCarreraSelectionSection
        form={form}
        carreras={planCards}
        loading={loadingPlanes}
        error={errorPlanes}
        embedded
        fieldName={PLAN_FIELD}
        requiredMessage="Seleccioná un plan habilitado para continuar"
        loadingHint="Cargando planes habilitados..."
        emptyDescription="No hay planes habilitados disponibles"
        onCarreraChange={(item) => {
          const id = item?.id ?? null;
          onGestionPlanChange?.(id);
        }}
      />
    </Card>
  );
}
