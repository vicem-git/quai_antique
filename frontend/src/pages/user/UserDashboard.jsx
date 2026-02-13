import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API } from "../../utils/ApiCall"
import useAuth from "../../auth/useAuth"

export default function UserDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [profile, setProfile] = useState({
    email: "",
    firstName: "",
    lastName: "",
    defaultGuests: 2,
    allergies: "",
  })

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await API.get("/auth/me")
        setProfile({
          email: res.data.email || "",
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          defaultGuests: res.data.defaultGuests ?? 2,
          allergies: res.data.allergies || "",
        })
      } catch (err) {
        console.error("Failed to load profile", err)
        setError("Impossible de charger le profil.")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")
    try {
      await API.put("/auth/profile", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        defaultGuests: Number(profile.defaultGuests),
        allergies: profile.allergies,
      })
      setMessage("Profil mis à jour.")
    } catch (err) {
      console.error("Failed to update profile", err)
      setError("Échec de la mise à jour du profil.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Supprimer votre compte ?")) return
    try {
      await API.delete("/auth/account")
      logout()
      navigate("/", { replace: true })
    } catch (err) {
      console.error("Failed to delete account", err)
      setError("Échec de la suppression du compte.")
    }
  }

  if (loading) return <p>Chargement…</p>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Mon profil</h1>

      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      <form onSubmit={handleSave} className="space-y-4 max-w-xl">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            readOnly
            className="w-full border rounded px-3 py-2 bg-neutral-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Prénom</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Nom</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Convives par défaut</label>
            <input
              type="number"
              min={1}
              value={profile.defaultGuests}
              onChange={(e) => handleChange("defaultGuests", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1">Allergies</label>
            <input
              type="text"
              value={profile.allergies}
              onChange={(e) => handleChange("allergies", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-primary-2 text-ground-0"
        >
          {saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>
      </form>

      <div className="pt-4 border-t">
        <h2 className="text-lg font-semibold mb-2">Zone dangereuse</h2>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  )
}