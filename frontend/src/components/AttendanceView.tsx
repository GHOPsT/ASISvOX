import { useState, useEffect } from "react";
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
  Clock,
  Loader
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../services/api";
import { tokenService } from "../services/tokenService";
import type { AttendanceSession } from "../../../shared/types";

interface Student {
  id: string;
  name: string;
  code?: string;
  attendance?: 'present' | 'absent' | 'late';
}

interface AttendanceViewProps {
  classId: string;
  onBack: () => void;
}

export function AttendanceView({ classId, onBack }: AttendanceViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("voice");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
  const [classInfo, setClassInfo] = useState<any>(null);

  // Cargar datos de la clase y estudiantes
  useEffect(() => {
    loadAttendanceData();
  }, [classId]);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      // Obtener estudiantes de la clase
      const classResponse = await apiClient.classes.getClassById(classId!);
      if (classResponse?.data?.students && Array.isArray(classResponse.data.students)) {
        setStudents(classResponse.data.students.map((s: any) => ({
          id: s.id || s.student_id,
          name: s.name || s.student_name,
          code: s.code,
          attendance: 'present' as const
        })));
      }

      // Obtener o crear sesión de asistencia para hoy
      const today = new Date().toISOString().split('T')[0];
      const sessionsResponse = await apiClient.attendance.getAttendanceSessions({ classId });
      const sessions = sessionsResponse?.data || [];
      let session = sessions.find((s: any) => s.date === today);
      
      if (!session) {
        // Crear nueva sesión
        const sessionResponse = await apiClient.attendance.createAttendanceSession({
          classId,
          teacherId: tokenService.getUserId() || '',
          date: new Date(today)
        });
        session = sessionResponse?.data as AttendanceSession | undefined;
      }
      if (session) {
        setCurrentSession(session);
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error('Error al cargar datos de asistencia');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAttendanceUpdate = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    try {
      if (!currentSession) {
        toast.error('No hay sesión de asistencia activa');
        return;
      }

      // Registrar o actualizar asistencia en la BD
      await apiClient.attendance.recordAttendance({
        sessionId: currentSession.id,
        studentId: studentId,
        status: status,
        method: 'manual'
      });

      // Actualizar localmente
      setStudents(prev =>
        prev.map(student =>
          student.id === studentId ? { ...student, attendance: status } : student
        )
      );

      toast.success(`Asistencia registrada: ${status}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Error al registrar asistencia');
    }
  };

  // Wrapper para VoiceAttendance que convierte boolean a string
  const handleVoiceAttendanceUpdate = async (studentId: string, isPresent: boolean) => {
    const status = isPresent ? 'present' : 'absent';
    await handleAttendanceUpdate(studentId, status);
  };

  const handleManualAttendance = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const currentStatus = student.attendance || 'present';
      const nextStatus: 'present' | 'absent' | 'late' = 
        currentStatus === 'present' ? 'absent' : 
        currentStatus === 'absent' ? 'late' : 'present';
      handleAttendanceUpdate(studentId, nextStatus);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      if (!currentSession) {
        toast.error('No hay sesión de asistencia activa');
        return;
      }

      const presentCount = students.filter(s => s.attendance === 'present').length;
      const absentCount = students.filter(s => s.attendance === 'absent').length;
      const lateCount = students.filter(s => s.attendance === 'late').length;
      
      toast.success(`Asistencia guardada: ${presentCount} presentes, ${absentCount} ausentes, ${lateCount} retrasados`);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Error al guardar asistencia');
    }
  };

  const handleExportAttendance = () => {
    try {
      const csv = generateAttendanceCSV();
      downloadCSV(csv, `asistencia_${classId}_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success("Reporte de asistencia exportado");
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast.error('Error al exportar reporte');
    }
  };

  const generateAttendanceCSV = () => {
    let csv = 'Estudiante,Código,Estado,Fecha\n';
    const today = new Date().toISOString().split('T')[0];
    students.forEach(student => {
      csv += `${student.name},${student.code},${student.attendance},${today}\n`;
    });
    return csv;
  };

  const downloadCSV = (csv: string, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getAttendanceStats = () => {
    const presentCount = students.filter(s => s.attendance === 'present').length;
    const absentCount = students.filter(s => s.attendance === 'absent').length;
    const lateCount = students.filter(s => s.attendance === 'late').length;
    const attendanceRate = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(0) : 0;

    return {
      totalStudents: students.length,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate
    };
  };

  const stats = getAttendanceStats();

  const getAttendanceBadgeVariant = (attendance?: string) => {
    if (attendance === 'present') return 'default';
    if (attendance === 'late') return 'secondary';
    return 'destructive';
  };

  const getAttendanceLabel = (attendance?: string) => {
    if (attendance === 'present') return 'Presente';
    if (attendance === 'late') return 'Retrasado';
    return 'Ausente';
  };

  return (
    <div className="h-screen flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando datos de asistencia...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1>Asistencia - {classInfo?.name || 'Clase'}</h1>
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
                students={students.map(s => ({ ...s, attendance: s.attendance === 'present' ? true : false }))}
                onAttendanceUpdate={handleVoiceAttendanceUpdate}
              />
              
              {/* Recent Updates */}
              <Card className="p-4">
                <h3 className="mb-3">Actualizaciones recientes</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {students
                    .filter(s => s.attendance !== 'present') // Solo mostrar estudiantes ausentes o tardíos
                    .slice(-5)
                    .map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <span className="text-sm">{student.name}</span>
                        <Badge variant={getAttendanceBadgeVariant(student.attendance) as any}>
                          {getAttendanceLabel(student.attendance)}
                        </Badge>
                      </div>
                    ))}
                  {students.filter(s => s.attendance !== 'present').length === 0 && (
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
                      .filter(s => s.attendance === 'present')
                      .slice(0, 4)
                      .map(student => (
                        <p key={student.id} className="text-xs text-green-700">{student.name}</p>
                      ))}
                    {students.filter(s => s.attendance === 'present').length > 4 && (
                      <p className="text-xs text-green-600">+{students.filter(s => s.attendance === 'present').length - 4} más</p>
                    )}
                  </div>
                </Card>

                <Card className="p-3 bg-red-50 border-red-200">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Ausentes ({stats.absentCount})</h4>
                  <div className="space-y-1">
                    {students.filter(s => s.attendance !== 'present').length > 0 ? (
                      <>
                        {students
                          .filter(s => s.attendance !== 'present')
                          .slice(0, 4)
                          .map(student => (
                            <p key={student.id} className="text-xs text-red-700">{student.name}</p>
                          ))}
                        {students.filter(s => s.attendance !== 'present').length > 4 && (
                          <p className="text-xs text-red-600">+{students.filter(s => s.attendance !== 'present').length - 4} más</p>
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
        </>
      )}
    </div>
  );
}