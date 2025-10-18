import { Home, CheckSquare, User, Settings } from "lucide-react";

interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  const tabs = [
    { id: "home", icon: Home, label: "Inicio" },
    { id: "tasks", icon: CheckSquare, label: "Tareas" },
    { id: "profile", icon: User, label: "Perfil" },
    { id: "settings", icon: Settings, label: "Config" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}