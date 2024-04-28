import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Borrowing } from './pages/Borrowing';
import { Contact } from './pages/Contact';
import { ErrorPage } from './pages/ErrorPage';
import Warenkorb from './pages/Warenkorb'; // Remove curly braces for default export

function App() {
  return (
    <div className="App">
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<ErrorPage />} />
            <Route index element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/borrowing" element={<Borrowing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/warenkorb" element={<Warenkorb />} /> {/* Updated Warenkorb route */}
          </Routes>
        </BrowserRouter>
      </div>
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>Hello World!</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
