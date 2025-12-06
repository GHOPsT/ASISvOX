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
import { toast } from "sonner";
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

  // Función para calcular qué clases son de hoy
  const getClassesToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    return classes
      .filter((cls) => {
        // Filtrar clases que tengan horario para el día de hoy
        if (!cls.schedules || cls.schedules.length === 0) return false;
        return cls.schedules.some((sch: any) => sch.dayOfWeek === dayOfWeek);
      })
      .sort((a: any, b: any) => {
        // Ordenar por hora de inicio (start_time)
        const aSchedule = a.schedules?.find((s: any) => s.dayOfWeek === dayOfWeek);
        const bSchedule = b.schedules?.find((s: any) => s.dayOfWeek === dayOfWeek);
        
        if (!aSchedule || !bSchedule) return 0;
        return aSchedule.startTime.localeCompare(bSchedule.startTime);
      });
  };

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
        
        // Cargar clases desde el endpoint /classes (filtra automáticamente por teacher para teachers)
        const response = await apiClient.classes.getClasses();
        
        if (response.success && response.data && Array.isArray(response.data)) {
          // Mapear los datos del backend PostgreSQL correctamente
          const mappedClasses = response.data.map((cls: any) => ({
            id: cls.id,
            name: cls.name, // Ya viene formateado como "Física 10°A"
            subject: cls.subject,
            classroom: cls.classroom,
            studentCount: cls.studentCount || 0,
            averageGrade: cls.averageGrade || 0,
            nextClass: "Por programar",
            students: cls.students || [],
            academicYear: cls.academicYear,
            isActive: cls.isActive,
            schedules: cls.schedules || [] // Incluir horarios desde el backend
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

  // Calcular clases de hoy
  const classesToday = getClassesToday();

  // Datos mock del docente
  const teacherData = {
    name: user?.name || "Prof. Usuario",
    totalClasses: classes.length,
    totalStudents: classes.reduce((total, cls) => total + (cls.students?.length || cls.studentCount || 0), 0),
    averageGrade: classes.length > 0 ? (classes.reduce((total, cls) => total + (cls.averageGrade || 0), 0) / classes.length).toFixed(1) : 0,
    classesToday: classesToday.length
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

      // Recargar las clases desde el servidor para asegurar que se reflejen todos los cambios
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      const response = await apiClient.classes.getClasses();

      if (response.success && response.data && Array.isArray(response.data)) {
        const mappedClasses = response.data.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          subject: cls.subject,
          classroom: cls.classroom,
          studentCount: cls.studentCount || 0,
          averageGrade: cls.averageGrade || 0,
          nextClass: "Por programar",
          students: cls.students || [],
          academicYear: cls.academicYear,
          isActive: cls.isActive,
          schedules: cls.schedules || []
        }));

        setClasses(mappedClasses);
        localStorage.setItem(`teacher_classes_${user?.id}`, JSON.stringify(mappedClasses));
        toast.success("Clase creada y datos actualizados");
      }
    } catch (error) {
      console.error('Error in handleAddClass:', error);
      toast.error("Error al actualizar los datos");
    }
  };

  const handleAddStudents = async (students: any[]) => {
    if (!selectedClassForStudents) {
      toast.error("Clase no seleccionada");
      return;
    }

    try {
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      // Primero crear los estudiantes si no existen
      const createStudentsResponse = await apiClient.students.createStudents(
        students.map(s => ({
          first_name: s.first_name,
          last_name: s.last_name,
          identification_number: s.identification_number,
          date_of_birth: s.date_of_birth,
          gender: s.gender
        }))
      );

      if (!createStudentsResponse.success) {
        throw new Error('Error al crear estudiantes');
      }

      // Extraer IDs de estudiantes creados o existentes
      const studentIds = createStudentsResponse.data.map((s: any) => s.id);

      // Luego agregar los estudiantes a la clase
      const addToClassResponse = await apiClient.classes.addStudentsToClass(
        selectedClassForStudents.id,
        studentIds
      );

      if (!addToClassResponse.success) {
        throw new Error('Error al agregar estudiantes a la clase');
      }

      toast.success(`${students.length} estudiantes agregados correctamente`);
      
      // Recargar las clases para obtener el conteo actualizado
      const response = await apiClient.classes.getClasses();
      if (response.success && response.data) {
        const mappedClasses = response.data.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          subject: cls.subject,
          classroom: cls.classroom,
          studentCount: cls.studentCount || 0,
          averageGrade: cls.averageGrade || 0,
          nextClass: "Por programar",
          students: cls.students || [],
          academicYear: cls.academicYear,
          isActive: cls.isActive,
          schedules: cls.schedules || []
        }));
        
        setClasses(mappedClasses);
        localStorage.setItem(`teacher_classes_${user?.id}`, JSON.stringify(mappedClasses));
      }
    } catch (error: any) {
      console.error('Error adding students:', error);
      toast.error(error.message || "Error al agregar estudiantes");
    }
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
              {classesToday.length > 0 ? (
                classesToday.map((cls, index) => {
                  const today = new Date().getDay();
                  const todaySchedule = cls.schedules?.find((s: any) => s.dayOfWeek === today);
                  return (
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
                          {todaySchedule ? `${todaySchedule.startTime} - ${todaySchedule.endTime}` : ''}
                          {todaySchedule && cls.classroom ? ' | ' : ''}
                          {cls.classroom ? `Aula: ${cls.classroom}` : ''}
                        </p>
                      </div>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {index === 0 ? 'Próxima' : 'Más tarde'}
                      </Badge>
                    </div>
                  );
                })
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