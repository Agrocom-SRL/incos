// components/atoms/fields/FieldUpload.jsx
/**
 * FieldUpload: Átomo para campos de tipo upload
 * 
 * Single Responsibility: Renderizar un upload básico
 */

import { Upload, Button, Space } from 'antd';
import { UploadOutlined, FileTextOutlined, EditOutlined } from '@ant-design/icons';

const FieldUpload = ({ 
  disabled, 
  readOnly,
  onChange,
  fileList = [],
  maxCount = 1,
  accept,
  listType = 'text',
  uploadText = 'Seleccionar archivo',
  documentoExistente,
  mostrarInputUpload,
  onToggleUpload,
  ...props 
}) => {
  // Si hay un documento existente y no se está mostrando el input, mostrar enlace
  if (documentoExistente && !mostrarInputUpload) {
    const documento = documentoExistente;
    const url = documento.url || documento.rutaArchivo;
    
    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ marginRight: 8 }}
          >
            {documento.nombreArchivo || 'Ver documento'}
          </a>
          {!readOnly && (
            <Button 
              type="link" 
              size="small"
              icon={<EditOutlined />}
              onClick={onToggleUpload}
            >
              Modificar
            </Button>
          )}
        </Space>
      </Space>
    );
  }
  
  return (
    <Upload
      disabled={disabled || readOnly}
      beforeUpload={() => false}
      onChange={onChange}
      fileList={fileList}
      maxCount={maxCount}
      accept={accept}
      listType={listType}
      {...props}
    >
      <Button icon={<UploadOutlined />} disabled={disabled || readOnly}>
        {uploadText}
      </Button>
    </Upload>
  );
};

export default FieldUpload;

