import { Card } from "../../../components/ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User, Edit3 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  code: string;
  grade?: number;
  attendance?: boolean;
}

interface StudentCardProps {
  student: Student;
  onGradeChange: (studentId: string, grade: number) => void;
  showGrades?: boolean;
  showAttendance?: boolean;
}

export function StudentCard({ 
  student, 
  onGradeChange, 
  showGrades = true, 
  showAttendance = false 
}: StudentCardProps) {
  const getGradeColor = (grade?: number) => {
    if (!grade) return "secondary";
    if (grade >= 8.5) return "default";
    if (grade >= 7.0) return "secondary";
    if (grade >= 6.0) return "outline";
    return "destructive";
  };

  const getGradeStatus = (grade?: number) => {
    if (!grade) return "Sin nota";
    if (grade >= 8.5) return "Excelente";
    if (grade >= 7.0) return "Bueno";
    if (grade >= 6.0) return "Regular";
    return "Insuficiente";
  };

  const handleGradeChange = (value: string) => {
    const grade = parseFloat(value);
    if (!isNaN(grade) && grade >= 0 && grade <= 10) {
      onGradeChange(student.id, grade);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(student.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h4 className="font-medium">{student.name}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Código: {student.code}</span>
          </div>
        </div>

        {showAttendance && (
          <Badge variant={student.attendance ? "default" : "secondary"}>
            {student.attendance ? "Presente" : "Ausente"}
          </Badge>
        )}
      </div>

      {showGrades && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium">Calificación</label>
          </div>
          
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="0.0"
              value={student.grade || ""}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="w-20"
            />
            
            <Badge variant={getGradeColor(student.grade) as any} className="text-xs">
              {getGradeStatus(student.grade)}
            </Badge>
            
            {student.grade && (
              <span className="text-sm text-muted-foreground">
                / 10.0
              </span>
            )}
          </div>

          {student.grade && (
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    student.grade >= 6 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(student.grade / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}