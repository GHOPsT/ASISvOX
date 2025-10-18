import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Plus, Filter } from "lucide-react";

export function TasksScreen() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Revisar presentación del proyecto", completed: false, priority: "alta", category: "Trabajo" },
    { id: 2, title: "Comprar ingredientes para cena", completed: false, priority: "media", category: "Personal" },
    { id: 3, title: "Llamar al dentista", completed: true, priority: "baja", category: "Salud" },
    { id: 4, title: "Actualizar CV", completed: false, priority: "media", category: "Trabajo" },
    { id: 5, title: "Hacer ejercicio", completed: true, priority: "alta", category: "Salud" },
    { id: 6, title: "Leer libro", completed: false, priority: "baja", category: "Personal" },
  ]);

  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        title: newTask,
        completed: false,
        priority: "media",
        category: "Personal"
      };
      setTasks([task, ...tasks]);
      setNewTask("");
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "destructive";
      case "media": return "secondary";
      case "baja": return "outline";
      default: return "secondary";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Trabajo": return "bg-blue-100 text-blue-800";
      case "Personal": return "bg-green-100 text-green-800";
      case "Salud": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Add Task Section */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Agregar nueva tarea..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            className="flex-1"
          />
          <Button onClick={addTask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todas ({tasks.length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pendientes ({tasks.filter(t => !t.completed).length})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completadas ({tasks.filter(t => t.completed).length})
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <p className={`${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                    {task.priority}
                  </Badge>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {filter === "all" ? "No hay tareas" : 
           filter === "completed" ? "No hay tareas completadas" :
           "No hay tareas pendientes"}
        </div>
      )}
    </div>
  );
}