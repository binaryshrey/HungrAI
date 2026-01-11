export default function ShoppingListPage() {
  return (
    <div className="bg-black min-h-screen">
      <div className="flex justify-between items-center text-center gap-16 md:gap-0 mb-8">
        <h1 className="text-white font-semibold text-3xl md:text-4xl">
          Shopping List
        </h1>
      </div>

      <div className="shrink-0 border-t border-zinc-800 mt-4 mb-8"></div>

      <div className="mt-8">
        <p className="text-neutral-300 text-lg">
          This is the Shopping List page. Here you can manage your shopping
          list.
        </p>
      </div>
    </div>
  );
}
