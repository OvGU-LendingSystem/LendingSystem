import { useState } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import { gql, useMutation } from "@apollo/client";
import { useLoginStatusDispatcher } from "../../context/LoginStatusContext";

interface LoginProps {}

const query = gql`
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    ok,
    infoText
  }
}
`;

export function Login(props: LoginProps) {
  const setLoginAction = useLoginStatusDispatcher();
  const [isLogin, setIsLogin] = useState(true);
  const [first_name, setFirstName] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Login email:', email);
    console.log('Login Password:', password);
    await login({
      variables: {
        email: email,
        password: password
      }
    });
    setLoginAction({ type: 'login' });
  };

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== repeatPassword) {
      setErrorMessage('Die Passwörter stimmen nicht überein!');
      return;
    }
    console.log('Register First Name:', first_name);
    console.log('Register Name:', name);
    console.log('Register Password:', password);
    console.log('Register Email:', email);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFirstName('');
    setName('');
    setPassword('');
    setRepeatPassword('');
    setEmail('');
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
            <input
              type="text"
              id="login-email"
              value={email}
              style={{width:"380px"}}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Passwort</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                value={password}
                style={{width:"380px"}}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="password-toggle" onClick={toggleShowPassword}>
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>
          <button type="submit" className="submit-button">Login</button>
          <p style={{marginTop:"5px"}}>
            Kein Konto? <button type="button" className="toggle-button" onClick={toggleForm}>Registrieren</button>
          </p>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleRegister}>
          <h2>Registrieren</h2>
          <div className="form-group">
            <label htmlFor="register-first-name">Vorname</label>
            <input
              type="text"
              id="register-first-name"
              value={first_name}
              style={{width:"380px"}}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-name">Name</label>
            <input
              type="text"
              id="register-name"
              value={name}
              style={{width:"380px"}}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">E-Mail-Adresse</label>
            <input
              type="email"
              id="register-email"
              value={email}
              style={{width:"380px"}}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Passwort</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="register-password"
                value={password}
                style={{width:"380px"}}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
             <span className="password-toggle" onClick={toggleShowPassword}>
            {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="register-repeat-password">Passwort wiederholen</label>
            <input
              type={showPassword ? "text" : "password"}
              id="register-repeat-password"
              value={repeatPassword}
              style={{width:"380px"}}

              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="submit-button">Registrieren</button>
          <p style={{marginTop:"5px"}}>
            Bereits registriert? <button type="button" className="toggle-button" onClick={toggleForm}>Zum Login</button>
          </p>
        </form>
      )}
    </div>
  );
}
