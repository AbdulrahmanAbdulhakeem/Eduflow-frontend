import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Users, Activity } from 'lucide-react';

export default function LecturerDashboard() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Lecturer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your teaching activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                My Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">4</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">87</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Students Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">14</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Student Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 py-16 text-center">
              Real-time student monitoring will appear here
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}