import { getAuth, signOut } from 'firebase/auth'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { useSelector } from "react-redux"

const Header = () => {
    const auth = useSelector(state => state.auth).user
    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">Navbar</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            {
                                auth ? (
                                    <>
                                        <li className="nav-item">
                                            <Link href={"/"}><a className="nav-link">Home</a></Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link href={"/blog"}><a className="nav-link">Blog</a></Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link href={"/feed"}><a className="nav-link">Feed</a></Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link href={"/inbox"}><a className="nav-link">Inbox</a></Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link href={"/notes"}><a className="nav-link">Notes</a></Link>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="nav-item">
                                            <Link href={"/register"}><a className="nav-link">Register</a></Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link href={"/login"}><a className="nav-link">Login</a></Link>
                                        </li>
                                    </>
                                )
                            }
                        </ul>
                        <form className="d-flex me-2">
                            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                            <button className="btn btn-outline-success" type="submit">Search</button>
                        </form>
                        {
                            auth && <div className='dropdown'>
                                <a className="nav-link" href="#" id="dropdownMenuButton1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {/* <img src={auth.pic} alt="" className='rounded-circle border' width="45px" height={"45px"} /> */}
                                    <Image src={auth.pic} alt="" className='rounded-circle border' width="45px" height={"45px"} />
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                                    <li className='px-4'>{auth.name || "Name"}</li>
                                    <li className='px-4'>{auth.email || "Email"}</li>
                                    <li className='px-4'>{auth.phone || "Phone"}</li>
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