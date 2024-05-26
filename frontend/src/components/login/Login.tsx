export function Login() {
    var username, password;

    const login = () => {
        //TODO
    };

    return (
        <div style={{padding: "20px"}}>
            <h2 style={{marginBottom: '20px'}}>Anmelden</h2>

            <div style={{padding: '10px'}}>
                <div> <label>Username: </label> </div>
                <div> <input type="text" value={username} style={input}></input> </div>
            </div>
            <div style={{padding: '10px'}}>
                <div> <label>Password: </label> </div>
                <div> <input type="password" value={password} style={input}></input> </div>
            </div>
            <div style={{padding: '10px'}}>
                <button onClick={() => login()} style={buttonStyle}>Login</button>
            </div>
        
        </div>
    );
}


const input: React.CSSProperties = {
    padding: '10px',
    width: '100%',
    marginRight: '10px',
};

const buttonStyle: React.CSSProperties = {
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    marginTop: '10px',
    width: '100%'
};