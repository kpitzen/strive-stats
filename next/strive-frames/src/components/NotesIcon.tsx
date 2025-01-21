import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotesIconProps {
  notes: string | null;
}

export function NotesIcon({ notes }: NotesIconProps) {
  if (!notes) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoCircledIcon className="inline-block ml-2 w-4 h-4 flex-shrink-0 text-gray-500 hover:text-gray-700 cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs whitespace-pre-wrap">{notes}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 