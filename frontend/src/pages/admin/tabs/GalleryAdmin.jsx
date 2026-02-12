import { useEffect, useState } from "react"
import { API } from "../../../utils/ApiCall"

export default function GalleryAdmin() {
  const [images, setImages] = useState([])
  const [title, setTitle] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const res = await API.get("/gallery")
      setImages(res.data)
    } catch (err) {
      console.error("Fetch gallery error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return

    const formData = new FormData()
    formData.append("title", title)
    formData.append("image", file)

    try {
      setUploading(true)
      const res = await API.post("/gallery/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      setImages(prev => [res.data, ...prev])
      setTitle("")
      setFile(null)
    } catch (err) {
      console.error("Upload error:", err)
      alert("Erreur upload image")
    } finally {
      setUploading(false)
    }
  }

  const updateTitle = async (id, newTitle) => {
    try {
      const res = await API.put(`/gallery/${id}`, { title: newTitle })
      setImages(prev =>
        prev.map(img => img.id === id ? { ...img, title: res.data.title } : img)
      )
    } catch (err) {
      console.error("Update title error:", err)
    }
  }

  const deleteImage = async (id) => {
    if (!confirm("Supprimer cette image ?")) return

    try {
      await API.delete(`/gallery/${id}`)
      setImages(prev => prev.filter(img => img.id !== id))
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  if (loading) return <p>Chargement…</p>

  return (
    <div className="space-y-10">

      {/* Upload */}
      <section>
        <h2 className="text-xl mb-4">Ajouter une image</h2>

        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border rounded-md px-3 py-2 flex-1"
          />

          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
            className="border rounded-md px-3 py-2"
          />

          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 rounded-md bg-primary-2 text-ground-0"
          >
            {uploading ? "Upload…" : "Ajouter"}
          </button>
        </form>
      </section>

      {/* Gallery grid */}
      <section>
        <h2 className="text-xl mb-4">Galerie</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(img => (
            <ImageCard
              key={img.id}
              image={img}
              onUpdate={updateTitle}
              onDelete={deleteImage}
            />
          ))}
        </div>
      </section>

    </div>
  )
}

function ImageCard({ image, onUpdate, onDelete }) {
  const [editTitle, setEditTitle] = useState(image.title)

  return (
    <div className="border rounded-md overflow-hidden">
      <img
        src={image.imageUrl}
        alt={image.title}
        className="w-full h-48 object-cover"
      />

      <div className="p-3 space-y-2">
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full border rounded-md px-2 py-1"
        />

        <div className="flex justify-between gap-2">
          <button
            onClick={() => onUpdate(image.id, editTitle)}
            className="flex-1 px-3 py-1 rounded-md bg-primary-2 text-ground-0"
          >
            Sauver
          </button>

          <button
            onClick={() => onDelete(image.id)}
            className="flex-1 px-3 py-1 rounded-md bg-red-600 text-white"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
