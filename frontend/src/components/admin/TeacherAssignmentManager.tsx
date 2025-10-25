import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  BookOpen, 
  Clock,
  MapPin,
  Users,
  Search,
  Copy,
  Download,
  AlertTriangle,
  Bell
} from "lucide-react";

interface TeacherAssignment {
  teacherId: string;
  teacherName: string;
  classes: ClassAssignment[];
}

interface ClassAssignment {
  id: string;
  subject: string;
  section: string;
  grade: string;
  room?: string;
  schedule: ScheduleSlot[];
}

interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface TeacherAssignmentManagerProps {
  onBack: () => void;
}

const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

const SUBJECTS = [
  "Matemáticas", "Física", "Química", "Biología", "Historia", 
  "Geografía", "Literatura", "Inglés", "Educación Física", "Arte",
  "Música", "Informática", "Filosofía", "Economía"
];

const GRADES = [
  "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico",
  "7° Básico", "8° Básico", "9° Básico", "10° Básico", "11° Básico", "12° Básico"
];

export function TeacherAssignmentManager({ onBack }: TeacherAssignmentManagerProps) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromTeacher, setCopyFromTeacher] = useState<string>("");
  const [copyToTeacher, setCopyToTeacher] = useState<string>("");
  const [editingClass, setEditingClass] = useState<ClassAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleConflicts, setScheduleConflicts] = useState<string[]>([]);
  
  const [classFormData, setClassFormData] = useState({
    subject: "",
    section: "",
    grade: "",
    room: "",
    scheduleSlots: [{ day: "", startTime: "", endTime: "" }]
  });

  useEffect(() => {
    loadTeachers();
    loadAssignments();
  }, []);

  const loadTeachers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('asisVox_users') || '[]');
    const teacherUsers = storedUsers.filter((user: any) => user.role === 'teacher');
    setTeachers(teacherUsers);
  };

  const loadAssignments = () => {
    const storedAssignments = JSON.parse(localStorage.getItem('asisVox_teacher_assignments') || '[]');
    setAssignments(storedAssignments);
  };

  const getTeacherAssignments = (teacherId: string) => {
    return assignments.find(a => a.teacherId === teacherId);
  };

  const handleAddScheduleSlot = () => {
    setClassFormData(prev => ({
      ...prev,
      scheduleSlots: [...prev.scheduleSlots, { day: "", startTime: "", endTime: "" }]
    }));
  };

  const handleRemoveScheduleSlot = (index: number) => {
    setClassFormData(prev => ({
      ...prev,
      scheduleSlots: prev.scheduleSlots.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateScheduleSlot = (index: number, field: string, value: string) => {
    setClassFormData(prev => ({
      ...prev,
      scheduleSlots: prev.scheduleSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
    
    // Check for conflicts when slots change
    if (selectedTeacher) {
      checkScheduleConflicts(selectedTeacher);
    }
  };

  // Validate schedule conflicts
  const checkScheduleConflicts = (teacherId: string) => {
    const conflicts: string[] = [];
    const validSlots = classFormData.scheduleSlots.filter(
      slot => slot.day && slot.startTime && slot.endTime
    );

    const teacherAssignment = assignments.find(a => a.teacherId === teacherId);
    if (!teacherAssignment) {
      setScheduleConflicts([]);
      return;
    }

    validSlots.forEach(newSlot => {
      teacherAssignment.classes.forEach(existingClass => {
        // Skip if editing the same class
        if (editingClass && existingClass.id === editingClass.id) return;

        existingClass.schedule.forEach(existingSlot => {
          if (existingSlot.day === newSlot.day) {
            // Check time overlap
            const newStart = timeToMinutes(newSlot.startTime);
            const newEnd = timeToMinutes(newSlot.endTime);
            const existingStart = timeToMinutes(existingSlot.startTime);
            const existingEnd = timeToMinutes(existingSlot.endTime);

            if (
              (newStart >= existingStart && newStart < existingEnd) ||
              (newEnd > existingStart && newEnd <= existingEnd) ||
              (newStart <= existingStart && newEnd >= existingEnd)
            ) {
              conflicts.push(
                `${newSlot.day} ${newSlot.startTime}-${newSlot.endTime} se solapa con ${existingClass.subject} (${existingSlot.startTime}-${existingSlot.endTime})`
              );
            }
          }
        });
      });
    });

    setScheduleConflicts(conflicts);
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Create notification for teacher
  const createNotification = (teacherId: string, message: string) => {
    const notifications = JSON.parse(localStorage.getItem('asisVox_notifications') || '[]');
    const newNotification = {
      id: Date.now().toString(),
      userId: teacherId,
      message,
      type: 'assignment',
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    localStorage.setItem('asisVox_notifications', JSON.stringify(notifications));
  };

  // Copy schedules between teachers
  const handleCopySchedule = () => {
    if (!copyFromTeacher || !copyToTeacher) {
      toast.error("Por favor selecciona ambos profesores");
      return;
    }

    if (copyFromTeacher === copyToTeacher) {
      toast.error("No puedes copiar a el mismo profesor");
      return;
    }

    const sourceAssignment = assignments.find(a => a.teacherId === copyFromTeacher);
    if (!sourceAssignment || sourceAssignment.classes.length === 0) {
      toast.error("El profesor origen no tiene clases asignadas");
      return;
    }

    const targetTeacher = teachers.find(t => t.id === copyToTeacher);
    if (!targetTeacher) return;

    // Create new classes with new IDs
    const copiedClasses = sourceAssignment.classes.map(cls => ({
      ...cls,
      id: Date.now().toString() + Math.random()
    }));

    // Update or create assignment for target teacher
    const existingTargetIndex = assignments.findIndex(a => a.teacherId === copyToTeacher);
    let updatedAssignments: TeacherAssignment[];

    if (existingTargetIndex >= 0) {
      updatedAssignments = assignments.map((a, i) => {
        if (i === existingTargetIndex) {
          return {
            ...a,
            classes: [...a.classes, ...copiedClasses]
          };
        }
        return a;
      });
    } else {
      const newAssignment: TeacherAssignment = {
        teacherId: copyToTeacher,
        teacherName: targetTeacher.name,
        classes: copiedClasses
      };
      updatedAssignments = [...assignments, newAssignment];
    }

    localStorage.setItem('asisVox_teacher_assignments', JSON.stringify(updatedAssignments));
    setAssignments(updatedAssignments);
    
    // Create notification
    createNotification(
      copyToTeacher,
      `Se te han asignado ${copiedClasses.length} nuevas clases copiadas de ${sourceAssignment.teacherName}`
    );

    setShowCopyModal(false);
    setCopyFromTeacher("");
    setCopyToTeacher("");
    toast.success(`${copiedClasses.length} clases copiadas exitosamente`);
  };

  // Export assignments report
  const handleExportReport = () => {
    let reportContent = "REPORTE DE ASIGNACIONES DE PROFESORES\n";
    reportContent += "=====================================\n\n";
    reportContent += `Generado: ${new Date().toLocaleString('es-ES')}\n\n`;

    if (assignments.length === 0) {
      reportContent += "No hay asignaciones registradas.\n";
    } else {
      assignments.forEach(assignment => {
        reportContent += `\n${assignment.teacherName}\n`;
        reportContent += "─".repeat(50) + "\n";
        reportContent += `Total de clases: ${assignment.classes.length}\n\n`;

        assignment.classes.forEach((cls, index) => {
          reportContent += `${index + 1}. ${cls.subject} - ${cls.grade} ${cls.section}\n`;
          if (cls.room) {
            reportContent += `   Aula: ${cls.room}\n`;
          }
          reportContent += `   Horarios:\n`;
          cls.schedule.forEach(slot => {
            reportContent += `   - ${slot.day}: ${slot.startTime} - ${slot.endTime}\n`;
          });
          reportContent += "\n";
        });
      });

      // Summary
      reportContent += "\n" + "=".repeat(50) + "\n";
      reportContent += "RESUMEN\n";
      reportContent += "=".repeat(50) + "\n";
      reportContent += `Total de profesores con asignaciones: ${assignments.length}\n`;
      reportContent += `Total de clases asignadas: ${assignments.reduce((total, a) => total + a.classes.length, 0)}\n`;
      
      const subjects = new Set<string>();
      assignments.forEach(a => {
        a.classes.forEach(c => subjects.add(c.subject));
      });
      reportContent += `Materias activas: ${subjects.size}\n`;
    }

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asignaciones_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Reporte exportado exitosamente");
  };

  const handleAssignClass = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeacher) {
      toast.error("Por favor selecciona un profesor");
      return;
    }

    if (!classFormData.subject || !classFormData.section || !classFormData.grade) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    // Validate schedule slots
    const validSlots = classFormData.scheduleSlots.filter(
      slot => slot.day && slot.startTime && slot.endTime
    );

    if (validSlots.length === 0) {
      toast.error("Por favor agrega al menos un horario válido");
      return;
    }

    // Check for conflicts
    if (scheduleConflicts.length > 0) {
      toast.error("Hay conflictos de horario. Por favor resuelve los conflictos antes de continuar.");
      return;
    }

    const teacher = teachers.find(t => t.id === selectedTeacher);
    if (!teacher) return;

    const newClass: ClassAssignment = {
      id: Date.now().toString(),
      subject: classFormData.subject,
      section: classFormData.section,
      grade: classFormData.grade,
      room: classFormData.room,
      schedule: validSlots
    };

    // Update or create teacher assignment
    const existingAssignmentIndex = assignments.findIndex(a => a.teacherId === selectedTeacher);
    let updatedAssignments: TeacherAssignment[];

    if (existingAssignmentIndex >= 0) {
      updatedAssignments = assignments.map((a, i) => {
        if (i === existingAssignmentIndex) {
          return {
            ...a,
            classes: editingClass 
              ? a.classes.map(c => c.id === editingClass.id ? newClass : c)
              : [...a.classes, newClass]
          };
        }
        return a;
      });
    } else {
      const newAssignment: TeacherAssignment = {
        teacherId: selectedTeacher,
        teacherName: teacher.name,
        classes: [newClass]
      };
      updatedAssignments = [...assignments, newAssignment];
    }

    localStorage.setItem('asisVox_teacher_assignments', JSON.stringify(updatedAssignments));
    setAssignments(updatedAssignments);
    
    // Create notification for teacher
    if (!editingClass) {
      createNotification(
        selectedTeacher,
        `Se te ha asignado una nueva clase: ${newClass.subject} - ${newClass.grade} ${newClass.section}`
      );
    }
    
    setClassFormData({
      subject: "",
      section: "",
      grade: "",
      room: "",
      scheduleSlots: [{ day: "", startTime: "", endTime: "" }]
    });
    setEditingClass(null);
    setScheduleConflicts([]);
    setShowAssignmentModal(false);
    
    toast.success(editingClass ? "Clase actualizada exitosamente" : "Clase asignada exitosamente");
  };

  const handleDeleteClass = (teacherId: string, classId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta asignación?")) {
      const updatedAssignments = assignments.map(a => {
        if (a.teacherId === teacherId) {
          return {
            ...a,
            classes: a.classes.filter(c => c.id !== classId)
          };
        }
        return a;
      }).filter(a => a.classes.length > 0);

      localStorage.setItem('asisVox_teacher_assignments', JSON.stringify(updatedAssignments));
      setAssignments(updatedAssignments);
      toast.success("Clase eliminada exitosamente");
    }
  };

  const handleEditClass = (teacherId: string, classData: ClassAssignment) => {
    setSelectedTeacher(teacherId);
    setEditingClass(classData);
    setClassFormData({
      subject: classData.subject,
      section: classData.section,
      grade: classData.grade,
      room: classData.room || "",
      scheduleSlots: classData.schedule.length > 0 
        ? classData.schedule 
        : [{ day: "", startTime: "", endTime: "" }]
    });
    setShowAssignmentModal(true);
  };

  const closeModal = () => {
    setShowAssignmentModal(false);
    setEditingClass(null);
    setClassFormData({
      subject: "",
      section: "",
      grade: "",
      room: "",
      scheduleSlots: [{ day: "", startTime: "", endTime: "" }]
    });
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalClasses = (teacherId: string) => {
    const assignment = assignments.find(a => a.teacherId === teacherId);
    return assignment?.classes.length || 0;
  };

  const getTotalWeeklyHours = (teacherId: string) => {
    const assignment = assignments.find(a => a.teacherId === teacherId);
    if (!assignment) return 0;

    let totalMinutes = 0;
    assignment.classes.forEach(cls => {
      cls.schedule.forEach(slot => {
        const start = slot.startTime.split(':');
        const end = slot.endTime.split(':');
        const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
        const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
        totalMinutes += (endMinutes - startMinutes);
      });
    });

    return (totalMinutes / 60).toFixed(1);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2>Asignación de Cursos y Horarios</h2>
          <p className="text-sm text-muted-foreground">Gestionar clases y horarios de profesores</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCopyModal(true)}
            className="hidden sm:flex"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {teachers.length}
              </div>
              <div className="text-xs text-muted-foreground">Profesores</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {assignments.reduce((total, a) => total + a.classes.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Clases Asignadas</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {assignments.filter(a => a.classes.length > 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Con Asignaciones</div>
            </div>
          </Card>
        </div>

        {/* Action Buttons (Mobile) */}
        <div className="flex gap-2 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCopyModal(true)}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copiar Horarios
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar profesor..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Teachers List with Assignments */}
        <div className="space-y-3">
          {filteredTeachers.map((teacher) => {
            const teacherAssignment = getTeacherAssignments(teacher.id);
            const totalClasses = getTotalClasses(teacher.id);
            const totalHours = getTotalWeeklyHours(teacher.id);

            return (
              <Card key={teacher.id} className="p-4">
                <div className="space-y-3">
                  {/* Teacher Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3>{teacher.name}</h3>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTeacher(teacher.id);
                        setShowAssignmentModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Asignar
                    </Button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Clases Asignadas</p>
                      <p className="font-semibold">{totalClasses}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Horas/Semana</p>
                      <p className="font-semibold">{totalHours}h</p>
                    </div>
                  </div>

                  {/* Assigned Classes */}
                  {teacherAssignment && teacherAssignment.classes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Clases Asignadas:</p>
                      {teacherAssignment.classes.map((cls) => (
                        <Card key={cls.id} className="p-3 bg-muted/20">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-blue-600" />
                                  <h4 className="font-medium">{cls.subject}</h4>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{cls.grade}</Badge>
                                  <Badge variant="outline">Sección {cls.section}</Badge>
                                  {cls.room && (
                                    <Badge variant="outline" className="gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {cls.room}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditClass(teacher.id, cls)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteClass(teacher.id, cls.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Schedule */}
                            <div className="space-y-1 mt-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>Horarios:</span>
                              </div>
                              <div className="grid grid-cols-1 gap-1">
                                {cls.schedule.map((slot, idx) => (
                                  <div key={idx} className="text-xs bg-background p-2 rounded">
                                    <span className="font-medium">{slot.day}</span>: {slot.startTime} - {slot.endTime}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {(!teacherAssignment || teacherAssignment.classes.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sin clases asignadas</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTeachers.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No se encontraron profesores.</p>
          </Card>
        )}

        <div className="h-20"></div>
      </div>

      {/* Assignment Modal */}
      <Dialog open={showAssignmentModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? 'Editar Asignación' : 'Asignar Clase a Profesor'}
            </DialogTitle>
            <DialogDescription>
              {editingClass 
                ? 'Modifica los datos de la clase y horarios asignados.' 
                : 'Completa la información de la clase y define los horarios semanales.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignClass} className="space-y-4">
            {/* Conflict Warning */}
            {scheduleConflicts.length > 0 && (
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription>
                  <p className="font-medium text-destructive mb-2">Conflictos de Horario Detectados:</p>
                  <ul className="text-sm space-y-1">
                    {scheduleConflicts.map((conflict, idx) => (
                      <li key={idx} className="text-destructive">• {conflict}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Materia *</Label>
              <Select 
                value={classFormData.subject}
                onValueChange={(value) => setClassFormData(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade */}
            <div className="space-y-2">
              <Label htmlFor="grade">Grado *</Label>
              <Select 
                value={classFormData.grade}
                onValueChange={(value) => setClassFormData(prev => ({ ...prev, grade: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div className="space-y-2">
              <Label htmlFor="section">Sección *</Label>
              <Input
                id="section"
                value={classFormData.section}
                onChange={(e) => setClassFormData(prev => ({ ...prev, section: e.target.value }))}
                placeholder="Ej. A, B, C"
                maxLength={2}
              />
            </div>

            {/* Room */}
            <div className="space-y-2">
              <Label htmlFor="room">Aula/Sala</Label>
              <Input
                id="room"
                value={classFormData.room}
                onChange={(e) => setClassFormData(prev => ({ ...prev, room: e.target.value }))}
                placeholder="Ej. Aula 101, Lab. Física"
              />
            </div>

            {/* Schedule Slots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Horarios *</Label>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={handleAddScheduleSlot}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Horario
                </Button>
              </div>

              {classFormData.scheduleSlots.map((slot, index) => (
                <Card key={index} className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Horario {index + 1}</span>
                    {classFormData.scheduleSlots.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveScheduleSlot(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="text-xs">Día</Label>
                      <Select
                        value={slot.day}
                        onValueChange={(value) => handleUpdateScheduleSlot(index, 'day', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar día" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Hora Inicio</Label>
                        <Select
                          value={slot.startTime}
                          onValueChange={(value) => handleUpdateScheduleSlot(index, 'startTime', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Inicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Hora Fin</Label>
                        <Select
                          value={slot.endTime}
                          onValueChange={(value) => handleUpdateScheduleSlot(index, 'endTime', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Fin" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {editingClass ? 'Actualizar' : 'Asignar Clase'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Copy Schedule Modal */}
      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copiar Horarios entre Profesores</DialogTitle>
            <DialogDescription>
              Duplica todas las clases y horarios de un profesor a otro profesor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                Esta acción copiará todas las clases y horarios de un profesor a otro. El profesor destino recibirá una notificación.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Copiar desde (Profesor Origen)</Label>
              <Select value={copyFromTeacher} onValueChange={setCopyFromTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar profesor origen" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.filter(t => {
                    const assignment = assignments.find(a => a.teacherId === t.id);
                    return assignment && assignment.classes.length > 0;
                  }).map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({getTeacherAssignments(teacher.id)?.classes.length || 0} clases)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Copiar hacia (Profesor Destino)</Label>
              <Select value={copyToTeacher} onValueChange={setCopyToTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar profesor destino" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.filter(t => t.id !== copyFromTeacher).map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {copyFromTeacher && copyToTeacher && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm">
                  Se copiarán {getTeacherAssignments(copyFromTeacher)?.classes.length || 0} clases a {teachers.find(t => t.id === copyToTeacher)?.name}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowCopyModal(false);
                  setCopyFromTeacher("");
                  setCopyToTeacher("");
                }} 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleCopySchedule} 
                className="flex-1"
                disabled={!copyFromTeacher || !copyToTeacher}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar Horarios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
