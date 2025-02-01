import './App.css';
import { Router } from './components/router/Router';
import { useTitle } from './hooks/use-title';

function App() {
  useTitle('OvGU - LendingSystem');

  return <Router />
}

export default App;
