import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Form from './pages/Form';
import DataListener from './components/DataListener';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Form />} />
          <Route path="/listen" element={<DataListener />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;