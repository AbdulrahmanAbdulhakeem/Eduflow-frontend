import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCourseStore } from '../../store/courseStore';

const courseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  code: z.string().min(3, "Course code is required").toUpperCase(),
  level: z.number().min(100).max(400),
  semester: z.number().min(1).max(3),
  description: z.string().optional(),
});

type CreateCourseForm = z.infer<typeof courseSchema>;

type CreateCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createCourse } = useCourseStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      code: '',
      level: 200,
      semester: 1,
      description: '',
    }
  });

  const onSubmit = async (data: CreateCourseForm) => {
    setIsLoading(true);

    try {
      await createCourse(data);
      toast.success("Course created successfully!");
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-700 dark:text-green-500">Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to your teaching portfolio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" {...register("title")} placeholder="Introduction to Computer Science" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="code">Course Code</Label>
            <Input id="code" {...register("code")} placeholder="CSC101" className="uppercase" />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level">Level</Label>
              <Input 
                id="level" 
                type="number" 
                {...register("level", { valueAsNumber: true })} 
                placeholder="200" 
              />
              {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level.message}</p>}
            </div>

            <div>
              <Label htmlFor="semester">Semester</Label>
              <Input 
                id="semester" 
                type="number" 
                {...register("semester", { valueAsNumber: true })} 
                placeholder="1" 
                min="1" 
                max="3"
              />
              {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              {...register("description")} 
              placeholder="Course overview and objectives..." 
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
