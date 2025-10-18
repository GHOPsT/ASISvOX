import { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

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

interface Student {
  id: string;
  name: string;
  code: string;
}

interface GradingInterfaceProps {
  students: Student[];
  assessments: Assessment[];
  onGradesChange: (grades: StudentGrade[]) => void;
}

export function GradingInterface({ students, assessments, onGradesChange }: GradingInterfaceProps) {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string>(assessments[0]?.id || "");

  const updateGrade = (studentId: string, assessmentId: string, score: number) => {
    setGrades(prev => {
      const existing = prev.find(g => g.studentId === studentId && g.assessmentId === assessmentId);
      if (existing) {
        return prev.map(g =>
          g.studentId === studentId && g.assessmentId === assessmentId
            ? { ...g, score }
            : g
        );
      } else {
        return [...prev, { studentId, assessmentId, score }];
      }
    });
  };

  const getStudentGrade = (studentId: string, assessmentId: string): number | undefined => {
    return grades.find(g => g.studentId === studentId && g.assessmentId === assessmentId)?.score;
  };

  const calculateFinalGrade = (studentId: string): number => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    assessments.forEach(assessment => {
      const grade = getStudentGrade(studentId, assessment.id);
      if (grade !== undefined) {
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

  const saveGrades = () => {
    onGradesChange(grades);
    toast.success("Calificaciones guardadas exitosamente");
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
      {/* Assessment Tabs */}
      <Tabs value={selectedAssessment} onValueChange={setSelectedAssessment} className="h-full flex flex-col">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${assessments.length}, 1fr)` }}>
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
                  const status = currentGrade ? getGradeStatus(currentGrade, assessment.maxScore) : null;
                  
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
                                max={assessment.maxScore}
                                step="0.1"
                                placeholder="0.0"
                                value={currentGrade || ""}
                                onChange={(e) => {
                                  const score = parseFloat(e.target.value);
                                  if (!isNaN(score) && score >= 0 && score <= assessment.maxScore) {
                                    updateGrade(student.id, assessment.id, score);
                                  } else if (e.target.value === "") {
                                    // Clear grade if input is empty
                                    setGrades(prev => prev.filter(g => !(g.studentId === student.id && g.assessmentId === assessment.id)));
                                  }
                                }}
                                className="w-20 h-8 text-sm"
                              />
                              <span className="text-xs text-muted-foreground">
                                / {assessment.maxScore}
                              </span>
                            </div>
                          </div>

                          {currentGrade !== undefined && (
                            <div className="text-center">
                              <p className="text-xs font-medium">
                                {((currentGrade / assessment.maxScore) * 100).toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {currentGrade !== undefined && (
                          <Progress 
                            value={(currentGrade / assessment.maxScore) * 100} 
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
                            .reduce((sum, g) => sum + (g.score / assessment.maxScore) * 100, 0) /
                          grades.filter(g => g.assessmentId === assessment.id).length
                        ).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Promedio</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {grades.filter(g => g.assessmentId === assessment.id && (g.score / assessment.maxScore) >= 0.6).length}
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
    </div>
  );
}