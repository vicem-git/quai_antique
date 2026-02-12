import { useEffect, useState } from "react"
import { API } from "../../../utils/ApiCall"

const SECTIONS = {
  CATEGORIES: "categories",
  DISHES: "dishes",
  MENUS: "menus",
}

export default function MenuAdmin() {
  const [section, setSection] = useState(SECTIONS.CATEGORIES)

  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [menus, setMenus] = useState([])

  const [loading, setLoading] = useState(true)

  // form states
  const [categoryTitle, setCategoryTitle] = useState("")
  const [dishForm, setDishForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    price: "",
  })
  const [menuForm, setMenuForm] = useState({
    title: "",
    description: "",
    price: "",
  })

  /* ---------------- FETCH ALL ---------------- */

  async function loadAll() {
    setLoading(true)
    try {
      const [cats, dishs, mens] = await Promise.all([
        API.get("/menu/categories"),
        API.get("/menu/dishes"),
        API.get("/menu/menus"),
      ])

      setCategories(cats.data)
      setDishes(dishs.data)
      setMenus(mens.data)
    } catch (err) {
      console.error("Menu admin load error:", err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  /* ---------------- CREATE ---------------- */

  async function createCategory(e) {
    e.preventDefault()
    await API.post("/menu/categories", {
      title: categoryTitle,
    })
    setCategoryTitle("")
    loadAll()
  }

  async function createDish(e) {
    e.preventDefault()
    await API.post("/menu/dishes", {
      ...dishForm,
      price: Number(dishForm.price),
    })
    setDishForm({ categoryId: "", title: "", description: "", price: "" })
    loadAll()
  }

  async function createMenu(e) {
    e.preventDefault()
    await API.post("/menu/menus", {
      ...menuForm,
      price: Number(menuForm.price),
    })
    setMenuForm({ title: "", description: "", price: "" })
    loadAll()
  }

  /* ---------------- DELETE ---------------- */

  async function deleteItem(path) {
    if (!confirm("Are you sure?")) return
    await API.delete(path)
    loadAll()
  }

  if (loading) {
    return <p className="text-center">Loading menu…</p>
  }

  return (
    <div className="space-y-6">
      {/* SECTION SELECTOR */}
      <select
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value={SECTIONS.CATEGORIES}>Categories</option>
        <option value={SECTIONS.DISHES}>Dishes</option>
        <option value={SECTIONS.MENUS}>Menus</option>
      </select>

      {/* ---------------- CATEGORIES ---------------- */}
      {section === SECTIONS.CATEGORIES && (
        <div className="space-y-4">
          <form onSubmit={createCategory} className="flex gap-2">
            <input
              value={categoryTitle}
              onChange={(e) => setCategoryTitle(e.target.value)}
              placeholder="Category title"
              className="flex-1 p-2 border rounded"
              required
            />
            <button className="px-4 py-2 bg-black text-white rounded">
              Add
            </button>
          </form>

          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="flex justify-between border p-2 rounded">
                <span>{c.title}</span>
                <button
                  onClick={() => deleteItem(`/menu/categories/${c.id}`)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------------- DISHES ---------------- */}
      {section === SECTIONS.DISHES && (
        <div className="space-y-4">
          <form onSubmit={createDish} className="grid gap-2">
            <select
              value={dishForm.categoryId}
              onChange={(e) =>
                setDishForm({ ...dishForm, categoryId: e.target.value })
              }
              required
              className="p-2 border rounded"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            <input
              placeholder="Dish title"
              value={dishForm.title}
              onChange={(e) =>
                setDishForm({ ...dishForm, title: e.target.value })
              }
              required
              className="p-2 border rounded"
            />

            <textarea
              placeholder="Description"
              value={dishForm.description}
              onChange={(e) =>
                setDishForm({ ...dishForm, description: e.target.value })
              }
              className="p-2 border rounded"
            />

            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={dishForm.price}
              onChange={(e) =>
                setDishForm({ ...dishForm, price: e.target.value })
              }
              required
              className="p-2 border rounded"
            />

            <button className="bg-black text-white py-2 rounded">
              Add dish
            </button>
          </form>

          <ul className="space-y-2">
            {dishes.map((d) => (
              <li key={d.id} className="border p-2 rounded">
                <div className="flex justify-between">
                  <strong>{d.title}</strong>
                  <button
                    onClick={() => deleteItem(`/menu/dishes/${d.id}`)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm">{d.category_title}</p>
                <p className="text-sm">{d.description}</p>
                <p className="text-sm font-semibold">{d.price} €</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------------- MENUS ---------------- */}
      {section === SECTIONS.MENUS && (
        <div className="space-y-4">
          <form onSubmit={createMenu} className="grid gap-2">
            <input
              placeholder="Menu title"
              value={menuForm.title}
              onChange={(e) =>
                setMenuForm({ ...menuForm, title: e.target.value })
              }
              required
              className="p-2 border rounded"
            />

            <textarea
              placeholder="Description"
              value={menuForm.description}
              onChange={(e) =>
                setMenuForm({ ...menuForm, description: e.target.value })
              }
              required
              className="p-2 border rounded"
            />

            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={menuForm.price}
              onChange={(e) =>
                setMenuForm({ ...menuForm, price: e.target.value })
              }
              required
              className="p-2 border rounded"
            />

            <button className="bg-black text-white py-2 rounded">
              Add menu
            </button>
          </form>

          <ul className="space-y-2">
            {menus.map((m) => (
              <li key={m.id} className="flex justify-between border p-2 rounded">
                <div>
                  <strong>{m.title}</strong>
                  <p className="text-sm">{m.description}</p>
                  <p className="text-sm font-semibold">{m.price} €</p>
                </div>
                <button
                  onClick={() => deleteItem(`/menu/menus/${m.id}`)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
