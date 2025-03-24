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
  isBlocked?: boolean;
  onUnblock?: () => void;
}

export default function SuspiciousUserAlert({
  onBlock,
  onIgnore,
  isBlocked = false,
  onUnblock,
}: SuspiciousUserAlertProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`p-1 h-6 w-6 rounded-full ${
            isBlocked 
              ? "bg-red-100 text-red-600 hover:bg-red-200" 
              : "hover:bg-red-100 hover:text-red-600"
          }`}
        >
          <AlertTriangleIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5" />
            {isBlocked ? "Blocked User" : "Suspicious User Alert"}
          </DialogTitle>
          <DialogDescription>
            {isBlocked 
              ? "This user is currently blocked. Would you like to unblock and continue the conversation?"
              : "This user has been flagged as suspicious. What would you like to do?"
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-start">
          {isBlocked ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onUnblock}
            >
              Unblock User
            </Button>
          ) : (
            <>
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 