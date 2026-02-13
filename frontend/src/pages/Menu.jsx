import { useEffect, useMemo, useState } from "react"
import { API } from "../utils/ApiCall"

export default function Menu() {
  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true)
      try {
        const [catsRes, dishesRes, menusRes] = await Promise.all([
          API.get("/menu/categories"),
          API.get("/menu/dishes"),
          API.get("/menu/menus"),
        ])
        setCategories(catsRes.data)
        setDishes(dishesRes.data)
        setMenus(menusRes.data)
      } catch (err) {
        console.error("Failed to load menu", err)
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [])

  const dishesByCategory = useMemo(() => {
    const map = new Map()
    categories.forEach((c) => map.set(c.id, { title: c.title, items: [] }))
    dishes.forEach((d) => {
      if (!map.has(d.category_id)) {
        map.set(d.category_id, { title: d.category_title || "Autres", items: [] })
      }
      map.get(d.category_id).items.push(d)
    })
    return Array.from(map.values())
  }, [categories, dishes])

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Carte & Menus</h1>
        <p className="text-neutral-600">La carte complète et les menus du chef.</p>
      </header>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Plats à la carte</h2>

            {dishesByCategory.length === 0 ? (
              <p>Aucun plat disponible.</p>
            ) : (
              dishesByCategory.map((group) => (
                <div key={group.title} className="space-y-3">
                  <h3 className="text-lg font-semibold">{group.title}</h3>
                  <ul className="space-y-3">
                    {group.items.map((d) => (
                      <li key={d.id} className="border rounded p-3">
                        <div className="flex justify-between">
                          <strong>{d.title}</strong>
                          <span className="font-semibold">{d.price} €</span>
                        </div>
                        {d.description && (
                          <p className="text-sm text-neutral-600">{d.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Menus</h2>
            {menus.length === 0 ? (
              <p>Aucun menu disponible.</p>
            ) : (
              <ul className="space-y-3">
                {menus.map((m) => (
                  <li key={m.id} className="border rounded p-3">
                    <div className="flex justify-between">
                      <strong>{m.title}</strong>
                      <span className="font-semibold">{m.price} €</span>
                    </div>
                    <p className="text-sm text-neutral-600">{m.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}