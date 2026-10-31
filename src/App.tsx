import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import LoginScreen from "./components/LoginScreen";
import MainLayout from "./components/MainLayout";
import { LikesProvider } from "./context/LikesContext";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Disable right-click context menu
    const disableContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', disableContextMenu);

    checkAuth();

    return () => {
      window.removeEventListener('contextmenu', disableContextMenu);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await invoke<boolean>("check_auth");
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await invoke("logout");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="glass rounded-2xl p-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <LikesProvider>
      <MainLayout onLogout={handleLogout} />
    </LikesProvider>
  ) : (
    <LoginScreen onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;
