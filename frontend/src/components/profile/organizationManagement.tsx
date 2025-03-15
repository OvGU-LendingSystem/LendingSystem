import React, { useState, useEffect } from "react";
import { useLoginStatus } from "../../context/LoginStatusContext";
import { FaUserEdit, FaTrash } from "react-icons/fa";
import { Login } from "../login/Login";
import { gql } from "@apollo/client"; 
import { OrganizationInfo } from "../../models/user.model";
import { useLazyQuery } from "@apollo/client";
import { useMutationWithResponse } from "../../hooks/response-helper";
import { Organization } from "../../models/organization.model";
import { useMutation } from "@apollo/client";
import { startTransition } from "react";
import {  } from "../../hooks/user-helper";
import { useGetUserIDbyEmail } from "../../hooks/user-helper";
import { flattenEdges, useMutationWithResponseMapped, useLazyQueryWithResponseMapped, useSuspenseQueryWithResponseMapped } from "../../hooks/response-helper";

import "./Profile.css";

const GET_USERS = gql`
query getUsersByOrganization($organizationIds: [String!]){
  filterUsers (organizations: $organizationIds) {
    firstName
    lastName
    email
    userId
    organizations{
      edges {
        node
        {
         organizationId 
         rights
         }
      }
    }
  }
}`;

const UPDATE_USER_RIGHTS = gql`
  mutation updateUserRights($newRights: String!, $organizationId: String!, $userId: String!) {
    updateUserRights(newRights: $newRights, organizationId: $organizationId, userId: $userId) {
      ok
      infoText
      statusCode
    }
  }
`;



export function OrganizationManagement() {
  const loginStatus = useLoginStatus();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");  
  const [searchTerm, setSearchTerm] = useState("");
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [roleEmail, setRoleEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const rowsPerPage = 10;
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [updateUserRights] = useMutation(UPDATE_USER_RIGHTS);
  const userId = useGetUserIDbyEmail(roleEmail).data.userId;


  const handleRoleChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      setErrorMessage('Alle Felder müssen ausgefüllt werden!');
      return;
    }
    try {
      const { data } = await updateUserRights({
        variables: {
          newRights: selectedRole,
          organizationId: selectedOrganizationId,
          userId: userId
        }
      });

      if (data?.updateUserRights?.ok) {
        setErrorMessage('');
        alert('Rechte erfolgreich geändert!');
        setRoleModalOpen(false);
      } else {
        setErrorMessage(data?.updateUserRights?.message || 'Rechteänderung fehlgeschlagen.');
      }
    } catch (error) {
      setErrorMessage('Fehler bei der Rechteänderung. Bitte versuche es später erneut.');
    }
  };



  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrgId = e.target.value;
    startTransition(() => {
      setSelectedOrganizationId(newOrgId);
    });
  };


const [fetchUsers, { data, loading, error }] = useLazyQuery(GET_USERS);


interface GetOrgByIdResponse {
  firstName: string,
  lastName: string,
  email: string,
  userId: string,
  rights: string,
  organizations: {
      edges: {
          node: {
                  organizationId: string,
                  rights: string,
              }
          }
  }[]
}

interface UserOrg {
    firstName: string,
    lastName: string,
    email: string,
    userId: string,
    rights: string,
    organizationId: {
      edges: {
          node: {
                  organizationId: string;
                  rights: string;
              }
          }
  }[]
}


const ORGANIZATIONS2 = loginStatus?.loggedIn ? loginStatus.user?.organizationInfoList : [];

const ORGANIZATIONS = [
  { organizationId: "", name: "System-Admin" }, // Shows all users
  { organizationId: "00000000-0000-0000-0000-000000000003", name: "Stark Industries" },
  { organizationId: "1376ac52-85f7-4720-9aaa-b8bccd667aeb", name: "X-Men" },
  { organizationId: "69590f30-0959-406d-a9b5-3fefbda28fb4", name: "fara" },
  { organizationId: "75c869b4-d191-4b89-91ee-48575e4b48d6", name: "Avengers" },
  { organizationId: "c9c5feb9-01ff-45de-ba44-c0b38e268170", name: "root_organization" }
];


