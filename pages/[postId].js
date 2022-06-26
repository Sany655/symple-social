import withProtected from './middlewares/withProtected'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { deleteDoc, doc, getFirestore, onSnapshot } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import Spinner from '../components/Spinner'

const Post = () => {
    const [postUser, setPostUser] = useState({})
    const router = useRouter()
    const [blog, setBlog] = useState({})
    const { user } = useSelector(state => state.auth)
    const [postLoad, setPostLoad] = useState(true)

    function deleteBlog(id) {
        confirm("Are sure about it?") && deleteDoc(doc(getFirestore(), "blogs", id)).catch(err => console.log(err.message))
    }

    useEffect(() => {
        onSnapshot(doc(getFirestore(), "blogs", router.query.postId), snapblog => {
            if (snapblog.exists()) {
            const blg = snapblog.data()
            blg.id = snapblog.id;
            setBlog(blg)
                onSnapshot(doc(getFirestore(), "users", blg.user.uid), snapuser => {
                    setPostUser(snapuser.data())
                    setPostLoad(false)
                })
            } else {
                alert("this post has deleted!")
                router.push("/")
            }
        })
    }, [])
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-10 col-lg-6 col-xl-3 mx-auto py-5">
                    {postLoad ? <Spinner /> : !postLoad && blog!==null > 0 && <div className="card">
                        <div className="card-body pb-0">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <Image src={postUser.photoURL ? postUser.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"40px"} height="40px" />
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
                            <p className='my-4' onClick={() => {

                            }}>{blog.blog}</p>
                            <div className="d-flex justify-content-around align-items-center border-top py-2">
                                <i className="bi bi-hand-thumbs-up" role={"button"}>Like</i>
                                <i className="bi bi-chat-left" role={"button"}>comment</i>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    )
}

export default withProtected(Post)