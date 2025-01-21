import { useState } from 'react';
import styles from './TierMaker.module.scss';
import { DraggableTierRow } from './components/DraggableTierRow';
import { CharacterPool } from './components/CharacterPool';

interface TierData {
  id: string;
  label: string;
  color: string;
  characters: string[];
}

interface CharacterDrop {
  name: string;
  sourceTierId?: string;
}

const CHARACTERS = [
  'Sol', 'Ky', 'May', 'Axl', 'Chipp', 'Potemkin', 'Faust', 
  'Millia', 'Zato', 'Ramlethal', 'Leo', 'Nagoriyuki', 'Giovanna', 
  'Anji', 'I-No', 'Goldlewis', 'Jack-O', 'Happy Chaos', 'Baiken', 
  'Testament', 'Sin', 'Bridget', 'Asuka'
];

export const TierMaker = () => {
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [isPrettified, setIsPrettified] = useState(false);

  const handleAddTier = () => {
    const newTier: TierData = {
      id: `tier-${Date.now()}`,
      label: 'S',
      color: '#4a4a4a',
      characters: []
    };
    setTiers([...tiers, newTier]);
  };

  const moveTier = (dragIndex: number, hoverIndex: number) => {
    setTiers(prevTiers => {
      const newTiers = [...prevTiers];
      const [removed] = newTiers.splice(dragIndex, 1);
      newTiers.splice(hoverIndex, 0, removed);
      return newTiers;
    });
  };

  const handleCharacterDrop = (tierId: string, item: CharacterDrop, insertIndex?: number) => {
    setTiers(prevTiers => {
      const newTiers = [...prevTiers];
      
      // Remove from source tier if it exists
      if (item.sourceTierId) {
        const sourceTierIndex = newTiers.findIndex(t => t.id === item.sourceTierId);
        if (sourceTierIndex !== -1) {
          newTiers[sourceTierIndex] = {
            ...newTiers[sourceTierIndex],
            characters: newTiers[sourceTierIndex].characters.filter(c => c !== item.name)
          };
        }
      }
      
      // Add to target tier
      const targetTierIndex = newTiers.findIndex(t => t.id === tierId);
      if (targetTierIndex !== -1) {
        const targetTier = newTiers[targetTierIndex];
        const newCharacters = [...targetTier.characters];
        
        if (typeof insertIndex === 'number') {
          newCharacters.splice(insertIndex, 0, item.name);
        } else {
          newCharacters.push(item.name);
        }
        
        newTiers[targetTierIndex] = {
          ...targetTier,
          characters: newCharacters
        };
      }
      
      return newTiers;
    });
  };

  const handleTierLabelChange = (tierId: string, newLabel: string) => {
    setTiers(prevTiers => 
      prevTiers.map(tier => 
        tier.id === tierId ? { ...tier, label: newLabel } : tier
      )
    );
  };

  const handleTierColorChange = (tierId: string, newColor: string) => {
    setTiers(prevTiers => 
      prevTiers.map(tier => 
        tier.id === tierId ? { ...tier, color: newColor } : tier
      )
    );
  };

  const handleRemoveTier = (tierId: string) => {
    setTiers(prevTiers => prevTiers.filter(tier => tier.id !== tierId));
  };

  return (
    <div className={styles.container}>
      <h1>Guilty Gear Strive Tier Maker</h1>
      <div className={styles.controls}>
        <button 
          className={styles.addTierButton}
          onClick={handleAddTier}
        >
          Add Tier
        </button>
        <button
          className={styles.addTierButton}
          onClick={() => setIsPrettified(!isPrettified)}
        >
          {isPrettified ? "Show Controls" : "Hide Controls"}
        </button>
      </div>
      <div className={styles.tierList}>
        {tiers.map((tier, index) => (
          <DraggableTierRow
            key={tier.id}
            index={index}
            id={tier.id}
            label={tier.label}
            color={tier.color}
            characters={tier.characters}
            onDrop={(item: { name: string; sourceTierId?: string }, insertIndex?: number) => 
              handleCharacterDrop(tier.id, item, insertIndex)
            }
            onLabelChange={(newLabel) => handleTierLabelChange(tier.id, newLabel)}
            onColorChange={(newColor) => handleTierColorChange(tier.id, newColor)}
            onRemove={() => handleRemoveTier(tier.id)}
            showDragHandle={true}
            isPrettified={isPrettified}
            moveTier={moveTier}
          />
        ))}
      </div>
      <CharacterPool 
        characters={CHARACTERS.filter(char => 
          !tiers.some(tier => tier.characters.includes(char))
        )}
        onDrop={(item) => {
          if (item.sourceTierId) {
            handleCharacterDrop(item.sourceTierId, item);
          }
        }}
      />
    </div>
  );
}; 