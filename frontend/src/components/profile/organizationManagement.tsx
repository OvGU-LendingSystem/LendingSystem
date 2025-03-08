import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useUpdateUserRights } from "../../hooks/user-helper";
import { useLoginStatus } from "../../context/LoginStatusContext";
import './Profile.css';


export function OrganzationManagement() {
  const loginStatus = useLoginStatus();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);

  const userOrganizations = loginStatus.loggedIn
    ? loginStatus.user?.organizationInfoList || []
    : [];

  const getOrganizationName = (orgId: any) => {
  };

  const usersData = true;
  const usersLoading = true;
  const organizationUsers = [3,4,2];


  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Organisationsverwaltung</h2>
      {/* Organization Dropdown */}
      <label>Organisation wählen:</label>
      <select
        value={selectedOrganizationId || ""}
        //onChange={(e) => setSelectedOrganizationId(e.target.value)}
      >
        <option value="" disabled>
          Organisation auswählen
        </option>
        {userOrganizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
        
      {/* Users Table */}
      {selectedOrganizationId && (
        <div>
          <h3>Mitglieder von {}</h3>
          {usersLoading ? (
            <p>Lädt Benutzer...</p>
          ) : (
            <table className="organization-table">
              <thead>
                <tr>
                  <th>Vorname</th>
                  <th>Nachname</th>
                  <th>E-Mail</th>
                </tr>
              </thead>
              <tbody>
                {organizationUsers?.map((user: any) => (
                  <tr key={user.id}>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
