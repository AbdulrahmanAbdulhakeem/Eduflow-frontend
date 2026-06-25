import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BookOpen, Activity, Plus, Edit, Trash2 } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import CreateCourseModal from '../components/modals/CreateCourseModal';
import EditCourseModal from '../components/modals/EditCourseModal';
import { toast } from 'sonner';
import io from 'socket.io-client';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const socket = io('http://localhost:3000');

export default function LecturerDashboard() {
  const navigate = useNavigate();
  
  const { 
    lecturerCourses, 
    lecturerStudents,
    getLecturerCourses, 
    getLecturerStudents,
    deleteCourse,
    isLoading 
  } = useCourseStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [liveStudents, setLiveStudents] = useState<any[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    getLecturerCourses();
    getLecturerStudents();
  }, [getLecturerCourses, getLecturerStudents]);

  // WebSocket Real-time Student Activity
  useEffect(() => {
    socket.on('connect', () => console.log('✅ Connected to Live Students'));

    // Join lecturer monitoring room when course is selected
    if (selectedCourseId) {
      socket.emit('lecturer:join', selectedCourseId);
    }

    // Listen for live updates
    socket.on('presence:live_data', (students) => {
      console.log('📡 Live students received:', students);
      setLiveStudents(students || []);
    });

    return () => {
      socket.off('presence:live_data');
    };
  }, [selectedCourseId]);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setEditModalOpen(true);
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteCourse(id);
      toast.success("Course deleted successfully");
      getLecturerCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/lecturer/courses/${courseId}`);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time student monitoring</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Courses List */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>My Courses ({lecturerCourses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-12">Loading courses...</p>
                ) : lecturerCourses.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">No courses yet. Create one to begin.</p>
                ) : (
                  <div className="space-y-4">
                    {lecturerCourses.map((course) => (
                      <div
                        key={course.id}
                        className={`p-6 border rounded-2xl cursor-pointer transition-all hover:border-green-300 ${selectedCourseId === course.id ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}`}
                        onClick={() => handleSelectCourse(course.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-xl">{course.title}</h3>
                            <p className="text-green-600">{course.code} • Level {course.level}</p>
                          </div>
                          <Badge variant="outline">{course._count?.enrollments || 0} Students</Badge>
                        </div>

                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="flex gap-3 mt-6">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleViewCourse(course.id); }}
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Manage Materials
                          </Button>

                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditCourse(course); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>

                          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id, course.title); }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Students - Real-time Activity */}
          <div className="lg:col-span-5">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Live Students
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {selectedCourseId ? "Currently active in selected course" : "Select a course to monitor"}
                </p>
              </CardHeader>
              <CardContent>
                {liveStudents.length === 0 ? (
                  <p className="text-center py-20 text-gray-500">
                    {selectedCourseId ? "No students currently active" : "Select a course on the left to see live activity"}
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {liveStudents.map((student, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-medium text-green-700">
                            {student.name?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-green-600 font-medium">{student.currentAction}</p>
                          {student.materialTitle && (
                            <p className="text-gray-400 text-xs mt-1">{student.materialTitle}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Enrolled Students Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Enrolled Students ({lecturerStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Enrolled On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lecturerStudents.map((enrollment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{enrollment?.student?.name}</TableCell>
                    <TableCell>{enrollment?.student?.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{enrollment?.course?.code}</Badge>
                    </TableCell>
                    <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateCourseModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={getLecturerCourses}
      />

      <EditCourseModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        course={selectedCourse}
        onSuccess={getLecturerCourses}
      />
    </MainLayout>
  );
}