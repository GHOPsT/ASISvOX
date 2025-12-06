import { useState, useEffect } from "react";
import { ArrowLeft, Search, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../../components/ui/input";
import { apiClient } from "../../services/api";
import { tokenService } from "../../services/tokenService";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  totalClasses: number;
  totalStudents: number;
  status: "active" | "inactive";
  lastActivity: string;
}

interface TeacherListViewProps {
  onBack: () => void;
}

export function TeacherListView({ onBack }: TeacherListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      // Cargar teachers desde el backend
      const response = await apiClient.teachers.getTeachers();
      
      if (response.success && response.data) {
        // Mapear datos del backend
        const mappedTeachers: Teacher[] = (response.data as any[]).map((teacher: any) => ({
          id: teacher.id,
          name: teacher.full_name || teacher.name || "Sin nombre",
          email: teacher.email,
          subjects: teacher.subjects || [],
          totalClasses: teacher.totalClasses || 0,
          totalStudents: teacher.totalStudents || 0,
          status: teacher.status === 'active' ? 'active' : 'inactive',
          lastActivity: "Recientemente"
        }));
        
        setTeachers(mappedTeachers);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects.some(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando profesores...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-foreground">Lista de Profesores</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar profesor o materia..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Teachers List */}
        <div className="space-y-3">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3>{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                  <Badge className={teacher.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {teacher.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Clases Asignadas</p>
                    <p className="font-medium">{teacher.totalClasses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Estudiantes</p>
                    <p className="font-medium">{teacher.totalStudents}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Materias</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      teacher.subjects.map((subject) => (
                        <Badge key={subject} variant="outline">{subject}</Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Sin materias asignadas</p>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>

                <div className="text-xs text-muted-foreground">
                  Última actividad: {teacher.lastActivity}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {teachers.length === 0 ? "No hay profesores disponibles" : "No se encontraron profesores que coincidan con la búsqueda."}
            </p>
          </Card>
        )}

        <div className="h-20"></div>
      </div>
    </div>
  );
}