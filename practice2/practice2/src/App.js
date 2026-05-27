import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Form from './pages/Form';
import Edit from './pages/Edit';

import {PassProvider} from './context/PassContext';
import './App.css';

const App = () => {
  return (
    <PassProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/add" element={<Form />} />
            <Route path="/edit/:id" element={<Edit />} />
          </Routes>
        </Router>
      </PassProvider>
  );
};

export default App;