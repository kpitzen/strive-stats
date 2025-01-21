import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <div className="bg-bg-secondary mb-16">
        <div className="container mx-auto py-16">
          <h1 className="text-5xl font-bold mb-8 text-text-primary">Welcome to Strive Frames</h1>
          <p className="text-xl text-text-secondary">
            Explore frame data for Guilty Gear Strive moves
          </p>
        </div>
      </div>
      
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/normal-moves"
            className="p-6 bg-bg-secondary shadow hover:shadow-md transition-all hover:bg-[var(--success-bg)] hover:text-[var(--success-text)]"
          >
            <h2 className="text-2xl font-semibold mb-2 text-text-primary">Normal Moves</h2>
            <p className="text-text-secondary">View normal attack properties</p>
          </Link>

          <Link
            href="/special-moves"
            className="p-6 bg-bg-secondary shadow hover:shadow-md transition-all hover:bg-[var(--success-bg)] hover:text-[var(--success-text)]"
          >
            <h2 className="text-2xl font-semibold mb-2 text-text-primary">Special Moves</h2>
            <p className="text-text-secondary">View special move properties</p>
          </Link>

          <Link
            href="/overdrive-moves"
            className="p-6 bg-bg-secondary shadow hover:shadow-md transition-all hover:bg-[var(--success-bg)] hover:text-[var(--success-text)]"
          >
            <h2 className="text-2xl font-semibold mb-2 text-text-primary">Overdrive Moves</h2>
            <p className="text-text-secondary">View overdrive move properties</p>
          </Link>

          <Link
            href="/tier-maker"
            className="p-6 bg-bg-secondary shadow hover:shadow-md transition-all hover:bg-[var(--success-bg)] hover:text-[var(--success-text)]"
          >
            <h2 className="text-2xl font-semibold mb-2 text-text-primary">Tier Maker</h2>
            <p className="text-text-secondary">Create and share character tier lists</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
