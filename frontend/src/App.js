// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import CreateTourPage from "./pages/CreateTourPage";
import LoginPage from "./pages/LoginPage";
import CreateBlogPage from './pages/CreateBlogPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import FinalizeRoutePage from './pages/FinalizeRoutePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-blog" element={<CreateBlogPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-tour" 
            element={
              <ProtectedRoute>
                <CreateTourPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/finalize-route" element={<FinalizeRoutePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;
