import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";

interface FrameTooltipProps {
  value: string;
}

export function FrameTooltip({ value }: FrameTooltipProps) {
  // First decode the HTML entities
  const decodedValue = value.replace(/&lt;/g, '<')
                           .replace(/&gt;/g, '>')
                           .replace(/&quot;/g, '"')
                           .replace(/&#39;/g, "'")
                           .replace(/&amp;/g, '&');

  // Extract the frame value and tooltip text from the decoded HTML string
  const frameMatch = decodedValue.match(/^([+-]?\d+)/);
  const tooltipMatch = decodedValue.match(/tooltiptext" style="">([^<]+)/);
  
  if (!frameMatch || !tooltipMatch) {
    return value;
  }

  const frameValue = frameMatch[1];
  const tooltipText = tooltipMatch[1];

  return (
    <span className="inline-flex items-center">
      {frameValue}
      <Tooltip>
        <TooltipTrigger className="ml-1">
          <InfoCircledIcon className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </span>
  );
} 