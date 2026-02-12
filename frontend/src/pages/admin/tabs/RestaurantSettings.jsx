import { useEffect, useState } from "react"
import { API } from "../../../utils/ApiCall"

export default function RestaurantSettings() {
  const [maxCapacity, setMaxCapacity] = useState("")
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    API.get("/settings")
      .then(res => {
        setMaxCapacity(res.data.maxCapacity)
        setServices(res.data.services)
      })
      .catch(err => console.error("Settings load error:", err))
      .finally(() => setLoading(false))
  }, [])

  const updateCapacity = async () => {
    try {
      setSaving(true)
      await API.put("/settings/capacity", { maxCapacity })
      alert("Capacité mise à jour")
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la mise à jour")
    } finally {
      setSaving(false)
    }
  }

  const updateService = async (id, startTime, endTime) => {
    try {
      await API.put(`/settings/services/${id}`, { startTime, endTime })
      alert("Service mis à jour")
    } catch (err) {
      console.error(err)
      alert("Erreur service")
    }
  }

  if (loading) return <p>Chargement…</p>

  return (
    <div className="space-y-10">

      {/* Max capacity */}
      <section>
        <h2 className="text-xl mb-4">Capacité maximale</h2>

        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            value={maxCapacity}
            onChange={e => setMaxCapacity(e.target.value)}
            className="w-32 border rounded-md px-3 py-2"
          />
          <button
            onClick={updateCapacity}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-primary-2 text-ground-0"
          >
            Enregistrer
          </button>
        </div>
      </section>

      {/* Services */}
      <section>
        <h2 className="text-xl mb-4">Horaires des services</h2>

        <div className="space-y-6">
          {services.map(service => (
            <ServiceRow
              key={service.id}
              service={service}
              onSave={updateService}
            />
          ))}
        </div>
      </section>

    </div>
  )
}

function ServiceRow({ service, onSave }) {
  const [startTime, setStartTime] = useState(service.start_time)
  const [endTime, setEndTime] = useState(service.end_time)

  return (
    <div className="border rounded-md p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <strong className="w-40">{service.name}</strong>

      <input
        type="time"
        value={startTime}
        onChange={e => setStartTime(e.target.value)}
        className="border rounded-md px-2 py-1"
      />

      <input
        type="time"
        value={endTime}
        onChange={e => setEndTime(e.target.value)}
        className="border rounded-md px-2 py-1"
      />

      <button
        onClick={() => onSave(service.id, startTime, endTime)}
        className="px-3 py-1 rounded-md bg-primary-2 text-ground-0"
      >
        Sauvegarder
      </button>
    </div>
  )
}
