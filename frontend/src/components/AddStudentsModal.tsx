import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { Download, Upload, Plus, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

interface Student {
  id: string;
  name: string;
  lastName: string;
  age: number;
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
    name: "",
    lastName: "",
    age: ""
  });

  const generateExcelTemplate = () => {
    const templateData = [
      { Nombre: "Juan", Apellido: "Pérez", Edad: 15 },
      { Nombre: "María", Apellido: "García", Edad: 16 },
      { Nombre: "Carlos", Apellido: "López", Edad: 15 }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");
    
    // Ajustar el ancho de las columnas
    worksheet['!cols'] = [
      { width: 15 }, // Nombre
      { width: 15 }, // Apellido
      { width: 10 }  // Edad
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

        const importedStudents: Student[] = jsonData.map((row: any, index) => ({
          id: `imported_${Date.now()}_${index}`,
          name: row.Nombre || row.nombre || "",
          lastName: row.Apellido || row.apellido || "",
          age: parseInt(row.Edad || row.edad || "0")
        })).filter(student => student.name && student.lastName && student.age > 0);

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
    if (!manualStudent.name || !manualStudent.lastName || !manualStudent.age) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const age = parseInt(manualStudent.age);
    if (age < 5 || age > 25) {
      toast.error("La edad debe estar entre 5 y 25 años");
      return;
    }

    const newStudent: Student = {
      id: `manual_${Date.now()}`,
      name: manualStudent.name,
      lastName: manualStudent.lastName,
      age: age
    };

    setStudents(prev => [...prev, newStudent]);
    setManualStudent({ name: "", lastName: "", age: "" });
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
    setManualStudent({ name: "", lastName: "", age: "" });
    toast.success(`${students.length} estudiantes agregados a ${className}`);
    onClose();
  };

  const handleClose = () => {
    setStudents([]);
    setManualStudent({ name: "", lastName: "", age: "" });
    onClose();
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
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={manualStudent.name}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del estudiante"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={manualStudent.lastName}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Apellido del estudiante"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Edad</Label>
                    <Input
                      id="age"
                      type="number"
                      min="5"
                      max="25"
                      value={manualStudent.age}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Edad"
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
              <h4 className="font-medium">Estudiantes Agregados ({students.length})</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{student.name} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground">{student.age} años</p>
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