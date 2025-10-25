import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { StudentCard } from "./StudentCard";
import { VoiceGrading } from "./VoiceGrading";
import { AssessmentSetup } from "./AssessmentSetup";
import { GradingInterface } from "./GradingInterface";
import { 
  ArrowLeft, 
  Users, 
  Download, 
  Upload,
  Search,
  Filter,
  Save,
  FileText
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  code: string;
  grade?: number;
  attendance: boolean;
}

interface Assessment {
  id: string;
  name: string;
  type: string;
  weight: number;
  maxScore: number;
  icon: any;
  color: string;
}

interface StudentGrade {
  studentId: string;
  assessmentId: string;
  score: number;
}

interface ClassDetailProps {
  classId: string;
  onBack: () => void;
}

export function ClassDetail({ classId, onBack }: ClassDetailProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);

  // Datos mock de la clase
  const classInfo = {
    id: classId,
    name: "Matemáticas 10°A",
    subject: "Matemáticas",
    schedule: "Lun, Mié, Vie - 8:00 AM",
    period: "2024-1",
    teacher: "Prof. María González"
  };

  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Juan Pérez García", code: "2024001", grade: 8.5, attendance: true },
    { id: "2", name: "María González López", code: "2024002", grade: 9.2, attendance: true },
    { id: "3", name: "Carlos Rodríguez Martín", code: "2024003", grade: 7.8, attendance: false },
    { id: "4", name: "Ana Fernández Silva", code: "2024004", grade: 8.9, attendance: true },
    { id: "5", name: "Luis Hernández Ruiz", code: "2024005", grade: 6.5, attendance: true },
    { id: "6", name: "Sofia Morales Castro", code: "2024006", grade: 9.5, attendance: true },
    { id: "7", name: "Diego Vargas Mendoza", code: "2024007", grade: 7.2, attendance: false },
    { id: "8", name: "Isabella Torres Jiménez", code: "2024008", grade: 8.7, attendance: true },
    { id: "9", name: "Andrés Ramírez Ortega", code: "2024009", grade: 8.1, attendance: true },
    { id: "10", name: "Valentina Cruz Herrera", code: "2024010", grade: 9.8, attendance: true }
  ]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGradeUpdate = (studentId: string, grade: number) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, grade } : student
      )
    );
  };

  const handleAssessmentsChange = (newAssessments: Assessment[]) => {
    setAssessments(newAssessments);
    if (newAssessments.length > 0) {
      setActiveTab("grades");
    }
  };

  const handleGradesChange = (newGrades: StudentGrade[]) => {
    setGrades(newGrades);
  };

  const handleSaveGrades = () => {
    // Simular guardado
    toast.success("Calificaciones guardadas exitosamente");
  };

  const handleExportGrades = () => {
    // Simular exportación
    toast.success("Reporte de notas exportado");
  };

  const getClassStats = () => {
    const gradesWithValues = students.filter(s => s.grade !== undefined);
    const averageGrade = gradesWithValues.length > 0 
      ? gradesWithValues.reduce((sum, s) => sum + (s.grade || 0), 0) / gradesWithValues.length
      : 0;
    
    const passedStudents = gradesWithValues.filter(s => (s.grade || 0) >= 6).length;
    const attendanceCount = students.filter(s => s.attendance).length;

    return {
      totalStudents: students.length,
      averageGrade: averageGrade.toFixed(1),
      passedStudents,
      attendanceRate: ((attendanceCount / students.length) * 100).toFixed(0)
    };
  };

  const stats = getClassStats();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1>{classInfo.name}</h1>
            <p className="text-sm text-muted-foreground">{classInfo.subject} • {classInfo.schedule}</p>
          </div>
        </div>

        {/* Class Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-lg font-semibold">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Estudiantes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{stats.averageGrade}</p>
            <p className="text-xs text-muted-foreground">Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{stats.passedStudents}</p>
            <p className="text-xs text-muted-foreground">Aprobados</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{stats.attendanceRate}%</p>
            <p className="text-xs text-muted-foreground">Asistencia</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="students" className="flex-1">Estudiantes</TabsTrigger>
            <TabsTrigger value="setup" className="flex-1">Configurar</TabsTrigger>
            <TabsTrigger value="grades" className="flex-1" disabled={assessments.length === 0}>
              Calificaciones
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex-1" disabled={assessments.length === 0}>
              Voz
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden p-4">
            <TabsContent value="students" className="h-full space-y-4 mt-0">
              {/* Search and Actions */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => toast.success("Lista de estudiantes exportada")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              {/* Students Summary */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">{students.filter(s => s.attendance).length}</p>
                    <p className="text-xs text-muted-foreground">Presentes</p>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-red-600">{students.filter(s => !s.attendance).length}</p>
                    <p className="text-xs text-muted-foreground">Ausentes</p>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{stats.averageGrade}</p>
                    <p className="text-xs text-muted-foreground">Promedio</p>
                  </div>
                </Card>
              </div>

              {/* Students List */}
              <div className="space-y-3 overflow-y-auto max-h-80">
                {filteredStudents.map((student, index) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Código: {student.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={student.attendance ? "default" : "destructive"}>
                            {student.attendance ? "Presente" : "Ausente"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={
                              (student.grade || 0) >= 8 ? "bg-green-50 text-green-700 border-green-200" :
                              (student.grade || 0) >= 6 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              (student.grade || 0) < 6 && student.grade ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {student.grade ? student.grade.toFixed(1) : "Sin nota"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredStudents.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No se encontraron estudiantes que coincidan con la búsqueda.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="setup" className="h-full space-y-4 mt-0">
              <AssessmentSetup
                classId={classId}
                onAssessmentsChange={handleAssessmentsChange}
                selectedDate={new Date().toISOString().split('T')[0]}
              />
            </TabsContent>

            <TabsContent value="grades" className="h-full mt-0">
              <GradingInterface
                students={students}
                assessments={assessments}
                onGradesChange={handleGradesChange}
              />
            </TabsContent>

            <TabsContent value="voice" className="h-full space-y-4 mt-0">
              <VoiceGrading
                students={students}
                onGradeUpdate={handleGradeUpdate}
              />
              
              {/* Recent Voice Commands */}
              <Card className="p-4">
                <h3 className="mb-3">Estudiantes con notas recientes</h3>
                <div className="space-y-2">
                  {students
                    .filter(s => s.grade !== undefined)
                    .slice(0, 5)
                    .map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <span className="text-sm">{student.name}</span>
                        <Badge variant="secondary">{student.grade}</Badge>
                      </div>
                    ))}
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}