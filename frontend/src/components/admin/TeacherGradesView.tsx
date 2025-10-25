import { useState } from "react";
import { ArrowLeft, Search, Users, BookOpen, Eye } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface TeacherGradesViewProps {
  onBack: () => void;
}

interface Teacher {
  id: string;
  name: string;
  classes: ClassInfo[];
}

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  averageGrade: number;
  lastGradeUpdate: string;
  students: Student[];
}

interface Student {
  id: string;
  name: string;
  grades: {
    [evaluationType: string]: {
      score: number;
      weight: number;
      date: string;
    }[];
  };
  finalGrade: number;
  attendance: number;
}

export function TeacherGradesView({ onBack }: TeacherGradesViewProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const teachers: Teacher[] = [
    {
      id: "1",
      name: "Prof. María González",
      classes: [
        {
          id: "1",
          name: "Matemáticas 10°A",
          subject: "Matemáticas",
          studentCount: 32,
          averageGrade: 16.7,
          lastGradeUpdate: "Hace 2 horas",
          students: [
            {
              id: "1",
              name: "Ana García",
              grades: {
                "Práctica Calificada": [
                  { score: 18, weight: 30, date: "2024-01-15" },
                  { score: 16, weight: 30, date: "2024-02-01" }
                ],
                "Examen Parcial": [{ score: 17, weight: 40, date: "2024-01-30" }],
                "Test de Entrada": [{ score: 15, weight: 15, date: "2024-01-08" }],
                "Participación": [{ score: 19, weight: 15, date: "2024-02-05" }]
              },
              finalGrade: 17.2,
              attendance: 95
            },
            {
              id: "2",
              name: "Carlos López",
              grades: {
                "Práctica Calificada": [
                  { score: 14, weight: 30, date: "2024-01-15" },
                  { score: 15, weight: 30, date: "2024-02-01" }
                ],
                "Examen Parcial": [{ score: 13, weight: 40, date: "2024-01-30" }],
                "Test de Entrada": [{ score: 12, weight: 15, date: "2024-01-08" }],
                "Participación": [{ score: 16, weight: 15, date: "2024-02-05" }]
              },
              finalGrade: 14.1,
              attendance: 88
            },
            {
              id: "3",
              name: "María Rodriguez",
              grades: {
                "Práctica Calificada": [
                  { score: 20, weight: 30, date: "2024-01-15" },
                  { score: 19, weight: 30, date: "2024-02-01" }
                ],
                "Examen Parcial": [{ score: 18, weight: 40, date: "2024-01-30" }],
                "Test de Entrada": [{ score: 17, weight: 15, date: "2024-01-08" }],
                "Participación": [{ score: 20, weight: 15, date: "2024-02-05" }]
              },
              finalGrade: 18.8,
              attendance: 100
            }
          ]
        },
        {
          id: "2",
          name: "Álgebra 11°B",
          subject: "Matemáticas",
          studentCount: 28,
          averageGrade: 15.3,
          lastGradeUpdate: "Hace 1 día",
          students: [
            {
              id: "4",
              name: "Pedro Martínez",
              grades: {
                "Práctica Calificada": [{ score: 16, weight: 40, date: "2024-01-20" }],
                "Examen Parcial": [{ score: 14, weight: 60, date: "2024-02-03" }]
              },
              finalGrade: 14.8,
              attendance: 92
            },
            {
              id: "5",
              name: "Laura Fernández",
              grades: {
                "Práctica Calificada": [{ score: 18, weight: 40, date: "2024-01-20" }],
                "Examen Parcial": [{ score: 17, weight: 60, date: "2024-02-03" }]
              },
              finalGrade: 17.4,
              attendance: 96
            }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "Prof. Carlos Ruiz",
      classes: [
        {
          id: "3",
          name: "Física 11°A",
          subject: "Física",
          studentCount: 25,
          averageGrade: 14.8,
          lastGradeUpdate: "Hace 3 horas",
          students: [
            {
              id: "6",
              name: "Roberto Silva",
              grades: {
                "Laboratorio": [{ score: 16, weight: 30, date: "2024-01-25" }],
                "Examen Teórico": [{ score: 15, weight: 50, date: "2024-02-01" }],
                "Proyecto": [{ score: 17, weight: 20, date: "2024-02-08" }]
              },
              finalGrade: 15.6,
              attendance: 90
            }
          ]
        }
      ]
    }
  ];

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.classes.some(cls => 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getGradeStatus = (grade: number) => {
    if (grade >= 17) return { color: "bg-green-100 text-green-700", status: "Excelente" };
    if (grade >= 14) return { color: "bg-blue-100 text-blue-700", status: "Bueno" };
    if (grade >= 11) return { color: "bg-yellow-100 text-yellow-700", status: "Regular" };
    return { color: "bg-red-100 text-red-700", status: "Deficiente" };
  };

  // Vista de estudiantes de una clase específica
  if (selectedClass) {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => setSelectedClass(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-foreground">{selectedClass.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedTeacher?.name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Class Stats */}
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
                <p className="text-2xl font-medium">{selectedClass.studentCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio</p>
                <p className="text-2xl font-medium">{selectedClass.averageGrade.toFixed(1)}/20</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última Act.</p>
                <p className="text-sm">{selectedClass.lastGradeUpdate}</p>
              </div>
            </div>
          </Card>

          {/* Students */}
          <div className="space-y-3">
            <h3>Lista de Estudiantes</h3>
            {selectedClass.students.map((student) => {
              const gradeStatus = getGradeStatus(student.finalGrade);
              return (
                <Card key={student.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4>{student.name}</h4>
                      <Badge className={gradeStatus.color}>
                        {student.finalGrade.toFixed(1)}/20
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Asistencia</p>
                        <p className="font-medium">{student.attendance}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <p className="font-medium">{gradeStatus.status}</p>
                      </div>
                    </div>

                    <Tabs defaultValue="grades" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="grades">Notas por Tipo</TabsTrigger>
                        <TabsTrigger value="timeline">Cronología</TabsTrigger>
                      </TabsList>

                      <TabsContent value="grades" className="space-y-3">
                        {Object.entries(student.grades).map(([type, gradeList]) => (
                          <div key={type} className="space-y-2">
                            <h5>{type}</h5>
                            <div className="space-y-1">
                              {gradeList.map((grade, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <span className="text-sm">Nota {index + 1}</span>
                                  <div className="text-right">
                                    <p className="font-medium">{grade.score}/20</p>
                                    <p className="text-xs text-muted-foreground">Peso: {grade.weight}%</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="timeline" className="space-y-2">
                        {Object.entries(student.grades)
                          .flatMap(([type, gradeList]) =>
                            gradeList.map(grade => ({ ...grade, type, date: new Date(grade.date) }))
                          )
                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                          .map((grade, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="font-medium">{grade.type}</p>
                                <p className="text-sm text-muted-foreground">
                                  {grade.date.toLocaleDateString('es-ES')}
                                </p>
                              </div>
                              <Badge variant="outline">{grade.score}/20</Badge>
                            </div>
                          ))}
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="h-20"></div>
        </div>
      </div>
    );
  }

  // Vista de clases de un profesor
  if (selectedTeacher) {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTeacher(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-foreground">Clases de {selectedTeacher.name}</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-3">
            {selectedTeacher.classes.map((classInfo) => {
              const gradeStatus = getGradeStatus(classInfo.averageGrade);
              return (
                <Card key={classInfo.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3>{classInfo.name}</h3>
                        <p className="text-sm text-muted-foreground">{classInfo.subject}</p>
                      </div>
                      <Badge className={gradeStatus.color}>
                        Promedio: {classInfo.averageGrade.toFixed(1)}/20
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Estudiantes</p>
                        <p className="font-medium">{classInfo.studentCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Última Actualización</p>
                        <p className="text-sm">{classInfo.lastGradeUpdate}</p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedClass(classInfo)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Ver Estudiantes y Notas
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="h-20"></div>
        </div>
      </div>
    );
  }

  // Vista principal de profesores
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-foreground">Supervisión de Notas</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar profesor o clase..."
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
                  <h3>{teacher.name}</h3>
                  <Badge variant="outline">
                    {teacher.classes.length} {teacher.classes.length === 1 ? 'clase' : 'clases'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {teacher.classes.map((classInfo) => {
                    const gradeStatus = getGradeStatus(classInfo.averageGrade);
                    return (
                      <div key={classInfo.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div>
                          <p className="font-medium">{classInfo.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {classInfo.studentCount} estudiantes • {classInfo.lastGradeUpdate}
                          </p>
                        </div>
                        <Badge className={gradeStatus.color}>
                          {classInfo.averageGrade.toFixed(1)}/20
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedTeacher(teacher)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Clases y Notas
                </Button>
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