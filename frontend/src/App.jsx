// src/App.jsx
import AppRouter from '@router';
import { StudentProvider } from '@application/modules/estudiantes';

const App = () => {
    return (
        <StudentProvider>
            <AppRouter />
        </StudentProvider>
    );
};

export default App;