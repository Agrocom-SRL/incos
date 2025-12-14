// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import incosTheme from '@infrastructure/config/theme.config';
import { injectCSSVariables } from '@styles/theme/css-variables';
import '@styles/index.css';
import App from './App.jsx';

// Inyectar variables CSS desde el tema JS (sincronización)
injectCSSVariables();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ConfigProvider theme={incosTheme}>
            <App />
        </ConfigProvider>
    </StrictMode>
);