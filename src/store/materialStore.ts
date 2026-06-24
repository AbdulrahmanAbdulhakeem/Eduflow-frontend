import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import api from '../api/axios';

type Material = {
  id: string;
  title: string;
  fileUrl: string;
  publicId?: string;
  type: string;
  createdAt: string;
};

interface MaterialState {
  materials: Material[];
  currentMaterial: Material | null;
  isLoading: boolean;

  getCourseMaterials: (courseId: string) => Promise<void>;
  uploadMaterial: (courseId: string, formData: FormData) => Promise<void>;
  updateMaterial: (materialId: string, data: any) => Promise<void>;
  deleteMaterial: (materialId: string, courseId: string) => Promise<void>;
  setCurrentMaterial: (material: Material | null) => void;
}

export const useMaterialStore = create<MaterialState>()(
  immer((set) => ({
    materials: [],
    currentMaterial: null,
    isLoading: false,

    getCourseMaterials: async (courseId: string) => {
      set((state) => { state.isLoading = true; });
      try {
        const res = await api.get(`/api/v1/course/${courseId}/materials`);
        set((state) => { state.materials = res.data.data || res.data; });
      } catch (error) {
        console.error("Failed to fetch materials", error);
      } finally {
        set((state) => { state.isLoading = false; });
      }
    },

    uploadMaterial: async (courseId: string, formData: FormData) => {
      const res = await api.post(`/api/v1/course/${courseId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set((state) => {
        state.materials.unshift(res.data.data);
      });
    },

    updateMaterial: async (materialId: string, data: any) => {
      const res = await api.patch(`/api/v1/course/materials/${materialId}`, data);
      set((state) => {
        const index = state.materials.findIndex(m => m.id === materialId);
        if (index !== -1) {
          state.materials[index] = { ...state.materials[index], ...res.data.data };
        }
      });
    },

    deleteMaterial: async (materialId: string, courseId: string) => {
      await api.delete(`/api/v1/course/${courseId}/materials/${materialId}`);
      set((state) => {
        state.materials = state.materials.filter(m => m.id !== materialId);
      });
    },

    setCurrentMaterial: (material) => 
      set((state) => { state.currentMaterial = material; }),
  }))
);