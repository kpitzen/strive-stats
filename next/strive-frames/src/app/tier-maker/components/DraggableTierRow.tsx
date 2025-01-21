import { useDrag, useDrop } from 'react-dnd';
import { useRef } from 'react';
import { TierRow } from './TierRow';
import styles from '../TierMaker.module.scss';

interface DraggableTierRowProps {
  id: string;
  label: string;
  color: string;
  characters: string[];
  index: number;
  onDrop: (item: { name: string; sourceTierId?: string }, insertIndex?: number) => void;
  onLabelChange: (newLabel: string) => void;
  onColorChange: (newColor: string) => void;
  onRemove: () => void;
  moveTier: (dragIndex: number, hoverIndex: number) => void;
  showDragHandle?: boolean;
  isPrettified?: boolean;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const DraggableTierRow = ({
  id,
  label,
  color,
  characters,
  index,
  onDrop,
  onLabelChange,
  onColorChange,
  onRemove,
  moveTier,
  showDragHandle,
  isPrettified,
}: DraggableTierRowProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'tier',
    item: { type: 'tier', id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: 'tier',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveTier(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
        if (node) ref.current = node;
      }}
      className={styles.draggableTierRow}
      data-handler-id={handlerId}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <TierRow
        id={id}
        label={label}
        color={color}
        characters={characters}
        onDrop={onDrop}
        onLabelChange={onLabelChange}
        onColorChange={onColorChange}
        onRemove={onRemove}
        showDragHandle={showDragHandle}
        isPrettified={isPrettified}
      />
    </div>
  );
}; 