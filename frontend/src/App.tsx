import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { ClassDetail } from "./components/ClassDetail";
import { AttendanceView } from "./components/AttendanceView";
import { ReportsScreen } from "./components/ReportsScreen";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<"welcome" | "login" | "register">("welcome");
  const [currentView, setCurrentView] = useState<"dashboard" | "class" | "attendance" | "reports">("dashboard");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentView("class");
  };

  const handleAttendanceSelect = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentView("attendance");
  };

  const handleReportsSelect = () => {
    setCurrentView("reports");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedClassId(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando ASISvOX...</p>
        </div>
      </div>
    );
  }

  // Show authentication screens if user is not logged in
  if (!user) {
    if (authView === "login") {
      return (
        <LoginScreen
          onBack={() => setAuthView("welcome")}
          onRegister={() => setAuthView("register")}
        />
      );
    }

    if (authView === "register") {
      return (
        <RegisterScreen
          onBack={() => setAuthView("welcome")}
          onLogin={() => setAuthView("login")}
        />
      );
    }

    return (
      <WelcomeScreen
        onLogin={() => setAuthView("login")}
        onRegister={() => setAuthView("register")}
      />
    );
  }

  // Show main application if user is logged in
  return (
    <div className="h-screen bg-background flex flex-col max-w-md mx-auto">
      {currentView === "dashboard" && user?.role === "teacher" && (
        <TeacherDashboard 
          onClassSelect={handleClassSelect}
          onAttendanceSelect={handleAttendanceSelect}
          onReportsSelect={handleReportsSelect}
        />
      )}

      {currentView === "dashboard" && (user?.role === "admin_entity" || user?.role === "admin_general") && (
        <AdminDashboard />
      )}
      
      {currentView === "class" && selectedClassId && (
        <ClassDetail
          classId={selectedClassId}
          onBack={handleBackToDashboard}
        />
      )}
      
      {currentView === "attendance" && selectedClassId && (
        <AttendanceView
          classId={selectedClassId}
          onBack={handleBackToDashboard}
        />
      )}
      
      {currentView === "reports" && (
        <ReportsScreen onBack={handleBackToDashboard} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}