import { useState } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import { gql, useMutation } from "@apollo/client";
import { useLoginStatusDispatcher } from "../../context/LoginStatusContext";

interface LoginProps {onClose: () => void;}

const query = gql`
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    ok,
    infoText
  }
}
`;

const REGISTER_MUTATION = gql`
mutation Register($firstName: String!, $lastName: String!, $email: String!, $address: String!, $postalCode: String!, $city: String!, $password: String!) {
  updateUser(input: {
    firstName: $firstName,
    lastName: $lastName,
    email: $email,
    address: $address,
    postalCode: $postalCode,
    city: $city,
    password: $password
  }) {
    success
    message
  }
}
`;

export function Login(props: LoginProps) {
  const setLoginAction = useLoginStatusDispatcher();
  const [isLogin, setIsLogin] = useState(true);
  const [first_name, setFirstName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [registerUser] = useMutation(REGISTER_MUTATION);


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Login email:', email);
    console.log('Login Password:', password);
    try {
      const { data } = await login({
        variables: {
          email: email,
          password: password
        }
      });
  
      if (data?.login?.ok) {
        setLoginAction({ type: 'login' });
        setErrorMessage('');
        props.onClose(); // Close modal on successful login
      } else {
        setErrorMessage(data?.login?.infoText || 'Fehler beim Login!');
      }
    } catch (error) {
      setErrorMessage('Fehler bei der Anfrage. Bitte versuche es später erneut.');
    }
  };
  



  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!first_name || !name || !email || !address || !postalCode || !city || !password || !repeatPassword) {
      setErrorMessage('Alle Felder müssen ausgefüllt werden!');
      return;
    }

    if (password !== repeatPassword) {
      setErrorMessage('Die Passwörter stimmen nicht überein!');
      return;
    }

    try {
      const { data } = await registerUser({
        variables: {
          firstName: first_name,
          lastName: name,
          email,
          address,
          postalCode,
          city,
          password
        }
      });

      if (data?.updateUser?.success) {
        setErrorMessage('');
        alert('Registrierung erfolgreich! Bitte logge dich ein.');
        setIsLogin(true);
      } else {
        setErrorMessage(data?.updateUser?.message || 'Registrierung fehlgeschlagen.');
      }
    } catch (error) {
      setErrorMessage('Fehler bei der Registrierung. Bitte versuche es später erneut.');
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFirstName('');
    setName('');
    setEmail('');
    setPassword('');
    setRepeatPassword('');
    setAddress('');
    setPostalCode('');
    setCity('');
    setShowPassword(false);
    setErrorMessage('');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [login] = useMutation(query);

  return (
    <div className="login-container">
      {isLogin ? (
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <div className="form-group">
            <label htmlFor="login-email">E-Mail-Adresse</label>
            <input style={{width:'380px'}}type="text" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Passwort</label>
            <div className="password-container">
              <input style={{width:'380px'}} type={showPassword ? "text" : "password"} id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <span className="password-toggle" onClick={toggleShowPassword}>{showPassword ? <FaEye /> : <FaEyeSlash />}</span>
            </div>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="submit-button">Login</button>
          <p>Kein Konto? <button type="button" onClick={toggleForm}>Registrieren</button></p>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleRegister}>
          <h2>Registrieren</h2>
          <div style={{width:'380px'}} className="form-group"><label>Vorname</label><input type="text" value={first_name} onChange={(e) => setFirstName(e.target.value)} required /></div>
          <div style={{width:'380px'}} className="form-group"><label>Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div style={{width:'380px'}} className="form-group"><label>E-Mail-Adresse</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div style={{width:'380px'}} className="form-group"><label>Adresse</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
          <div style={{width:'380px'}} className="form-group"><label>Postleitzahl</label><input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required /></div>
          <div style={{width:'380px'}} className="form-group"><label>Ort</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} required /></div>
          <div style={{width:'380px'}} className="form-group"><label>Passwort</label><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div style={{width:'380px'}} className="form-group"><label>Passwort wiederholen</label><input type={showPassword ? "text" : "password"} value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required /></div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="submit-button">Registrieren</button>
          <p>Bereits registriert? <button type="button" onClick={toggleForm}>Zum Login</button></p>
        </form>
      )}
    </div>
  );
}
