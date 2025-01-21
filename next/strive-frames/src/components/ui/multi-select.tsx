import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: Option[];
  onChange: (options: Option[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleUnselect = (option: Option) => {
    onChange(selected.filter((s) => s.value !== option.value));
  };

  const handleFocus = () => setOpen(true);

  return (
    <Command className={cn("overflow-visible bg-transparent relative", className)}>
      <div 
        ref={containerRef}
        className="group border border-gray-300 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white"
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="px-1 font-normal"
            >
              {option.label}
              <button
                className="ml-1 ring-offset-background outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(option);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnselect(option);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            onFocus={handleFocus}
            placeholder={selected.length === 0 ? placeholder : undefined}
            className="flex-1 bg-transparent outline-none placeholder:text-gray-500 min-w-[50px]"
          />
        </div>
      </div>
      {open && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 right-0 z-50 border bg-white shadow-md outline-none animate-in mt-2" 
        >
          <CommandGroup className="h-full overflow-auto max-h-60">
            {options.map((option) => {
              const isSelected = selected.some((s) => s.value === option.value);
              return (
                <div
                  key={option.value}
                  className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isSelected) {
                      onChange(selected.filter((s) => s.value !== option.value));
                    } else {
                      onChange([...selected, option]);
                    }
                    inputRef.current?.focus();
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center border border-gray-300",
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <svg
                      className={cn("h-4 w-4")}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>{option.label}</span>
                </div>
              );
            })}
          </CommandGroup>
        </div>
      )}
    </Command>
  );
} 