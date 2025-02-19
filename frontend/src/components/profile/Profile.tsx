import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoginStatus } from "../../context/LoginStatusContext";
import { Orders } from "./orders";
import { Login } from "../login/Login";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useLoginStatusDispatcher } from "../../context/LoginStatusContext";
import './Profile.css';

const CHECK_EMAIL_EXISTENCE = gql`
  query CheckEmail($email: String!) {
    checkEmailExists(email: $email) {
      exists
    }
  }
`;

export function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginStatus = useLoginStatus();
  const { email } = location.state || {};
  const [isModalOpen, setModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [editField, setEditField] = useState<"email" | "address" | null>(null);
  const [newEmail, setNewEmail] = useState(email);
  const [newAddress, setNewAddress] = useState("");
  const [roleEmail, setRoleEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("User");
  const setLoginAction = useLoginStatusDispatcher();

  const handleLogout = () => {
    setLoginAction({ type: "logout" });
    localStorage.removeItem("authToken");
    console.log("User logged out");
    navigate("/");
  };

  const handleSave = () => {
    setModalOpen(false);
  };

  const { data, loading, error } = useQuery(CHECK_EMAIL_EXISTENCE, {
    variables: { email: roleEmail },
    skip: !roleEmail, // Only run when there's an email input
  });

  const handleAssignRole = () => {
    if (loading) return; // Prevent clicking while checking

    if (error || !data?.checkEmailExists?.exists) {
      alert("Diese E-Mail existiert nicht!");
      return;
    }

    console.log(`Assigning ${selectedRole} role to ${roleEmail}`);
    setRoleModalOpen(false);
  };

  if (!loginStatus.loggedIn) {
    return <Login onClose={() => {}} />;
  }

  return (
    <div className="profile-container">
      <h2>Nutzereinstellungen</h2>
      <div className="profile-details">
        <p style={{ marginBottom: '20px' }}>
          Vorname: {loginStatus.user?.firstName || ""}
        </p>
        <p style={{ marginBottom: '20px' }}>
          Name: {loginStatus.user?.lastName || ""}
        </p>
        <p>
          Rolle: {loginStatus.user?.organizationInfoList?.length > 0
            ? loginStatus.user.organizationInfoList[0].rights
            : "keine Organisation"}
          <button onClick={() => setRoleModalOpen(true)} style={{ marginLeft: '10px' }} className="edit-button">
            Rechte zuweisen
          </button>
        </p>
        <p>
          E-Mail: {loginStatus.user?.email || " "}
          <button onClick={() => { setModalOpen(true); setEditField("email"); }} className="edit-button">
            ✎
          </button>
        </p>
        <p>
          Adresse: {"Keine Adresse angegeben"}
          <button onClick={() => { setModalOpen(true); setEditField("address"); }} className="edit-button">
            ✎
          </button>
        </p>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {isModalOpen && (
        <div className="modal22">
          <div className="modal-content22">
            <h3>{editField === "email" ? "Email" : "Adresse"} Bearbeiten</h3>
            {editField === "email" ? (
              <label>
                Email:
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                />
              </label>
            ) : (
              <label>
                Adresse:
                <input 
                  type="text" 
                  value={newAddress} 
                  onChange={(e) => setNewAddress(e.target.value)} 
                />
              </label>
            )}
            <br />
            <div className="modal-buttons">
              <button onClick={handleSave}>Speichern</button>
              <button onClick={() => setModalOpen(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {isRoleModalOpen && (
        <div className="modal22">
          <div className="modal-content22">
            <h3>Rechte zuweisen</h3>
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
            {data && !data.checkEmailExists.exists && (
              <p style={{ color: "red" }}>Diese E-Mail existiert nicht!</p>
            )}
            <label>
              Rolle:
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="Guest">Guest</option>
                <option value="Manager">Member</option>
                <option value="Admin">Inventaradmin</option>
                <option value="Admin">Organisationsadmin</option>
              </select>
            </label>
            <br />
            <div className="modal-buttons">
              <button onClick={handleAssignRole}>Bestätigen</button>
              <button onClick={() => setRoleModalOpen(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
      <Orders />
    </div>
  );
}
