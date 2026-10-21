import { useEffect, useState } from "react";

function StudiosTable() {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editID, seteditID] = useState("");
  const [editName, seteditName] = useState("");
  const [editLocation, seteditLocation] = useState("");
  const [editSpecialty, seteditSpecialty] = useState("");
  const [isModalOpen, setisModalOpen] = useState(false);

  const studios_url = "http://localhost:5000/api/studios";

  useEffect(() => {
    fetch(studios_url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch studios");
        return res.json();
      })
      .then((data) => {
        console.log("Studios data from backend:", data);
        setStudios(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${studios_url}/${editID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          location: editLocation,
          specialty: editSpecialty,
        }),
      });

      if (!response.ok) throw new Error("Failed to update studio");

      const data = await response.json();

      setStudios((prev) =>
        prev.map((s) => (s.id === Number(editID) ? data : s))
      );

      setisModalOpen(false);
    } catch (err) {
      console.error("Error updating studio:", err);
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this studio?")) return;

    try {
      const response = await fetch(`${studios_url}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete studio");

      setStudios((prev) => prev.filter((s) => s.id !== Number(id)));
    } catch (err) {
      console.error("Error deleting studio:", err);
      alert(err.message);
    }
  }

  function openEditModal(studio) {
    setisModalOpen(true);
    seteditID(studio.id);
    seteditName(studio.name);
    seteditLocation(studio.location);
    seteditSpecialty(studio.specialty);
  }

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };
  const modalStyle = {
    background: "#0b0b0b",
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: "8px",
    padding: "20px",
    width: "90%",
    maxWidth: "420px",
  };
  const labelStyle = { display: "block", marginBottom: "4px", marginTop: "12px" };
  const inputStyle = {
    width: "100%",
    padding: "8px",
    background: "#0b0b0b",
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: "4px",
    boxSizing: "border-box",
  };
  const buttonStyle = {
    padding: "6px 14px",
    background: "transparent",
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: "4px",
    cursor: "pointer",
  };

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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {studios.length === 0 ? (
            <tr><td colSpan="4">No studios found</td></tr>
          ) : (
            studios.map((studio) => (
              <tr key={studio.id}>
                <td>{studio.name}</td>
                <td>{studio.location}</td>
                <td>{studio.specialty}</td>
                <td>
                  <button type="button" style={buttonStyle} onClick={() => openEditModal(studio)}>
                    Edit
                  </button>{" "}
                  <button type="button" style={buttonStyle} onClick={() => handleDelete(studio.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginTop: 0 }}>Edit Studio</h3>
            <form onSubmit={handleUpdate}>
              <label htmlFor="editName" style={labelStyle}>Name</label>
              <input
                type="text"
                id="editName"
                style={inputStyle}
                value={editName}
                onChange={(e) => seteditName(e.target.value)}
                required
              />

              <label htmlFor="editLocation" style={labelStyle}>Location</label>
              <input
                type="text"
                id="editLocation"
                style={inputStyle}
                value={editLocation}
                onChange={(e) => seteditLocation(e.target.value)}
                required
              />

              <label htmlFor="editSpecialty" style={labelStyle}>Specialty</label>
              <input
                type="text"
                id="editSpecialty"
                style={inputStyle}
                value={editSpecialty}
                onChange={(e) => seteditSpecialty(e.target.value)}
                required
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
                <button type="button" style={buttonStyle} onClick={() => setisModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" style={buttonStyle}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudiosTable;