import React, { useEffect, useState } from 'react'
import { doc, getFirestore, onSnapshot } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

const PostComponent = ({ blog, user, deleteBlog }) => {
    const [postUser, setPostUser] = useState({})
    const navigate = useNavigate()
    useEffect(() => {
        onSnapshot(doc(getFirestore(), "users", blog.user.uid), snapuser => setPostUser(snapuser.data()))
    }, [blog.user.uid])
    return (
        <div className="card">
            <div className="card-body pb-0">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                        <img src={postUser.photoURL ? postUser.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"40px"} height="40px" />
                        <h4 className='display-6'>{postUser.displayName ? postUser.displayName : postUser.email}</h4>
                    </div>
                    <div className="dropdown">
                        <i className="bi bi-three-dots-vertical fs-4" role={"button"} data-bs-toggle="dropdown" data-bs-target="blog-option-dropdown"></i>
                        <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg-start">
                            {
                                postUser.uid === user.uid && (
                                    <>
                                        <li className="dropdown-item" role={"button"} onClick={() => deleteBlog(blog.id)}>Delete</li>
                                    </>
                                )
                            }
                            <li className="dropdown-item" role={"button"}>Report</li>
                        </ul>
                    </div>
                </div>
                {/* <p className='my-4' onClick={() => {
                    navigate(`./post/${blog.id}`)
                }}>{blog.blog.substring(0,100)}{blog.blog.length>100&&"..."}</p> */}
                <p className='my-4' >{blog.blog}</p>
                {/* <div className="d-flex justify-content-around align-items-center border-top py-2">
                    <i className="bi bi-hand-thumbs-up" role={"button"}>Like</i>
                    <i className="bi bi-chat-left" role={"button"}>comment</i>
                </div> */}
            </div>
        </div>
    )
}

export default PostComponent