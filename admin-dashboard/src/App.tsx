import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import ProductForm from './pages/ProductForm';
import Heroes from './pages/Heroes';
import HeroForm from './pages/HeroForm';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import { getToken } from './api/authToken';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading');

  useEffect(() => {
    let mounted = true;
    getToken().then((token) => {
      if (mounted) setStatus(token ? 'authed' : 'unauthed');
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'loading') return null;
  return status === 'authed' ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/new" element={<ProductForm />} />
                  <Route path="/products/:id/edit" element={<ProductForm />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/heroes" element={<Heroes />} />
                  <Route path="/heroes/new" element={<HeroForm />} />
                  <Route path="/heroes/:id/edit" element={<HeroForm />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/new" element={<CategoryForm />} />
                  <Route path="/categories/:id/edit" element={<CategoryForm />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
