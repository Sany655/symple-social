import Image from 'next/image'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import withProtected from './middlewares/withProtected'

const Inbox = () => {
    const { chats } = useSelector(state => state.inbox)
    const { user } = useSelector(state => state.auth)
    
    return (
        <div className="container-fluid" style={{ flex: "1 1 auto" }}>
            <div className="row h-100">
                <div className="col-md-6 xl-3 m-auto card h-100">
                    <div className="card-body h-100 d-flex flex-column">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-3">
                                <Image src={chats.photoURL ? chats.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"25px"} height="25px" />
                                <h5 className='m-0'>{chats.displayName || chats.email}</h5>
                                <i className='bg-success rounded-circle' style={{ width: "10px", height: "10px" }}></i>
                            </div>
                            <div className="dropdown">
                                <i className="bi bi-three-dots-vertical" role={"button"} data-bs-toggle="dropdown" aria-expanded="false"></i>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                                    <li><a className='dropdown-item'>a</a></li>
                                    <li><a className='dropdown-item'>a</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className='card h-100'>
                            <div className="card-body overflow-auto d-flex flex-column-reverse" style={{ height: "70vh" }}>
                                {
                                    chats.messages.map(message => {
                                        if (message.sentBy === user.uid) {
                                            // return <div key={message.uid} className='my-3 text-end'><p className='text-light bg-primary p-1 d-inline rounded'>{message.message}</p> <p>{message.sentAt.toDate}</p></div>
                                        } else {
                                            // return <div key={message.uid} className='my-3 text-start'><p className='text-primary bg-light p-1 d-inline rounded'>{message.message}</p> <p>{message.sentAt.toDate}</p></div>
                                        }
                                    })
                                }
                            </div>
                        </div>
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Message" />
                            <span className="input-group-text bi bi-send" id="basic-addon2" role={"button"}></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withProtected(Inbox)