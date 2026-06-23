import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import api from "../api/axios";

type Material = {
  id: string;
  title: string;
  fileUrl: string;
  publicId?: string;
  type: string;
  createdAt: string;
};

type Course = {
  id: string;
  code: string;
  title: string;
  level: number;
  semester: number;
  description?: string;
  lecturerId: string;
  materials: Material[];
  _count?: {
    materials: number;
    enrollments: number;
  };
  createdAt: string;
};

interface CourseState {
  courses: Course[];
  lecturerCourses: Course[];
  currentCourse: Course | null;
  isLoading: boolean;
  error: string | null;

  // All required actions
  getCourses: () => Promise<void>; // For students (all available)
  getLecturerCourses: () => Promise<void>;
  getCourseById: (id: string) => Promise<void>;
  createCourse: (data: any) => Promise<void>;
  updateCourse: (id: string, data: any) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  enrollCourse: (courseCode: string) => Promise<void>;
  disenrollCourse: (courseCode: string) => Promise<void>;
  getLecturerStudents: () => Promise<void>;

  setCurrentCourse: (course: Course | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCourseStore = create<CourseState>()(
  immer((set) => ({
    courses: [],
    lecturerCourses: [],
    currentCourse: null,
    isLoading: false,
    error: null,

    getCourses: async () => {
      set((state) => {
        state.isLoading = true;
      });
      try {
        const res = await api.get("/api/v1/course");
        set((state) => {
          state.courses = res.data.data || res.data;
        });
      } catch (error: any) {
        set((state) => {
          state.error =
            error.response?.data?.error || "Failed to fetch courses";
        });
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    getLecturerCourses: async () => {
      set((state) => {
        state.isLoading = true;
      });
      try {
        const res = await api.get("/api/v1/course/mycourses");
        set((state) => {
          state.lecturerCourses = res.data.data || res.data;
        });
      } catch (error) {
        console.error(error);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },
    
    getLecturerStudents: async () => {
      try {
        const res = await api.get("/api/v1/course/mystudents");
        // You can store this in a separate state if needed, or just return it
        return res.data.data || res.data;
      } catch (error) {
        console.error("Failed to fetch lecturer students", error);
        return [];
      }
    },

    getCourseById: async (id: string) => {
      try {
        const res = await api.get(`/api/v1/course/${id}`);
        set((state) => {
          state.currentCourse = res.data.data || res.data;
        });
      } catch (error) {
        console.error("Failed to fetch course", error);
      }
    },

    createCourse: async (data) => {
      const res = await api.post("/api/v1/course/create", data);
      set((state) => {
        state.lecturerCourses.unshift(res.data.data);
      });
    },

    updateCourse: async (id: string, data) => {
      const res = await api.patch(`/api/v1/course/${id}`, data);
      set((state) => {
        const index = state.lecturerCourses.findIndex((c) => c.id === id);
        if (index !== -1) {
          state.lecturerCourses[index] = {
            ...state.lecturerCourses[index],
            ...res.data.data,
          };
        }
      });
    },

    deleteCourse: async (id: string) => {
      await api.delete(`/api/v1/course/${id}`);
      set((state) => {
        state.lecturerCourses = state.lecturerCourses.filter(
          (c) => c.id !== id,
        );
      });
    },

    enrollCourse: async (courseCode: string) => {
      await api.post("/api/v1/course/student/enroll", { courseCode });
    },

    disenrollCourse: async (courseCode: string) => {
      await api.post("/api/v1/course/student/disenroll", { courseCode });
    },

    setCurrentCourse: (course) =>
      set((state) => {
        state.currentCourse = course;
      }),
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),
  })),
);
