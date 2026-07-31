/**
 * Organismo: sección de estudiantes de la ficha de sesión (TUT · A9).
 *
 * Tabla de registro rápido de asistencia/progreso en LOTE: los editores
 * escriben en memoria (`setEstudianteCampo`) y el botón "Guardar registro"
 * persiste todo en un batch (sesion·EDITAR, fail-closed vía ActionButton).
 * Incluye el enlace virtual de la sesión (si aplica), un indicador discreto de
 * cambios sin guardar junto al botón (sin banners) y estado vacío contextual.
 */

import { useMemo } from 'react';
import { Empty, Flex, Typography } from 'antd';
import { LinkOutlined, SaveOutlined } from '@ant-design/icons';
import { DataTable } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, Text } from '@atoms';
import { TUTORIAS_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';
import { createSesionEstudiantesColumns } from '@academico/acompanamiento/sesiones/config/sesionEstudiantesTableColumns';
import { allSpacing } from '@theme/tokens';

const { Paragraph } = Typography;

const SesionEstudiantesSection = ({
  sesion,
  estudiantes,
  setEstudianteCampo,
  dirty,
  saving,
  onGuardar,
  readOnly = false,
}) => {
  const columns = useMemo(
    () => createSesionEstudiantesColumns({ setEstudianteCampo, readOnly }),
    [setEstudianteCampo, readOnly],
  );

  const guardarAction = readOnly ? null : (
    <Flex gap={allSpacing.marginSM} align="center">
      {dirty ? <Text type="warning">Cambios sin guardar</Text> : null}
      <ActionButton
        permiso={TUTORIAS_PERMISOS.sesion}
        accion="EDITAR"
        variant="primary"
        icon={<SaveOutlined />}
        loading={saving}
        disabled={!dirty}
        onClick={onGuardar}
      >
        Guardar registro
      </ActionButton>
    </Flex>
  );

  return (
    <section className="cfg-academico-workspace">
      <header className="cfg-academico-workspace__header">
        <ListPanelHeader title="Asistencia y progreso" actions={guardarAction} />
        <Paragraph type="secondary" className="cfg-academico-workspace__desc">
          {readOnly
            ? 'Registro de asistencia y valoración de progreso de los alumnos convocados a la sesión.'
            : 'Marque la asistencia y valore el progreso de cada alumno; los cambios se guardan todos juntos con «Guardar registro».'}
        </Paragraph>
      </header>

      <Flex vertical gap={allSpacing.margin} className="cfg-academico-tab-panel">
        {sesion?.modalidad === 'VIRTUAL' && sesion?.enlaceVirtual ? (
          <Text type="secondary">
            <LinkOutlined /> Enlace de la sesión:{' '}
            <a href={sesion.enlaceVirtual} target="_blank" rel="noopener noreferrer">
              {sesion.enlaceVirtual}
            </a>
          </Text>
        ) : null}

        {estudiantes.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="La sesión no tiene alumnos convocados."
          />
        ) : (
          <DataTable
            dataSource={estudiantes}
            columns={columns}
            rowKey={(record) => record.id ?? record.matriculaMateriaId}
            pagination={false}
            size="small"
          />
        )}
      </Flex>
    </section>
  );
};

export default SesionEstudiantesSection;
