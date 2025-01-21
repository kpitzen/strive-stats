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
  isMulti?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  isMulti = true,
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
        style={{
          background: 'var(--theme-background-input)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text)',
        }}
        className="group border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-[var(--success-bg)] focus-within:border-transparent"
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((option) => (
            <Badge
              key={option.value}
              className="px-1 font-normal bg-[var(--success-bg)] text-[var(--success-text)]"
            >
              {option.label}
              <button
                className="ml-1 outline-none"
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
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            onFocus={handleFocus}
            placeholder={selected.length === 0 ? placeholder : undefined}
            style={{
              color: 'var(--theme-text)',
            }}
            className="flex-1 bg-transparent outline-none placeholder:text-gray-500 min-w-[50px]"
          />
        </div>
      </div>
      {open && (
        <div 
          ref={dropdownRef}
          style={{
            background: 'var(--theme-background-modal)',
            borderColor: 'var(--theme-border)',
          }}
          className="absolute left-0 right-0 z-50 border shadow-md outline-none animate-in mt-2" 
        >
          <CommandGroup className="h-full overflow-auto max-h-60">
            {options.map((option) => {
              const isSelected = selected.some((s) => s.value === option.value);
              return (
                <div
                  key={option.value}
                  style={{
                    color: 'var(--theme-text)',
                    background: 'transparent',
                  }}
                  className={cn(
                    "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                    "hover:bg-[var(--theme-focused-foreground-subdued)]",
                    !isMulti && "pl-4"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isMulti) {
                      if (isSelected) {
                        onChange(selected.filter((s) => s.value !== option.value));
                      } else {
                        onChange([...selected, option]);
                      }
                    } else {
                      onChange([option]);
                      setOpen(false);
                    }
                    inputRef.current?.focus();
                  }}
                >
                  <div
                    style={{
                      borderColor: 'var(--theme-border)',
                      background: isSelected ? 'var(--success-bg)' : 'transparent',
                      color: isSelected ? 'var(--success-text)' : 'inherit'
                    }}
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center border",
                      isSelected && "border-transparent"
                    )}
                  >
                    <svg
                      className={cn("h-4 w-4", !isSelected && "invisible")}
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