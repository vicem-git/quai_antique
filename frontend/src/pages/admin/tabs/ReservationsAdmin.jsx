import { useEffect, useState } from "react"
import { API } from "../../../utils/ApiCall"

export default function ReservationsAdmin() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState("")

  async function fetchReservations(selectedDate = "") {
    setLoading(true)
    try {
      const query = selectedDate ? `?date=${selectedDate}` : ""
      const res = await API.get(`/reservations/admin/all${query}`)
      
      setReservations(res.data)
    } catch (err) {
      console.error("Failed to fetch reservations", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">
          Reservations
        </h2>

        {/* date filter */}
        <input
          type="date"
          value={date}
          onChange={(e) => {
            const value = e.target.value
            setDate(value)
            fetchReservations(value)
          }}
          className="
            border border-neutral-300
            rounded-lg
            px-3 py-2
          "
        />
      </div>

      {/* content */}
      {loading ? (
        <p className="text-neutral-500">Loading reservations…</p>
      ) : reservations.length === 0 ? (
        <p className="text-neutral-500">No reservations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-sm text-neutral-500">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Service</th>
                <th className="py-2 pr-4">Guest</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Guests</th>
              </tr>
            </thead>

            <tbody>
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  className="border-b last:border-none text-sm"
                >
                  <td className="py-2 pr-4">
                    {r.reservation_date}
                  </td>
                  <td className="py-2 pr-4">
                    {r.reservation_time}
                  </td>
                  <td className="py-2 pr-4">
                    {r.service_name}
                  </td>
                  <td className="py-2 pr-4">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="py-2 pr-4">
                    {r.email}
                  </td>
                  <td className="py-2 pr-4">
                    {r.guests}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
