import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  Plus, 
  Trash2, 
  Settings, 
  BookOpen, 
  FileText, 
  PenTool,
  CheckCircle,
  AlertCircle,
  Loader
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../services/api";
import { tokenService } from "../services/tokenService";

interface Assessment {
  id: string;
  name: string;
  type: string;
  weight: number;
  maxScore: number;
  icon: any;
  color: string;
}

interface AssessmentSetupProps {
  classId: string;
  onAssessmentsChange: (assessments: Assessment[]) => void;
  selectedDate?: string;
}

export function AssessmentSetup({ classId, onAssessmentsChange, selectedDate }: AssessmentSetupProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customAssessmentName, setCustomAssessmentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssessments, setSelectedAssessments] = useState<Assessment[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<any[]>([]);
  const [assessmentTypeMap, setAssessmentTypeMap] = useState<Record<string, string>>({});

  // Cargar tipos de evaluación y evaluaciones cuando el componente se monta
  useEffect(() => {
    loadAssessmentTypes();
    loadAssessments();
  }, [classId]);

  const loadAssessmentTypes = async () => {
    try {
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      const response = await apiClient.assessments.getAssessmentTypes();
      const types = response?.data || [];
      setAssessmentTypes(types);

      // Crear mapa: nombre → id (UUID)
      const map: Record<string, string> = {};
      types.forEach((type: any) => {
        map[type.name.toLowerCase()] = type.id;
      });
      setAssessmentTypeMap(map);
    } catch (error) {
      console.error('Error loading assessment types:', error);
    }
  };

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      const response = await apiClient.assessments.getAssessments({ classId });
      const assessmentsData = response?.data || [];
      
      const mappedAssessments = assessmentsData.map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        weight: a.weight || 100,
        maxScore: a.maxScore || 20,
        icon: FileText,
        color: "bg-blue-100 text-blue-700"
      }));
      
      setSelectedAssessments(mappedAssessments);
      if (onAssessmentsChange) {
        onAssessmentsChange(mappedAssessments);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast.error('Error al cargar evaluaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Mapeo de iconos y colores para tipos de evaluación
  const getAssessmentTypeDisplay = (typeName: string) => {
    const displays: Record<string, { icon: any; color: string }> = {
      'examen': { icon: FileText, color: 'bg-red-100 text-red-700' },
      'tarea': { icon: PenTool, color: 'bg-blue-100 text-blue-700' },
      'participación': { icon: AlertCircle, color: 'bg-orange-100 text-orange-700' },
      'proyecto': { icon: CheckCircle, color: 'bg-purple-100 text-purple-700' },
      'quiz': { icon: BookOpen, color: 'bg-green-100 text-green-700' },
      'trabajo en grupo': { icon: Settings, color: 'bg-indigo-100 text-indigo-700' },
      'presentación': { icon: CheckCircle, color: 'bg-yellow-100 text-yellow-700' }
    };
    return displays[typeName.toLowerCase()] || { icon: FileText, color: 'bg-gray-100 text-gray-700' };
  };

  // Tipos de evaluación predefinidos - Ahora cargados del servidor
  const predefinedTypes = [
    { name: "Práctica Calificada", label: "Tarea" },
    { name: "Examen", label: "Examen" },
    { name: "Test de Entrada", label: "Quiz" },
    { name: "Práctica Oral", label: "Quiz" },
    { name: "Participación", label: "Participación" },
    { name: "Trabajo en Grupo", label: "Trabajo en Grupo" },
    { name: "Presentación", label: "Presentación" }
  ];

  const getCurrentDateString = () => {
    return selectedDate || new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const addAssessment = async (typeName: string) => {
    const typeLabel = predefinedTypes.find(t => t.name === typeName);
    if (!typeLabel) {
      console.warn(`⚠️ Tipo no encontrado en predefinedTypes:`, typeName);
      return;
    }

    try {
      console.log('📝 Iniciando creación de evaluación...');
      console.log('  - typeName:', typeName);
      console.log('  - typeLabel:', typeLabel);
      console.log('  - assessmentTypeMap:', assessmentTypeMap);
      
      // Usar el UUID para el tipo de evaluación seleccionado
      const assessmentTypeUUID = assessmentTypeMap[typeLabel.name.toLowerCase()];
      console.log('  - assessmentTypeUUID:', assessmentTypeUUID);
      
      if (!assessmentTypeUUID) {
        console.error(`❌ UUID no encontrado para tipo: ${typeLabel.label}`);
        toast.error(`Tipo de evaluación "${typeLabel.label}" no encontrado`);
        return;
      }

      const newAssessment = {
        name: typeName,
        type: 'homework' as const,
        weight: 100,
        maxScore: 20,
        classId: classId,
        assessmentTypeId: assessmentTypeUUID,
        dueDate: new Date()
      };
      console.log('  - Enviando al backend:', newAssessment);

      const response = await apiClient.assessments.createAssessment(newAssessment);
      console.log('  - Respuesta del backend:', response);
      
      const createdAssessment = response?.data;
      
      if (createdAssessment) {
        console.log('✅ Evaluación creada exitosamente:', createdAssessment);
        const display = getAssessmentTypeDisplay(typeLabel.label);
        const assessment: Assessment = {
          id: createdAssessment.id,
          name: createdAssessment.name,
          type: createdAssessment.type,
          weight: createdAssessment.weight || 100,
          maxScore: createdAssessment.maxScore || 20,
          icon: display.icon,
          color: display.color
        };
        
        setSelectedAssessments(prev => [...prev, assessment]);
        if (onAssessmentsChange) {
          onAssessmentsChange([...selectedAssessments, assessment]);
        }
        toast.success(`${typeName} agregada`);
      } else {
        console.warn('⚠️ Respuesta sin data:', response);
        toast.error('No se recibieron datos de la evaluación creada');
      }
    } catch (error) {
      console.error('❌ Error al crear evaluación:', error);
      if (error instanceof Error) {
        console.error('  - Mensaje:', error.message);
        console.error('  - Stack:', error.stack);
      }
      toast.error('Error al crear evaluación');
    }
  };

  const addCustomAssessment = async () => {
    if (!customAssessmentName.trim()) {
      toast.error("Ingresa un nombre para la evaluación");
      return;
    }

    try {
      console.log('📝 Iniciando creación de evaluación personalizada...');
      console.log('  - Nombre:', customAssessmentName);
      console.log('  - assessmentTypeMap:', assessmentTypeMap);
      
      // Usar el UUID para "Tarea" como tipo de evaluación personalizada
      const assessmentTypeUUID = assessmentTypeMap['tarea'];
      console.log('  - assessmentTypeUUID para "tarea":', assessmentTypeUUID);
      
      if (!assessmentTypeUUID) {
        console.error('❌ UUID no encontrado para tipo "tarea"');
        toast.error("Tipo 'Tarea' no encontrado");
        return;
      }

      const newAssessment = {
        name: customAssessmentName,
        type: 'homework' as const,
        weight: 100,
        maxScore: 20,
        classId: classId,
        assessmentTypeId: assessmentTypeUUID,
        dueDate: new Date()
      };
      console.log('  - Enviando al backend:', newAssessment);

      const response = await apiClient.assessments.createAssessment(newAssessment);
      console.log('  - Respuesta del backend:', response);
      
      const createdAssessment = response?.data;
      
      if (createdAssessment) {
        console.log('✅ Evaluación personalizada creada exitosamente:', createdAssessment);
        const assessment: Assessment = {
          id: createdAssessment.id,
          name: createdAssessment.name,
          type: createdAssessment.type,
          weight: createdAssessment.weight || 100,
          maxScore: createdAssessment.maxScore || 20,
          icon: FileText,
          color: "bg-gray-100 text-gray-700"
        };
        
        setSelectedAssessments(prev => [...prev, assessment]);
        if (onAssessmentsChange) {
          onAssessmentsChange([...selectedAssessments, assessment]);
        }
        setCustomAssessmentName("");
        toast.success(`${customAssessmentName} agregada`);
      } else {
        console.warn('⚠️ Respuesta sin data:', response);
        toast.error('No se recibieron datos de la evaluación creada');
      }
    } catch (error) {
      console.error('❌ Error al crear evaluación personalizada:', error);
      if (error instanceof Error) {
        console.error('  - Mensaje:', error.message);
        console.error('  - Stack:', error.stack);
      }
      toast.error('Error al crear evaluación personalizada');
    }
  };

  const removeAssessment = async (id: string) => {
    try {
      await apiClient.assessments.deleteAssessment(id);
      setSelectedAssessments(prev => prev.filter(a => a.id !== id));
      if (onAssessmentsChange) {
        onAssessmentsChange(selectedAssessments.filter(a => a.id !== id));
      }
      toast.success("Evaluación eliminada");
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Error al eliminar evaluación');
    }
  };

  const updateAssessment = async (id: string, field: keyof Assessment, value: any) => {
    try {
      // Actualizar en el API
      await apiClient.assessments.updateAssessment(id, { [field]: value });
      
      // Actualizar en estado local
      setSelectedAssessments(prev =>
        prev.map(assessment =>
          assessment.id === id ? { ...assessment, [field]: value } : assessment
        )
      );
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast.error('Error al actualizar evaluación');
    }
  };

  const saveConfiguration = () => {
    if (selectedAssessments.length === 0) {
      toast.error("Selecciona al menos una evaluación");
      return;
    }

    // Validar que la suma de pesos sea 100
    const totalWeight = selectedAssessments.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight !== 100) {
      toast.error(`Los pesos deben sumar 100% (actual: ${totalWeight}%)`);
      return;
    }

    onAssessmentsChange(selectedAssessments);
    setIsDialogOpen(false);
    toast.success("Configuración de evaluaciones guardada");
  };

  const distributeWeightsEvenly = () => {
    if (selectedAssessments.length === 0) return;
    
    const weightPerAssessment = Math.floor(100 / selectedAssessments.length);
    const remainder = 100 % selectedAssessments.length;

    setSelectedAssessments(prev =>
      prev.map((assessment, index) => ({
        ...assessment,
        weight: weightPerAssessment + (index < remainder ? 1 : 0)
      }))
    );
  };

  const getWeightColor = (weight: number) => {
    if (weight > 40) return "text-red-600";
    if (weight > 25) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Evaluaciones del Día
          </h3>
          <p className="text-sm text-muted-foreground">{getCurrentDateString()}</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Configurar
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar Evaluaciones</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Tipos predefinidos */}
              <div>
                <Label className="text-sm font-medium">Tipos de Evaluación</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {predefinedTypes.map((type) => {
                    const display = getAssessmentTypeDisplay(type.label);
                    const Icon = display.icon;
                    const isSelected = selectedAssessments.some(a => a.name === type.name);
                    
                    return (
                      <Button
                        key={type.name}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="h-auto p-3 flex-col gap-1"
                        onClick={() => addAssessment(type.name)}
                        disabled={isSelected}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{type.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Evaluación personalizada */}
              <div className="space-y-2">
                <Label htmlFor="custom-assessment">Evaluación Personalizada</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-assessment"
                    placeholder="Ej: Quiz sorpresa"
                    value={customAssessmentName}
                    onChange={(e) => setCustomAssessmentName(e.target.value)}
                  />
                  <Button size="sm" onClick={addCustomAssessment}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Evaluaciones seleccionadas */}
              {selectedAssessments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Evaluaciones Configuradas</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={distributeWeightsEvenly}
                      className="text-xs"
                    >
                      Distribuir Pesos
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedAssessments.map((assessment) => {
                      const Icon = assessment.icon;
                      return (
                        <div key={assessment.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{assessment.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAssessment(assessment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Peso (%)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={assessment.weight}
                                onChange={(e) => updateAssessment(
                                  assessment.id, 
                                  'weight', 
                                  parseInt(e.target.value) || 0
                                )}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Puntaje Máx.</Label>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={assessment.maxScore}
                                onChange={(e) => updateAssessment(
                                  assessment.id, 
                                  'maxScore', 
                                  parseInt(e.target.value) || 20
                                )}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen de pesos */}
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Total de pesos:</span>
                      <span className={getWeightColor(selectedAssessments.reduce((sum, a) => sum + a.weight, 0))}>
                        {selectedAssessments.reduce((sum, a) => sum + a.weight, 0)}%
                      </span>
                    </div>
                    {selectedAssessments.reduce((sum, a) => sum + a.weight, 0) !== 100 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Los pesos deben sumar exactamente 100%
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={saveConfiguration} className="flex-1">
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vista de evaluaciones configuradas */}
      {selectedAssessments.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {selectedAssessments.map((assessment) => {
              const Icon = assessment.icon;
              return (
                <div key={assessment.id} className={`p-3 rounded-lg ${assessment.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{assessment.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {assessment.weight}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        /{assessment.maxScore}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {selectedAssessments.length} evaluación{selectedAssessments.length !== 1 ? 'es' : ''} configurada{selectedAssessments.length !== 1 ? 's' : ''} para hoy
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No hay evaluaciones configuradas para hoy
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Haz clic en "Configurar" para seleccionar las evaluaciones del día
          </p>
        </div>
      )}
    </Card>
  );
}