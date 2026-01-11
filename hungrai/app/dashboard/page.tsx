export default function DashboardPage() {
  return (
    <div className="bg-black min-h-screen">
      <div className="flex justify-between items-center text-center gap-16 md:gap-0 mb-8">
        <h1 className="text-white font-semibold text-3xl md:text-4xl">
          Dashboard
        </h1>
      </div>

      <div className="shrink-0 border-t border-zinc-800 mt-4 mb-8"></div>

      <div className="mt-8">
        <p className="text-neutral-300 text-lg">
          Welcome to your HungrAI Dashboard! Navigate using the sidebar to
          explore different features.
        </p>
      </div>
    </div>
  );
}
