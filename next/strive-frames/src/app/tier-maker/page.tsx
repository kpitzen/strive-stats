'use client';

import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from './TierMaker.module.scss';
import { DraggableTierRow } from './components/DraggableTierRow';
import { CharacterPool } from './components/CharacterPool';

interface Tier {
  id: string;
  label: string;
  color: string;
  characters: string[];
}

const defaultTiers: Tier[] = [
  { id: 'S', label: 'S', color: '#ff7676', characters: [] },
  { id: 'A', label: 'A', color: '#ffa076', characters: [] },
  { id: 'B', label: 'B', color: '#ffcf76', characters: [] },
  { id: 'C', label: 'C', color: '#76b8ff', characters: [] },
  { id: 'D', label: 'D', color: '#767676', characters: [] },
];

const characters = [
  'A.B.A', 'Anji Mito', 'Asuka R', 'Axl Low', 'Baiken', 'Bedman', 'Bridget',
  'Chipp Zanuff', 'Elphelt Valentine', 'Faust', 'Giovanna', 'Goldlewis Dickinson',
  'Happy Chaos', 'I-No', 'Jack-O', 'Johnny', 'Ky Kiske', 'Leo Whitefang',
  'May', 'Millia Rage', 'Nagoriyuki', 'Potemkin', 'Queen Dizzy', 'Ramlethal Valentine',
  'Sin Kiske', 'Slayer', 'Sol Badguy', 'Testament', 'Zato-1'
];

export default function TierMaker() {
  const [tiers, setTiers] = useState<Tier[]>(defaultTiers);
  const [unassignedCharacters, setUnassignedCharacters] = useState(characters);
  const [isPrettified, setIsPrettified] = useState(false);

  const handleCharacterDrop = (tierId: string) => (item: { name: string; sourceTierId?: string }, insertIndex?: number) => {
    const { name, sourceTierId } = item;

    // Remove from source
    if (sourceTierId) {
      setTiers(prevTiers => prevTiers.map(tier => {
        if (tier.id === sourceTierId) {
          return { ...tier, characters: tier.characters.filter(char => char !== name) };
        }
        return tier;
      }));
    } else {
      setUnassignedCharacters(prev => prev.filter(char => char !== name));
    }

    // Add to target tier at specific position
    setTiers(prevTiers => prevTiers.map(tier => {
      if (tier.id === tierId) {
        const newCharacters = [...tier.characters];
        if (typeof insertIndex === 'number') {
          newCharacters.splice(insertIndex, 0, name);
        } else {
          newCharacters.push(name);
        }
        return { ...tier, characters: newCharacters };
      }
      return tier;
    }));
  };

  const handleUnassignedDrop = (item: { name: string; sourceTierId?: string }) => {
    const { name, sourceTierId } = item;
    if (sourceTierId) {
      setTiers(prevTiers => prevTiers.map(tier => {
        if (tier.id === sourceTierId) {
          return { ...tier, characters: tier.characters.filter(char => char !== name) };
        }
        return tier;
      }));
      setUnassignedCharacters(prev => [...prev, name]);
    }
  };

  const handleAddTier = () => {
    const newTierId = String.fromCharCode(65 + tiers.length); // A, B, C, etc.
    setTiers(prev => [...prev, { 
      id: newTierId, 
      label: newTierId, 
      color: '#767676', 
      characters: [] 
    }]);
  };

  const handleRemoveTier = (tierId: string) => {
    setTiers(prevTiers => {
      const tierToRemove = prevTiers.find(t => t.id === tierId);
      if (tierToRemove) {
        // Move characters back to unassigned
        setUnassignedCharacters(prev => [...prev, ...tierToRemove.characters]);
      }
      return prevTiers.filter(t => t.id !== tierId);
    });
  };

  const handleLabelChange = (tierId: string, newLabel: string) => {
    setTiers(prevTiers => prevTiers.map(tier => {
      if (tier.id === tierId) {
        return { ...tier, label: newLabel };
      }
      return tier;
    }));
  };

  const handleColorChange = (tierId: string, newColor: string) => {
    setTiers(prevTiers => prevTiers.map(tier => {
      if (tier.id === tierId) {
        return { ...tier, color: newColor };
      }
      return tier;
    }));
  };

  const moveTier = useCallback((dragIndex: number, hoverIndex: number) => {
    setTiers((prevTiers) => {
      const newTiers = [...prevTiers];
      const [removed] = newTiers.splice(dragIndex, 1);
      newTiers.splice(hoverIndex, 0, removed);
      return newTiers;
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
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
              id={tier.id}
              index={index}
              label={tier.label}
              color={tier.color}
              characters={tier.characters}
              onDrop={handleCharacterDrop(tier.id)}
              onLabelChange={(newLabel) => handleLabelChange(tier.id, newLabel)}
              onColorChange={(newColor) => handleColorChange(tier.id, newColor)}
              onRemove={() => handleRemoveTier(tier.id)}
              moveTier={moveTier}
              showDragHandle={true}
              isPrettified={isPrettified}
            />
          ))}
        </div>
        <CharacterPool
          characters={unassignedCharacters}
          onDrop={handleUnassignedDrop}
        />
      </div>
    </DndProvider>
  );
} 