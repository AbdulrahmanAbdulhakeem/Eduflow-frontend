import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Clock, Award } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Continue your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Courses Enrolled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">6</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Hours Studied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">54</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">82%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 py-12 text-center">
              Your enrolled courses will appear here
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}