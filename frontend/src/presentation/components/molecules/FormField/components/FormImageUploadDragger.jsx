/**
 * Upload de imagen con vista previa a pantalla completa del área (blob local o ruta servidor).
 */
import { useCallback } from 'react';
import { Form, Upload, Typography } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { buildCarreraImageUrl } from '@application-configuracion/academico/utils/buildCarreraImageUrl';
import { useImageUploadPreviewUrl } from '../hooks/useImageUploadPreviewUrl';

const { Dragger } = Upload;
const { Text } = Typography;

const DEFAULT_ACCEPT = 'image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.svg,.avif,.heic,.heif';

const fileListFromUploadEvent = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList;
};

const enrichFileListWithPreview = (nextList) => {
  if (!Array.isArray(nextList) || nextList.length === 0) {
    return [];
  }
  return nextList.slice(0, 1).map((file) => {
    const origin = file.originFileObj ?? file;
    if (origin instanceof File) {
      return {
        ...file,
        originFileObj: origin,
        status: 'done',
        percent: 100,
      };
    }
    return file;
  });
};

const FormImageUploadDragger = ({ value, onChange, disabled, readOnly, field, form }) => {
  const d = disabled || readOnly;
  const fileList = value ?? [];
  const previewField = field.previewField || 'imagenRuta';
  const storedPath = form ? Form.useWatch(previewField, form) : null;

  const previewUrl = useImageUploadPreviewUrl(fileList, () => buildCarreraImageUrl(storedPath));
  const hasPreview = Boolean(previewUrl);

  const handleChange = useCallback(
    ({ fileList: next }) => {
      const enriched = enrichFileListWithPreview(next);
      onChange?.(enriched);
    },
    [onChange],
  );

  return (
    <div
      className={`form-image-upload${hasPreview ? ' form-image-upload--has-preview' : ''}`}
    >
      {hasPreview ? (
        <img
          src={previewUrl}
          alt={field.previewAlt || 'Vista previa de la imagen'}
          className="form-image-upload__preview-img"
        />
      ) : null}

      <Dragger
        className="form-image-upload__dragger"
        maxCount={field.maxCount ?? 1}
        beforeUpload={() => false}
        accept={field.accept || DEFAULT_ACCEPT}
        fileList={fileList}
        onChange={handleChange}
        disabled={d}
        showUploadList={false}
      >
        <div className="form-image-upload__content">
          <p className="form-image-upload__icon">
            {hasPreview ? <UploadOutlined /> : <InboxOutlined />}
          </p>
          <p className="form-image-upload__title">
            {hasPreview ? 'Cambiar imagen' : 'Arrastre y suelte la imagen aquí'}
          </p>
          <p className="form-image-upload__hint">
            o <span className="form-image-upload__link">haga clic para seleccionar</span>
          </p>
          <Text className="form-image-upload__formats">
            {field.formatsHint || 'Formatos: JPG, PNG, WEBP, GIF, BMP, TIFF y más'}
          </Text>
        </div>
      </Dragger>
    </div>
  );
};

export { fileListFromUploadEvent };
export default FormImageUploadDragger;
