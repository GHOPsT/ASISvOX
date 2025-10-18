import { useState, type ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { toast } from "sonner";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: any) => void;
}

const days = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" }
];

const subjects = [
  "Matemáticas",
  "Física",
  "Química",
  "Biología",
  "Historia",
  "Geografía",
  "Literatura",
  "Inglés",
  "Educación Física",
  "Arte",
  "Música",
  "Informática"
];

export function AddClassModal({ isOpen, onClose, onSave }: AddClassModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    grade: "",
    section: "",
    startTime: "",
    endTime: "",
    selectedDays: [] as string[],
    weeks: 1,
    description: ""
  });

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject || !formData.grade || !formData.startTime || !formData.endTime || formData.selectedDays.length === 0) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const newClass = {
      id: Date.now().toString(),
      ...formData,
      studentCount: 0,
      averageGrade: 0,
      createdAt: new Date().toISOString()
    };

    onSave(newClass);
    
    setFormData({
      name: "",
      subject: "",
      grade: "",
      section: "",
      startTime: "",
      endTime: "",
      selectedDays: [],
      weeks: 1,
      description: ""
    });
    
    toast.success("Clase creada exitosamente");
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      subject: "",
      grade: "",
      section: "",
      startTime: "",
      endTime: "",
      selectedDays: [],
      weeks: 1,
      description: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Clase</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Clase *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ej. Matemáticas 10°A"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="subject">Materia *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grado *</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                placeholder="ej. 10°"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Sección</Label>
            <Input
              id="section"
              value={formData.section}
              onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
              placeholder="ej. A, B, C"
            />
          </div>

          <div className="space-y-2">
            <Label>Días de la semana *</Label>
            <div className="grid grid-cols-2 gap-2">
              {days.map(day => (
                <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.selectedDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora Inicio *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Hora Final *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeks">Duración en semanas</Label>
            <Input
              id="weeks"
              type="number"
              min="1"
              max="52"
              value={formData.weeks}
              onChange={(e) => setFormData(prev => ({ ...prev, weeks: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción opcional de la clase"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Crear Clase
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}