import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useCourseStore } from '../../store/courseStore';
import { useMaterialStore } from '../../store/materialStore';
import { Upload, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const { currentCourse, getCourseById } = useCourseStore();
  const { materials, getCourseMaterials, deleteMaterial,isLoading } = useMaterialStore();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  useEffect(() => {
    if (courseId) {
      getCourseById(courseId);
      getCourseMaterials(courseId);
    }
  }, [courseId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !courseId) return;

    setUploading(true);
    setUploadProgress("Uploading...");

    const formData = new FormData();
    formData.append('materialFile', file);
    formData.append('title', file.name);

    try {
      await useMaterialStore.getState().uploadMaterial(courseId, formData);
      toast.success("Material uploaded successfully!");
      setUploadProgress("Upload complete!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload material");
      setUploadProgress("Upload failed");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!courseId) return;
    if (!confirm("Delete this material?")) return;

    try {
      await deleteMaterial(materialId, courseId);
      toast.success("Material deleted successfully");
    } catch (error) {
      toast.error("Failed to delete material");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/lecturer')} 
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {currentCourse && (
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold">{currentCourse.title}</h1>
                <p className="text-green-600 text-2xl mt-1">{currentCourse.code}</p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Level {currentCourse.level} • Semester {currentCourse.semester}
              </Badge>
            </div>
            {currentCourse.description && (
              <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-3xl">
                {currentCourse.description}
              </p>
            )}
          </div>
        )}

        {/* Upload Material Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Material</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 hover:border-green-500 rounded-2xl p-12 cursor-pointer transition-colors">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-16 w-16 text-green-600 animate-spin mb-4" />
                  <p className="text-xl font-medium">Uploading Material...</p>
                  <p className="text-sm text-gray-500 mt-2">{uploadProgress}</p>
                </div>
              ) : (
                <>
                  <Upload className="h-16 w-16 text-green-600 mb-4" />
                  <p className="text-xl font-medium">Click to upload PDF</p>
                  <p className="text-sm text-gray-500 mt-2">Only PDF files are supported</p>
                </>
              )}
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </CardContent>
        </Card>

        {/* Materials List */}
        <Card>
          <CardHeader>
            <CardTitle>Course Materials ({materials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                  <p className="text-center py-12">Loading materials...</p>
                ) : materials.length === 0 ? (
              <p className="text-center py-16 text-gray-500">No materials uploaded yet. Upload one above.</p>
            ) : (
              <div className="space-y-4">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between border p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center text-red-600 font-bold text-xl">
                        PDF
                      </div>
                      <div>
                        <p className="font-medium text-lg">{material.title}</p>
                        <p className="text-sm text-gray-500">Uploaded {new Date(material.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button asChild variant="outline">
                        <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                          View PDF
                        </a>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleDeleteMaterial(material.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}