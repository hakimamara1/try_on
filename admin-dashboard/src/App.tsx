import type { ReactNode } from 'react';
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

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
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
