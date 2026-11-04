import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import LoginScreen from "./components/LoginScreen";
import MainLayout from "./components/MainLayout";
import { LikesProvider } from "./context/LikesContext";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", disableContextMenu);

    const blockTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", blockTabKey, { capture: true });

    const handleResize = () => {
      setIsResizing(true);
      document.body.classList.add("is-resizing");

      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = window.setTimeout(() => {
        setIsResizing(false);
        document.body.classList.remove("is-resizing");
      }, 100);
    };
    window.addEventListener("resize", handleResize);

    checkAuth();

    return () => {
      window.removeEventListener("contextmenu", disableContextMenu);
      window.removeEventListener("keydown", blockTabKey, { capture: true });
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
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

  return (
    <>
    <div
    className={`fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-150 backdrop-blur-xl bg-black/20 ${
      isResizing ? "opacity-100" : "opacity-0"
    }`}
    />

    {isAuthenticated ? (
      <LikesProvider>
      <MainLayout onLogout={handleLogout} />
      </LikesProvider>
    ) : (
      <LoginScreen onLoginSuccess={handleLoginSuccess} />
    )}
    </>
  );
}

export default App;
