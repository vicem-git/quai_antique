import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { API } from "../utils/ApiCall"

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const res = await API.get("/gallery")
        setImages(res.data)
      } catch (err) {
        console.error("Failed to load gallery", err)
      } finally {
        setLoading(false)
      }
    }

    loadGallery()
  }, [])

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Galerie</h1>
        <p className="text-neutral-600">Quelques photos pour vous ouvrir l’appétit.</p>
      </header>

      {loading ? (
        <p>Chargement…</p>
      ) : images.length === 0 ? (
        <p>Aucune image disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <figure key={img.id} className="border rounded-md overflow-hidden">
              <img
                src={img.imageUrl}
                alt={img.title}
                className="w-full h-56 object-cover"
                title={img.title}
              />
              <figcaption className="px-3 py-2 text-sm text-neutral-700">
                {img.title}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="pt-2">
        <Link
          to="/user/reservations"
          className="inline-block px-4 py-2 rounded bg-primary-2 text-ground-0"
        >
          Réserver une table
        </Link>
      </div>
    </div>
  )
}