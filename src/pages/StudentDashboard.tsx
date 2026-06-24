import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Eye, BookOpen, Loader2 } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { courses, getCourses, enrollCourse, disenrollCourse, isLoading } = useCourseStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({}); // courseCode -> isLoading

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const handleEnroll = async (courseCode: string) => {
    setLoadingActions(prev => ({ ...prev, [courseCode]: true }));
    try {
      await enrollCourse(courseCode);
      toast.success(`Successfully enrolled in ${courseCode}`);
      await getCourses(); // Refresh status
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to enroll");
    } finally {
      setLoadingActions(prev => ({ ...prev, [courseCode]: false }));
    }
  };

  const handleDisenroll = async (courseCode: string) => {
    if (!confirm(`Disenroll from ${courseCode}?`)) return;

    setLoadingActions(prev => ({ ...prev, [courseCode]: true }));
    try {
      await disenrollCourse(courseCode);
      toast.success(`Successfully disenrolled from ${courseCode}`);
      await getCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to disenroll");
    } finally {
      setLoadingActions(prev => ({ ...prev, [courseCode]: false }));
    }
  };

  const handleViewCourse = (course: any) => {
    if (course.enrollmentStatus === "NOT_ENROLLED") {
      toast.error("You must enroll first to access this course.");
      return;
    }
    navigate(`/student/courses/${course.id}`);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Welcome back, Student!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Discover and manage your courses</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Courses</CardTitle>
              <input
                type="text"
                placeholder="Search by title or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && courses.length === 0 ? (
              <p className="text-center py-12">Loading courses...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Lecturer</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => {
                    const isActionLoading = loadingActions[course.code] || false;
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.lecturer?.name || 'N/A'}</TableCell>
                        <TableCell>Level {course.level}</TableCell>
                        <TableCell>
                          <Badge variant={course.enrollmentStatus === "ENROLLED" ? "default" : "secondary"}>
                            {course.enrollmentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewCourse(course)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {course.enrollmentStatus === "ENROLLED" ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isActionLoading}
                              onClick={() => handleDisenroll(course.code)}
                            >
                              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disenroll"}
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              disabled={isActionLoading}
                              onClick={() => handleEnroll(course.code)}
                            >
                              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}