import { Card } from "../../../components/ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Users, BookOpen, Calendar, Clock, ChevronRight, UserPlus } from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  studentCount: number;
  averageGrade?: number;
  nextClass?: string;
}

interface ClassCardProps {
  classData: ClassData;
  onClick: () => void;
  onAttendanceClick?: () => void;
  onAddStudentsClick?: () => void;
}

export function ClassCard({ classData, onClick, onAttendanceClick, onAddStudentsClick }: ClassCardProps) {
  const getGradeColor = (grade?: number) => {
    if (!grade) return "secondary";
    if (grade >= 8.5) return "default";
    if (grade >= 7.0) return "secondary";
    if (grade >= 6.0) return "outline";
    return "destructive";
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">{classData.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{classData.subject}</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{classData.studentCount}</p>
              <p className="text-xs text-muted-foreground">Estudiantes</p>
            </div>
          </div>
          
          {classData.averageGrade && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium">{classData.averageGrade.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Promedio</p>
              </div>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{classData.schedule}</span>
        </div>

        {/* Next Class */}
        {classData.nextClass && (
          <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">Próxima clase:</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {classData.nextClass}
            </Badge>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAttendanceClick && onAttendanceClick();
            }}
          >
            Asistencia
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Notas
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddStudentsClick && onAddStudentsClick();
            }}
          >
            <UserPlus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}