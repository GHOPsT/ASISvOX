import { useState, useEffect } from "react";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

interface TeacherCalendarViewProps {
  onBack: () => void;
}

interface Teacher {
  id: string;
  name: string;
  schedule: {
    [day: string]: {
      time: string;
      subject: string;
      class: string;
      room?: string;
    }[];
  };
}

export function TeacherCalendarView({ onBack }: TeacherCalendarViewProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    loadTeachersWithSchedule();
  }, []);

  const loadTeachersWithSchedule = () => {
    // Load teachers from user management
    const storedUsers = JSON.parse(localStorage.getItem('asisVox_users') || '[]');
    const teacherUsers = storedUsers.filter((user: any) => user.role === 'teacher');
    
    // Load assignments
    const assignments = JSON.parse(localStorage.getItem('asisVox_teacher_assignments') || '[]');
    
    // Transform assignments to calendar format
    const teachersWithSchedule: Teacher[] = teacherUsers.map((teacher: any) => {
      const assignment = assignments.find((a: any) => a.teacherId === teacher.id);
      const schedule: { [day: string]: { time: string; subject: string; class: string; room?: string; }[] } = {};
      
      if (assignment) {
        assignment.classes.forEach((cls: any) => {
          cls.schedule.forEach((slot: any) => {
            if (!schedule[slot.day]) {
              schedule[slot.day] = [];
            }
            schedule[slot.day].push({
              time: `${slot.startTime}-${slot.endTime}`,
              subject: cls.subject,
              class: `${cls.grade} ${cls.section}`,
              room: cls.room
            });
          });
        });
      }
      
      return {
        id: teacher.id,
        name: teacher.name,
        schedule
      };
    });
    
    setTeachers(teachersWithSchedule);
  };

  // Keep mock data as fallback for demo purposes
  const mockTeachers: Teacher[] = [
    {
      id: "1",
      name: "Prof. María González",
      schedule: {
        "Lunes": [
          { time: "8:00-9:30", subject: "Matemáticas", class: "10°A", room: "Aula 101" },
          { time: "14:00-15:30", subject: "Geometría", class: "9°C", room: "Aula 102" }
        ],
        "Martes": [
          { time: "10:00-11:30", subject: "Álgebra", class: "11°B", room: "Aula 103" }
        ],
        "Miércoles": [
          { time: "8:00-9:30", subject: "Matemáticas", class: "10°A", room: "Aula 101" },
          { time: "14:00-15:30", subject: "Geometría", class: "9°C", room: "Aula 102" }
        ],
        "Jueves": [
          { time: "10:00-11:30", subject: "Álgebra", class: "11°B", room: "Aula 103" },
          { time: "9:00-10:30", subject: "Cálculo", class: "12°A", room: "Aula 104" }
        ],
        "Viernes": [
          { time: "8:00-9:30", subject: "Matemáticas", class: "10°A", room: "Aula 101" },
          { time: "14:00-15:30", subject: "Geometría", class: "9°C", room: "Aula 102" }
        ],
        "Sábado": [
          { time: "9:00-10:30", subject: "Cálculo", class: "12°A", room: "Aula 104" }
        ]
      }
    },
    {
      id: "2",
      name: "Prof. Carlos Ruiz",
      schedule: {
        "Lunes": [
          { time: "9:30-11:00", subject: "Física", class: "11°A", room: "Lab. Física" },
          { time: "15:30-17:00", subject: "Química", class: "10°B", room: "Lab. Química" }
        ],
        "Martes": [
          { time: "8:00-9:30", subject: "Física", class: "12°A", room: "Lab. Física" }
        ],
        "Miércoles": [
          { time: "9:30-11:00", subject: "Física", class: "11°A", room: "Lab. Física" }
        ],
        "Jueves": [
          { time: "8:00-9:30", subject: "Física", class: "12°A", room: "Lab. Física" },
          { time: "15:30-17:00", subject: "Química", class: "10°B", room: "Lab. Química" }
        ],
        "Viernes": [
          { time: "9:30-11:00", subject: "Física", class: "11°A", room: "Lab. Física" }
        ]
      }
    },
    {
      id: "3",
      name: "Prof. Ana López",
      schedule: {
        "Lunes": [
          { time: "11:00-12:30", subject: "Historia", class: "9°A", room: "Aula 201" }
        ],
        "Martes": [
          { time: "14:00-15:30", subject: "Geografía", class: "10°A", room: "Aula 202" },
          { time: "15:30-17:00", subject: "Historia", class: "11°C", room: "Aula 201" }
        ],
        "Miércoles": [
          { time: "11:00-12:30", subject: "Historia", class: "9°A", room: "Aula 201" }
        ],
        "Jueves": [
          { time: "14:00-15:30", subject: "Geografía", class: "10°A", room: "Aula 202" }
        ],
        "Viernes": [
          { time: "11:00-12:30", subject: "Historia", class: "9°A", room: "Aula 201" },
          { time: "15:30-17:00", subject: "Historia", class: "11°C", room: "Aula 201" }
        ]
      }
    }
  ];

  // Use real data if available, otherwise use mock data
  const displayTeachers = teachers.length > 0 ? teachers : mockTeachers;

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const timeSlots = [
    "8:00-9:30",
    "9:30-11:00", 
    "11:00-12:30",
    "14:00-15:30",
    "15:30-17:00"
  ];

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      "Matemáticas": "bg-blue-100 text-blue-700 border-blue-200",
      "Álgebra": "bg-blue-100 text-blue-700 border-blue-200",
      "Geometría": "bg-blue-100 text-blue-700 border-blue-200",
      "Cálculo": "bg-blue-100 text-blue-700 border-blue-200",
      "Física": "bg-green-100 text-green-700 border-green-200",
      "Química": "bg-purple-100 text-purple-700 border-purple-200",
      "Historia": "bg-orange-100 text-orange-700 border-orange-200",
      "Geografía": "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    return colors[subject] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const renderCalendar = () => {
    const selectedTeacherData = selectedTeacher === "all" ? null : displayTeachers.find(t => t.id === selectedTeacher);
    const relevantTeachers = selectedTeacher === "all" ? displayTeachers : selectedTeacherData ? [selectedTeacherData] : [];

    return (
      <div className="space-y-4">
        <h3>
          {selectedTeacher === "all" 
            ? "Vista General - Calendario Semanal" 
            : `Horario de ${selectedTeacherData?.name}`
          }
        </h3>
        
        {/* Calendar Grid */}
        <Card className="p-2 sm:p-4 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header with days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
              <div className="text-center p-1 sm:p-2 font-medium text-xs sm:text-sm bg-secondary rounded-lg">
                <Clock className="w-3 h-3 mx-auto mb-1" />
                Horario
              </div>
              {daysOfWeek.map(day => (
                <div key={day} className="text-center p-1 sm:p-2 font-medium text-xs sm:text-sm bg-primary/10 rounded-lg border">
                  {day.substring(0, 3)}
                  <div className="hidden sm:block text-xs text-muted-foreground mt-1">
                    {day.substring(3)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Time slots grid */}
            <div className="space-y-1 sm:space-y-2">
              {timeSlots.map(timeSlot => (
                <div key={timeSlot} className="grid grid-cols-7 gap-1 sm:gap-2">
                  {/* Time column */}
                  <div className="flex items-center justify-center p-1 sm:p-2 bg-muted/50 rounded-lg border">
                    <div className="text-xs font-medium text-center">
                      {timeSlot.split('-')[0]}
                      <div className="text-xs text-muted-foreground">
                        {timeSlot.split('-')[1]}
                      </div>
                    </div>
                  </div>
                  
                  {/* Day columns */}
                  {daysOfWeek.map(day => {
                    const classesInSlot = relevantTeachers.flatMap(teacher => 
                      teacher.schedule[day]?.filter(cls => cls.time === timeSlot).map(cls => ({
                        ...cls,
                        teacherName: teacher.name
                      })) || []
                    );
                    
                    return (
                      <div key={day} className="min-h-[50px] sm:min-h-[70px] border rounded-lg p-1 bg-background hover:bg-muted/20 transition-colors">
                        {classesInSlot.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                            <div className="text-center opacity-50">·</div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {classesInSlot.map((cls, index) => (
                              <div key={index} className={`p-1 sm:p-2 rounded text-xs border ${getSubjectColor(cls.subject)} hover:shadow-sm transition-shadow cursor-pointer`}>
                                <div className="font-medium truncate leading-tight">{cls.subject}</div>
                                <div className="truncate opacity-80 text-xs">{cls.class}</div>
                                {selectedTeacher === "all" && (
                                  <div className="truncate opacity-70 text-xs">
                                    {cls.teacherName.split(' ')[1] || cls.teacherName.split(' ')[0]}
                                  </div>
                                )}
                                {cls.room && (
                                  <div className="flex items-center gap-1 opacity-70 mt-1">
                                    <MapPin className="w-2 h-2" />
                                    <span className="text-xs truncate">{cls.room}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Summary Statistics */}
        <Card className="p-4">
          <h4 className="mb-3">Resumen de la Semana</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total de clases:</span>
                <span className="font-medium">
                  {relevantTeachers.reduce((total, teacher) => 
                    total + Object.values(teacher.schedule).flat().length, 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Días activos:</span>
                <span className="font-medium">
                  {daysOfWeek.filter(day => 
                    relevantTeachers.some(teacher => teacher.schedule[day]?.length > 0)
                  ).length}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profesores:</span>
                <span className="font-medium">{relevantTeachers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Aulas utilizadas:</span>
                <span className="font-medium">
                  {new Set(
                    relevantTeachers.flatMap(teacher => 
                      Object.values(teacher.schedule).flat().map(cls => cls.room).filter(Boolean)
                    )
                  ).size}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-foreground">Calendario de Horarios</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {displayTeachers.reduce((total, teacher) => 
                  total + Object.values(teacher.schedule).flat().length, 0
                )}
              </div>
              <div className="text-xs text-muted-foreground">Total Clases</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {displayTeachers.length}
              </div>
              <div className="text-xs text-muted-foreground">Profesores</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {new Set(
                  displayTeachers.flatMap(teacher => 
                    Object.values(teacher.schedule).flat().map(cls => cls.room).filter(Boolean)
                  )
                ).size}
              </div>
              <div className="text-xs text-muted-foreground">Aulas</div>
            </div>
          </Card>
        </div>
        {/* Teacher Selection */}
        <Card className="p-4">
          <div className="space-y-3">
            <h3>Seleccionar Profesor</h3>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar profesor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los profesores</SelectItem>
                {displayTeachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Legend */}
        <Card className="p-4">
          <h4 className="mb-3">Leyenda de Materias</h4>
          <div className="grid grid-cols-2 gap-2">
            {["Matemáticas", "Física", "Química", "Historia", "Geografía"].map(subject => (
              <div key={subject} className={`flex items-center gap-2 p-2 rounded-lg border ${getSubjectColor(subject)}`}>
                <div className="w-3 h-3 rounded-full bg-current"></div>
                <span className="text-sm">{subject}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Calendar */}
        {renderCalendar()}

        <div className="h-20"></div>
      </div>
    </div>
  );
}