import { createContext, useContext, useState } from 'react';

type AppContextType = {
  isModalOpen: boolean;
  formData: any;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openModal: () => void;
  closeModal: () => void;
  setIsModalOpen: (value: boolean) => void;
  setFormData: (value: any) => void;
  setIsSidebarOpen: (value: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const value = {
    // estados
    isModalOpen,
    formData,
    isSidebarOpen,
    // setters
    setIsModalOpen,
    setFormData,
    setIsSidebarOpen,
    // funciones auxiliares
    toggleSidebar: () => setIsSidebarOpen((prev) => !prev),
    closeSidebar: () => setIsSidebarOpen(false),
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}
