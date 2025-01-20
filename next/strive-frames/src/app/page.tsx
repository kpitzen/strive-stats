import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto py-16">
      <h1 className="text-5xl font-bold mb-8">Welcome to Strive Frames</h1>
      <p className="text-xl text-gray-600 mb-12">
        Explore frame data and system mechanics for Guilty Gear Strive
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/characters"
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Characters</h2>
          <p className="text-gray-600">Browse the character roster</p>
        </Link>
        
        <Link
          href="/system-core"
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">System Core Data</h2>
          <p className="text-gray-600">View core system mechanics and stats</p>
        </Link>
        
        <Link
          href="/system-jump"
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Jump Data</h2>
          <p className="text-gray-600">Explore jump and air movement stats</p>
        </Link>
        
        <Link
          href="/gatling"
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Gatling Tables</h2>
          <p className="text-gray-600">Check move cancels and gatling options</p>
        </Link>
        
        <Link
          href="/normal-moves"
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Normal Moves</h2>
          <p className="text-gray-600">View normal attack properties</p>
        </Link>

        <Link
          href="/special-moves"
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Special Moves</h2>
          <p className="text-gray-600">View special move properties</p>
        </Link>

        <Link
          href="/overdrive-moves"
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">Overdrive Moves</h2>
          <p className="text-gray-600">View overdrive move properties</p>
        </Link>
      </div>
    </div>
  );
}
