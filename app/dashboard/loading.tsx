export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-[#F7F8FC] flex">
      {/* ── SIDEBAR SKELETON (desktop only) ── */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-[#D0D5DD] flex-col py-5 px-4 shrink-0">
        <div className="flex items-center gap-3 px-2 mb-7">
          <div className="w-8 h-8 rounded-lg bg-[#E4E7EC] animate-pulse" />
          <div className="h-5 w-28 rounded bg-[#E4E7EC] animate-pulse" />
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl px-4 h-11"
            >
              <div className="w-[18px] h-[18px] rounded bg-[#E4E7EC] animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-[#E4E7EC] animate-pulse" />
            </div>
          ))}
        </nav>
        <div className="rounded-[20px] p-4 mx-1 mb-6 bg-[#F7F4FF]">
          <div className="flex justify-end mb-2">
            <div className="w-8 h-8 rounded-full bg-[#E4E7EC] animate-pulse" />
          </div>
          <div className="h-4 w-24 rounded bg-[#E4E7EC] animate-pulse mb-2" />
          <div className="h-3 w-full rounded bg-[#E4E7EC] animate-pulse mb-1" />
          <div className="h-3 w-3/4 rounded bg-[#E4E7EC] animate-pulse mb-3" />
          <div className="h-9 w-full rounded-xl bg-[#E4E7EC] animate-pulse" />
        </div>
      </aside>

      {/* ── MOBILE TOP BAR SKELETON (mobile only) ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-[52px] bg-white border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] rounded-lg bg-[#E4E7EC] animate-pulse" />
          <div className="h-4 w-20 rounded bg-[#E4E7EC] animate-pulse" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-16 rounded-full bg-[#E4E7EC] animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-[#E4E7EC] animate-pulse" />
        </div>
      </header>

      {/* ── MAIN CONTENT SKELETON ── */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Desktop Navbar skeleton (lg+) */}
        <div className="hidden lg:flex h-15 bg-white border-b border-[#EAECF0] items-center justify-between px-5 shrink-0">
          <div className="h-9 w-56 rounded-lg bg-[#E4E7EC] animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-32 rounded-xl bg-[#E4E7EC] animate-pulse" />
            <div className="w-9 h-9 rounded-lg bg-[#E4E7EC] animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-[#E4E7EC] animate-pulse" />
          </div>
        </div>

        {/* Page content — padded for mobile top bar + bottom nav */}
        <div className="flex-1 overflow-auto pt-[52px] pb-20 lg:pt-0 lg:pb-0 p-6">
          <div className="max-w-350 mx-auto">
            {/* ── HERO SKELETON ── */}
            <div className="rounded-2xl p-8 flex items-center justify-between mb-7 bg-[#E4E7EC] animate-pulse">
              <div className="flex-1 max-w-md">
                <div className="h-7 w-72 rounded-lg bg-[#F0F2F5] mb-3" />
                <div className="h-7 w-56 rounded-lg bg-[#F0F2F5] mb-4" />
                <div className="h-4 w-80 rounded bg-[#F0F2F5] mb-2" />
                <div className="h-4 w-64 rounded bg-[#F0F2F5] mb-6" />
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-12 w-32 rounded-xl bg-[#F0F2F5]" />
                  <div className="h-12 w-36 rounded-xl bg-[#F0F2F5]" />
                </div>
                <div className="flex items-center gap-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#F0F2F5]" />
                      <div className="h-3.5 w-20 rounded bg-[#F0F2F5]" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden sm:block w-[250px] h-[200px] rounded-2xl bg-[#F0F2F5]" />
            </div>

            {/* ── MY NOTES SKELETON ── */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="h-6 w-28 rounded bg-[#E4E7EC] animate-pulse mb-1.5" />
                  <div className="h-4 w-56 rounded bg-[#E4E7EC] animate-pulse" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-52 rounded-[9px] bg-[#E4E7EC] animate-pulse" />
                  <div className="h-9 w-20 rounded-[9px] bg-[#E4E7EC] animate-pulse" />
                </div>
              </div>

              <div className="w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center border-b border-gray-100 last:border-none py-[13px]"
                  >
                    <div className="w-[40px] shrink-0 px-2">
                      <div className="w-9 h-9 rounded-lg bg-[#E4E7EC] animate-pulse" />
                    </div>
                    <div className="flex-1 px-2">
                      <div className="h-3.5 w-44 rounded bg-[#E4E7EC] animate-pulse" />
                    </div>
                    <div className="hidden sm:block w-[140px] shrink-0 px-2">
                      <div className="h-3.5 w-28 rounded bg-[#E4E7EC] animate-pulse" />
                    </div>
                    <div className="hidden sm:block w-[130px] shrink-0 px-2">
                      <div className="h-3.5 w-24 rounded bg-[#E4E7EC] animate-pulse" />
                    </div>
                    <div className="hidden sm:block w-[90px] shrink-0 px-2">
                      <div className="h-5 w-14 rounded-md bg-[#E4E7EC] animate-pulse" />
                    </div>
                    <div className="w-[120px] shrink-0 px-2">
                      <div className="h-7 w-22 rounded-lg bg-[#E4E7EC] animate-pulse" />
                    </div>
                    <div className="w-14 shrink-0 px-2 flex justify-center">
                      <div className="h-8 w-8 rounded-lg bg-[#E4E7EC] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-4 mt-1 border-t border-gray-100">
                <div className="h-4 w-28 rounded bg-[#E4E7EC] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV SKELETON (mobile only) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-stretch justify-around bg-white/82 border-t border-[rgba(0,0,0,0.06)] border-t-[16px] border-t-transparent rounded-t-[16px] shadow-[0_-2px_16px_rgba(0,0,0,0.04)] px-0 pt-1.5 pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 min-h-[48px]">
              <div className="w-7 h-7 rounded-full bg-[#E4E7EC] animate-pulse" />
              <div className="h-2.5 w-10 rounded bg-[#E4E7EC] animate-pulse" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
