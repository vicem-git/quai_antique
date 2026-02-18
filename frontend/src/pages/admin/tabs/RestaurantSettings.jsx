// src/pages/admin/tabs/AdminRestaurantSettingsTab.jsx
import { useState, useEffect } from "react";
import { API } from "../../../utils/ApiCall";
  
export default function AdminRestaurantSettingsTab() {
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [savingService, setSavingService] = useState({}); // track saving per service id
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const resSettings = await API.get("/settings");
        setMaxCapacity(resSettings.data.maxCapacity);

        const resServices = await API.get("/settings/services");
        setServices(resServices.data);
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleCapacityUpdate = async () => {
    setSavingCapacity(true);
    try {
      await API.put("/settings/capacity", { maxCapacity });
      alert("Max capacity updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update capacity.");
    } finally {
      setSavingCapacity(false);
    }
  };

  const handleServiceChange = (day, id, field, value) => {
    setServices((prev) => ({
      ...prev,
      [day]: prev[day].map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleServiceUpdate = async (service) => {
    setSavingService((prev) => ({ ...prev, [service.id]: true }));
    try {
      await API.put(`/settings/services/${service.id}`, {
        startTime: service.start_time,
        endTime: service.end_time,
      });
      alert(`Service ${service.name} updated!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update service.");
    } finally {
      setSavingService((prev) => ({ ...prev, [service.id]: false }));
    }
  };

  if (loading) return <p>Loading settings...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-8">
      {/* MAX CAPACITY */}
      <section className="bg-ground-1 p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Paramètres du restaurant</h3>
        <div className="flex items-center gap-4">
          <label className="font-medium">Max Convives:</label>
          <input
            type="number"
            min={1}
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
            className="border bg-ground-0 px-2 py-1 rounded w-20"
          />
          <button
            onClick={handleCapacityUpdate}
            disabled={savingCapacity}
            className="bg-primary-1 hover:bg-primary-2 text-ground-0 px-4 py-1 rounded"
          >
            {savingCapacity ? "Saving..." : "Sauvegarder"}
          </button>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-ground-1 p-6 rounded shadow space-y-6">
        <h3 className="text-xl font-semibold">Services par jour</h3>
        {Object.keys(services).map((day) => (
          <div key={day} className="space-y-2">
            <h4 className="font-semibold">{day}</h4>
            <div className="flex flex-wrap gap-4">
              {services[day].map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-2 border p-2 rounded bg-ground-0"
                >
                  <span className="capitalize font-medium">{service.name}</span>
                  <input
                    type="time"
                    value={service.start_time}
                    onChange={(e) =>
                      handleServiceChange(day, service.id, "start_time", e.target.value)
                    }
                    className="border px-2 py-1 rounded"
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={service.end_time}
                    onChange={(e) =>
                      handleServiceChange(day, service.id, "end_time", e.target.value)
                    }
                    className="border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => handleServiceUpdate(service)}
                    disabled={savingService[service.id]}
                    className="bg-primary-1 hover:bg-primary-2 text-ground-0 px-3 py-1 rounded"
                  >
                    {savingService[service.id] ? "Saving..." : "Sauvegarder"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}