import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
interface ProfileProps {
  onLogout: () => void;
}

export function Orders({ onLogout }: ProfileProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [isModalOpen, setModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [editField, setEditField] = useState<"email" | "address" | null>(null);
  const [newEmail, setNewEmail] = useState(email);
  const [newAddress, setNewAddress] = useState("");
  const [roleEmail, setRoleEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("User");

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleSave = () => {
    // Save logic for email or address
    setModalOpen(false);
  };

  const handleAssignRole = () => {
    // Logic to assign the role to the email
    console.log(`Assigning ${selectedRole} role to ${roleEmail}`);
    setRoleModalOpen(false);
  };

  return (
      <div style={{marginLeft:"20px"}}>
          <h2>Offene Anfragen</h2>
          </div>
      ) 
}
