import Game from "./components/Game";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-8 bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">15 Puzzle</h1>
      <Game />
    </main>
  );
}
