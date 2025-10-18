import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "./ui/badge";
import { Mic, MicOff, Volume2, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  attendance?: boolean;
}

interface VoiceAttendanceProps {
  students: Array<Student>;
  onAttendanceUpdate: (studentId: string, isPresent: boolean) => void;
}

export function VoiceAttendance({ students, onAttendanceUpdate }: VoiceAttendanceProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [lastCommand, setLastCommand] = useState("");

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        setIsListening(false);
        toast.error('Error en el reconocimiento de voz');
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    setLastCommand(command);
    
    // Patrones para reconocer comandos de asistencia
    const attendancePatterns = [
      /(.+?)\s+(presente|aquí|asistió)/i,
      /(.+?)\s+(ausente|falta|no\s+vino|no\s+asistió)/i,
      /presente\s+(.+)/i,
      /ausente\s+(.+)/i,
      /(.+?)\s+está\s+(presente|aquí)/i,
      /(.+?)\s+no\s+está/i,
      /(.+?)\s+faltó/i
    ];

    for (const pattern of attendancePatterns) {
      const match = lowerCommand.match(pattern);
      if (match) {
        let studentName = '';
        let isPresent = false;

        // Determinar el nombre del estudiante y el estado de asistencia
        if (pattern.source.includes('presente|aquí|asistió')) {
          studentName = match[1].trim();
          isPresent = true;
        } else if (pattern.source.includes('ausente|falta|no')) {
          studentName = match[1].trim();
          isPresent = false;
        } else if (pattern.source.includes('presente\\s+(.+)')) {
          studentName = match[1].trim();
          isPresent = true;
        } else if (pattern.source.includes('ausente\\s+(.+)')) {
          studentName = match[1].trim();
          isPresent = false;
        } else if (pattern.source.includes('está\\s+(presente|aquí)')) {
          studentName = match[1].trim();
          isPresent = true;
        } else if (pattern.source.includes('no\\s+está') || pattern.source.includes('faltó')) {
          studentName = match[1].trim();
          isPresent = false;
        }

        // Buscar estudiante por nombre (coincidencia parcial)
        const student = students.find(s => 
          s.name.toLowerCase().includes(studentName) ||
          studentName.includes(s.name.toLowerCase().split(' ')[0]) ||
          studentName.includes(s.name.toLowerCase().split(' ').pop() || '')
        );

        if (student) {
          onAttendanceUpdate(student.id, isPresent);
          toast.success(`${student.name} marcado como ${isPresent ? 'presente' : 'ausente'}`);
          return;
        } else {
          toast.error(`No se encontró al estudiante: ${studentName}`);
          return;
        }
      }
    }

    // Comandos globales
    if (lowerCommand.includes('todos presentes') || lowerCommand.includes('todos están')) {
      students.forEach(student => {
        onAttendanceUpdate(student.id, true);
      });
      toast.success('Todos los estudiantes marcados como presentes');
      return;
    }

    if (lowerCommand.includes('pasar lista') || lowerCommand.includes('comenzar asistencia')) {
      toast.info('Iniciando toma de asistencia. Di el nombre del estudiante seguido de "presente" o "ausente"');
      return;
    }

    toast.error('Comando no reconocido. Intenta: "Juan Pérez presente" o "María García ausente"');
  };

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setTranscript("");
      recognition.start();
    } else {
      toast.error('Reconocimiento de voz no soportado en este navegador');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const playExample = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Juan Pérez presente. María García ausente.");
      utterance.lang = 'es-ES';
      speechSynthesis.speak(utterance);
    }
  };

  const markAllPresent = () => {
    students.forEach(student => {
      onAttendanceUpdate(student.id, true);
    });
    toast.success('Todos los estudiantes marcados como presentes');
  };

  const markAllAbsent = () => {
    students.forEach(student => {
      onAttendanceUpdate(student.id, false);
    });
    toast.success('Todos los estudiantes marcados como ausentes');
  };

  const getAttendanceStats = () => {
    const presentCount = students.filter(s => s.attendance === true).length;
    const absentCount = students.filter(s => s.attendance === false).length;
    const pendingCount = students.filter(s => s.attendance === undefined).length;
    
    return { presentCount, absentCount, pendingCount };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Asistencia por Voz
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={playExample}
            className="gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Ejemplo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-700">{stats.presentCount}</p>
            <p className="text-xs text-green-600">Presentes</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <p className="text-lg font-semibold text-red-700">{stats.absentCount}</p>
            <p className="text-xs text-red-600">Ausentes</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-semibold text-gray-700">{stats.pendingCount}</p>
            <p className="text-xs text-gray-600">Pendientes</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              className="flex-1 gap-2"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Detener" : "Iniciar"} Asistencia
            </Button>
          </div>

          {isListening && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Escuchando...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Di: "Nombre del estudiante presente/ausente"
              </p>
            </div>
          )}

          {transcript && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Último comando:</p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Comandos de ejemplo:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• "Juan Pérez presente"</li>
                <li>• "María García ausente"</li>
                <li>• "Pedro López falta"</li>
                <li>• "Ana está presente"</li>
                <li>• "Todos presentes"</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllPresent}
            className="gap-2"
          >
            ✅ Todos Presentes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAbsent}
            className="gap-2"
          >
            ❌ Todos Ausentes
          </Button>
        </div>
      </Card>
    </div>
  );
}