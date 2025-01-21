import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <Tooltip>
      <TooltipTrigger className="cursor-help">{frameValue}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
} 