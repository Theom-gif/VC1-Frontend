import './index.css'
import { BrowserRouter } from "react-router-dom";
import AdminRoutes from "./admin/AdminRoutes";
import AuthorRoute from './author/AuthorRoute/AuthorRoute'
import { AuthProvider } from "./auth/AuthContext";
import { LanguageProvider } from "./i18n/LanguageContext";


function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AdminRoutes />
          <AuthorRoute />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
