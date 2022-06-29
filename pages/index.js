import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import PostComponent from '../components/PostComponent'
import Spinner from '../components/Spinner'
import withProtected from './middlewares/withProtected'

const Blog = () => {
    const user = useSelector(state => state.auth).user
    const [blogs, setBlogs] = useState([])
    const [post, setPost] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)

    const postBlog = (e) => {
        setSubmitLoading(true)
        e.preventDefault()
        if (post.length > 0) {
            addDoc(collection(getFirestore(), "blogs"), {
                user: {
                    uid: user.uid
                },
                blog: post,
                timestamp: serverTimestamp(),
                status: "approved"
            }).then(() => setPost("") & setSubmitLoading(false)).catch(err => console.log(err))
        }
    }

    function deleteBlog(id) {
        confirm("Are sure about it?") && deleteDoc(doc(getFirestore(), "blogs", id))
    }

    useEffect(() => {
        setLoading(true)

        onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid)), snapChats => {
            const friends = snapChats.docs.map(snapChat => snapChat.data().status===true?snapChat.data().members.find(member => member !== user.uid): null)
            friends.push(user.uid)
            onSnapshot(query(collection(getFirestore(), "blogs"), orderBy('timestamp', 'desc'), where("user.uid", "in", friends)), (snapshot) => {
                setBlogs(snapshot.docs.map(snapblog => {
                    const blg = snapblog.data();
                    blg.id = snapblog.id;
                    setLoading(false)
                    return blg;
                }))
                if (snapshot.docs.length === 0) {
                    setLoading(false)
                }
            })
        })
    }, [])

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 col-md-10 col-lg-6 col-xl-4 mx-auto py-5">

                    {/* post blog */}
                    <div className="card mb-4 sticky-top" style={{ zIndex: 99 }}>
                        <form className="card-body" onSubmit={postBlog}>
                            <textarea placeholder="What's on your mind?" className="form-control " style={{ resize: "none" }} onChange={e => setPost(e.target.value)} value={post} />
                            <button type='submit' className="btn btn-primary btn-sm d-block ms-auto mt-3" disabled={submitLoading}>{submitLoading ? <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div> : "Post"}</button>
                        </form>
                    </div>

                    {/* blogs */}
                    {
                        loading ? <Spinner /> : blogs.map(blog => <PostComponent blog={blog} key={blog.id} deleteBlog={deleteBlog} user={user} />)
                    }

                </div>
            </div>
        </div>
    )
}

export default withProtected(Blog)