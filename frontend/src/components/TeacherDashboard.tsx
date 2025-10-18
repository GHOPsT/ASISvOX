import { useState, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ClassCard } from "./ClassCard";
import { AddClassModal } from "./AddClassModal";
import { AddStudentsModal } from "./AddStudentsModal";
import { NotificationsPanel } from "./NotificationsPanel";
import { useAuth } from "../contexts/AuthContext";
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

  // Load classes from localStorage
  useEffect(() => {
    const storedClasses = localStorage.getItem(`teacher_classes_${user?.id}`);
    if (storedClasses) {
      setClasses(JSON.parse(storedClasses));
    } else {
      // Initialize with default classes
      const defaultClasses = [
        {
          id: "1",
          name: "Matemáticas 10°A",
          subject: "Matemáticas",
          schedule: "Lun, Mié, Vie - 8:00 AM",
          studentCount: 32,
          averageGrade: 8.5,
          nextClass: "Hoy 8:00 AM",
          students: []
        },
        {
          id: "2",
          name: "Álgebra 11°B",
          subject: "Matemáticas",
          schedule: "Mar, Jue - 10:00 AM",
          studentCount: 28,
          averageGrade: 7.8,
          nextClass: "Mañana 10:00 AM",
          students: []
        },
        {
          id: "3",
          name: "Geometría 9°C",
          subject: "Matemáticas",
          schedule: "Lun, Mié, Vie - 2:00 PM",
          studentCount: 30,
          averageGrade: 8.1,
          nextClass: "Hoy 2:00 PM",
          students: []
        },
        {
          id: "4",
          name: "Cálculo 12°A",
          subject: "Matemáticas Avanzadas",
          schedule: "Mar, Jue, Sáb - 9:00 AM",
          studentCount: 25,
          averageGrade: 8.9,
          nextClass: "Mañana 9:00 AM",
          students: []
        }
      ];
      setClasses(defaultClasses);
      localStorage.setItem(`teacher_classes_${user?.id}`, JSON.stringify(defaultClasses));
    }
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

  const handleAddClass = (classData: any) => {
    const newClasses = [...classes, { ...classData, students: [] }];
    setClasses(newClasses);
    localStorage.setItem(`teacher_classes_${user?.id}`, JSON.stringify(newClasses));
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

      {/* Today's Schedule */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3>Horario de Hoy</h3>
            <Badge variant="secondary">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div>
                <p className="font-medium">Matemáticas 10°A</p>
                <p className="text-sm text-muted-foreground">8:00 AM - 9:30 AM</p>
              </div>
              <Badge>Próxima</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Geometría 9°C</p>
                <p className="text-sm text-muted-foreground">2:00 PM - 3:30 PM</p>
              </div>
              <Badge variant="outline">Más tarde</Badge>
            </div>
          </div>
        </div>
      </Card>

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
          {classes.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              onClick={() => onClassSelect(classData.id)}
              onAttendanceClick={() => onAttendanceSelect(classData.id)}
              onAddStudentsClick={() => handleOpenAddStudents(classData)}
            />
          ))}
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