import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../constants';
import { LayoutDashboard, BookOpen, UserCheck } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="w-64 border-r bg-white dark:bg-gray-900 pt-6 pb-8">
      <nav className="px-3 space-y-1">
        <Link
          to={`/${user.role.toLowerCase()}`}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive(`/${user.role.toLowerCase()}`)
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>

        {user.role === ROLES.LECTURER && (
          <>
            <Link
              to="/lecturer/courses"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <BookOpen className="h-5 w-5" />
              My Courses
            </Link>
            <Link
              to="/lecturer/live"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <UserCheck className="h-5 w-5" />
              Live Students
            </Link>
          </>
        )}

        {user.role === ROLES.STUDENT && (
          <Link
            to="/student/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <BookOpen className="h-5 w-5" />
            My Courses
          </Link>
        )}
      </nav>
    </div>
  );
}