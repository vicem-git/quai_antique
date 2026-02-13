import { useEffect, useMemo, useState } from "react"
import { API } from "../../utils/ApiCall"

export default function UserReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [availability, setAvailability] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    date: "",
    time: "",
    partySize: 2,
    allergies: "",
    serviceType: "lunch",
  })

  const selectedService = useMemo(
    () => availability.find((s) => s.service === form.serviceType),
    [availability, form.serviceType]
  )

  const availableSlots = useMemo(() => {
    if (!selectedService) return []
    return selectedService.slots.filter((s) => s.available)
  }, [selectedService])

  const loadReservations = async () => {
    setLoading(true)
    try {
      const res = await API.get("/reservations/my-reservations")
      setReservations(res.data)
    } catch (err) {
      console.error("Failed to load reservations", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  useEffect(() => {
    const loadAvailability = async () => {
      if (!form.date || !form.partySize || !form.serviceType) return
      setAvailabilityLoading(true)
      try {
        const res = await API.get("/reservations/availability", {
          params: {
            date: form.date,
            partySize: form.partySize,
            serviceType: form.serviceType,
          },
        })
        setAvailability(res.data)
      } catch (err) {
        console.error("Failed to load availability", err)
      } finally {
        setAvailabilityLoading(false)
      }
    }

    loadAvailability()
  }, [form.date, form.partySize, form.serviceType])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setEditId(null)
    setForm({ date: "", time: "", partySize: 2, allergies: "", serviceType: "lunch" })
    setAvailability([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setMessage("")

    try {
      if (!selectedService) {
        setError("Veuillez sélectionner un service.")
        return
      }

      const payload = {
        date: form.date,
        time: form.time,
        partySize: Number(form.partySize),
        allergies: form.allergies,
        serviceId: selectedService.serviceId,
      }

      if (editId) {
        await API.put(`/reservations/${editId}`, payload)
        setMessage("Réservation mise à jour.")
      } else {
        await API.post("/reservations", payload)
        setMessage("Réservation créée.")
      }

      resetForm()
      loadReservations()
    } catch (err) {
      console.error("Reservation submit error", err)
      setError("Impossible d'enregistrer la réservation.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (r) => {
    setEditId(r.id)
    setForm({
      date: r.reservation_date,
      time: r.reservation_time,
      partySize: r.number_of_people,
      allergies: r.allergies || "",
      serviceType: r.service_name || "lunch",
    })
    setMessage("")
    setError("")
  }

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette réservation ?")) return
    try {
      await API.delete(`/reservations/${id}`)
      loadReservations()
    } catch (err) {
      console.error("Failed to delete reservation", err)
      setError("Impossible de supprimer la réservation.")
    }
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Réservations</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {editId ? "Modifier une réservation" : "Réserver une table"}
        </h2>

        {error && <p className="text-red-600">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}

        <form onSubmit={handleSubmit} className="grid gap-3 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="number"
              min={1}
              value={form.partySize}
              onChange={(e) => handleChange("partySize", e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
          </div>

          <select
            value={form.serviceType}
            onChange={(e) => handleChange("serviceType", e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="lunch">Déjeuner</option>
            <option value="dinner">Dîner</option>
          </select>

          <select
            value={form.time}
            onChange={(e) => handleChange("time", e.target.value)}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">Choisir une heure</option>
            {availabilityLoading ? (
              <option>Chargement…</option>
            ) : (
              availableSlots.map((slot) => (
                <option key={slot.time} value={slot.time}>
                  {slot.time}
                </option>
              ))
            )}
          </select>

          <input
            type="text"
            placeholder="Allergies (optionnel)"
            value={form.allergies}
            onChange={(e) => handleChange("allergies", e.target.value)}
            className="border rounded px-3 py-2"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-primary-2 text-ground-0"
            >
              {submitting ? "Enregistrement…" : editId ? "Mettre à jour" : "Réserver"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded border"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Mes réservations</h2>

        {loading ? (
          <p>Chargement…</p>
        ) : reservations.length === 0 ? (
          <p>Aucune réservation.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm text-neutral-500">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Heure</th>
                  <th className="py-2 pr-4">Service</th>
                  <th className="py-2 pr-4">Convives</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b last:border-none text-sm">
                    <td className="py-2 pr-4">{r.reservation_date}</td>
                    <td className="py-2 pr-4">{r.reservation_time}</td>
                    <td className="py-2 pr-4">{r.service_name}</td>
                    <td className="py-2 pr-4">{r.number_of_people}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(r)}
                          className="px-3 py-1 rounded border"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="px-3 py-1 rounded bg-red-600 text-white"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}