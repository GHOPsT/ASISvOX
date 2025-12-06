import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  User, 
  Save, 
  RotateCcw,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../services/api";
import { tokenService } from "../services/tokenService";

interface Assessment {
  id: string;
  name: string;
  type?: string;
  weight?: number;
  maxScore?: number;
  max_score?: number;
  icon?: any;
  color?: string;
}

interface StudentGrade {
  studentId: string;
  student_id?: string;
  assessmentId: string;
  assessment_id?: string;
  score: number;
  id?: string;
}

interface Student {
  id: string;
  name: string;
  code?: string;
}

interface GradingInterfaceProps {
  classId?: string;
  students?: Student[];
  assessments?: Assessment[];
  onGradesChange?: (grades: StudentGrade[]) => void;
}

export function GradingInterface({ classId, students: initialStudents = [], assessments: initialAssessments = [], onGradesChange }: GradingInterfaceProps) {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    if (classId) {
      loadGradingData();
    } else {
      setIsLoading(false);
    }
  }, [classId]);

  const loadGradingData = async () => {
    try {
      setIsLoading(true);
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      // Cargar estudiantes de la clase
      const classResponse = await apiClient.classes.getClassById(classId!);
      if (classResponse?.data?.students) {
        setStudents(classResponse.data.students.map((s: any) => ({
          id: s.id,
          name: s.name,
          code: s.code
        })));
      }

      // Cargar evaluaciones de la clase
      const assessmentsResponse = await apiClient.assessments.getAssessments({ classId });
      const assessmentsData = assessmentsResponse?.data || [];
      setAssessments(assessmentsData);
      if (assessmentsData && assessmentsData.length > 0) {
        setSelectedAssessment(assessmentsData[0].id);
      }

      // Cargar calificaciones
      const gradesResponse = await apiClient.grading.getGrades({ classId });
      const gradesData = gradesResponse?.data || [];
      setGrades(gradesData.map((g: any) => ({
        studentId: g.student_id || g.studentId,
        assessmentId: g.assessment_id || g.assessmentId,
        score: g.score,
        id: g.id
      })));

      // Si hay calificaciones guardadas, activar modo lectura
      if (gradesData && gradesData.length > 0) {
        setIsReadOnly(true);
      }
    } catch (error) {
      console.error('Error loading grading data:', error);
      toast.error('Error al cargar datos de calificación');
    } finally {
      setIsLoading(false);
    }
  };

  const updateGrade = async (studentId: string, assessmentId: string, score: number) => {
    try {
      const existing = grades.find(g => 
        g.studentId === studentId && g.assessmentId === assessmentId
      );

      if (existing?.id) {
        // Actualizar calificación existente - usar updateGrade de grading API
        await apiClient.grading.updateGrade(existing.id, { score });
      } else {
        // Crear nueva calificación - usar recordGrade de grading API
        await apiClient.grading.recordGrade({
          studentId: studentId,
          assessmentId: assessmentId,
          score: score,
          method: 'manual'
        });
      }

      // Actualizar estado local
      setGrades(prev => {
        const existingIndex = prev.findIndex(g => 
          g.studentId === studentId && g.assessmentId === assessmentId
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], score };
          return updated;
        } else {
          return [...prev, { studentId, assessmentId, score }];
        }
      });

      if (onGradesChange) {
        onGradesChange(grades);
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      toast.error('Error al guardar calificación');
    }
  };

  const getStudentGrade = (studentId: string, assessmentId: string): number | undefined => {
    const grade = grades.find(g => 
      (g.studentId === studentId || g.student_id === studentId) && 
      (g.assessmentId === assessmentId || g.assessment_id === assessmentId)
    );
    return grade?.score;
  };

  const calculateFinalGrade = (studentId: string): number => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    assessments.forEach(assessment => {
      const grade = getStudentGrade(studentId, assessment.id);
      if (grade !== undefined && assessment.maxScore && assessment.weight) {
        const normalizedScore = (grade / assessment.maxScore) * 20; // Normalizar a escala de 20
        totalWeightedScore += normalizedScore * (assessment.weight / 100);
        totalWeight += assessment.weight / 100;
      }
    });

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  };

  const getGradeStatus = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return { color: "text-green-600", label: "Excelente" };
    if (percentage >= 70) return { color: "text-blue-600", label: "Bueno" };
    if (percentage >= 60) return { color: "text-yellow-600", label: "Regular" };
    return { color: "text-red-600", label: "Insuficiente" };
  };

  const getCurrentAssessment = () => {
    return assessments.find(a => a.id === selectedAssessment);
  };

  const getCompletionPercentage = (assessmentId: string) => {
    const graded = students.filter(s => getStudentGrade(s.id, assessmentId) !== undefined).length;
    return (graded / students.length) * 100;
  };

  const saveGrades = async () => {
    try {
      setIsSaving(true);
      // Las calificaciones ya se guardan al hacer updateGrade
      toast.success("Calificaciones guardadas exitosamente");
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Error al guardar calificaciones');
    } finally {
      setIsSaving(false);
    }
  };

  const clearGrades = (assessmentId: string) => {
    setGrades(prev => prev.filter(g => g.assessmentId !== assessmentId));
    toast.success("Calificaciones eliminadas");
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleTabChange = (value: string) => {
    // Si hace clic en la pestaña que ya está activa, contraer (vaciar la selección)
    if (selectedAssessment === value) {
      setSelectedAssessment("");
    } else {
      setSelectedAssessment(value);
    }
  };

  if (assessments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">
          Configura las evaluaciones del día antes de asignar calificaciones
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4 px-4 md:px-0">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando datos de calificación...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Assessment Tabs - Responsive */}
          <Tabs value={selectedAssessment} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full gap-1 bg-slate-100 p-1 rounded-lg" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))` }}>
              {assessments.map((assessment) => {
                const Icon = assessment.icon;
                const completion = getCompletionPercentage(assessment.id);
                
                return (
                  <TabsTrigger 
                    key={assessment.id} 
                    value={assessment.id} 
                    className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md transition-all"
                  >
                    <div className="flex items-center gap-1 justify-center">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span className="text-xs font-medium line-clamp-1">{assessment.name}</span>
                    </div>
                    <div className="text-xs font-semibold text-blue-600">{completion.toFixed(0)}%</div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Assessment Content */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Main Grading Area - Left/Top */}
              <div className="lg:col-span-2 flex flex-col space-y-4 min-h-0">
                {assessments.map((assessment) => {
                  if (assessment.id !== selectedAssessment) return null;
                  
                  const Icon = assessment.icon;
                  const completion = getCompletionPercentage(assessment.id);
                  
                  return (
                    <div key={assessment.id} className="flex flex-col space-y-4 h-full">
                      {/* Assessment Header */}
                      <Card className={`p-6 border-0 shadow-md ${assessment.color} rounded-xl`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            {Icon && <Icon className="h-6 w-6" />}
                            <div>
                              <h3 className="font-bold text-lg">{assessment.name}</h3>
                              <p className="text-sm opacity-80">
                                Peso: <span className="font-semibold">{assessment.weight}%</span> • Máximo: <span className="font-semibold">{assessment.maxScore} pts</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm font-semibold">
                            <span>Progreso General</span>
                            <span className="text-lg">{Math.round(completion)}%</span>
                          </div>
                          <Progress value={completion} className="h-3 rounded-full" />
                        </div>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex gap-3 flex-col sm:flex-row">
                        <Button 
                          onClick={saveGrades} 
                          size="lg"
                          className="flex-1 h-11 text-base gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                          disabled={isSaving || isReadOnly}
                        >
                          <Save className="h-5 w-5" />
                          {isSaving ? 'Guardando...' : 'Guardar Calificaciones'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={() => clearGrades(assessment.id)}
                          className="h-11 text-base gap-2 border-2"
                          disabled={isReadOnly}
                        >
                          <RotateCcw className="h-5 w-5" />
                          Limpiar
                        </Button>
                      </div>

                      {/* Students Grading List */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {students.map((student) => {
                          const currentGrade = getStudentGrade(student.id, assessment.id);
                          const percentage = currentGrade && assessment.maxScore ? (currentGrade / assessment.maxScore) * 100 : 0;
                          
                          return (
                            <Card key={student.id} className="p-4 border border-border/50 shadow-none hover:shadow-lg transition-all duration-200 rounded-lg">
                              <div className="space-y-4">
                                {/* Student Info */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/20">
                                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-bold">
                                        {getInitials(student.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-base truncate">{student.name}</p>
                                      <p className="text-sm text-muted-foreground">{student.code}</p>
                                    </div>
                                  </div>

                                  {currentGrade !== undefined && (
                                    <Badge 
                                      className={`text-sm font-bold px-3 py-1 ml-2 flex-shrink-0 ${
                                        percentage >= 60 ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                        percentage >= 40 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                        'bg-red-100 text-red-800 hover:bg-red-100'
                                      }`}
                                    >
                                      {percentage.toFixed(0)}%
                                    </Badge>
                                  )}
                                </div>

                                {/* Grade Input Section */}
                                <div className="border-t border-border/30 pt-4">
                                  <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Calificación:</span>
                                      {isReadOnly ? (
                                        <div className="h-11 flex items-center px-4 bg-gray-100 rounded-md border border-gray-200 text-lg font-bold text-gray-700 flex-1 sm:flex-none sm:w-28">
                                          {currentGrade || "—"}
                                        </div>
                                      ) : (
                                        <Input
                                          type="number"
                                          min="0"
                                          max={assessment.maxScore || 100}
                                          step="0.1"
                                          placeholder="0.0"
                                          value={currentGrade || ""}
                                          onChange={(e) => {
                                            const score = parseFloat(e.target.value);
                                            const maxScore = assessment.maxScore || 100;
                                            if (!isNaN(score) && score >= 0 && score <= maxScore) {
                                              updateGrade(student.id, assessment.id, score);
                                            } else if (e.target.value === "") {
                                              setGrades(prev => prev.filter(g => !(g.studentId === student.id && g.assessmentId === assessment.id)));
                                            }
                                          }}
                                          className="h-11 text-lg font-bold text-center flex-1 sm:flex-none sm:w-28"
                                        />
                                      )}
                                      <span className="text-lg font-bold text-muted-foreground whitespace-nowrap">
                                        / {assessment.maxScore || 100}
                                      </span>
                                    </div>

                                    {currentGrade !== undefined && (
                                      <div className="w-full sm:w-32">
                                        <Progress 
                                          value={percentage} 
                                          className="h-2"
                                        />
                                        <p className="text-xs text-center text-muted-foreground mt-1 font-medium">
                                          {percentage.toFixed(1)}%
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Sidebar - Right/Bottom */}
              <div className="lg:col-span-1 flex flex-col space-y-4">
                {assessments.map((assessment) => {
                  if (assessment.id !== selectedAssessment) return null;
                  
                  const calificados = students.filter(s => getStudentGrade(s.id, assessment.id) !== undefined).length;
                  const pendientes = students.length - calificados;
                  const promedio = grades
                    .filter(g => g.assessmentId === assessment.id && g.score > 0)
                    .length > 0
                    ? (grades
                        .filter(g => g.assessmentId === assessment.id)
                        .reduce((sum, g) => sum + (g.score / (assessment.maxScore || 100)) * 100, 0) /
                      grades.filter(g => g.assessmentId === assessment.id).length
                    ).toFixed(1)
                    : 0;
                  const aprobados = grades.filter(g => g.assessmentId === assessment.id && (g.score / (assessment.maxScore || 100)) >= 0.6).length;
                  
                  return (
                    <div key={assessment.id} className="space-y-4">
                      {/* Resumen Card */}
                      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-md rounded-xl sticky top-4">
                        <h4 className="text-lg font-bold text-slate-800 mb-4">Resumen</h4>
                        <div className="space-y-3">
                          {/* Calificados */}
                          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                            <p className="text-2xl font-bold text-blue-600 text-center">{calificados}</p>
                            <p className="text-xs text-slate-600 text-center mt-1 font-medium">Calificados</p>
                          </div>

                          {/* Pendientes */}
                          <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                            <p className="text-2xl font-bold text-orange-600 text-center">{pendientes}</p>
                            <p className="text-xs text-slate-600 text-center mt-1 font-medium">Pendientes</p>
                          </div>

                          {/* Promedio */}
                          <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                            <p className="text-2xl font-bold text-purple-600 text-center">{promedio}%</p>
                            <p className="text-xs text-slate-600 text-center mt-1 font-medium">Promedio</p>
                          </div>

                          {/* Aprobados */}
                          <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                            <p className="text-2xl font-bold text-green-600 text-center">{aprobados}</p>
                            <p className="text-xs text-slate-600 text-center mt-1 font-medium">Aprobados</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </Tabs>
        </>
      )}
    </div>
  );
}