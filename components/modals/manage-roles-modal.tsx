"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/hooks/user-model-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Palette, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomRole {
  id: string;
  name: string;
  color: string;
  position: number;
  members: {
    member: {
      id: string;
      profile: { id: string; name: string; imageUrl: string };
    };
  }[];
}

interface ServerMember {
  id: string;
  profile: { id: string; name: string; imageUrl: string };
}

const PRESET_COLORS = [
  "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3",
  "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39",
  "#FFC107", "#FF9800", "#FF5722", "#795548", "#607D8B",
];

export const ManageRolesModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "manageRoles";
  const { server } = data;

  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("#5865F2");
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"roles" | "assign">("roles");

  useEffect(() => {
    if (isModalOpen && server?.id) {
      fetchRoles();
      fetchMembers();
    }
  }, [isModalOpen, server?.id]);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`/api/servers/${server?.id}/roles`);
      setRoles(res.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`/api/servers?id=${server?.id}`);
      setMembers(res.data.members || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    setIsLoading(true);
    try {
      await axios.post(`/api/servers/${server?.id}/roles`, {
        name: newRoleName,
        color: newRoleColor,
      });
      setNewRoleName("");
      fetchRoles();
    } catch (error) {
      console.error("Failed to create role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      await axios.delete(`/api/servers/${server?.id}/roles/${roleId}`);
      setSelectedRole(null);
      fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  const updateRole = async (roleId: string, name: string, color: string) => {
    try {
      await axios.patch(`/api/servers/${server?.id}/roles/${roleId}`, {
        name,
        color,
      });
      fetchRoles();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const assignRole = async (memberId: string) => {
    if (!selectedRole) return;
    try {
      await axios.post(
        `/api/servers/${server?.id}/roles/${selectedRole.id}/members`,
        { memberId }
      );
      fetchRoles();
    } catch (error) {
      console.error("Failed to assign role:", error);
    }
  };

  const removeRole = async (memberId: string) => {
    if (!selectedRole) return;
    try {
      await axios.delete(
        `/api/servers/${server?.id}/roles/${selectedRole.id}/members?memberId=${memberId}`
      );
      fetchRoles();
    } catch (error) {
      console.error("Failed to remove role:", error);
    }
  };

  const isMemberInRole = (memberId: string) => {
    return selectedRole?.members.some((m) => m.member.id === memberId);
  };

  const handleClose = () => {
    setSelectedRole(null);
    setView("roles");
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-[#313338] overflow-hidden max-w-lg">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-xl font-bold text-center">
            Manage Roles
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {view === "roles" ? (
            <>
              {/* Create new role */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="New role name..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="flex-1"
                />
                <div className="relative">
                  <input
                    type="color"
                    value={newRoleColor}
                    onChange={(e) => setNewRoleColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                </div>
                <Button
                  onClick={createRole}
                  disabled={isLoading || !newRoleName.trim()}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Color presets */}
              <div className="flex flex-wrap gap-1 mb-4">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewRoleColor(color)}
                    className={cn(
                      "w-6 h-6 rounded-full transition-transform hover:scale-110",
                      newRoleColor === color && "ring-2 ring-white ring-offset-2 ring-offset-[#313338]"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Roles list */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: role.color }}
                      />
                      <span
                        className="flex-1 font-medium"
                        style={{ color: role.color }}
                      >
                        {role.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {role.members.length} members
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRole(role);
                          setView("assign");
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRole(role.id)}
                        className="text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {roles.length === 0 && (
                    <p className="text-center text-zinc-500 py-8">
                      No custom roles yet. Create one above!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              {/* Assign members view */}
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" onClick={() => setView("roles")}>
                  ← Back
                </Button>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedRole?.color }}
                />
                <span style={{ color: selectedRole?.color }} className="font-semibold">
                  {selectedRole?.name}
                </span>
              </div>

              <ScrollArea className="h-[350px]">
                <div className="space-y-1">
                  {members.map((member) => {
                    const hasRole = isMemberInRole(member.id);
                    return (
                      <button
                        key={member.id}
                        onClick={() =>
                          hasRole ? removeRole(member.id) : assignRole(member.id)
                        }
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          hasRole && "bg-zinc-100 dark:bg-zinc-800"
                        )}
                      >
                        <img
                          src={member.profile.imageUrl}
                          alt={member.profile.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span
                          className="flex-1 text-left"
                          style={{ color: hasRole ? selectedRole?.color : undefined }}
                        >
                          {member.profile.name}
                        </span>
                        {hasRole && (
                          <Check
                            className="h-4 w-4"
                            style={{ color: selectedRole?.color }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
