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
    <div className="h-full flex flex-col space-y-4">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando datos de calificación...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Assessment Tabs */}
      <Tabs value={selectedAssessment} onValueChange={setSelectedAssessment} className="h-full flex flex-col">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${assessments.length || 1}, 1fr)` }}>
          {assessments.map((assessment) => {
            const Icon = assessment.icon;
            const completion = getCompletionPercentage(assessment.id);
            
            return (
              <TabsTrigger key={assessment.id} value={assessment.id} className="flex flex-col gap-1 p-2">
                <div className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  <span className="text-xs truncate">{assessment.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">{completion.toFixed(0)}%</div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {assessments.map((assessment) => {
            const Icon = assessment.icon;
            const completion = getCompletionPercentage(assessment.id);
            
            return (
              <TabsContent key={assessment.id} value={assessment.id} className="h-full flex flex-col space-y-4 mt-0">
              {/* Assessment Header */}
              <Card className={`p-3 ${assessment.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <div>
                      <h4 className="text-sm font-medium">{assessment.name}</h4>
                      <p className="text-xs opacity-80">
                        Peso: {assessment.weight}% • Máximo: {assessment.maxScore} pts
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progreso</span>
                    <span>{Math.round(completion)}%</span>
                  </div>
                  <Progress value={completion} className="h-1.5" />
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={saveGrades} size="sm" className="flex-1 gap-2 h-8">
                  <Save className="h-3 w-3" />
                  Guardar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => clearGrades(assessment.id)}
                  className="gap-2 h-8"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpiar
                </Button>
              </div>

              {/* Students Grading */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {students.map((student) => {
                  const currentGrade = getStudentGrade(student.id, assessment.id);
                  const finalGrade = calculateFinalGrade(student.id);
                  const status = currentGrade && assessment.maxScore ? getGradeStatus(currentGrade, assessment.maxScore) : null;
                  
                  return (
                    <Card key={student.id} className="p-3">
                      <div className="space-y-3">
                        {/* Student Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.code}</p>
                            </div>
                          </div>

                          {currentGrade !== undefined && (
                            <Badge 
                              variant={status?.color.includes('red') ? 'destructive' : 'default'}
                              className="text-xs"
                            >
                              {status?.label}
                            </Badge>
                          )}
                        </div>

                        {/* Grading Input */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
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
                                    // Clear grade if input is empty
                                    setGrades(prev => prev.filter(g => !(g.studentId === student.id && g.assessmentId === assessment.id)));
                                  }
                                }}
                                className="w-20 h-8 text-sm"
                              />
                              <span className="text-xs text-muted-foreground">
                                / {assessment.maxScore || 100}
                              </span>
                            </div>
                          </div>

                          {currentGrade !== undefined && (
                            <div className="text-center">
                              <p className="text-xs font-medium">
                                {((currentGrade / (assessment.maxScore || 100)) * 100).toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {currentGrade !== undefined && (
                          <Progress 
                            value={(currentGrade / (assessment.maxScore || 100)) * 100} 
                            className="h-1.5"
                          />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Summary - Fixed at bottom */}
              <Card className="p-3 bg-muted/50 mt-auto">
                <h5 className="text-sm font-medium mb-2">Resumen</h5>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-sm font-semibold">
                      {students.filter(s => getStudentGrade(s.id, assessment.id) !== undefined).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Calificados</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {grades
                        .filter(g => g.assessmentId === assessment.id && g.score > 0)
                        .length > 0
                        ? (grades
                            .filter(g => g.assessmentId === assessment.id)
                            .reduce((sum, g) => sum + (g.score / (assessment.maxScore || 100)) * 100, 0) /
                          grades.filter(g => g.assessmentId === assessment.id).length
                        ).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Promedio</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {grades.filter(g => g.assessmentId === assessment.id && (g.score / (assessment.maxScore || 100)) >= 0.6).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Aprobados</p>
                  </div>
                </div>
              </Card>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
        </>
      )}
    </div>
  );
}