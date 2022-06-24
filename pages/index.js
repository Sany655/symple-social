import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import withProtected from './middlewares/withProtected'

const Blog = () => {
    const user = useSelector(state => state.auth).user
    const [blogs, setBlogs] = useState([])
    const [post, setPost] = useState("")

    const postBlog = (e) => {
        e.preventDefault()
        addDoc(collection(getFirestore(), "blogs"), {
            user: {
                id: user.uid,
                name: user.name,
                pic: user.pic
            },
            blog: post,
            timestamp: serverTimestamp(),
            status: "approved"
        }).then(() => setPost("")).catch(err => console.log(err))
    }

    function deleteBlog(id) {
        deleteDoc(doc(getFirestore(),"blogs",id))
    }

    useEffect(() => {
        onSnapshot(query(collection(getFirestore(), "blogs"), orderBy('timestamp', 'desc'), where('status', '==', 'approved')), (snapshot) => {
            setBlogs(snapshot.docs.map(doc => ({...doc.data(),id:doc.id})))
        })
    }, [])

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-10 col-lg-6 col-xl-3 mx-auto py-5">

                    {/* post blog */}
                    <div className="card mb-4">
                        <form className="card-body" onSubmit={postBlog}>
                            <textarea placeholder="What's on your mind?" className="form-control " style={{ resize: "none" }} onChange={e => setPost(e.target.value)} value={post} />
                            <button type='submit' className="btn btn-primary btn-sm d-block ms-auto mt-3">Post</button>
                        </form>
                    </div>

                    {/* blogs */}
                    {
                        blogs.map(blog => (
                            <div className="card" key={blog.id}>
                                <div className="card-body pb-0">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-3">
                                            <Image src={blog.user.pic} alt="" className='rounded-circle' width={"40px"} height="40px" />
                                            <h4 className='display-6'>{blog.user.name}</h4>
                                        </div>
                                        <div className="dropdown">
                                            <i className="bi bi-three-dots-vertical fs-4" role={"button"} data-bs-toggle="dropdown" data-bs-target="blog-option-dropdown"></i>
                                            <ul className="dropdown-menu">
                                                {
                                                    blog.user.id === user.uid && (
                                                        <>
                                                            {/* <li className="dropdown-item" role={"button"}>Edit</li> */}
                                                            <li className="dropdown-item" role={"button"} onClick={() => deleteBlog(blog.id)}>Delete</li>
                                                        </>
                                                    )
                                                }
                                                <li className="dropdown-item" role={"button"}>Report</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <p className='my-4'>{blog.blog}</p>
                                    <div className="d-flex justify-content-around align-items-center border-top py-2">
                                        <i className="bi bi-hand-thumbs-up" role={"button"}>Like</i>
                                        <i className="bi bi-chat-left" role={"button"}>comment</i>
                                    </div>
                                </div>
                            </div>
                        ))
                    }

                </div>
            </div>
        </div>
    )
}

export default withProtected(Blog)