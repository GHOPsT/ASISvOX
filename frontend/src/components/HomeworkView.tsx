import { useState } from "react";
import { ArrowLeft, Plus, Calendar, Users, Eye, Edit, Trash2, BookOpen, Clock, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed" | "overdue";
  submissionsCount: number;
  totalStudents: number;
  createdAt: string;
}

interface HomeworkViewProps {
  classId: string;
  onBack: () => void;
}

export function HomeworkView({ classId, onBack }: HomeworkViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddingHomework, setIsAddingHomework] = useState(false);

  // Mock data de tareas
  const homeworks: Homework[] = [
    {
      id: "1",
      title: "Ejercicios de Álgebra - Capítulo 5",
      description: "Resolver los ejercicios 1-20 del capítulo 5. Incluir procedimiento completo y gráficas donde sea necesario.",
      subject: "Matemáticas",
      dueDate: "2024-02-15",
      priority: "high",
      status: "active",
      submissionsCount: 18,
      totalStudents: 25,
      createdAt: "2024-02-08"
    },
    {
      id: "2",
      title: "Ensayo sobre la Revolución Francesa",
      description: "Redactar un ensayo de 500 palabras sobre las causas y consecuencias de la Revolución Francesa.",
      subject: "Historia",
      dueDate: "2024-02-20",
      priority: "medium",
      status: "active",
      submissionsCount: 12,
      totalStudents: 25,
      createdAt: "2024-02-10"
    },
    {
      id: "3",
      title: "Laboratorio de Química - Reacciones",
      description: "Completar el reporte del laboratorio sobre reacciones químicas básicas.",
      subject: "Química",
      dueDate: "2024-02-12",
      priority: "high",
      status: "overdue",
      submissionsCount: 20,
      totalStudents: 25,
      createdAt: "2024-02-05"
    },
    {
      id: "4",
      title: "Proyecto de Física - Movimiento",
      description: "Crear una presentación sobre los tipos de movimiento en la física clásica.",
      subject: "Física",
      dueDate: "2024-01-30",
      priority: "medium",
      status: "completed",
      submissionsCount: 25,
      totalStudents: 25,
      createdAt: "2024-01-15"
    }
  ];

  const filteredHomeworks = homeworks.filter(homework => {
    const matchesSearch = homework.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         homework.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || homework.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "overdue": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Activa";
      case "completed": return "Completada";
      case "overdue": return "Vencida";
      default: return status;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const AddHomeworkModal = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      subject: "",
      dueDate: "",
      priority: "medium"
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Aquí iría la lógica para crear la tarea
      console.log("Nueva tarea:", formData);
      setIsAddingHomework(false);
      setFormData({
        title: "",
        description: "",
        subject: "",
        dueDate: "",
        priority: "medium"
      });
    };

    return (
      <Dialog open={isAddingHomework} onOpenChange={setIsAddingHomework}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la Tarea</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Ejercicios de matemáticas..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Materia</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Matemáticas">Matemáticas</SelectItem>
                  <SelectItem value="Historia">Historia</SelectItem>
                  <SelectItem value="Química">Química</SelectItem>
                  <SelectItem value="Física">Física</SelectItem>
                  <SelectItem value="Literatura">Literatura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe los detalles de la tarea..."
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="dueDate">Fecha de Entrega</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Crear Tarea
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddingHomework(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-foreground">Tareas y Deberes</h2>
          <p className="text-sm text-muted-foreground">Gestiona las tareas de la clase</p>
        </div>
        <Button onClick={() => setIsAddingHomework(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-3 border-b">
        <div className="relative">
          <Input
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <BookOpen className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            Todas
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
          >
            Activas
          </Button>
          <Button
            variant={filterStatus === "overdue" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("overdue")}
          >
            Vencidas
          </Button>
          <Button
            variant={filterStatus === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("completed")}
          >
            Completadas
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredHomeworks.map((homework) => {
          const daysUntilDue = getDaysUntilDue(homework.dueDate);
          const submissionPercentage = Math.round((homework.submissionsCount / homework.totalStudents) * 100);
          
          return (
            <Card key={homework.id} className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{homework.title}</h3>
                    <p className="text-sm text-muted-foreground">{homework.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(homework.priority)}>
                      {homework.priority === "high" ? "Alta" : homework.priority === "medium" ? "Media" : "Baja"}
                    </Badge>
                    <Badge className={getStatusColor(homework.status)}>
                      {getStatusText(homework.status)}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {homework.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(homework.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {daysUntilDue > 0 ? `${daysUntilDue} días restantes` : 
                         daysUntilDue === 0 ? "Vence hoy" : 
                         `${Math.abs(daysUntilDue)} días vencida`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {homework.submissionsCount}/{homework.totalStudents}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {submissionPercentage}% entregado
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      submissionPercentage === 100 ? 'bg-green-500' : 
                      submissionPercentage >= 70 ? 'bg-blue-500' : 
                      submissionPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${submissionPercentage}%` }}
                  ></div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Entregas
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Alerts */}
                {homework.status === "overdue" && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700">
                      Esta tarea está vencida hace {Math.abs(daysUntilDue)} días
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {filteredHomeworks.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">No hay tareas</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterStatus !== "all" 
                ? "No se encontraron tareas con los filtros aplicados" 
                : "Aún no has creado ninguna tarea para esta clase"}
            </p>
          </div>
        )}

        <div className="h-20"></div>
      </div>

      <AddHomeworkModal />
    </div>
  );
}