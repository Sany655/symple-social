import { getAuth, signOut } from 'firebase/auth'
import React from 'react'
import { useSelector } from "react-redux"
import { NavLink } from 'react-router-dom'

const Header = () => {
    const user = useSelector(state => state.auth).user

    return (
        <header className=''>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container-fluid">
                    <NavLink className="navbar-brand" to={"/"}>Symple Social</NavLink>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            {
                                user ? (
                                    <>
                                        <li className="nav-item">
                                            <NavLink to={"/feed"} className="nav-link">Home</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to={"/notes"} className="nav-link">Notes</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to={"/todo"} className="nav-link">Todo</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to={"/friend"} className="nav-link">Friends</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to={"/people"} className="nav-link">Peoples</NavLink>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="nav-item">
                                            <NavLink to={"/share-file"} className="nav-link">Share File</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to={"/register"} className="nav-link">Register</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to={"/login"} className="nav-link">Login</NavLink>
                                        </li>
                                    </>
                                )
                            }
                        </ul>
                        <form className="d-flex me-2" onSubmit={e => e.preventDefault()}>
                            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                            <button className="btn btn-outline-light">Search</button>
                        </form>
                        {
                            user && <div className='dropdown'>
                                <a className="nav-link" href="#" id="dropdownMenuButton1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {/* <img src={user.photoURL ? user.photoURL : "default_user.png"} alt="" className='rounded-circle border' width="100%"  /> */}
                                    <i className="bi bi-person-circle text-white" style={{fontSize:"30px"}}></i>
                                </a>
                                <ul style={{ zIndex: 100 }} className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                                    <li className='px-4'>{user.displayName || "Name"}</li>
                                    <li className='px-4'>{user.email || "Email"}</li>
                                    <li className='px-4'>{user.phone || "Phone"}</li>
                                    <li className='px-4 pb-1'><button className="btn btn-warning btn-sm ">Edit Profile</button></li>
                                    <li className='px-4'><button className="btn btn-primary btn-sm" onClick={() => signOut(getAuth()).then().catch(err => console.log(err))}>Logout</button></li>
                                </ul>
                            </div>
                        }
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Header