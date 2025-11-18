import { useState, useEffect, type ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { apiClient } from "../services/api";
import { tokenService } from "../services/tokenService";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: any) => void;
}

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" }
];

export function AddClassModal({ isOpen, onClose, onSave }: AddClassModalProps) {
  const [formData, setFormData] = useState({
    subjectId: "",
    sectionId: "",
    academicYearId: "",
    classroom: "",
    weeksDuration: 52, // Nuevo: duración en semanas
    schedules: [] as { day_of_week: number; start_time: string; end_time: string }[]
  });

  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: 1,
    start_time: "08:00",
    end_time: "09:00"
  });

  // Cargar datos cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const loadFormData = async () => {
    setIsLoading(true);
    try {
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      // Datos mock (próximamente conectar a endpoints reales)
      const mockSubjects = [
        { id: "1", name: "Matemáticas" },
        { id: "2", name: "Física" },
        { id: "3", name: "Química" },
        { id: "4", name: "Biología" },
        { id: "5", name: "Historia" },
        { id: "6", name: "Geografía" },
        { id: "7", name: "Literatura" },
        { id: "8", name: "Inglés" }
      ];

      const mockSections = [
        { id: "sec1", name: "10°A" },
        { id: "sec2", name: "10°B" },
        { id: "sec3", name: "11°A" },
        { id: "sec4", name: "11°B" }
      ];

      const mockAcademicYears = [
        { id: "ay1", name: "2025", year: 2025 },
        { id: "ay2", name: "2026", year: 2026 }
      ];

      setSubjects(mockSubjects);
      setSections(mockSections);
      setAcademicYears(mockAcademicYears);
    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error("Error al cargar datos del formulario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSchedule = () => {
    if (!newSchedule.day_of_week || !newSchedule.start_time || !newSchedule.end_time) {
      toast.error("Por favor completa todos los campos del horario");
      return;
    }

    // Validar que end_time > start_time
    if (newSchedule.end_time <= newSchedule.start_time) {
      toast.error("La hora final debe ser mayor que la hora inicial");
      return;
    }

    // Verificar si ya existe un horario para ese día
    const dayExists = formData.schedules.some(s => s.day_of_week === newSchedule.day_of_week);
    if (dayExists) {
      toast.error("Ya existe un horario para ese día");
      return;
    }

    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, { ...newSchedule }]
    }));

    // Reset
    setNewSchedule({
      day_of_week: 1,
      start_time: "08:00",
      end_time: "09:00"
    });

    toast.success("Horario agregado");
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subjectId || !formData.sectionId || !formData.academicYearId) {
      toast.error("Por favor completa los campos básicos de la clase");
      return;
    }

    if (formData.schedules.length === 0) {
      toast.error("Por favor agrega al menos un horario");
      return;
    }

    const subject = subjects.find(s => s.id === formData.subjectId);
    const section = sections.find(s => s.id === formData.sectionId);
    const academicYear = academicYears.find(y => y.id === formData.academicYearId);

    const newClass = {
      subjectId: formData.subjectId,
      sectionId: formData.sectionId,
      academicYearId: formData.academicYearId,
      classroom: formData.classroom || "",
      weeksDuration: formData.weeksDuration,
      schedules: formData.schedules,
      // Información adicional
      _subjectName: subject?.name,
      _sectionName: section?.name,
      _academicYearName: academicYear?.name
    };

    onSave(newClass);
    
    setFormData({
      subjectId: "",
      sectionId: "",
      academicYearId: "",
      classroom: "",
      weeksDuration: 52,
      schedules: []
    });
    
    toast.success("Clase creada exitosamente");
    onClose();
  };

  const handleClose = () => {
    setFormData({
      subjectId: "",
      sectionId: "",
      academicYearId: "",
      classroom: "",
      weeksDuration: 52,
      schedules: []
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Clase</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección: Información Básica */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm">Información de la Clase</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Materia *</Label>
                <Select value={formData.subjectId} onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}>
                  <SelectTrigger id="subject" disabled={isLoading}>
                    <SelectValue placeholder="Seleccionar materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Sección *</Label>
                <Select value={formData.sectionId} onValueChange={(value) => setFormData(prev => ({ ...prev, sectionId: value }))}>
                  <SelectTrigger id="section" disabled={isLoading}>
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(section => (
                      <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Año Académico *</Label>
                <Select value={formData.academicYearId} onValueChange={(value) => setFormData(prev => ({ ...prev, academicYearId: value }))}>
                  <SelectTrigger id="academicYear" disabled={isLoading}>
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map(year => (
                      <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classroom">Aula/Salón</Label>
                <Input
                  id="classroom"
                  value={formData.classroom}
                  onChange={(e) => setFormData(prev => ({ ...prev, classroom: e.target.value }))}
                  placeholder="ej. A-101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeksDuration">Duración (Semanas) *</Label>
                <Input
                  id="weeksDuration"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.weeksDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, weeksDuration: parseInt(e.target.value) || 52 }))}
                  placeholder="ej. 36"
                />
                <p className="text-xs text-gray-500">¿Cuántas semanas durará esta clase?</p>
              </div>
            </div>
          </div>

          {/* Sección: Horarios */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Horario de la Clase *</h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3 border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Día</Label>
                  <Select 
                    value={newSchedule.day_of_week.toString()} 
                    onValueChange={(value) => setNewSchedule(prev => ({ ...prev, day_of_week: parseInt(value) }))}
                  >
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder="Seleccionar día" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora Inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSchedule.start_time}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora Final</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSchedule.end_time}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                type="button" 
                onClick={handleAddSchedule}
                variant="outline"
                className="w-full"
              >
                + Agregar Horario
              </Button>
            </div>

            {/* Lista de horarios agregados */}
            {formData.schedules.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Horarios Agregados:</p>
                <div className="space-y-2">
                  {formData.schedules.map((schedule, index) => {
                    const dayName = DAYS.find(d => d.value === schedule.day_of_week)?.label;
                    return (
                      <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded">
                        <span className="text-sm">
                          {dayName}: {schedule.start_time} - {schedule.end_time}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSchedule(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1 border-2 border-slate-300 dark:border-slate-600"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 border-2 border-primary"
            >
              Crear Clase
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}