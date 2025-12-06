import { useState, useEffect } from "react";
import { ArrowLeft, Download, FileText, FileSpreadsheet, Filter, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../services/api";
import { tokenService } from "../services/tokenService";
import { toast } from "sonner";

interface ReportsScreenProps {
  onBack?: () => void;
}

interface GradeData {
  studentId: string;
  studentName: string;
  grades: {
    [evaluationType: string]: {
      score: number;
      weight: number;
      date: string;
    }[];
  };
  finalGrade: number;
}

interface ClassReport {
  classId: string;
  className: string;
  subject: string;
  studentCount: number;
  grades: GradeData[];
  evaluationTypes: string[];
  averageByType: { [type: string]: number };
  classAverage: number;
}

export function ReportsScreen({ onBack }: ReportsScreenProps) {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current");
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");
  const [reportData, setReportData] = useState<ClassReport[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar reportes y clases al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const token = tokenService.getToken();
        if (token) {
          apiClient.setToken(token);
        }

        // Cargar clases
        const classesResponse = await apiClient.classes.getClasses();
        if (classesResponse.success && classesResponse.data) {
          const formattedClasses = classesResponse.data.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            subject: cls.subject
          }));
          setClasses(formattedClasses);
        }

        // Cargar reportes
        const reportsResponse = await apiClient.reports.getReports();
        if (reportsResponse.success && reportsResponse.data) {
          const formattedReports = reportsResponse.data.map((report: any) => ({
            classId: report.class_id,
            className: report.class_name || report.className,
            subject: report.subject,
            studentCount: report.student_count || report.studentCount || 0,
            grades: report.grades || [],
            evaluationTypes: report.evaluation_types || report.evaluationTypes || [],
            averageByType: report.average_by_type || report.averageByType || {},
            classAverage: report.class_average || report.classAverage || 0
          }));
          setReportData(formattedReports);
        }
      } catch (error) {
        console.error('Error loading reports:', error);
        toast.error('No se pudieron cargar los reportes');
        setReportData([]);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const evaluationTypes = [
    "Práctica Calificada",
    "Examen Parcial",
    "Test de Entrada",
    "Proyecto",
    "Participación"
  ];

  const exportToPDF = async (classReport: ClassReport) => {
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Título del reporte
      doc.setFontSize(20);
      doc.text(`Reporte de Notas - ${classReport.className}`, 20, 30);
      
      // Información de la clase
      doc.setFontSize(12);
      doc.text(`Materia: ${classReport.subject}`, 20, 50);
      doc.text(`Número de estudiantes: ${classReport.studentCount}`, 20, 60);
      doc.text(`Promedio de clase: ${classReport.classAverage.toFixed(1)}/20`, 20, 70);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 80);
      
      // Promedio por tipo de evaluación
      doc.setFontSize(14);
      doc.text('Promedio por Tipo de Evaluación:', 20, 100);
      
      let yPos = 110;
      doc.setFontSize(10);
      Object.entries(classReport.averageByType).forEach(([type, average]) => {
        doc.text(`${type}: ${average.toFixed(1)}/20`, 25, yPos);
        yPos += 10;
      });
      
      // Tabla de notas por estudiante
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Notas por Estudiante:', 20, yPos);
      yPos += 15;
      
      // Headers de la tabla
      doc.setFontSize(8);
      const headers = ['Estudiante', ...classReport.evaluationTypes, 'Promedio Final'];
      let xPos = 20;
      headers.forEach((header, index) => {
        doc.text(header, xPos, yPos);
        xPos += index === 0 ? 40 : 25;
      });
      
      yPos += 10;
      
      // Datos de estudiantes
      classReport.grades.forEach((student) => {
        if (yPos > 250) { // Nueva página si es necesario
          doc.addPage();
          yPos = 30;
        }
        
        xPos = 20;
        doc.text(student.studentName, xPos, yPos);
        xPos += 40;
        
        classReport.evaluationTypes.forEach((type) => {
          const gradeData = student.grades[type];
          const average = gradeData ? 
            gradeData.reduce((sum, g) => sum + g.score, 0) / gradeData.length : 
            0;
          doc.text(average.toFixed(1), xPos, yPos);
          xPos += 25;
        });
        
        doc.text(student.finalGrade.toFixed(1), xPos, yPos);
        yPos += 10;
      });
      
      // Guardar el PDF
      doc.save(`reporte_${classReport.className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("Reporte PDF generado exitosamente");
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error("Error al generar el reporte PDF");
    }
  };

  const exportToExcel = async (classReport: ClassReport) => {
    try {
      // Importar xlsx dinámicamente
      const XLSX = await import('xlsx');
      
      // Crear workbook
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Resumen de la clase
      const summaryData = [
        ['Reporte de Notas'],
        ['Clase', classReport.className],
        ['Materia', classReport.subject],
        ['Número de estudiantes', classReport.studentCount],
        ['Promedio de clase', classReport.classAverage.toFixed(1)],
        ['Fecha de generación', new Date().toLocaleDateString('es-ES')],
        [],
        ['Promedio por Tipo de Evaluación'],
        ...Object.entries(classReport.averageByType).map(([type, avg]) => [type, avg.toFixed(1)])
      ];
      
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWS, 'Resumen');
      
      // Hoja 2: Notas detalladas
      const detailHeaders = ['Estudiante', ...classReport.evaluationTypes, 'Promedio Final'];
      const detailData = [
        detailHeaders,
        ...classReport.grades.map(student => {
          const row = [student.studentName];
          classReport.evaluationTypes.forEach(type => {
            const gradeData = student.grades[type];
            const average = gradeData ? 
              gradeData.reduce((sum, g) => sum + g.score, 0) / gradeData.length : 
              0;
            row.push(average.toFixed(1));
          });
          row.push(student.finalGrade.toFixed(1));
          return row;
        })
      ];
      
      const detailWS = XLSX.utils.aoa_to_sheet(detailData);
      XLSX.utils.book_append_sheet(wb, detailWS, 'Notas Detalladas');
      
      // Hoja 3: Notas por tipo de evaluación
      classReport.evaluationTypes.forEach(type => {
        const typeData = [
          [type],
          ['Estudiante', 'Nota', 'Peso', 'Fecha'],
          ...classReport.grades.flatMap(student => 
            student.grades[type]?.map(grade => [
              student.studentName,
              grade.score,
              `${grade.weight}%`,
              grade.date
            ]) || []
          )
        ];
        
        const typeWS = XLSX.utils.aoa_to_sheet(typeData);
        XLSX.utils.book_append_sheet(wb, typeWS, type.replace(/\s+/g, '_'));
      });
      
      // Descargar el archivo
      XLSX.writeFile(wb, `reporte_${classReport.className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success("Reporte Excel generado exitosamente");
    } catch (error) {
      console.error('Error generando Excel:', error);
      toast.error("Error al generar el reporte Excel");
    }
  };

  const handleExport = (format: string, classReport: ClassReport) => {
    if (format === 'pdf') {
      exportToPDF(classReport);
    } else if (format === 'excel') {
      exportToExcel(classReport);
    }
  };

  const selectedClassData = selectedClass === "all" ? 
    reportData : 
    reportData.filter(c => c.classId === selectedClass);

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h2 className="text-foreground">Reportes de Notas</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Filtros */}
        <Card className="p-4">
          <h3 className="mb-4">Filtros de Reporte</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Clase</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar clase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las clases</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Período Actual</SelectItem>
                    <SelectItem value="previous">Período Anterior</SelectItem>
                    <SelectItem value="all">Todos los Períodos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Reportes por clase */}
        {selectedClassData.map((classReport) => (
          <Card key={classReport.classId} className="p-4">
            <div className="space-y-4">
              {/* Header de clase */}
              <div className="flex items-center justify-between">
                <div>
                  <h3>{classReport.className}</h3>
                  <p className="text-muted-foreground">{classReport.subject}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf', classReport)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('excel', classReport)}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </Button>
                </div>
              </div>

              {/* Estadísticas de clase */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Estudiantes</p>
                  <p className="text-2xl font-medium">{classReport.studentCount}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Promedio de Clase</p>
                  <p className="text-2xl font-medium">{classReport.classAverage.toFixed(1)}/20</p>
                </div>
              </div>

              {/* Tabs para diferentes vistas */}
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Resumen</TabsTrigger>
                  <TabsTrigger value="by-type">Por Tipo</TabsTrigger>
                  <TabsTrigger value="detailed">Detallado</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <h4>Promedio por Tipo de Evaluación</h4>
                  <div className="space-y-2">
                    {Object.entries(classReport.averageByType).map(([type, average]) => (
                      <div key={type} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{type}</span>
                        <Badge variant="outline">{average.toFixed(1)}/20</Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="by-type" className="space-y-4">
                  <div className="space-y-4">
                    {classReport.evaluationTypes.map((type) => (
                      <div key={type} className="space-y-2">
                        <h4>{type}</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Estudiante</TableHead>
                              <TableHead>Nota</TableHead>
                              <TableHead>Fecha</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classReport.grades.map((student) => (
                              student.grades[type]?.map((grade, index) => (
                                <TableRow key={`${student.studentId}-${index}`}>
                                  <TableCell>{student.studentName}</TableCell>
                                  <TableCell>{grade.score}/20</TableCell>
                                  <TableCell>{new Date(grade.date).toLocaleDateString('es-ES')}</TableCell>
                                </TableRow>
                              ))
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        {classReport.evaluationTypes.map((type) => (
                          <TableHead key={type}>{type}</TableHead>
                        ))}
                        <TableHead>Promedio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classReport.grades.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell>{student.studentName}</TableCell>
                          {classReport.evaluationTypes.map((type) => {
                            const gradeData = student.grades[type];
                            const average = gradeData ? 
                              gradeData.reduce((sum, g) => sum + g.score, 0) / gradeData.length : 
                              0;
                            return (
                              <TableCell key={type}>
                                {average > 0 ? `${average.toFixed(1)}/20` : 'N/A'}
                              </TableCell>
                            );
                          })}
                          <TableCell>
                            <Badge variant="outline">
                              {student.finalGrade.toFixed(1)}/20
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        ))}

        {selectedClassData.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay datos disponibles para los filtros seleccionados.</p>
          </Card>
        )}

        <div className="h-20"></div>
      </div>
    </div>
  );
}