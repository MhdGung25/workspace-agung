import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Pages
import Home from './pages/Home';
import Notes from './pages/Notes';
import TodoList from './pages/TodoList';
import AddTask from './pages/AddTask';

function App() {
  return (
    <Router>
      {/* Flex Col & Min-H-Screen memastikan footer tetap di bawah 
        meskipun konten halaman sedang sedikit/kosong 
      */}
      <div className="flex flex-col min-h-screen bg-[#f8f9fd]">
        
        {/* Navbar tetap muncul di semua halaman */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/todos" element={<TodoList />} />
            <Route path="/add-task" element={<AddTask />} />
            
            {/* Jalur cadangan jika user mengetik URL asal (404) */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Menggunakan komponen Footer yang sudah di-import.
          Pastikan di dalam file ./components/Footer.jsx sudah rapi.
        */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;