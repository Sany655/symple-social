import { Navigate, useNavigate, useRouteError } from "react-router-dom";
import React from "react";
export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);
    const navigate = useNavigate();
    return (
        <div className="container vh-100 d-flex justify-content-center align-items-center">
            <div>
                <h1>Oops!</h1>
                <p>{error.statusText || error.message}</p>
                <button className="btn btn-primary" onClick={()=>navigate(-1,{replace:true})}>Back</button>
            </div>
        </div>
    );
}