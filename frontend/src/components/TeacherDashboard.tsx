import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ClassCard } from "./ClassCard";
import { AddClassModal } from "./AddClassModal";
import { AddStudentsModal } from "./AddStudentsModal";
import { NotificationsPanel } from "./NotificationsPanel";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../services/api";
import { tokenService } from "../services/tokenService";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Plus,
  Search,
  Filter,
  LogOut,
  UserPlus
} from "lucide-react";

interface TeacherDashboardProps {
  onClassSelect: (classId: string) => void;
  onAttendanceSelect: (classId: string) => void;
  onReportsSelect: () => void;
}

export function TeacherDashboard({ onClassSelect, onAttendanceSelect, onReportsSelect }: TeacherDashboardProps) {
  const { user, logout } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  // Load classes from API
  useEffect(() => {
    const loadTeacherClasses = async () => {
      if (!user?.id) return;
      
      try {
        // Asegurarse de que el token está configurado en el apiClient
        const token = tokenService.getToken();
        if (token) {
          apiClient.setToken(token);
        }
        
        // Cargar clases desde el API del docente
        const response = await apiClient.teachers.getTeacherClasses(user.id);
        
        if (response.success && response.data) {
          // Mapear los datos del backend PostgreSQL correctamente
          const mappedClasses = response.data.map((cls: any) => ({
            id: cls.id,
            name: cls.name, // Ya viene formateado como "Matemáticas 10°A"
            subject: cls.subject,
            classroom: cls.classroom,
            studentCount: cls.studentCount || 0,
            averageGrade: cls.averageGrade || 8.0, // Valor por defecto
            nextClass: "Por programar", // Se puede mejorar con horarios
            students: cls.students || [],
            academicYear: cls.academicYear,
            isCurrent: cls.isCurrent,
            createdAt: cls.createdAt,
            isActive: cls.isActive
          }));
          
          setClasses(mappedClasses);
          // Guardar en localStorage como respaldo
          localStorage.setItem(`teacher_classes_${user?.id}`, JSON.stringify(mappedClasses));
        } else {
          throw new Error('No hay datos de clases');
        }
      } catch (error) {
        console.error('Error loading teacher classes:', error);
        // Si falla el API, cargar desde localStorage
        const storedClasses = localStorage.getItem(`teacher_classes_${user?.id}`);
        if (storedClasses) {
          setClasses(JSON.parse(storedClasses));
        } else {
          // Si no hay datos guardados, mostrar lista vacía
          setClasses([]);
        }
      }
    };

    loadTeacherClasses();
  }, [user?.id]);

  // Datos mock del docente
  const teacherData = {
    name: user?.name || "Prof. Usuario",
    totalClasses: classes.length,
    totalStudents: classes.reduce((total, cls) => total + (cls.students?.length || cls.studentCount || 0), 0),
    averageGrade: classes.length > 0 ? (classes.reduce((total, cls) => total + (cls.averageGrade || 0), 0) / classes.length).toFixed(1) : 0,
    classesToday: 2
  };

  const quickStats = [
    {
      label: "Clases Asignadas",
      value: teacherData.totalClasses,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      label: "Total Estudiantes",
      value: teacherData.totalStudents,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      label: "Promedio General",
      value: `${teacherData.averageGrade}/10`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      label: "Clases Hoy",
      value: teacherData.classesToday,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const handleAddClass = async (classData: any) => {
    try {
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }

      // El backend auto-asigna teacherId y entityId, solo enviar: subjectId, sectionId, academicYearId, classroom, weeksDuration
      const newClassData = {
        subjectId: classData.subjectId,
        sectionId: classData.sectionId,
        academicYearId: classData.academicYearId,
        classroom: classData.classroom || "",
        weeksDuration: classData.weeksDuration || 52
        // NOTA: teacherId y entityId se asignan automáticamente en el backend
      };

      // Asegurarse de que el token está configurado
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      const response = await apiClient.classes.createClass(newClassData as any);
      
      if (response.success && response.data) {
        // Mapear la clase creada al formato esperado
        const mappedClass = {
          id: response.data.id,
          name: response.data.name,
          subject: response.data.subject,
          classroom: response.data.classroom || "",
          studentCount: 0,
          averageGrade: 0,
          nextClass: "Por programar",
          students: [],
          academicYear: response.data.academicYear,
          isCurrent: response.data.isCurrent,
          createdAt: response.data.createdAt,
          isActive: response.data.isActive
        };
        
        // Si hay horarios, guardarlos
        if (classData.schedules && classData.schedules.length > 0) {
          try {
            // Guardar horarios usando el nuevo endpoint
            console.log('Guardando horarios:', classData.schedules);
            await apiClient.classes.createSchedules(mappedClass.id, classData.schedules);
            console.log('Horarios guardados exitosamente');
          } catch (scheduleError) {
            console.error('Error guardando horarios:', scheduleError);
            // No es un error fatal, la clase se creó pero los horarios pueden no haberse guardado
          }
        }
        
        const newClasses = [...classes, mappedClass];
        setClasses(newClasses);
        localStorage.setItem(`teacher_classes_${user?.id}`, JSON.stringify(newClasses));
      } else {
        throw new Error('Error al crear clase en el servidor');
      }
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleAddStudents = (students: any[]) => {
    if (!selectedClassForStudents) return;
    
    const updatedClasses = classes.map(cls => 
      cls.id === selectedClassForStudents.id 
        ? { ...cls, students: students, studentCount: students.length }
        : cls
    );
    
    setClasses(updatedClasses);
    localStorage.setItem(`teacher_classes_${user?.id}`, JSON.stringify(updatedClasses));
  };

  const handleOpenAddStudents = (classData: any) => {
    setSelectedClassForStudents(classData);
    setShowAddStudentsModal(true);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header with Logout and Notifications */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1>¡Bienvenido de vuelta! 👋</h1>
          <p className="text-muted-foreground">{teacherData.name}</p>
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

      {/* Today's Schedule - Solo si hay clases */}
      {classes.length > 0 && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3>Clases de Hoy</h3>
              <Badge variant="secondary">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {classes.length > 0 ? (
                classes.slice(0, 2).map((cls, index) => (
                  <div 
                    key={cls.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cls.classroom ? `Aula: ${cls.classroom}` : 'Sin aula asignada'}
                      </p>
                    </div>
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      {index === 0 ? 'Próxima' : 'Más tarde'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No hay clases programadas para hoy
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3>Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => onAttendanceSelect(classes[0]?.id || "1")}
          >
            <Users className="h-5 w-5" />
            <span className="text-sm">Tomar Asistencia</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={onReportsSelect}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Ver Reportes</span>
          </Button>
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3>Mis Clases</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setShowAddClassModal(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {classes.length > 0 ? (
            classes.map((classData) => (
              <ClassCard
                key={classData.id}
                classData={classData}
                onClick={() => onClassSelect(classData.id)}
                onAttendanceClick={() => onAttendanceSelect(classData.id)}
                onAddStudentsClick={() => handleOpenAddStudents(classData)}
              />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No tienes clases asignadas aún
              </p>
              <Button 
                onClick={() => setShowAddClassModal(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Primera Clase
              </Button>
            </Card>
          )}
        </div>
      </div>

      <div className="h-20"></div>

      {/* Modals */}
      <AddClassModal
        isOpen={showAddClassModal}
        onClose={() => setShowAddClassModal(false)}
        onSave={handleAddClass}
      />

      <AddStudentsModal
        isOpen={showAddStudentsModal}
        onClose={() => {
          setShowAddStudentsModal(false);
          setSelectedClassForStudents(null);
        }}
        onSave={handleAddStudents}
        classId={selectedClassForStudents?.id || ""}
        className={selectedClassForStudents?.name || ""}
      />
    </div>
  );
}