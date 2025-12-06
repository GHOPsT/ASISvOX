import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { Download, Upload, Plus, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  identification_number?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
}

interface AddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (students: Student[]) => void;
  classId: string;
  className: string;
}

export function AddStudentsModal({ isOpen, onClose, onSave, classId, className }: AddStudentsModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [manualStudent, setManualStudent] = useState({
    first_name: "",
    last_name: "",
    identification_number: "",
    date_of_birth: "",
    gender: ""
  });

  const generateExcelTemplate = () => {
    const templateData = [
      { 
        Nombre: "Juan", 
        Apellido: "Pérez", 
        Documento: "12345678",
        Sexo: "H",
        FechaNacimiento: "2008-05-15"
      },
      { 
        Nombre: "María", 
        Apellido: "García", 
        Documento: "87654321",
        Sexo: "M",
        FechaNacimiento: "2009-03-20"
      },
      { 
        Nombre: "Carlos", 
        Apellido: "López", 
        Documento: "11223344",
        Sexo: "H",
        FechaNacimiento: "2008-07-10"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");
    
    // Ajustar el ancho de las columnas
    worksheet['!cols'] = [
      { width: 15 }, // Nombre
      { width: 15 }, // Apellido
      { width: 15 }, // Documento
      { width: 12 }, // Sexo
      { width: 18 }  // FechaNacimiento
    ];

    XLSX.writeFile(workbook, `Plantilla_Estudiantes_${className.replace(/\s+/g, '_')}.xlsx`);
    toast.success("Plantilla descargada correctamente");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedStudents: Student[] = jsonData.map((row: any, index) => {
          let gender: "male" | "female" | "other" | undefined;
          const sexo = (row.Sexo || row.sexo || "").toUpperCase().trim();
          if (sexo === "H") gender = "male";
          else if (sexo === "M") gender = "female";
          else if (sexo === "male") gender = "male";
          else if (sexo === "female") gender = "female";
          
          return {
            id: `imported_${Date.now()}_${index}`,
            first_name: row.Nombre || row.nombre || "",
            last_name: row.Apellido || row.apellido || "",
            identification_number: row.Documento || row.documento || "",
            gender: gender,
            date_of_birth: row.FechaNacimiento || row.fechaNacimiento || ""
          };
        }).filter(student => student.first_name && student.last_name);

        if (importedStudents.length === 0) {
          toast.error("No se encontraron estudiantes válidos en el archivo");
          return;
        }

        setStudents(prev => [...prev, ...importedStudents]);
        toast.success(`${importedStudents.length} estudiantes importados correctamente`);
      } catch (error) {
        toast.error("Error al leer el archivo. Verifica que sea un archivo Excel válido.");
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Limpiar el input
    event.target.value = "";
  };

  const addManualStudent = () => {
    if (!manualStudent.first_name || !manualStudent.last_name) {
      toast.error("Nombre y apellido son requeridos");
      return;
    }

    if (!manualStudent.identification_number) {
      toast.error("Documento de identidad es requerido");
      return;
    }

    // Verificar duplicado por documento
    const isDuplicate = students.some(s => s.identification_number === manualStudent.identification_number);
    if (isDuplicate) {
      toast.error(`El documento ${manualStudent.identification_number} ya fue agregado`);
      return;
    }

    const newStudent: Student = {
      id: `manual_${Date.now()}`,
      first_name: manualStudent.first_name,
      last_name: manualStudent.last_name,
      identification_number: manualStudent.identification_number,
      gender: (manualStudent.gender || undefined) as "male" | "female" | "other" | undefined,
      date_of_birth: manualStudent.date_of_birth || undefined
    };

    setStudents(prev => [...prev, newStudent]);
    setManualStudent({ first_name: "", last_name: "", identification_number: "", date_of_birth: "", gender: "" });
    toast.success("Estudiante agregado");
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  const handleSave = () => {
    if (students.length === 0) {
      toast.error("Agrega al menos un estudiante");
      return;
    }

    onSave(students);
    setStudents([]);
    setManualStudent({ first_name: "", last_name: "", identification_number: "", date_of_birth: "", gender: "" });
    toast.success(`${students.length} estudiantes agregados a ${className}`);
    onClose();
  };

  const handleClose = () => {
    setStudents([]);
    setManualStudent({ first_name: "", last_name: "", identification_number: "", date_of_birth: "", gender: "" });
    onClose();
  };

  const getGenderLabel = (gender?: string) => {
    switch(gender) {
      case 'male': return 'H';
      case 'female': return 'M';
      case 'other': return 'O';
      default: return '-';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Estudiantes a {className}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="excel" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="excel">Desde Excel</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="excel" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <h4 className="font-medium">1. Descargar Plantilla</h4>
                <p className="text-sm text-muted-foreground">
                  Descarga la plantilla Excel y complétala con los datos de los estudiantes
                </p>
                <Button onClick={generateExcelTemplate} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <h4 className="font-medium">2. Cargar Archivo</h4>
                <p className="text-sm text-muted-foreground">
                  Selecciona el archivo Excel con los datos completados
                </p>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <h4 className="font-medium">Agregar Estudiante</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                      id="first_name"
                      value={manualStudent.first_name}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Nombre del estudiante"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Apellido *</Label>
                    <Input
                      id="last_name"
                      value={manualStudent.last_name}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Apellido del estudiante"
                    />
                  </div>
                  <div>
                    <Label htmlFor="identification">Documento de Identidad *</Label>
                    <Input
                      id="identification"
                      value={manualStudent.identification_number}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, identification_number: e.target.value }))}
                      placeholder="Cédula o documento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Sexo</Label>
                    <Select value={manualStudent.gender} onValueChange={(value) => setManualStudent(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Selecciona sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">H - Hombre</SelectItem>
                        <SelectItem value="female">M - Mujer</SelectItem>
                        <SelectItem value="other">O - Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={manualStudent.date_of_birth}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    />
                  </div>
                  <Button onClick={addManualStudent} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Estudiante
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {students.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">Estudiantes Agregados ({students.length}/30)</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.identification_number && `Doc: ${student.identification_number}`}
                        {student.gender && ` | ${getGenderLabel(student.gender)}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeStudent(student.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={students.length === 0}>
            Guardar ({students.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}