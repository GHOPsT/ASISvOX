import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
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
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" }
];

export function AddClassModal({ isOpen, onClose, onSave }: AddClassModalProps) {
  const [formData, setFormData] = useState({
    subjectId: "",
    sectionId: "",
    academicYearId: "",
    classroom: "",
    weeksDuration: "",
    schedules: [] as { day_of_week: number; start_time: string; end_time: string }[]
  });

  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: 1,
    start_time: "08:00",
    end_time: "09:00"
  });

  // ===============================================
  // HELPER FUNCTIONS
  // ===============================================

  const getCurrentAcademicYear = (): string => {
    const current = academicYears.find(y => y.is_current === true);
    if (current) return current.id;
    
    const today = new Date();
    const activeYear = academicYears.find(y => {
      const startDate = new Date(y.start_date);
      const endDate = new Date(y.end_date);
      return startDate <= today && today <= endDate;
    });
    
    return activeYear?.id || "";
  };

  const getFilteredAcademicYears = (): any[] => {
    const today = new Date();
    return academicYears.filter(y => new Date(y.end_date) >= today);
  };

  const isNextYear = (year: any): boolean => {
    const today = new Date();
    return new Date(year.start_date) > today;
  };

  const sortByName = (items: any[]): any[] => {
    return [...items].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  };

  // ===============================================
  // EFFECTS
  // ===============================================

  // Cargar datos cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  // Pre-seleccionar año académico cuando carga
  useEffect(() => {
    if (academicYears.length > 0 && !formData.academicYearId) {
      const preSelectedYear = getCurrentAcademicYear();
      if (preSelectedYear) {
        setFormData(prev => ({ ...prev, academicYearId: preSelectedYear }));
      }
    }
  }, [academicYears]);

  const loadFormData = async () => {
    setIsLoading(true);
    try {
      const token = tokenService.getToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const [subjectsRes, sectionsRes, yearsRes] = await Promise.all([
        fetch('http://localhost:3001/api/master/subjects', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/master/sections', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/master/academic-years', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!subjectsRes.ok || !sectionsRes.ok || !yearsRes.ok) {
        throw new Error('Error al cargar configuración del servidor');
      }

      const subjectsData = await subjectsRes.json();
      const sectionsData = await sectionsRes.json();
      const yearsData = await yearsRes.json();

      setSubjects(subjectsData.data || []);
      setSections(sectionsData.data || []);
      setAcademicYears(yearsData.data || []);
    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Desconocido'}`);
      setSubjects([]);
      setSections([]);
      setAcademicYears([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // HANDLERS
  // ===============================================

  const handleAddSchedule = () => {
    if (!newSchedule.start_time || !newSchedule.end_time) {
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

  // OPCIÓN B: Ambas API calls (crear clase + horarios)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.subjectId || !formData.sectionId || !formData.academicYearId) {
      toast.error("Por favor completa los campos obligatorios (Materia, Sección, Año Académico)");
      return;
    }

    if (!formData.weeksDuration || parseInt(formData.weeksDuration) < 1 || parseInt(formData.weeksDuration) > 52) {
      toast.error("Duración debe estar entre 1 y 52 semanas");
      return;
    }

    if (formData.schedules.length === 0) {
      toast.error("Por favor agrega al menos un horario");
      return;
    }

    setIsSubmitting(true);
    try {
      // STEP 1: Create Class
      // Backend espera snake_case: subject_id, section_id, academic_year_id, weeks_duration
      const createClassResponse = await apiClient.classes.createClass({
        subjectId: formData.subjectId,
        sectionId: formData.sectionId,
        academicYearId: formData.academicYearId,
        classroom: formData.classroom || "",
        weeksDuration: parseInt(formData.weeksDuration)
      } as any);

      if (!createClassResponse.success || !createClassResponse.data) {
        throw new Error("No se pudo crear la clase");
      }

      const newClassId = createClassResponse.data.id;

      // STEP 2: Create Schedules
      const schedulesForAPI = formData.schedules.map(s => ({
        dayOfWeek: s.day_of_week,
        startTime: s.start_time,
        endTime: s.end_time
      }));

      await apiClient.classes.createSchedules(newClassId, schedulesForAPI);

      // STEP 3: Success - return full class data
      const subject = subjects.find(s => s.id === formData.subjectId);
      const section = sections.find(s => s.id === formData.sectionId);
      const academicYear = academicYears.find(y => y.id === formData.academicYearId);

      const completeClass = {
        ...createClassResponse.data,
        schedules: formData.schedules,
        _subjectName: subject?.name,
        _sectionName: section?.name,
        _academicYearName: academicYear?.name
      };

      onSave(completeClass);
      
      // Reset form
      setFormData({
        subjectId: "",
        sectionId: "",
        academicYearId: "",
        classroom: "",
        weeksDuration: "",
        schedules: []
      });

      toast.success("Clase creada exitosamente con horarios");
      onClose();

    } catch (error) {
      console.error('Error creating class:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      subjectId: "",
      sectionId: "",
      academicYearId: "",
      classroom: "",
      weeksDuration: "",
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
              {/* Materia */}
              <div className="space-y-2">
                <Label htmlFor="subject">Materia *</Label>
                <Select value={formData.subjectId} onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}>
                  <SelectTrigger id="subject" disabled={isLoading}>
                    <SelectValue placeholder="Seleccionar materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortByName(subjects).map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sección */}
              <div className="space-y-2">
                <Label htmlFor="section">Sección *</Label>
                <Select value={formData.sectionId} onValueChange={(value) => setFormData(prev => ({ ...prev, sectionId: value }))}>
                  <SelectTrigger id="section" disabled={isLoading}>
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortByName(sections).map(section => (
                      <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Año Académico con badges */}
              <div className="space-y-2">
                <Label htmlFor="academicYear">Año Académico *</Label>
                <Select value={formData.academicYearId} onValueChange={(value) => setFormData(prev => ({ ...prev, academicYearId: value }))}>
                  <SelectTrigger id="academicYear" disabled={isLoading}>
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredAcademicYears()
                      .sort((a, b) => {
                        // Actual primero, luego próximos
                        const aIsCurrent = a.is_current;
                        const bIsCurrent = b.is_current;
                        if (aIsCurrent && !bIsCurrent) return -1;
                        if (!aIsCurrent && bIsCurrent) return 1;
                        // Dentro del mismo grupo, por fecha
                        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
                      })
                      .map(year => (
                        <SelectItem key={year.id} value={year.id}>
                          <div className="flex items-center gap-2">
                            <span>{year.name}</span>
                            {year.is_current && (
                              <Badge variant="default" className="text-xs">Actual</Badge>
                            )}
                            {isNextYear(year) && (
                              <Badge variant="secondary" className="text-xs">Próximo</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Aula */}
              <div className="space-y-2">
                <Label htmlFor="classroom">Aula/Salón</Label>
                <Input
                  id="classroom"
                  value={formData.classroom}
                  onChange={(e) => setFormData(prev => ({ ...prev, classroom: e.target.value }))}
                  placeholder="ej. A-101"
                  disabled={isLoading || isSubmitting}
                />
              </div>

              {/* Duración */}
              <div className="space-y-2">
                <Label htmlFor="weeksDuration">Duración (Semanas) *</Label>
                <Input
                  id="weeksDuration"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.weeksDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, weeksDuration: e.target.value }))}
                  placeholder="ej. 36"
                  disabled={isLoading || isSubmitting}
                  required
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
                    disabled={isLoading || isSubmitting}
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
                    disabled={isLoading || isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora Final</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSchedule.end_time}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                    disabled={isLoading || isSubmitting}
                  />
                </div>
              </div>

              <Button 
                type="button" 
                onClick={handleAddSchedule}
                variant="outline"
                className="w-full"
                disabled={isLoading || isSubmitting}
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
                          disabled={isSubmitting}
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
              disabled={isLoading || isSubmitting}
              className="flex-1 border-2 border-slate-300 dark:border-slate-600"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting || formData.schedules.length === 0}
              className="flex-1 border-2 border-primary"
            >
              {isSubmitting ? "Creando..." : "Crear Clase"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}