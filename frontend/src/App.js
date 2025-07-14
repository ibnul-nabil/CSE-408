// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TourProvider } from "./context/TourContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import CreateTourPage from "./pages/CreateTourPage";
import LoginPage from "./pages/LoginPage";
import CreateBlogPage from './pages/CreateBlogPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import FinalizeRoutePage from './pages/FinalizeRoutePage';
import ConfirmTourPage from './pages/ConfirmTourPage';
import CreateTourInfoPage from './pages/CreateTourInfoPage';
import MyBlogsPage from './pages/MyBlogsPage';
import MyTripsPage from './pages/MyTripsPage';
import TourDetailsPage from './pages/TourDetailsPage';
import EditTourPage from './pages/EditTourPage';

function App() {
  return (
    <AuthProvider>
      <TourProvider>
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
            <Route path="/blogs" element={<BlogListPage />} />
            <Route path="/blogs/:id" element={<BlogDetailPage />} />
            <Route path="/finalize-route" element={<FinalizeRoutePage />} />
            <Route 
              path="/confirm-tour" 
              element={
                <ProtectedRoute>
                  <ConfirmTourPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-tour-info" 
              element={
                <ProtectedRoute>
                  <CreateTourInfoPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/select-places" 
              element={
                <ProtectedRoute>
                  <CreateTourPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-blogs" 
              element={
                <ProtectedRoute>
                  <MyBlogsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-trips" 
              element={
                <ProtectedRoute>
                  <MyTripsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tour-details/:id" 
              element={
                <ProtectedRoute>
                  <TourDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-tour/:id" 
              element={
                <ProtectedRoute>
                  <EditTourPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </TourProvider>
    </AuthProvider>
  );
}
export default App;
