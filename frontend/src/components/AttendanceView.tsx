import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { StudentCard } from "./StudentCard";
import { VoiceAttendance } from "./VoiceAttendance";
import { 
  ArrowLeft, 
  Users, 
  Download, 
  Search,
  Filter,
  Save,
  Calendar,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  code: string;
  attendance: boolean;
}

interface AttendanceViewProps {
  classId: string;
  onBack: () => void;
}

export function AttendanceView({ classId, onBack }: AttendanceViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("voice");

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
    { id: "1", name: "Juan Pérez García", code: "2024001", attendance: true },
    { id: "2", name: "María González López", code: "2024002", attendance: true },
    { id: "3", name: "Carlos Rodríguez Martín", code: "2024003", attendance: true },
    { id: "4", name: "Ana Fernández Silva", code: "2024004", attendance: true },
    { id: "5", name: "Luis Hernández Ruiz", code: "2024005", attendance: true },
    { id: "6", name: "Sofia Morales Castro", code: "2024006", attendance: true },
    { id: "7", name: "Diego Vargas Mendoza", code: "2024007", attendance: true },
    { id: "8", name: "Isabella Torres Jiménez", code: "2024008", attendance: true },
    { id: "9", name: "Andrés Ramírez Ortega", code: "2024009", attendance: true },
    { id: "10", name: "Valentina Cruz Herrera", code: "2024010", attendance: true }
  ]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAttendanceUpdate = (studentId: string, isPresent: boolean) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, attendance: isPresent } : student
      )
    );
  };

  const handleManualAttendance = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      // Solo permite cambiar entre Presente (true) y Ausente (false)
      const newAttendance = student.attendance === true ? false : true;
      handleAttendanceUpdate(studentId, newAttendance);
    }
  };

  const handleSaveAttendance = () => {
    // Todos los estudiantes ya tienen asistencia marcada por defecto
    const presentStudents = students.filter(s => s.attendance === true);
    const absentStudents = students.filter(s => s.attendance === false);
    
    // Simular guardado
    toast.success(`Asistencia guardada: ${presentStudents.length} presentes, ${absentStudents.length} ausentes`);
  };

  const handleExportAttendance = () => {
    // Simular exportación
    toast.success("Reporte de asistencia exportado");
  };

  const getAttendanceStats = () => {
    const presentCount = students.filter(s => s.attendance === true).length;
    const absentCount = students.filter(s => s.attendance === false).length;
    const attendanceRate = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(0) : 0;

    return {
      totalStudents: students.length,
      presentCount,
      absentCount,
      attendanceRate
    };
  };

  const stats = getAttendanceStats();

  const getAttendanceBadgeVariant = (attendance: boolean) => {
    return attendance === true ? "default" : "destructive";
  };

  const getAttendanceLabel = (attendance: boolean) => {
    return attendance === true ? "Presente" : "Ausente";
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1>Asistencia - {classInfo.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-lg font-semibold">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-green-600">{stats.presentCount}</p>
            <p className="text-xs text-muted-foreground">Presentes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">{stats.absentCount}</p>
            <p className="text-xs text-muted-foreground">Ausentes</p>
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
            <TabsTrigger value="voice" className="flex-1">Por Voz</TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
            <TabsTrigger value="list" className="flex-1">Lista</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden p-4">
            <TabsContent value="voice" className="h-full space-y-4 mt-0">
              <VoiceAttendance
                students={students}
                onAttendanceUpdate={handleAttendanceUpdate}
              />
              
              {/* Recent Updates */}
              <Card className="p-4">
                <h3 className="mb-3">Actualizaciones recientes</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {students
                    .filter(s => s.attendance === false) // Solo mostrar estudiantes ausentes ya que son las "actualizaciones"
                    .slice(-5)
                    .map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <span className="text-sm">{student.name}</span>
                        <Badge variant={getAttendanceBadgeVariant(student.attendance) as any}>
                          {getAttendanceLabel(student.attendance)}
                        </Badge>
                      </div>
                    ))}
                  {students.filter(s => s.attendance === false).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Todos los estudiantes están presentes
                    </p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="h-full space-y-4 mt-0">
              {/* Search */}
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
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Manual Attendance Grid */}
              <div className="space-y-3 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Código: {student.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getAttendanceBadgeVariant(student.attendance) as any}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleManualAttendance(student.id)}
                        >
                          {getAttendanceLabel(student.attendance)}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="h-full space-y-4 mt-0">
              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleSaveAttendance} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Asistencia
                </Button>
                <Button variant="outline" onClick={handleExportAttendance} className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>

              {/* Summary by Status */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 bg-green-50 border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Presentes ({stats.presentCount})</h4>
                  <div className="space-y-1">
                    {students
                      .filter(s => s.attendance === true)
                      .slice(0, 4)
                      .map(student => (
                        <p key={student.id} className="text-xs text-green-700">{student.name}</p>
                      ))}
                    {students.filter(s => s.attendance === true).length > 4 && (
                      <p className="text-xs text-green-600">+{students.filter(s => s.attendance === true).length - 4} más</p>
                    )}
                  </div>
                </Card>

                <Card className="p-3 bg-red-50 border-red-200">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Ausentes ({stats.absentCount})</h4>
                  <div className="space-y-1">
                    {students.filter(s => s.attendance === false).length > 0 ? (
                      <>
                        {students
                          .filter(s => s.attendance === false)
                          .slice(0, 4)
                          .map(student => (
                            <p key={student.id} className="text-xs text-red-700">{student.name}</p>
                          ))}
                        {students.filter(s => s.attendance === false).length > 4 && (
                          <p className="text-xs text-red-600">+{students.filter(s => s.attendance === false).length - 4} más</p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-red-600">Ningún estudiante ausente</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Complete List */}
              <Card className="p-4">
                <h3 className="mb-3">Lista completa</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {students.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between p-2 border-b border-muted last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.code}</p>
                        </div>
                      </div>
                      <Badge variant={getAttendanceBadgeVariant(student.attendance) as any}>
                        {getAttendanceLabel(student.attendance)}
                      </Badge>
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