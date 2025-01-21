import { useDrop } from 'react-dnd';
import { useState, useRef, useEffect } from 'react';
import styles from '../TierMaker.module.scss';
import { DraggableCharacter } from './DraggableCharacter';

interface TierRowProps {
  id: string;
  label: string;
  color?: string;
  characters: string[];
  onDrop: (item: { name: string; sourceTierId?: string }, insertIndex?: number) => void;
  onLabelChange: (newLabel: string) => void;
  onColorChange: (newColor: string) => void;
  onRemove: () => void;
  showDragHandle?: boolean;
  isPrettified?: boolean;
}

interface DragItem {
  name: string;
  sourceTierId?: string;
  type: string;
}

interface DropPosition {
  index: number;
  x: number;
}

export const TierRow = ({ 
  id, 
  label, 
  color = '#4a4a4a', 
  characters, 
  onDrop, 
  onLabelChange,
  onColorChange,
  onRemove,
  showDragHandle = false,
  isPrettified = false
}: TierRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const charactersRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, dropRef] = useDrop<
    DragItem,
    void,
    { isOver: boolean }
  >({
    accept: 'character',
    hover: (item, monitor) => {
      if (!charactersRef.current) return;

      const containerRect = charactersRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const gap = 12; // Gap between characters (0.75rem)
      const containerPadding = 12; // Container padding (0.75rem)

      // Find the closest character position
      const existingCharElements = Array.from(charactersRef.current.getElementsByClassName(styles.character));
      let targetIndex = 0;
      let xPosition = containerPadding;

      if (existingCharElements.length > 0) {
        for (let i = 0; i < existingCharElements.length; i++) {
          const charRect = existingCharElements[i].getBoundingClientRect();
          const charMidpoint = charRect.left + charRect.width / 2;
          
          if (clientOffset.x < charMidpoint) {
            targetIndex = i;
            xPosition = charRect.left - containerRect.left - 2; // 2px offset for indicator width
            break;
          }
          
          if (i === existingCharElements.length - 1 && clientOffset.x >= charMidpoint) {
            targetIndex = i + 1;
            xPosition = charRect.right - containerRect.left + gap/2;
          }
        }
      } else {
        // If no characters, calculate based on container position
        targetIndex = 0;
        xPosition = containerPadding;
      }

      setDropPosition({ index: targetIndex, x: xPosition });
    },
    drop: (item) => {
      if (dropPosition) {
        onDrop(item, dropPosition.index);
      } else {
        onDrop(item, characters.length);
      }
      setDropPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    if (!isOver) {
      setDropPosition(null);
    }
  }, [isOver]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleLabelClick = () => {
    setIsEditing(true);
    setEditValue(label);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (editValue.trim()) {
      onLabelChange(editValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(label);
    }
  };

  const handleColorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newColor = e.target.value;
    onColorChange(newColor);
    if (colorInputRef.current) {
      colorInputRef.current.blur();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorInputRef.current && !colorInputRef.current.contains(event.target as Node)) {
        if (colorInputRef.current) {
          colorInputRef.current.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.tierRow}>
      <div className={styles.tierHeader}>
        <div className={styles.labelContainer}>
          {showDragHandle && !isPrettified && <div className={styles.dragHandle}>⋮⋮</div>}
          <div 
            className={styles.tierLabel} 
            onClick={!isPrettified ? handleLabelClick : undefined}
            style={{ backgroundColor: color }}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className={styles.labelInput}
                style={{ backgroundColor: color }}
              />
            ) : (
              label
            )}
          </div>
        </div>
        {!isPrettified && (
          <div className={styles.tierControls}>
            <button 
              onClick={handleColorClick}
              className={styles.colorButton}
              title="Change Color"
            >
              🎨
              <input
                ref={colorInputRef}
                type="color"
                value={color}
                onChange={handleColorChange}
                className={styles.colorInput}
              />
            </button>
            <button 
              onClick={onRemove}
              className={styles.removeTierButton}
              title="Remove Tier"
            >
              ×
            </button>
          </div>
        )}
      </div>
      <div
        ref={(node) => {
          dropRef(node);
          if (node) charactersRef.current = node;
        }}
        className={styles.tierCharacters}
        style={{
          backgroundColor: isOver ? 'var(--theme-focused-foreground-subdued)' : undefined,
        }}
      >
        {characters.map((char) => (
          <DraggableCharacter key={char} name={char} tierId={id} />
        ))}
        {isOver && dropPosition && !isPrettified && (
          <div 
            className={styles.dropIndicator}
            style={{ 
              transform: `translateX(${dropPosition.x}px)`,
            }}
          />
        )}
      </div>
    </div>
  );
}; 