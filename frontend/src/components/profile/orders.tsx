import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './Profile.css'


export function Orders() {
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
    navigate("/");
  };

  const handleSave = () => {
    setModalOpen(false);
  };

  const handleAssignRole = () => {
    console.log(`Assigning ${selectedRole} role to ${roleEmail}`);
    setRoleModalOpen(false);
  };

  return (
            <div style={{marginTop:"30px"}}>
          <h2></h2>
          </div>
      ) 
}
