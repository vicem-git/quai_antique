import { useState } from "react"
import { ChevronDown } from "lucide-react"

import RestaurantSettings from "./tabs/RestaurantSettings"
import MenuSettings from "./tabs/MenuSettings"
import ReservationsAdmin from "./tabs/ReservationsAdmin"
import GalleryAdmin from "./tabs/GalleryAdmin"

const TABS = [
  { key: "restaurant", label: "Restaurant settings" },
  { key: "gallery", label: "Gallery" },
  { key: "menu", label: "Carte / Menu" },
  { key: "reservations", label: "Reservations" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("restaurant")
  const [open, setOpen] = useState(false)

  const current = TABS.find(t => t.key === activeTab)

  return (
    <main className="w-full flex justify-center">
      {/* content container */}
      <div className="w-full max-w-[70rem] px-4 py-8">
        
        {/* page title */}
        <h1 className="text-2xl font-semibold mb-6">
          Admin dashboard
        </h1>

        {/* section selector */}
        <div className="relative w-full max-w-xs mb-8">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="
              w-full flex items-center justify-between
              px-4 py-2
              rounded-lg
              border border-neutral-300
              bg-white
            "
          >
            <span>{current.label}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div
              className="
                absolute z-20 mt-2 w-full
                rounded-lg
                border border-neutral-200
                bg-white
                shadow
              "
            >
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setOpen(false)
                  }}
                  className={`
                    w-full text-left px-4 py-2
                    hover:bg-neutral-100
                    ${tab.key === activeTab ? "font-medium" : ""}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* active section */}
        <section>
          {activeTab === "restaurant" && <RestaurantSettings />}
          {activeTab === "gallery" && <GalleryAdmin />}
          {/* {activeTab === "reservations" && <ReservationsAdmin />} */}
        </section>

      </div>
    </main>
  )
}
