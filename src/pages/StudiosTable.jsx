import { useEffect, useState } from "react";

function StudiosTable() {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/studios")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch studios");
        return res.json();
      })
      .then((data) => {
        console.log(" Studios data from backend:", data);
        setStudios(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(" Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading studios...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Studios List</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", margin: "20px auto" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Specialty</th>
          </tr>
        </thead>
        <tbody>
          {studios.length === 0 ? (
            <tr><td colSpan="3"> No studios found</td></tr>
          ) : (
            studios.map((studio, index) => (
              <tr key={index}>
                <td>{studio.name}</td>
                <td>{studio.location}</td>
                <td>{studio.specialty}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StudiosTable;
