import { Bell, Menu, Search } from "lucide-react";
import { Button } from "./ui/button";

interface MobileHeaderProps {
  title: string;
  showSearch?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
}

export function MobileHeader({ 
  title, 
  showSearch = false, 
  showMenu = false, 
  showNotifications = true 
}: MobileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-background border-b sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {showMenu && (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {showSearch && (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="h-5 w-5" />
          </Button>
        )}
        {showNotifications && (
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>
        )}
      </div>
    </div>
  );
}