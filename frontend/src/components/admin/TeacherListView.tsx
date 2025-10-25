import { useState } from "react";
import { ArrowLeft, Search, Calendar, Eye, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../../components/ui/input";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  totalClasses: number;
  totalStudents: number;
  status: "active" | "inactive";
  lastActivity: string;
  schedule: {
    [day: string]: {
      time: string;
      subject: string;
      class: string;
    }[];
  };
}

interface TeacherListViewProps {
  onBack: () => void;
}

export function TeacherListView({ onBack }: TeacherListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Mock data de profesores
  const teachers: Teacher[] = [
    {
      id: "1",
      name: "Prof. María González",
      email: "maria.gonzalez@asisVox.com",
      subjects: ["Matemáticas", "Álgebra"],
      totalClasses: 4,
      totalStudents: 120,
      status: "active",
      lastActivity: "Hace 15 minutos",
      schedule: {
        "Lunes": [
          { time: "8:00-9:30", subject: "Matemáticas", class: "10°A" },
          { time: "14:00-15:30", subject: "Geometría", class: "9°C" }
        ],
        "Martes": [
          { time: "10:00-11:30", subject: "Álgebra", class: "11°B" }
        ],
        "Miércoles": [
          { time: "8:00-9:30", subject: "Matemáticas", class: "10°A" },
          { time: "14:00-15:30", subject: "Geometría", class: "9°C" }
        ],
        "Jueves": [
          { time: "10:00-11:30", subject: "Álgebra", class: "11°B" },
          { time: "9:00-10:30", subject: "Cálculo", class: "12°A" }
        ],
        "Viernes": [
          { time: "8:00-9:30", subject: "Matemáticas", class: "10°A" },
          { time: "14:00-15:30", subject: "Geometría", class: "9°C" }
        ],
        "Sábado": [
          { time: "9:00-10:30", subject: "Cálculo", class: "12°A" }
        ]
      }
    },
    {
      id: "2",
      name: "Prof. Carlos Ruiz",
      email: "carlos.ruiz@asisVox.com",
      subjects: ["Física", "Química"],
      totalClasses: 3,
      totalStudents: 85,
      status: "active",
      lastActivity: "Hace 32 minutos",
      schedule: {
        "Lunes": [
          { time: "9:30-11:00", subject: "Física", class: "11°A" },
          { time: "15:30-17:00", subject: "Química", class: "10°B" }
        ],
        "Martes": [
          { time: "8:00-9:30", subject: "Física", class: "12°A" }
        ],
        "Miércoles": [
          { time: "9:30-11:00", subject: "Física", class: "11°A" }
        ],
        "Jueves": [
          { time: "8:00-9:30", subject: "Física", class: "12°A" },
          { time: "15:30-17:00", subject: "Química", class: "10°B" }
        ],
        "Viernes": [
          { time: "9:30-11:00", subject: "Física", class: "11°A" }
        ]
      }
    },
    {
      id: "3",
      name: "Prof. Ana López",
      email: "ana.lopez@asisVox.com",
      subjects: ["Historia", "Geografía"],
      totalClasses: 3,
      totalStudents: 90,
      status: "active",
      lastActivity: "Hace 1 hora",
      schedule: {
        "Lunes": [
          { time: "11:00-12:30", subject: "Historia", class: "9°A" }
        ],
        "Martes": [
          { time: "14:00-15:30", subject: "Geografía", class: "10°A" },
          { time: "15:30-17:00", subject: "Historia", class: "11°C" }
        ],
        "Miércoles": [
          { time: "11:00-12:30", subject: "Historia", class: "9°A" }
        ],
        "Jueves": [
          { time: "14:00-15:30", subject: "Geografía", class: "10°A" }
        ],
        "Viernes": [
          { time: "11:00-12:30", subject: "Historia", class: "9°A" },
          { time: "15:30-17:00", subject: "Historia", class: "11°C" }
        ]
      }
    }
  ];

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects.some(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getTotalWeeklyHours = (teacher: Teacher) => {
    return Object.values(teacher.schedule).reduce((total, daySchedule) => {
      return total + daySchedule.length * 1.5; // Asumiendo 1.5 horas por clase
    }, 0);
  };

  if (selectedTeacher) {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTeacher(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-foreground">Horario de {selectedTeacher.name}</h2>
        </div>

        {/* Teacher Schedule */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Teacher Info */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3>{selectedTeacher.name}</h3>
                <Badge className="bg-green-100 text-green-700">
                  {selectedTeacher.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clases Asignadas</p>
                  <p className="font-medium">{selectedTeacher.totalClasses}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horas Semanales</p>
                  <p className="font-medium">{getTotalWeeklyHours(selectedTeacher)}h</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Materias</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTeacher.subjects.map((subject) => (
                    <Badge key={subject} variant="outline">{subject}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Weekly Schedule */}
          <div className="space-y-3">
            <h3>Distribución Semanal</h3>
            {Object.entries(selectedTeacher.schedule).map(([day, classes]) => (
              <Card key={day} className="p-4">
                <h4 className="mb-3">{day}</h4>
                {classes.length > 0 ? (
                  <div className="space-y-2">
                    {classes.map((classInfo, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                        <div>
                          <p className="font-medium">{classInfo.subject} - {classInfo.class}</p>
                          <p className="text-sm text-muted-foreground">{classInfo.time}</p>
                        </div>
                        <Badge variant="outline">1.5h</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sin clases programadas</p>
                )}
              </Card>
            ))}
          </div>

          <div className="h-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-foreground">Lista de Profesores</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar profesor o materia..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Teachers List */}
        <div className="space-y-3">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3>{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                  <Badge className={teacher.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {teacher.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Clases</p>
                    <p className="font-medium">{teacher.totalClasses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estudiantes</p>
                    <p className="font-medium">{teacher.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horas/Semana</p>
                    <p className="font-medium">{getTotalWeeklyHours(teacher)}h</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Materias</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject) => (
                      <Badge key={subject} variant="outline">{subject}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedTeacher(teacher)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Horario
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Ver Estudiantes
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Última actividad: {teacher.lastActivity}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No se encontraron profesores que coincidan con la búsqueda.</p>
          </Card>
        )}

        <div className="h-20"></div>
      </div>
    </div>
  );
}