import { useState, useEffect } from 'react';
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

const editCourseSchema = z.object({
  title: z.string().min(5),
  code: z.string().min(3).toUpperCase(),
  level: z.number().min(100).max(400),
  semester: z.number().min(1).max(3),
  description: z.string().optional(),
});

type EditCourseForm = z.infer<typeof editCourseSchema>;

type EditCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onSuccess: () => void;
};

export default function EditCourseModal({ isOpen, onClose, course, onSuccess }: EditCourseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateCourse } = useCourseStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditCourseForm>({
    resolver: zodResolver(editCourseSchema),
  });

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        code: course.code,
        level: course.level,
        semester: course.semester,
        description: course.description || '',
      });
    }
  }, [course, reset]);

  const onSubmit = async (data: EditCourseForm) => {
    setIsLoading(true);
    try {
      await updateCourse(course.id, data);
      toast.success("Course updated successfully!");
      onClose();
      onSuccess();
    } catch (error: any) {
        console.log(error)
      toast.error("Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>Update course information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label>Course Title</Label>
            <Input {...register("title")} />
          </div>
          <div>
            <Label>Course Code</Label>
            <Input {...register("code")} className="uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Level</Label>
              <Input type="number" {...register("level", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Semester</Label>
              <Input type="number" {...register("semester", { valueAsNumber: true })} min="1" max="3" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} rows={3} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}