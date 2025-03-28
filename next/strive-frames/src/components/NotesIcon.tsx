import * as React from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NotesIconProps {
  notes: string | null;
}

function parseColorfulText(text: string): React.ReactNode[] {
  // First decode all HTML entities
  const decodedText = text.replace(/&lt;/g, '<')
                         .replace(/&gt;/g, '>')
                         .replace(/&quot;/g, '"')
                         .replace(/&#039;/g, "'")
                         .replace(/&amp;/g, '&');

  // Split on span tags but keep the tags in the result
  const parts = decodedText.split(/(<span class="colorful-text-\d+">[^<]+<\/span>)/);
  
  return parts.map((part, index) => {
    // Check if this part is a colorful-text span
    const match = part.match(/<span class="colorful-text-(\d+)">([^<]+)<\/span>/);
    if (match) {
      const [, number, content] = match;
      return (
        <span 
          key={index} 
          className={cn(
            'text-[var(--theme-text)]',
            {
              'text-[var(--success-bg)]': number === '5',  // D
              'text-[var(--theme-focused-foreground)]': number === '2',   // K
            }
          )}
        >
          {content}
        </span>
      );
    }
    // Return regular text without any HTML tags
    return <span key={index}>{part.replace(/<[^>]+>/g, '')}</span>;
  });
}

export function NotesIcon({ notes }: NotesIconProps) {
  if (!notes) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoCircledIcon className="inline-block ml-2 w-4 h-4 flex-shrink-0 text-[var(--theme-text-subdued)] hover:text-[var(--theme-text)] cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs whitespace-pre-wrap">
            {parseColorfulText(notes)}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 