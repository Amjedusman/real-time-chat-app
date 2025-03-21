import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

interface SuspiciousUserAlertProps {
  onBlock: () => void;
  onIgnore: () => void;
}

export default function SuspiciousUserAlert({
  onBlock,
  onIgnore,
}: SuspiciousUserAlertProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600"
        >
          <AlertTriangleIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5" />
            Suspicious User Alert
          </DialogTitle>
          <DialogDescription>
            This user has been flagged as suspicious. What would you like to do?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-start">
          <Button
            type="button"
            variant="destructive"
            onClick={onBlock}
          >
            Block User
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onIgnore}
          >
            Ignore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 