import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Search, Eye, Edit, Trash2, Users, UserCheck, UserStar } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { toast } from 'sonner';
import CreateUserModal from '@/components/modals/CreateUserModal';
import EditUserModal from '@/components/modals/EditUserModal';
import ViewUserModal from '@/components/modals/ViewUserModal';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [lecturerModalOpen, setLecturerModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { users, fetchAllUsers, deleteUser, isLoading } = useUserStore();

  // Fetch users
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Calculate counts
  const studentCount = users.filter(u => u.role === 'STUDENT').length;
  const lecturerCount = users.filter(u => u.role === 'LECTURER').length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (user: any) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEdit = (user: any) => {
    if (user.role === 'ADMIN') {
      toast.error("You cannot edit another Admin's profile.");
      return;
    }
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDelete = async (user: any) => {
    if (user.role === 'ADMIN') {
      toast.error("You cannot delete another Admin.");
      return;
    }
    if (!confirm(`Delete user ${user.name || user.email}?`)) return;

    try {
      await deleteUser(user.id);
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Total Students</CardTitle>
              <Users className="h-6 w-6 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-green-600">{studentCount}</p>
              <p className="text-sm text-gray-500 mt-2">Registered Students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Total Lecturers</CardTitle>
              <UserCheck className="h-6 w-6 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-green-600">{lecturerCount}</p>
              <p className="text-sm text-gray-500 mt-2">Active Lecturers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Total Admin</CardTitle>
              <UserStar className="h-6 w-6 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-green-600">{adminCount}</p>
              <p className="text-sm text-gray-500 mt-2">Registered Admin(s)</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Management Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all platform users</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setStudentModalOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Student
            </Button>
            <Button onClick={() => setLecturerModalOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Lecturer
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Users ({users.length})</CardTitle>
              <div className="relative w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {user.name?.[0] || user.email[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.level || '—'}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.role !== 'ADMIN' && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        userType="student"
        onSuccess={() => window.location.reload()}
      />

      <CreateUserModal
        isOpen={lecturerModalOpen}
        onClose={() => setLecturerModalOpen(false)}
        userType="lecturer"
        onSuccess={() => window.location.reload()}
      />

      <ViewUserModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
        onSuccess={() => window.location.reload()}
      />
    </MainLayout>
  );
}