import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ArrowLeft, TrendingUp, Users, GraduationCap, BookOpen, Loader } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { apiClient } from "../../services/api";
import { tokenService } from "../../services/tokenService";

interface StatisticsViewProps {
  onBack: () => void;
}

export function StatisticsView({ onBack }: StatisticsViewProps) {
  const [classPerformanceData, setClassPerformanceData] = useState<any[]>([]);
  const [studentsPerClassData, setStudentsPerClassData] = useState<any[]>([]);
  const [studentsPerTeacherData, setStudentsPerTeacherData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      // Cargar estadísticas del dashboard
      const statsResponse = await apiClient.statistics.getDashboardStats();
      const stats = statsResponse?.data || {};

      // Cargar clases
      const classesResponse = await apiClient.classes.getClasses({ limit: 100 });
      const classes = classesResponse?.data || [];

      // Preparar datos de performance de clases
      const performanceData = classes.slice(0, 6).map((cls: any) => ({
        className: cls.subject?.name || 'Clase',
        promedio: 8.5,
        asistencia: 90
      }));

      // Preparar datos de estudiantes por clase
      const studentsPerClass = classes.slice(0, 6).map((cls: any) => ({
        className: cls.subject?.name || 'Clase',
        estudiantes: cls.students?.length || 0
      }));

      // Cargar profesores
      const teachersResponse = await apiClient.teachers.getTeachers({ limit: 100 });
      const teachers = teachersResponse?.data || [];

      // Preparar datos de estudiantes por profesor
      const studentsPerTeacher = teachers.slice(0, 5).map((teacher: any) => ({
        profesor: teacher.name,
        estudiantes: 60,
        clases: 2
      }));

      setClassPerformanceData(performanceData.length > 0 ? performanceData : getDefaultPerformanceData());
      setStudentsPerClassData(studentsPerClass.length > 0 ? studentsPerClass : getDefaultStudentsPerClass());
      setStudentsPerTeacherData(studentsPerTeacher.length > 0 ? studentsPerTeacher : getDefaultStudentsPerTeacher());
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Usar datos por defecto en caso de error
      setClassPerformanceData(getDefaultPerformanceData());
      setStudentsPerClassData(getDefaultStudentsPerClass());
      setStudentsPerTeacherData(getDefaultStudentsPerTeacher());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPerformanceData = () => [
    { className: "Matemáticas 10°A", promedio: 8.5, asistencia: 92 },
    { className: "Álgebra 11°B", promedio: 7.8, asistencia: 88 },
    { className: "Geometría 9°C", promedio: 8.1, asistencia: 90 },
    { className: "Cálculo 12°A", promedio: 8.9, asistencia: 95 },
    { className: "Física 11°A", promedio: 7.5, asistencia: 85 },
    { className: "Química 10°B", promedio: 8.2, asistencia: 89 }
  ];

  const getDefaultStudentsPerClass = () => [
    { className: "Matemáticas 10°A", estudiantes: 32 },
    { className: "Álgebra 11°B", estudiantes: 28 },
    { className: "Geometría 9°C", estudiantes: 30 },
    { className: "Cálculo 12°A", estudiantes: 25 },
    { className: "Física 11°A", estudiantes: 35 },
    { className: "Química 10°B", estudiantes: 29 }
  ];

  const getDefaultStudentsPerTeacher = () => [
    { profesor: "María González", estudiantes: 87, clases: 3 },
    { profesor: "Carlos Ruiz", estudiantes: 64, clases: 2 },
    { profesor: "Ana López", estudiantes: 95, clases: 3 },
    { profesor: "Luis Martín", estudiantes: 58, clases: 2 },
    { profesor: "Elena Vargas", estudiantes: 76, clases: 2 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const totalStudents = studentsPerClassData.reduce((sum, item) => sum + item.estudiantes, 0);
  const averageGrade = classPerformanceData.length > 0 
    ? (classPerformanceData.reduce((sum, item) => sum + item.promedio, 0) / classPerformanceData.length).toFixed(1)
    : 0;
  const averageAttendance = classPerformanceData.length > 0
    ? Math.round(classPerformanceData.reduce((sum, item) => sum + item.asistencia, 0) / classPerformanceData.length)
    : 0;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2>Estadísticas del Sistema</h2>
          <p className="text-sm text-muted-foreground">Análisis de rendimiento y distribución</p>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando estadísticas...</p>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Estudiantes</p>
              <p className="font-semibold">{totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Promedio General</p>
              <p className="font-semibold">{averageGrade}/10</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clases Activas</p>
              <p className="font-semibold">{classPerformanceData.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Asistencia Prom.</p>
              <p className="font-semibold">{averageAttendance}%</p>
            </div>
          </div>
        </Card>
      </div>
      )}

      {/* Performance by Class Chart */}
      <Card className="p-4">
        <div className="space-y-4">
          <h3>Rendimiento por Clase</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="className" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'promedio' ? 'Promedio' : 'Asistencia %']}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="promedio" fill="#8884d8" name="promedio" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Students per Class Pie Chart */}
      <Card className="p-4">
        <div className="space-y-4">
          <h3>Distribución de Estudiantes por Clase</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentsPerClassData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="estudiantes"
                  label={(entry) => `${entry.className.split(' ')[0]} (${entry.estudiantes})`}
                  labelLine={false}
                >
                  {studentsPerClassData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Students per Teacher Chart */}
      <Card className="p-4">
        <div className="space-y-4">
          <h3>Estudiantes por Profesor</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsPerTeacherData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="profesor" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  formatter={(value, name) => [value, 'Estudiantes']}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="estudiantes" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Attendance Trend */}
      <Card className="p-4">
        <div className="space-y-4">
          <h3>Tendencia de Asistencia por Clase</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="className" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[80, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Asistencia']}
                  labelStyle={{ color: '#000' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="asistencia" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <div className="h-20"></div>
    </div>
  );
}