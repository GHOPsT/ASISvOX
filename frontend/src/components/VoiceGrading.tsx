import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Mic, MicOff, Volume2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface VoiceGradingProps {
  students: Array<{ id: string; name: string; grade?: number }>;
  onGradeUpdate: (studentId: string, grade: number) => void;
}

export function VoiceGrading({ students, onGradeUpdate }: VoiceGradingProps) {
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
    
    // Buscar patrones como "juan pérez nota 8.5" o "maría garcía 9.0"
    const gradePatterns = [
      /(.+?)\s+nota\s+(\d+(?:\.\d+)?)/i,
      /(.+?)\s+(\d+(?:\.\d+)?)\s*puntos?/i,
      /(.+?)\s+calificación\s+(\d+(?:\.\d+)?)/i,
      /(.+?)\s+(\d+(?:\.\d+)?)$/i
    ];

    for (const pattern of gradePatterns) {
      const match = lowerCommand.match(pattern);
      if (match) {
        const studentName = match[1].trim();
        const grade = parseFloat(match[2]);

        if (grade >= 0 && grade <= 10) {
          // Buscar estudiante por nombre (coincidencia parcial)
          const student = students.find(s => 
            s.name.toLowerCase().includes(studentName) ||
            studentName.includes(s.name.toLowerCase().split(' ')[0]) ||
            studentName.includes(s.name.toLowerCase().split(' ').pop() || '')
          );

          if (student) {
            onGradeUpdate(student.id, grade);
            toast.success(`Nota ${grade} asignada a ${student.name}`);
            return;
          } else {
            toast.error(`No se encontró al estudiante: ${studentName}`);
            return;
          }
        } else {
          toast.error('La nota debe estar entre 0 y 10');
          return;
        }
      }
    }

    toast.error('Comando no reconocido. Intenta: "Juan Pérez nota 8.5"');
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
      const utterance = new SpeechSynthesisUtterance("Juan Pérez nota ocho punto cinco");
      utterance.lang = 'es-ES';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Asignación por Voz
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

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            className="flex-1 gap-2"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? "Detener" : "Iniciar"} Reconocimiento
          </Button>
        </div>

        {isListening && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Escuchando...</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Di: "Nombre del estudiante nota [0-10]"
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
              <li>• "Juan Pérez nota 8.5"</li>
              <li>• "María García 9.0"</li>
              <li>• "Pedro López calificación 7.5"</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}