/**
 * App — composición raíz de providers.
 * Orden: i18n → tema (incluye ConfigProvider de AntD) → MotionConfig → Router.
 * SRP: solo ensambla; ninguna lógica de pantalla aquí.
 */
import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { I18nProvider } from '@lib/i18n/I18nProvider';
import { ThemeProvider } from '@ds/theme/ThemeProvider';
import { router } from './router';

export function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
