import { useState } from "react";
import Nav from "./nav";
import LeftSidebar from "./left_sidebar.jsx";
import RightSidebar from "./right_sidebar.jsx";


export default function Home() {
  const [liked, setLiked] = useState(new Set());

  const toggleLike = (id) => {
    setLiked((current) => {
      const updated = new Set(current);

      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }

      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Nav />

      <div className="mx-auto flex h-[calc(100vh-72px)] max-w-[1500px] overflow-hidden">

        <LeftSidebar heightClass="h-full" />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 md:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px]">

            {/* Stories */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-5 flex justify-between">
                <h2 className="font-bold">Stories</h2>

                <button className="text-sm text-blue-600">
                  See all →
                </button>
              </div>

              {/* Stories will come from backend */}
              <div className="flex gap-5 overflow-x-auto">
                {/* Real stories will be rendered here */}
              </div>
            </section>

            {/* Posts */}
            <section className="mt-4 space-y-4">
              {/* Real posts will be rendered here */}
            </section>

          </div>
        </main>

        <RightSidebar heightClass="h-full" />

      </div>
    </div>
  );
}