function useGetAllUsersInOrganization(orgId: string[]) {
  const mapToGroup = (response: GetOrgByIdResponse[]): UserOrg[] => {
      return response.map(orgRes => ({
          firstName: orgRes.firstName,
          userId: orgRes.userId,
          lastName: orgRes.lastName,
          email: orgRes.email,
          organizationId: orgRes.organizations,
          rights: orgRes.rights
          }));
  };

  return useSuspenseQueryWithResponseMapped(
      GET_USERS,
      'filterUsers',
      { variables: { organizationIds: orgId } },
      mapToGroup
  );
};

const handleFetchUsers = () => {
  fetchUsers({ variables: {} })
    .then(response => console.log("Fetched Users:", response.data))
    .catch(error => console.error("Error fetching users:", error));
};


  const userOrganizations = loginStatus.loggedIn
    ? loginStatus.user?.organizationInfoList || []
    : [];

    const { data: organizationUsers} = useGetAllUsersInOrganization(
      selectedOrganizationId ? [selectedOrganizationId] : []
    );
    const filteredUsers = (organizationUsers || []).filter(user =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const totalRows = filteredUsers.length || rowsPerPage;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const organizationData = useGetAllUsersInOrganization([]);
  const emailID = useGetUserIDbyEmail("steven.pfeif@ovgu.de");
  
  const handleTestClick2 = () => {
    console.log("Fetched Organization Data:", emailID);
  };

const handleTestClick = () => {
  console.log("Fetched Organization Data:", organizationData);
};

const [selectedUser, setSelectedUser] = useState<UserOrg | null>(null); // New state to track selected user


const handleUserEdit = (user: UserOrg) => {
  setSelectedUser(user); // Set selected user for editing
  setRoleEmail(user.email); // Pre-fill email in the modal
  setRoleModalOpen(true); // Open the modal
};



  if (loginStatus.loggedIn) {
    return <Login onClose={() => {}} />;
  }

  return (
    <div style={{ marginTop: "30px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Organisationsverwaltung</h2>
      <label style={{ fontWeight: "bold" }}>Organisation wählen:</label>
      <select 
        value={selectedOrganizationId} 
        onChange={handleOrganizationChange}
        style={{ padding: "8px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
      >
        <option >
          Organisation auswählen
        </option>
        {ORGANIZATIONS.map((org) => (
           <option key={org.organizationId} value={org.organizationId}>
            {org.name}
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
        <button onClick={() => {setRoleModalOpen(true); setSelectedUser(null); setRoleEmail("");}} style={{ padding: "8px 12px", borderRadius: "5px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
          Benutzer hinzufügen
        </button>
        <button onClick= {() => {console.log(handleTestClick());}} style={{ padding: "8px 12px", borderRadius: "5px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
          test
        </button>
        <button onClick= {() => {console.log(ORGANIZATIONS2);}} style={{ padding: "8px 12px", borderRadius: "5px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
          test
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
                <td style={{ padding: "10px" }}>{user.firstName || "--"}</td>
                <td style={{ padding: "10px" }}>
                  <button style={{ marginRight: "5px", backgroundColor: "#28a745", color: "white", border: "none", padding: "5px", borderRadius: "5px", cursor: "pointer" }}
                  onClick={() => handleUserEdit(user)}>
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


      {isRoleModalOpen && (
        <div className="modal222">
          <div className="modal-content222">
          <h3>{selectedUser ? `Rechte verändern (${selectedUser.firstName} ${selectedUser.lastName})` : "Benutzer hinzufügen"}</h3>            <label>
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
              <button onClick={() => handleRoleChange}>Bestätigen</button>
              <button onClick={() => setRoleModalOpen(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
