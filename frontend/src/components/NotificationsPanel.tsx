import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Bell, X, Check, Calendar, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../services/api";
import { tokenService } from "../services/tokenService";

interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'assignment' | 'general';
  read: boolean;
  createdAt: string;
}

interface NotificationsPanelProps {
  userId: string;
}

export function NotificationsPanel({ userId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      // Load from localStorage for now (notifications endpoint not yet implemented in backend)
      // TODO: Replace with API call when GET /notifications endpoint is available
      const allNotifications = JSON.parse(localStorage.getItem('asisVox_notifications') || '[]');
      const userNotifications = allNotifications
        .filter((n: Notification) => n.userId === userId)
        .sort((a: Notification, b: Notification) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to localStorage
      const allNotifications = JSON.parse(localStorage.getItem('asisVox_notifications') || '[]');
      const userNotifications = allNotifications
        .filter((n: Notification) => n.userId === userId)
        .sort((a: Notification, b: Notification) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter((n: Notification) => !n.read).length);
    }
  };

  const markAsRead = (notificationId: string) => {
    const allNotifications = JSON.parse(localStorage.getItem('asisVox_notifications') || '[]');
    const updatedNotifications = allNotifications.map((n: Notification) => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('asisVox_notifications', JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  const markAllAsRead = () => {
    const allNotifications = JSON.parse(localStorage.getItem('asisVox_notifications') || '[]');
    const updatedNotifications = allNotifications.map((n: Notification) => 
      n.userId === userId ? { ...n, read: true } : n
    );
    localStorage.setItem('asisVox_notifications', JSON.stringify(updatedNotifications));
    loadNotifications();
    toast.success("Todas las notificaciones marcadas como leídas");
  };

  const deleteNotification = (notificationId: string) => {
    const allNotifications = JSON.parse(localStorage.getItem('asisVox_notifications') || '[]');
    const updatedNotifications = allNotifications.filter((n: Notification) => n.id !== notificationId);
    localStorage.setItem('asisVox_notifications', JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowModal(true)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </DialogTitle>
              {notifications.length > 0 && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar todas
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {notifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No tienes notificaciones</p>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-3 ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'assignment' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          title="Marcar como leída"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        title="Eliminar"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="pt-3 border-t text-center text-sm text-muted-foreground">
              {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''} en total
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
