import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { NotificationsPanel } from "./NotificationsPanel";
import { useAuth } from "../contexts/AuthContext";
import { 
  Users, 
  BookOpen, 
  Calendar,
  GraduationCap,
  LogOut,
  Eye,
  ClipboardList,
  UserPlus,
  BarChart3,
  CalendarCheck,
  Building2
} from "lucide-react";
import { TeacherListView } from "./admin/TeacherListView";
import { TeacherCalendarView } from "./admin/TeacherCalendarView";
import { TeacherGradesView } from "./admin/TeacherGradesView";
import { UserManagement } from "./admin/UserManagement";
import { StatisticsView } from "./admin/StatisticsView";
import { TeacherAssignmentManager } from "./admin/TeacherAssignmentManager";
import { EntityManagement } from "./admin/EntityManagement";

type AdminView = "overview" | "teachers" | "calendar" | "grades" | "users" | "statistics" | "assignments" | "entities";

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>("overview");
  const [systemStats, setSystemStats] = useState({
    totalTeachers: 0,
    totalStudents: 450,
    totalClasses: 0,
    activeSubjects: 0
  });

  useEffect(() => {
    updateSystemStats();
  }, [currentView]);

  const updateSystemStats = () => {
    // Load teachers count
    const storedUsers = JSON.parse(localStorage.getItem('asisVox_users') || '[]');
    const teacherCount = storedUsers.filter((u: any) => u.role === 'teacher').length;
    
    // Load assignments
    const assignments = JSON.parse(localStorage.getItem('asisVox_teacher_assignments') || '[]');
    const totalClasses = assignments.reduce((total: number, a: any) => total + a.classes.length, 0);
    
    // Get unique subjects
    const subjects = new Set<string>();
    assignments.forEach((a: any) => {
      a.classes.forEach((c: any) => {
        subjects.add(c.subject);
      });
    });
    
    setSystemStats({
      totalTeachers: teacherCount,
      totalStudents: 450, // Keep mock for now
      totalClasses: totalClasses,
      activeSubjects: subjects.size
    });
  };

  const quickStats = [
    {
      label: "Profesores Registrados",
      value: systemStats.totalTeachers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      label: "Estudiantes Totales",
      value: systemStats.totalStudents,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      label: "Clases Activas",
      value: systemStats.totalClasses,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      label: "Materias",
      value: systemStats.activeSubjects,
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case "teachers":
        return <TeacherListView onBack={() => setCurrentView("overview")} />;
      case "calendar":
        return <TeacherCalendarView onBack={() => setCurrentView("overview")} />;
      case "grades":
        return <TeacherGradesView onBack={() => setCurrentView("overview")} />;
      case "users":
        return <UserManagement onBack={() => setCurrentView("overview")} />;
      case "statistics":
        return <StatisticsView onBack={() => setCurrentView("overview")} />;
      case "assignments":
        return <TeacherAssignmentManager onBack={() => setCurrentView("overview")} />;
      case "entities":
        return <EntityManagement onBack={() => setCurrentView("overview")} />;
      default:
        return (
          <div className="p-4 space-y-6">
            {/* Welcome Header with Notifications and Logout */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1>Panel de Administración 👨‍💼</h1>
                <p className="text-muted-foreground">{user?.name}</p>
              </div>
              <div className="flex gap-2">
                {user?.id && <NotificationsPanel userId={user.id} />}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="font-semibold">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* System Status */}
            <Card className="p-4">
              <div className="space-y-3">
                <h3>Estado del Sistema</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Sistema ASISvOX</span>
                    <Badge className="bg-green-100 text-green-700">Activo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Base de Datos</span>
                    <Badge className="bg-green-100 text-green-700">Conectado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Última Sincronización</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3>Gestión del Sistema</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full h-16 flex items-center justify-between p-4"
                  onClick={() => setCurrentView("users")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Gestión de Usuarios</p>
                      <p className="text-sm text-muted-foreground">Crear profesores y administradores</p>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-16 flex items-center justify-between p-4"
                  onClick={() => setCurrentView("entities")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Gestión de Entidades</p>
                      <p className="text-sm text-muted-foreground">Crear y administrar instituciones educativas</p>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-16 flex items-center justify-between p-4"
                  onClick={() => setCurrentView("assignments")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <CalendarCheck className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Asignación de Cursos</p>
                      <p className="text-sm text-muted-foreground">Asignar materias y horarios a profesores</p>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-16 flex items-center justify-between p-4"
                  onClick={() => setCurrentView("statistics")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Estadísticas</p>
                      <p className="text-sm text-muted-foreground">Gráficos de rendimiento y distribución</p>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-16 flex items-center justify-between p-4"
                  onClick={() => setCurrentView("teachers")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Lista de Profesores</p>
                      <p className="text-sm text-muted-foreground">Ver todos los profesores y sus cursos</p>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-16 flex items-center justify-between p-4"
                  onClick={() => setCurrentView("calendar")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Calendario de Horarios</p>
                      <p className="text-sm text-muted-foreground">Distribución semanal por profesor</p>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-16 flex items-center justify-between p-4"
                  onClick={() => setCurrentView("grades")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Supervisión de Notas</p>
                      <p className="text-sm text-muted-foreground">Revisar calificaciones por profesor</p>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <Card className="p-4">
              <div className="space-y-3">
                <h3>Actividad Reciente</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">Prof. María González registró asistencia</p>
                      <p className="text-xs text-muted-foreground">Matemáticas 10°A - Hace 15 min</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ClipboardList className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">Prof. Carlos Ruiz subió calificaciones</p>
                      <p className="text-xs text-muted-foreground">Física 11°B - Hace 32 min</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">Nueva clase creada</p>
                      <p className="text-xs text-muted-foreground">Historia 9°C - Hace 1 hora</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="h-20"></div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {renderContent()}
    </div>
  );
}