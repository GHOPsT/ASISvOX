import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Eye, Users, Building2, Mail, Phone } from "lucide-react";
import { tokenService } from "../../services/tokenService";

interface Entity {
  id: string;
  name: string;
  code: string;
  address?: string;
  representativeName?: string;
  representativeEmail?: string;
  representativePhone?: string;
  institutionalEmail?: string;
  isActive: boolean;
  createdAt?: string;
}

interface EntityUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EntityManagementProps {
  onBack: () => void;
}

export function EntityManagement({ onBack }: EntityManagementProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [entityUsers, setEntityUsers] = useState<EntityUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [showAddUserToEntityModal, setShowAddUserToEntityModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    representativeName: "",
    representativeEmail: "",
    representativePhone: "",
    institutionalEmail: "",
  });

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const token = tokenService.getToken();
      const response = await fetch("http://localhost:3001/api/entities", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data?.data) {
        setEntities(data.data);
      }
    } catch (error) {
      console.error("Error cargando entidades:", error);
      toast.error("Error al cargar entidades");
    } finally {
      setLoading(false);
    }
  };

  const loadEntityUsers = async (entityId: string) => {
    try {
      setLoading(true);
      const token = tokenService.getToken();
      const response = await fetch(`http://localhost:3001/api/entities/${entityId}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data?.data) {
        setEntityUsers(data.data);
      }
    } catch (error) {
      console.error("Error cargando usuarios de entidad:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEntity = async (entity: Entity) => {
    setSelectedEntity(entity);
    await loadEntityUsers(entity.id);
  };

  const handleAddEntity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast.error("Nombre y código son requeridos");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        code: formData.code,
        address: formData.address || null,
        representativeName: formData.representativeName || null,
        representativeEmail: formData.representativeEmail || null,
        representativePhone: formData.representativePhone || null,
        institutionalEmail: formData.institutionalEmail || null,
        isActive: true,
      };

      const token = tokenService.getToken();
      const url = editingEntity
        ? `http://localhost:3001/api/entities/${editingEntity.id}`
        : "http://localhost:3001/api/entities";
      const method = editingEntity ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data?.success) {
        toast.success(
          editingEntity
            ? "Entidad actualizada exitosamente"
            : "Entidad creada exitosamente"
        );
        await loadEntities();
        setShowAddEntityModal(false);
        setEditingEntity(null);
        setFormData({
          name: "",
          code: "",
          address: "",
          representativeName: "",
          representativeEmail: "",
          representativePhone: "",
          institutionalEmail: "",
        });
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al guardar entidad");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity);
    setFormData({
      name: entity.name,
      code: entity.code,
      address: entity.address || "",
      representativeName: entity.representativeName || "",
      representativeEmail: entity.representativeEmail || "",
      representativePhone: entity.representativePhone || "",
      institutionalEmail: entity.institutionalEmail || "",
    });
    setShowAddEntityModal(true);
  };

  const handleDeleteEntity = async (entityId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta entidad?")) return;

    try {
      setLoading(true);
      const token = tokenService.getToken();
      const response = await fetch(`http://localhost:3001/api/entities/${entityId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data?.success) {
        toast.success("Entidad eliminada exitosamente");
        await loadEntities();
        if (selectedEntity?.id === entityId) {
          setSelectedEntity(null);
          setEntityUsers([]);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al eliminar entidad");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserFromEntity = async (entityId: string, userId: string) => {
    if (!confirm("¿Estás seguro de que deseas remover este usuario?")) return;

    try {
      setLoading(true);
      const token = tokenService.getToken();
      const response = await fetch(
        `http://localhost:3001/api/entities/${entityId}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();

      if (data?.success) {
        toast.success("Usuario removido exitosamente");
        if (selectedEntity) {
          await loadEntityUsers(selectedEntity.id);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al remover usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedEntity ? selectedEntity.name : "Gestión de Entidades"}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedEntity
                ? "Ver y gestionar usuarios de la entidad"
                : "Administra todas las entidades del sistema"}
            </p>
          </div>
        </div>
        {!selectedEntity && (
          <Button
            onClick={() => {
              setEditingEntity(null);
              setFormData({
                name: "",
                code: "",
                address: "",
                representativeName: "",
                representativeEmail: "",
                representativePhone: "",
                institutionalEmail: "",
              });
              setShowAddEntityModal(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nueva Entidad
          </Button>
        )}
        {selectedEntity && (
          <Button
            onClick={() => setSelectedEntity(null)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Entidades
          </Button>
        )}
      </div>

      {/* Main Content */}
      {!selectedEntity ? (
        // Entities List
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando entidades...
            </div>
          ) : entities.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay entidades aún</p>
            </Card>
          ) : (
            entities.map((entity) => (
              <Card
                key={entity.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectEntity(entity)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {entity.name}
                      </h3>
                      <Badge
                        variant={entity.isActive ? "default" : "secondary"}
                      >
                        {entity.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Código: <span className="font-mono">{entity.code}</span>
                    </p>
                    {entity.address && (
                      <p className="text-sm text-gray-600 mb-2">
                        📍 {entity.address}
                      </p>
                    )}
                    {entity.institutionalEmail && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {entity.institutionalEmail}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEntity(entity);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntity(entity.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        // Entity Users
        <div className="space-y-6">
          {/* Entity Details Card */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedEntity.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Código</p>
                <p className="text-lg font-mono font-semibold text-gray-900">
                  {selectedEntity.code}
                </p>
              </div>
              {selectedEntity.representativeName && (
                <div>
                  <p className="text-sm text-gray-600">Representante</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedEntity.representativeName}
                  </p>
                </div>
              )}
              {selectedEntity.representativeEmail && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedEntity.representativeEmail}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Users Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuarios de la Entidad
              </h3>
              <Button
                onClick={() => setShowAddUserToEntityModal(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Agregar Usuario
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando usuarios...
              </div>
            ) : entityUsers.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay usuarios en esta entidad</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {entityUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <Badge className="mt-2" variant="outline">
                          {user.role}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (selectedEntity) {
                            handleRemoveUserFromEntity(
                              selectedEntity.id,
                              user.id
                            );
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Entity Modal */}
      <Dialog open={showAddEntityModal} onOpenChange={setShowAddEntityModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? "Editar Entidad" : "Nueva Entidad"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddEntity} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre de la entidad"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Código único"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Dirección"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="repName">Nombre del Representante</Label>
              <Input
                id="repName"
                value={formData.representativeName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    representativeName: e.target.value,
                  })
                }
                placeholder="Nombre"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="repEmail">Email del Representante</Label>
              <Input
                id="repEmail"
                type="email"
                value={formData.representativeEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    representativeEmail: e.target.value,
                  })
                }
                placeholder="email@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="repPhone">Teléfono del Representante</Label>
              <Input
                id="repPhone"
                value={formData.representativePhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    representativePhone: e.target.value,
                  })
                }
                placeholder="Teléfono"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="instEmail">Email Institucional</Label>
              <Input
                id="instEmail"
                type="email"
                value={formData.institutionalEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    institutionalEmail: e.target.value,
                  })
                }
                placeholder="institucion@example.com"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddEntityModal(false);
                  setEditingEntity(null);
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
