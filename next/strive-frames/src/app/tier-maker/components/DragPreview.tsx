import { usePreview } from 'react-dnd-preview';
import styles from '../TierMaker.module.scss';
import { getCharacterIconUrl } from '../utils/characterIcons';
import Image from 'next/image';

interface DragItem {
  type: string;
  name: string;
  sourceTierId?: string;
}

export const DragPreview = () => {
  const preview = usePreview<DragItem>();
  
  if (!preview.display || !preview.item) {
    return null;
  }

  return (
    <div className={styles.dragPreview} style={preview.style}>
      {preview.item.type === 'character' && (
        <div className={styles.character}>
          <Image 
            src={getCharacterIconUrl(preview.item.name)}
            alt={preview.item.name} 
            width={60} 
            height={60} 
          />
        </div>
      )}
    </div>
  );
}; 