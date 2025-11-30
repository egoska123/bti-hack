import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toast';
import styles from './App.module.css';
import { Layout } from './components/blocks/Layout';
import { Plan3DViewer, MOCK_PLAN_DATA } from './components/blocks/Plan3DViewer';
import { Plan2D } from '@/components/shared/2dPlan';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Executors } from './pages/Executors';
import { OrderDetail } from './pages/Executors/OrderDetail';

// Компонент страницы редактора с переключателем 2D/3D
const EditorPage = () => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  return (
    <Layout mode='chat'>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Переключатель 2D/3D */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 100,
            display: 'flex',
            gap: '8px',
            backgroundColor: 'var(--color-background, #ffffff)',
            padding: '4px',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--color-border, #cccccc)',
            boxShadow: 'var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1))',
          }}
        >
          <button
            onClick={() => setViewMode('2d')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === '2d' ? 'var(--color-primary, #18181b)' : 'transparent',
              color: viewMode === '2d' ? 'var(--color-primary-foreground, #fafafa)' : 'var(--color-text, #213547)',
              border: 'none',
              borderRadius: 'var(--radius-sm, 4px)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: viewMode === '2d' ? '600' : '400',
              transition: 'all 0.2s',
            }}
          >
            2D
          </button>
          <button
            onClick={() => setViewMode('3d')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === '3d' ? 'var(--color-primary, #18181b)' : 'transparent',
              color: viewMode === '3d' ? 'var(--color-primary-foreground, #fafafa)' : 'var(--color-text, #213547)',
              border: 'none',
              borderRadius: 'var(--radius-sm, 4px)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: viewMode === '3d' ? '600' : '400',
              transition: 'all 0.2s',
            }}
          >
            3D
          </button>
        </div>

        {/* Условный рендеринг компонентов */}
        {viewMode === '2d' ? (
          <Plan2D />
        ) : (
          <Plan3DViewer data={MOCK_PLAN_DATA as any} />
        )}
      </div>
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className={styles.container}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/executors" element={<Executors />} />
          <Route path="/executors/orders/:id" element={<OrderDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
