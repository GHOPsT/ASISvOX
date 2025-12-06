import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { StudentCard } from "./StudentCard";
import { VoiceGrading } from "./VoiceGrading";
import { AssessmentSetup } from "./AssessmentSetup";
import { GradingInterface } from "./GradingInterface";
import { AddStudentsModal } from "./AddStudentsModal";
import { apiClient } from "../services/api";
import { tokenService } from "../services/tokenService";
import { 
  ArrowLeft, 
  Users, 
  Download, 
  Upload,
  Search,
  Filter,
  Save,
  FileText,
  UserPlus
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
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [classInfo, setClassInfo] = useState<any>({
    id: classId,
    name: "",
    subject: "",
    schedule: "",
    period: "",
    teacher: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load class data and students from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const token = tokenService.getToken();
        if (token) {
          apiClient.setToken(token);
        }

        // Get class info
        const classResponse = await apiClient.classes.getClassById(classId);
        if (classResponse.success && classResponse.data) {
          const cls = classResponse.data;
          setClassInfo({
            id: cls.id,
            name: cls.name,
            subject: cls.subject,
            schedule: cls.schedule || "Consultar",
            period: cls.period || "2024-1",
            teacher: cls.teacher?.name || "Prof. Sin asignar"
          });
        }

        // Get students in this class
        const studentsResponse = await apiClient.classes.getClassStudents(classId);
        if (studentsResponse.success && studentsResponse.data) {
          const formattedStudents = studentsResponse.data.map((student: any) => ({
            id: student.id,
            name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
            code: student.identification_number || student.id,
            grade: student.grade,
            attendance: student.attendance !== false
          }));
          setStudents(formattedStudents);
        }
      } catch (error) {
        console.error('Error loading class data:', error);
        toast.error('Error al cargar la clase');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [classId]);

  const filteredStudents = students.filter(student =>
    (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (student.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
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

  const handleAddStudents = async (newStudents: any[]) => {
    try {
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      // Primero crear los estudiantes si no existen
      const createStudentsResponse = await apiClient.students.createStudents(
        newStudents.map(s => ({
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
        classId,
        studentIds
      );

      if (!addToClassResponse.success) {
        throw new Error('Error al agregar estudiantes a la clase');
      }

      toast.success(`${newStudents.length} estudiantes agregados correctamente`);
      
      // Recargar estudiantes de la clase
      const studentsResponse = await apiClient.classes.getClassStudents(classId);
      if (studentsResponse.success && studentsResponse.data) {
        const formattedStudents = studentsResponse.data.map((student: any) => ({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          code: student.identification_number || student.id,
          grade: student.grade,
          attendance: student.attendance !== false
        }));
        setStudents(formattedStudents);
      }
    } catch (error: any) {
      console.error('Error adding students:', error);
      toast.error(error.message || "Error al agregar estudiantes");
    }
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

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <TabsContent value="students" className="h-full space-y-4 mt-0 p-4">
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
                  <Button 
                    size="icon"
                    onClick={() => setShowAddStudentsModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                >
                  <UserPlus className="h-4 w-4" />
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

            <TabsContent value="setup" className="h-full space-y-4 mt-0 p-4">
              <AssessmentSetup
                classId={classId}
                onAssessmentsChange={handleAssessmentsChange}
                selectedDate={new Date().toISOString().split('T')[0]}
              />
            </TabsContent>

            <TabsContent value="grades" className="h-full mt-0 p-0">
              <GradingInterface
                students={students}
                assessments={assessments}
                onGradesChange={handleGradesChange}
              />
            </TabsContent>

            <TabsContent value="voice" className="h-full space-y-4 mt-0 p-4">
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
          </div>
        </Tabs>
      </div>

      {/* Add Students Modal */}
      <AddStudentsModal
        isOpen={showAddStudentsModal}
        onClose={() => setShowAddStudentsModal(false)}
        onSave={handleAddStudents}
        classId={classId}
        className={classInfo.name}
      />
    </div>
  );
}