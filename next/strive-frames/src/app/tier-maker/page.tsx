import { Suspense } from 'react';
import { TierMakerClient } from './TierMakerClient';
export { metadata } from './metadata';
export { viewport } from '../viewport';

export default function TierMakerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TierMakerClient />
    </Suspense>
  );
} 