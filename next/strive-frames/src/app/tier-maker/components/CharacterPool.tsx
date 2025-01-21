import { useDrop } from 'react-dnd';
import styles from '../TierMaker.module.scss';
import { DraggableCharacter } from './DraggableCharacter';

interface CharacterPoolProps {
  characters: string[];
  onDrop: (item: { name: string; sourceTierId?: string }) => void;
}

interface DragItem {
  name: string;
  sourceTierId?: string;
  type: string;
}

export const CharacterPool = ({ characters, onDrop }: CharacterPoolProps) => {
  const [{ isOver }, dropRef] = useDrop<
    DragItem,
    void,
    { isOver: boolean }
  >({
    accept: 'character',
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      // @ts-expect-error - react-dnd types are not fully compatible with React.Ref
      ref={dropRef}
      className={styles.characterPool}
      style={{
        backgroundColor: isOver ? 'var(--theme-focused-foreground-subdued)' : undefined,
      }}
    >
      {characters.map((char) => (
        <DraggableCharacter key={char} name={char} />
      ))}
    </div>
  );
}; 