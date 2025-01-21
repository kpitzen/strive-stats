import { useDrag } from 'react-dnd';
import type { DragSourceMonitor } from 'react-dnd';
import styles from '../TierMaker.module.scss';
import { getCharacterIconUrl } from '../utils/characterIcons';
import Image from 'next/image';

interface DraggableCharacterProps {
  name: string;
  tierId?: string;
}

interface DragItem {
  name: string;
  sourceTierId?: string;
  type: string;
}

export const DraggableCharacter = ({ name, tierId }: DraggableCharacterProps) => {
  const [{ isDragging }, dragRef] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >({
    type: 'character',
    item: { name, sourceTierId: tierId, type: 'character' },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      // @ts-expect-error - react-dnd types are not fully compatible with React.Ref
      ref={dragRef}
      className={styles.character}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      title={name}
    >
      <Image
        src={getCharacterIconUrl(name)}
        alt={name}
        width={170}
        height={170}
        priority
      />
    </div>
  );
}; 