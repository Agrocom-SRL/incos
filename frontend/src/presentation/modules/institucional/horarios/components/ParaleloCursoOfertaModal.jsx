/**
 * Modal alta / edición de curso en la oferta del paralelo (misma config que paraleloCursoOfertaFields).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Form, Modal, Space } from 'antd';
import { FormSection } from '@molecules';
import { Button } from '@atoms';
import { createParaleloCursoOfertaFields } from '../config/paraleloCursoOfertaFields';

const DEFAULT_COLOR_HEX = '#1890ff';

const ParaleloCursoOfertaModal = ({
    open,
    onClose,
    isEdit,
    cursoEdit,
    missingSubjects,
    /** Tras guardar exitoso (p. ej. recargar oferta) */
    onSaved,
    initialAsignaturaPlanId,
    /** @returns {Promise<{ success: boolean, error?: string, data?: object }>} */
    onCrearCurso,
}) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    const section = useMemo(() => {
        const { datosCurso } = createParaleloCursoOfertaFields({ isEdit });
        return datosCurso;
    }, [isEdit]);

    const resolveOptions = useCallback(
        (key) => {
            if (key !== 'asignaturasPlanPendientes') return [];
            if (isEdit && cursoEdit?.asignaturaPlanId != null) {
                const id = Number(cursoEdit.asignaturaPlanId);
                return [
                    {
                        value: id,
                        label: `${cursoEdit.materiaSigla || '—'} — ${cursoEdit.materiaNombre || 'Materia'}`,
                    },
                ];
            }
            return (missingSubjects || []).map((m) => ({
                value: Number(m.asignaturaPlanId),
                label: `${m.materiaSigla || '—'} — ${m.materiaNombre || `Plan #${m.asignaturaPlanId}`}`,
            }));
        },
        [isEdit, cursoEdit, missingSubjects],
    );

    useEffect(() => {
        if (!open) return;
        if (isEdit && cursoEdit) {
            form.setFieldsValue({
                asignaturaPlanId: Number(cursoEdit.asignaturaPlanId),
                cupoMinimo: cursoEdit.cupoMinimo ?? 10,
                cupoMaximo: cursoEdit.cupoMaximo ?? 35,
                colorHex: cursoEdit.colorHex || DEFAULT_COLOR_HEX,
            });
            return;
        }
        if (!isEdit) {
            const apNum =
                initialAsignaturaPlanId != null && initialAsignaturaPlanId !== ''
                    ? Number(initialAsignaturaPlanId)
                    : NaN;
            form.setFieldsValue({
                asignaturaPlanId: Number.isFinite(apNum) ? apNum : undefined,
                cupoMinimo: 10,
                cupoMaximo: 35,
                colorHex: DEFAULT_COLOR_HEX,
            });
        }
    }, [open, isEdit, cursoEdit, initialAsignaturaPlanId, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (isEdit) {
                message.info('La edición del curso estará disponible en la siguiente fase.');
                onClose();
                return;
            }
            if (typeof onCrearCurso !== 'function') {
                message.error('No hay handler de creación configurado.');
                return;
            }
            setSaving(true);
            const res = await onCrearCurso(values);
            if (!res?.success) {
                message.error(res?.error || 'No se pudo crear el curso');
                return;
            }
            message.success('Curso creado correctamente');
            onSaved?.();
            onClose();
        } catch (e) {
            if (e?.errorFields) return;
            message.error(e?.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const title = isEdit ? `Editar curso #${cursoEdit?.cursoId ?? ''}` : 'Nuevo curso del paralelo';

    return (
        <Modal
            title={title}
            open={open}
            onCancel={onClose}
            destroyOnHidden
            width={640}
            footer={
                <Space>
                    <Button variant="default" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleOk} loading={saving} disabled={saving}>
                        Guardar
                    </Button>
                </Space>
            }
            styles={{
                body: {
                    marginTop: 24,
                },
            }}
        >
            <Form form={form} layout="horizontal" preserve={false}>
                <FormSection title={section.title} fields={section.fields} form={form} resolveOptions={resolveOptions} />
            </Form>
        </Modal>
    );
};

export default ParaleloCursoOfertaModal;
