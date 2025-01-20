import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bg-secondary mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="text-text-secondary text-sm">
          <p>
            Frame data sourced from{' '}
            <Link 
              href="https://www.dustloop.com/w/GGST" 
              target="_blank"
              className="text-primary hover:underline"
            >
              Dustloop Wiki
            </Link>
            {' '}under{' '}
            <Link 
              href="https://creativecommons.org/licenses/by-nc-sa/3.0/"
              target="_blank"
              className="text-primary hover:underline"
            >
              CC BY-NC-SA 3.0
            </Link>
            . This means you may share and adapt this content for non-commercial purposes, as long as you provide attribution and share under the same license.
          </p>
          <p className="mt-2">
            Community project. Not affiliated with Arc System Works.
          </p>
        </div>
      </div>
    </footer>
  );
} 