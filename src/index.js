import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './page/Error';
import Feed from './page/Feed';
import Protected from './page/middlewares/Protected';
import Login from './page/login';
import Register from './page/register';
import Public from './page/middlewares/Public';
import Notes from './page/notes';
import Friend from './page/friend';
import Inbox from './page/inbox';
import People from './page/people';
import Post from './page/post';
import Blog from './page/Blog';
// import "bootstrap/dist/js/bootstrap.bundle";

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <Blog />,
            },
            {
                path: "/feed",
                element: <Protected><Feed /></Protected>,
            },
            {
                path: "/notes",
                element: <Protected><Notes /></Protected>,
            },
            {
                path: "/friend",
                element: <Protected><Friend /></Protected>,
            },
            {
                path: "/inbox",
                element: <Protected><Inbox /></Protected>,
            },
            {
                path: "/people",
                element: <Protected><People /></Protected>,
            },
            {
                path: "/login",
                element: <Public><Login /></Public>
            },
            {
                path: "/register",
                element: <Public><Register /></Public>
            },
        ],
    },
]);

root.render(
    <RouterProvider router={router} />
);

