import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoginStatus } from "../../context/LoginStatusContext";
import { Orders } from "./orders";
import { Login } from "../login/Login";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useLoginStatusDispatcher } from "../../context/LoginStatusContext";
import { useUpdateUserRights } from "../../hooks/user-helper";
import { OrganizationManagement } from "./organizationManagement";
import './Profile.css';

const CHECK_EMAIL_EXISTENCE = gql`
  query CheckEmail($email: String!) {
    checkEmailExists(email: $email) {
      exists
    }
  }
`;

const CHANGE_RIGHTS = gql`
  mutation updateUserRights($newRights: String,
  $organizationId: String
  $userId: String) {
    updateUserRights(newRights: $newRights,
    organizationId: $organizationId,
    userId: $userId) {
      ok,
      infoText,
      statusCode
    }
  }
`;

const CHANGE_PASSWORD = gql`
mutation updateUser($password: String!, $userId: String!){
  updateUser(password: $password, userId: $userId){
    ok
    statusCode
    infoText
  }
}
`;

const GET_USERID = gql`
query filterUsers($roleEmail: String){
  filterUsers(email: $roleEmail){
    userId
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
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [editField, setEditField] = useState<"email" | "address" | null>(null);
  const [newEmail, setNewEmail] = useState(email);
  const [newAddress, setNewAddress] = useState("");
  const [roleEmail, setRoleEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("User");
  const setLoginAction = useLoginStatusDispatcher();
  const [updateUserRightsMutation] = useUpdateUserRights();
  const [changeUserRights] = useMutation(CHANGE_RIGHTS);
  const [changePassword] = useMutation(CHANGE_PASSWORD);
  const [getUserID] = useMutation(CHANGE_PASSWORD);
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');



  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || !repeatPassword) {
      setErrorMessage('Alle Felder müssen ausgefüllt werden!');
      return;
    }

    if (password !== repeatPassword) {
      setErrorMessage('Die Passwörter stimmen nicht überein!');
      return;
    }
    if (!loginStatus.loggedIn){
      return;
    }

    try {
      const { data } = await changePassword({
        variables: {
          userId: loginStatus.user?.userId,
          password: password
        }
      });

      if (data?.updateUser?.ok) {
        setErrorMessage('');
        alert('Passwortänderung erfolgreich!');
        setPasswordModalOpen(false);
      } else {
        setErrorMessage(data?.updateUser?.message || 'Passwortänderung fehlgeschlagen!');
      }
    } catch (error) {
      setErrorMessage('Fehler bei der Passwortänderung. Bitte versuche es später erneut.');
    }
  };

  const handleRightsChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roleEmail) {
      alert('Alle Felder müssen ausgefüllt werden!');
      return;
    }
    try {
      console.log(roleEmail);
      const { data: userData } = await getUserID({
        variables: { roleEmail },
      });
      console.log("userd: "+userData);

      if (!userData?.filterUsers?.userId) {
        alert("Benutzer-ID konnte nicht gefunden werden.");
        return;
      }

    const userId = userData.filterUsers.userId;
    console.log("stev");
    console.log(userId);
    
      const { data } = await changeUserRights({
        variables: {
          userId: userId,
          newRights: selectedRole,
          organization: "69590f30-0959-406d-a9b5-3fefbda28fb4"
        }
      });
      console.log("userId");

      if (data?.updateUserRights?.ok) {
        alert(`Rolle "${selectedRole}" erfolgreich zugewiesen!`);
      } else {
        alert(`Fehler: ${data?.updateUserRights?.infoText || "Unbekannter Fehler"}`);
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      alert("Fehler beim Zuweisen der Rolle.: ");
    }
  
    setRoleModalOpen(false);
  };



  const handleLogout = () => {
    setLoginAction({ type: "logout" });
    localStorage.removeItem("authToken");
    console.log("User logged out");
    navigate("/");
  };

  const handleSave = () => {
    setModalOpen(false);
  };



  const handleAssignRole = async () => {
   // if (loading) return;


    const organizationId = loginStatus.loggedIn
    ? loginStatus.user?.organizationInfoList?.[0]?.id
    : undefined;

    try {
      const response = await updateUserRightsMutation({
        variables: {
          email,
          rights: [selectedRole],
        },
      });

      if (response.success) {
        console.log(`Role ${selectedRole} successfully assigned to ${roleEmail}`);
        alert(`Rolle "${selectedRole}" erfolgreich zugewiesen!`);
      } else {
        console.error("Failed to assign role:", response);
        alert(`Fehler: ${response.info}`);
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      alert("Fehler beim Zuweisen der Rolle.");
    }

    setRoleModalOpen(false);
  };

  if (!loginStatus.loggedIn) {
    return <Login onClose={() => {}} />;
  }

  return (
    <div className="profile-container5">
      <h2>Nutzereinstellungen</h2>
      <div className="profile-details5">
        <p style={{ marginBottom: '20px' }}>
          Vorname: {loginStatus.user?.firstName || ""}
        </p>
        <p style={{ marginBottom: '20px' }}>
          Name: {loginStatus.user?.lastName || ""}
        </p>
        <p>
          Rolle: {loginStatus.user?.organizationInfoList?.length > 0
            ? Array.isArray(loginStatus.user?.organizationInfoList?.[0]?.rights)
  ? loginStatus.user.organizationInfoList[0].rights.join(", ")
  : loginStatus.user.organizationInfoList[0].rights || "keine Rechte"
            : "keine Organisation"}
          <button onClick={() => setRoleModalOpen(true)} style={{ marginLeft: '10px' }} className="edit-button5">
            Rechte zuweisen
          </button>
        </p>
        <p>
          E-Mail: {loginStatus.user?.email || " "}
          <button onClick={() => { setModalOpen(true); setEditField("email"); }} className="edit-button5">
            ✎
          </button>
        </p>
        <p>
          Adresse: {(loginStatus.user?.street && loginStatus.user?.houseNumber + ", " + loginStatus.user?.city && loginStatus.user?.postcode)|| " "}
          <button onClick={() => { setModalOpen(true); setEditField("address"); }} className="edit-button5">
            ✎
          </button>
        </p>
        <p style={{ marginBottom: '20px' }}>
          Matrikelnummer: {loginStatus.user?.matricleNumber || ""}
        </p>
        <button style={{ marginBottom: '20px' }} onClick={() => setPasswordModalOpen(true)} className="logout-button5">Passwort ändern</button>
        <br></br>
        <button onClick={handleLogout} className="logout-button5">Logout</button>
      </div>
      

      {isModalOpen && (
        <div className="modal222">
          <div className="modal-content222">
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

      {isPasswordModalOpen && (
                <div className="modal222">
                <div className="modal-content222">
                  <h3>Passwort ändern</h3>
                  <label>
                    Neues Passwort:
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Passwort"
                    />
                  </label>
                  <br /><br />
                  <label>
                    Passwort wiederholen:
                    <input 
                      type="password" 
                      value={repeatPassword} 
                      onChange={(e) => setRepeatPassword(e.target.value)} 
                      placeholder="Passwort"
                    />
                  </label>
                  {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="modal-buttons">
              <button onClick={handlePasswordChange}>Bestätigen</button>
              <button onClick ={() => {setPasswordModalOpen(false); setErrorMessage("")}}>Abbrechen</button>
            </div>
      </div>      </div>
      )}

      {isRoleModalOpen && (
        <div className="modal222">
          <div className="modal-content222">
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
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <br /><br />
            <div className="modal-buttons">
              <button onClick={handlePasswordChange}>Bestätigen</button>
              <button onClick={() => setPasswordModalOpen(false)}>Abbrechen</button>
            </div>

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
              <button onClick={handleRightsChange}>Bestätigen</button>
              <button onClick={() => setRoleModalOpen(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
      <Orders />
    </div>
  );
}
