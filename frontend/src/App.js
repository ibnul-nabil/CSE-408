// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import CreateTourPage from "./pages/CreateTourPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/create-tour" element={<CreateTourPage />} />
      </Routes>
    </Router>
  );
}

export default App;
