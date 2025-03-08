import React, { useState } from "react";
import { useLoginStatus } from "../../context/LoginStatusContext";
import { FaUserEdit, FaTrash } from "react-icons/fa";
import { Login } from "../login/Login";
import "./Profile.css";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  rights?: string;
}

export function OrganizationManagement() {
  const loginStatus = useLoginStatus();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [roleEmail, setRoleEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const rowsPerPage = 10;

  const userOrganizations = loginStatus.loggedIn
    ? loginStatus.user?.organizationInfoList || []
    : [];

    const organizationUsers: User[] = [];
      const filteredUsers = organizationUsers.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalRows = filteredUsers.length || rowsPerPage;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const handlePageChange = (direction: any) => {
    setCurrentPage((prevPage) => {
      if (direction === "next" && prevPage < totalPages) return prevPage + 1;
      if (direction === "prev" && prevPage > 1) return prevPage - 1;
      return prevPage;
    });
  };

  if (!loginStatus.loggedIn) {
    return <Login onClose={() => {}} />;
  }

  return (
    <div style={{ marginTop: "30px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Organisationsverwaltung</h2>
      <label style={{ fontWeight: "bold" }}>Organisation wählen:</label>
      <select 
        value={selectedOrganizationId || ""} 
        onChange={(e) => setSelectedOrganizationId(null)}
        style={{ padding: "8px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
      >
        <option value="" disabled>
          Organisation auswählen
        </option>
        {userOrganizations.map((org) => (
          <option key={org.id} value={org.id}>
            {/*org.name*/}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <h3 style={{ color: "#444", margin: 0 }}>Mitglieder</h3>
        <input
          type="text"
          placeholder="Benutzer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", width: "250px" }}
        />
        <button onClick={() => setRoleModalOpen(true)} style={{ padding: "8px 12px", borderRadius: "5px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
          Benutzer hinzufügen
        </button>
      </div>

      <table className="organization-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "10px", textAlign: "left", width:"300px" }}>Vorname</th>
            <th style={{ padding: "10px", textAlign: "left", width:"300px"  }}>Nachname</th>
            <th style={{ padding: "10px", textAlign: "left", width: "300px"  }}>E-Mail</th>
            <th style={{ padding: "10px", textAlign: "left", width: "400px" }}>Rechte</th>
            <th style={{ padding: "10px", textAlign: "left"}}>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{user.firstName}</td>
                <td style={{ padding: "10px" }}>{user.lastName}</td>
                <td style={{ padding: "10px" }}>{user.email}</td>
                <td style={{ padding: "10px" }}>{user.rights || "--"}</td>
                <td style={{ padding: "10px" }}>
                  <button style={{ marginRight: "5px", backgroundColor: "#28a745", color: "white", border: "none", padding: "5px", borderRadius: "5px", cursor: "pointer" }}>
                    <FaUserEdit />
                  </button>
                  <button style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px", borderRadius: "5px", cursor: "pointer" }}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td  colSpan={5} style={{ padding: "10px", textAlign: "center", color: "#888"}}>Keine Benutzer gefunden</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination-controls" style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
        <button onClick={() => handlePageChange("prev")} disabled={currentPage === 1}>
          ◀ Zurück
        </button>
        <span style={{marginTop:"8px"}}>Seite {currentPage} von {totalPages}</span>
        <button onClick={() => handlePageChange("next")} disabled={currentPage === totalPages}>
          Weiter ▶
        </button>
      </div>


      {isRoleModalOpen && (
        <div className="modal222">
          <div className="modal-content222">
            <h3>Benutzer hinzufügen</h3>
            <label>
              E-Mail des Nutzers:
              <input 
                type="email" 
                value={roleEmail} 
                onChange={(e) => setRoleEmail(e.target.value)} 
                placeholder="Benutzer E-Mail"
              />
            </label>
            <br /><br />
            <label>
              Rolle:
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="organization_admin">Organisations-Admin</option>
                <option value="inventory_admin">Inventar-Admin</option>
                <option value="member">Mitglied</option>
                <option value="customer">Kunde</option>
                <option value="watcher">Beobachter</option>
              </select>
            </label>
            <br />
            <div className="modal-buttons">
              <button onClick={() => alert("Benutzer hinzugefügt!")}>Bestätigen</button>
              <button onClick={() => setRoleModalOpen(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
