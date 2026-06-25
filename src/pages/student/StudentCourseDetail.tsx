import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import MainLayout from "../../components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, BookOpen, Play, Loader2 } from "lucide-react";
import { useCourseStore } from "../../store/courseStore";
import { toast } from "sonner";
import socket from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

export default function StudentCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { currentCourse, getCourseById } = useCourseStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);

      try {
        await getCourseById(courseId);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    console.log(currentCourse);

    fetchCourse();
  }, [courseId, getCourseById]);

  useEffect(() => {
    if (courseId && user) {
      socket.emit('presence:initialize', {
        studentId: user.id,
        name: user.name,
        email: user.email,
        courseId,
      });
    }
  }, [courseId, user]);

  useEffect(() => {
    return () => {
      if (courseId) {
        socket.emit('presence:update_action', {
          courseId,
          action: "Left Course page"
        });
      }
    };
  }, [courseId]);

  const isEnrolled =
    currentCourse?.enrollmentStatus === "ENROLLED" ||
    currentCourse?.enrollments?.length > 0;

  const handleStudyNow = () => {
    if (!isEnrolled) {
      toast.error("You must enroll first to access the Study Arena.");
      return;
    }
    if (!currentCourse?.materials?.length) {
      toast.error("No materials available for this course yet.");
      return;
    }
    navigate(`/student/study/${courseId}`);
  };

  // Loading State
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
          <span className="ml-3 text-lg">Loading course details...</span>
        </div>
      </MainLayout>
    );
  }

  // Error State
  if (error || !currentCourse) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto mt-20 text-center">
          <h2 className="text-2xl font-semibold text-red-600">
            Course Not Found
          </h2>
          <p className="text-gray-600 mt-4">
            {error || "This course may not exist or you don't have access."}
          </p>
          <Button onClick={() => navigate("/student")} className="mt-6">
            Back to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/student")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold">{currentCourse.title}</h1>
            <p className="text-2xl text-green-600 mt-2">{currentCourse.code}</p>
          </div>

          <Badge variant="secondary" className="text-base px-5 py-2">
            {isEnrolled ? " Enrolled" : "Not Enrolled"}
          </Badge>
        </div>

        {currentCourse.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                {currentCourse.description}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Course Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-16">
            <BookOpen className="mx-auto h-20 w-20 text-green-600 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">
              Ready to Start Learning?
            </h3>
            <p className="text-gray-500 mb-10 max-w-md mx-auto">
              Access all materials and use the AI assistant while studying.
            </p>

            <div className="flex gap-4 justify-center">
              {isEnrolled && (
                <>
                  <Button
                    size="lg"
                    onClick={handleStudyNow}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="mr-3 h-5 w-5" />
                    Open Study Arena
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
