// src/App.jsx
import MainLayout from '@templates/MainLayout';
import { Sidebar, Header } from '@organisms';
import Dashboard from '@pages/Dashboard';
import SideContent from '@pages/Dashboard/SideContent';

const App = () => {
  return (
    <MainLayout
      sidebar={<Sidebar />}
      header={<Header />}
      sideContent={<SideContent />}
    >
      <Dashboard />
    </MainLayout>
  );
};

export default App;