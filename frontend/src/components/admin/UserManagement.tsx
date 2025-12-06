import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Users, Shield, Loader } from "lucide-react";
import { apiClient } from "../../services/api";
import { tokenService } from "../../services/tokenService";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
  createdAt?: string;
  status?: 'active' | 'inactive';
}

interface UserManagementProps {
  onBack: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher" as "teacher" | "admin"
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }

      const response = await apiClient.users.getUsers();
      const usersData = response?.data || [];
      
      const mappedUsers = usersData.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'teacher',
        status: u.status || 'active',
        createdAt: u.createdAt || u.created_at
      }));
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    try {
      // Use the register API to create a new user with the appropriate role
      const response = await apiClient.auth.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role === 'admin' ? 'admin_entity' : 'teacher'
      });

      if (response?.success && response?.data) {
        toast.success(`${formData.role === 'admin' ? 'Administrador' : 'Profesor'} creado exitosamente`);
        setFormData({ name: "", email: "", password: "", role: "teacher" });
        setShowAddUserModal(false);
        await loadUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role
    });
    setShowAddUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!editingUser) return;

    try {
      const updateData: Record<string, any> = {
        name: formData.name,
        email: formData.email
      };
      
      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await apiClient.users.updateUser(editingUser.id, updateData);
      toast.success("Usuario actualizado exitosamente");
      setFormData({ name: "", email: "", password: "", role: "teacher" });
      setEditingUser(null);
      setShowAddUserModal(false);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await apiClient.users.deleteUser(userId);
        toast.success("Usuario eliminado exitosamente");
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error al eliminar usuario');
      }
    }
  };

  const closeModal = () => {
    setShowAddUserModal(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "teacher" });
  };

  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className="text-sm text-muted-foreground">Administrar profesores y administradores</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profesores</p>
              <p className="font-semibold">{teacherCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Administradores</p>
              <p className="font-semibold">{adminCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add User Button */}  
      <Button onClick={() => setShowAddUserModal(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Usuario
      </Button>

      {/* Users List */}
      <div className="space-y-3">
        <h3>Usuarios Registrados</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Cargando usuarios...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{user.name}</h4>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrador' : 'Profesor'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej. María González"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@colegio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña {editingUser ? '(dejar vacío para mantener)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={editingUser ? "Nueva contraseña" : "contraseña123"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as "teacher" | "admin" }))}>
                <SelectTrigger>
                  <SelectValue placeholder={formData.role === 'admin' ? 'Administrador' : 'Profesor'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Profesor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {editingUser ? 'Actualizar' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="h-20"></div>
    </div>
  );
}