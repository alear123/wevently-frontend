
import { useEffect, useState } from "react"  
import Header from '../../../common/layouts/Navbar';
import LoginForm from './src/components/Login_form';
import RegisterForm from './src/components/Register_form';
import './src/assets/Login_y_register.css'; 
import { useSearchParams } from 'react-router-dom';

const Login_y_register = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState("login") // Estado para controlar la vista actual (login o register)

  // Sync state from query param on mount and when it changes
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'register' || view === 'login') {
      setCurrentView(view);
    }
  }, [searchParams]);

  const handleShowRegister = () => {
    setCurrentView("register")
    setSearchParams({ view: 'register' });
  }

  const handleBackToLogin = () => {
    setCurrentView("login")
    setSearchParams({ view: 'login' });
  }

  return (
    <>
      <Header />
      <main className="iniciar-sesion-container">
        {currentView === "login" ? (
          <LoginForm onShowRegister={handleShowRegister} />
        ) : (
          <RegisterForm onBackToLogin={handleBackToLogin} />
        )}
      </main>
    </>
  )
} 
export default Login_y_register;