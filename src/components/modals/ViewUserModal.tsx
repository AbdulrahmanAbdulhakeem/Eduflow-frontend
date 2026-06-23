import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

type ViewUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
};

export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-4xl bg-green-100 text-green-700">
              {user.name?.[0] || user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>

          <Badge variant="secondary" className="capitalize text-sm px-4 py-1">
            {user.role}
          </Badge>

          {user.level && <p className="text-lg">Level {user.level}</p>}
          <p className="text-sm text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}