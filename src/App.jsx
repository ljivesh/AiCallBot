import React from 'react';

import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';

const router = createBrowserRouter([{
  path: '/',
  element: <Home />,
},
  {
    path: '/room/:roomId',
    element: <Room />
  }
])

const App = ()=> {


  return <RouterProvider router={router} />

}


export default App;
