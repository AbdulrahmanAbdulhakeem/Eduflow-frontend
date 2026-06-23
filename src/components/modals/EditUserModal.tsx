import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '../../store/userStore';

const editSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  level: z.number().optional(),
});

type EditUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
};

export default function EditUserModal({ isOpen, onClose, user, onSuccess }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useUserStore();

  const isAdmin = user?.role === 'ADMIN';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      level: user?.level || 100,
    }
  });

  useEffect(() => {
    if (user) reset(user);
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    if (isAdmin) {
      toast.error("You cannot edit another Admin's details.");
      return;
    }

    setIsLoading(true);
    try {
      await updateUser(user.id, data);
      toast.success("User updated successfully");
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input {...register("name")} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
          {user?.role === 'STUDENT' && (
            <div>
              <Label>Level</Label>
              <Input type="number" {...register("level", { valueAsNumber: true })} />
            </div>
          )}

          <Button type="submit" disabled={isLoading || isAdmin} className="w-full bg-green-600">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}