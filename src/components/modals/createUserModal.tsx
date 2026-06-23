import { useEffect,useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userType: 'student' | 'lecturer';
  onSuccess?: () => void;
};

// Schemas
const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  level: z.number().min(100).max(400, "Level must be between 100 and 400"),
});

const lecturerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type StudentForm = z.infer<typeof studentSchema>;
type LecturerForm = z.infer<typeof lecturerSchema>;

export default function CreateUserModal({ 
  isOpen, 
  onClose, 
  userType, 
  onSuccess 
}: CreateUserModalProps) {

  const [isLoading, setIsLoading] = useState(false);

  const schema = userType === 'student' ? studentSchema : lecturerSchema;
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: userType === 'student' 
      ? { name: '', email: '', password: '', level: 100 }
      : { name: '', email: '', password: '' }
  });

  useEffect(() => {
    if (isOpen) {
      reset({ email: "", password: "" })
    }
  }, [isOpen, reset])

  const onSubmit = async (data: StudentForm | LecturerForm) => {
    setIsLoading(true);

    try {
      const payload = {
        ...data,
        role: userType.toUpperCase(),
      };

      await api.post('/api/v1/user/admin/users/create', payload);

      toast.success(`${userType === 'student' ? 'Student' : 'Lecturer'} created successfully!`);
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-700 dark:text-green-500">
            Create New {userType === 'student' ? 'Student' : 'Lecturer'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new {userType}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name")} placeholder="John Doe" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register("email")} placeholder="user@example.com" autoComplete='one-time-code'/>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} placeholder="••••••••" autoComplete='new-password' />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {userType === 'student' && (
            <div>
              <Label htmlFor="level">Level (e.g. 200)</Label>
              <Input
                id="level"
                type="number"
                {...register("level", { valueAsNumber: true })}
                placeholder="200"
              />
              {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level.message}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create {userType === 'student' ? 'Student' : 'Lecturer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
