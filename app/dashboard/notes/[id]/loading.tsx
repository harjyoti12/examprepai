export default function NoteDetailsLoading() {
  return (
    <main className="main-container pb-10">
      <div className="space-y-6">
        <div className="h-44 w-full animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="grid gap-6 xl:grid-cols-[1.75fr_1fr]">
          <div className="space-y-4 rounded-[2rem] bg-slate-200 p-8">
            <div className="h-8 w-1/2 rounded-full bg-slate-300" />
            <div className="h-6 w-1/4 rounded-full bg-slate-300" />
            <div className="space-y-4 pt-6">
              <div className="h-24 rounded-[1.75rem] bg-slate-300" />
              <div className="h-24 rounded-[1.75rem] bg-slate-300" />
              <div className="h-24 rounded-[1.75rem] bg-slate-300" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 rounded-[2rem] bg-slate-200" />
            <div className="h-56 rounded-[2rem] bg-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
