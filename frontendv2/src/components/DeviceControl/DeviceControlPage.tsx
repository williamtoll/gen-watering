import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import axios from "axios";
import { DeviceStatus } from "../../Types/Types";
import { BASE_URL } from "../../Config";


export default function DeviceControlPage() {
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/devices`);
      setDevices(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
    // let device_list=[{"id":1,"name":"Relay 1","status":false},{"id":2,"name":"Relay 2","status":false},{"id":4,"name":"Relay 4","status":false},{"id":3,"name":"Relay 3","status":false}];
    // setDevices(device_list);
    setLoading(false);
  };

  const toggleDevice = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/device/${id}/toggle`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Toggle failed");

      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === id ? { ...device, is_running: !device.is_running } : device
        )
      );
    } catch (error) {
    }

  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Device Control</h1>
      {loading ? (
        <p>Loading devices...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <div key={device.id} className="border rounded-lg p-4 shadow-md">
              <div className="text-lg font-semibold mb-2">{device.name}</div>
              <div className="flex justify-between items-center">
                <Switch
                  checked={device.is_running}
                  onChange={() => toggleDevice(device.id)}
                  className={`${
                    device.is_running ? "bg-blue-600" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span
                    className={`${
                      device.is_running ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
