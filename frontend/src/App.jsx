import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import Mine from './pages/Mine';
import CreateTransaction from './pages/CreateTransaction';
import Blocks from './pages/Blocks';
import Balance from './pages/Balance';

const App = () => {
  return (
    <div className='app-wrapper'>
      <Navbar />
      <main className='main-content'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/transactions' element={<Transactions />} />
          <Route path='/mine' element={<Mine />} />
          <Route path='/create' element={<CreateTransaction />} />
          <Route path='/blocks' element={<Blocks />} />
          <Route path='/balance' element={<Balance />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
