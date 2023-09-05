import React, { useState } from 'react'
import { useEffect } from 'react'
import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRef } from 'react'
import SingleArticle from './SingleArticle';
import Spinner from '../../components/Spinner';

function Blog() {
    const imgControl = useRef()
    const closeBTN = useRef()
    const [articles, setArticles] = useState([])
    const [input, setInput] = useState({
        title: "",
        img: {
            url:"",
            name:""
        },
        text: "",
        loading: false,
        error: "",
    })
    const [disabled, setdisabled] = useState(true)

    function articleWriting() {
        const pas = window.prompt("What is the password?")
        if (pas === process.env.REACT_APP_adminpass)
            setdisabled(false)
        else
            alert("Mail you article on this email address mazharulalam26@gmail.com")
    }

    const submitArticle = async e => {
        e.preventDefault();
        setInput({ ...input, loading: true })
        if (imgControl.current?.files[0]) {
            uploadfiles()
        } else {
            writingArtic()
        }
    }

    async function uploadfiles() {
        const storage = getStorage();
        const file = imgControl.current.files[0]
        const storageRef = ref(storage, 'articles/' + file.name);
        try {
            const snapshot = await uploadBytes(storageRef, file)
            try {
                const downloadURL = await getDownloadURL(snapshot.ref)
                writingArtic(downloadURL,file.name)
            } catch (error) {
                setInput({ ...input, error: 'Error getting download URL: ' + error });
            }
        } catch (error) {
            setInput({ ...input, error: 'Error uploading file: ' + error });
        }
    }

    function writingArtic(url = "",fileName = "") {
        addDoc(collection(getFirestore(), "articles"), {
            title: input.title,
            text: input.text,
            img: {
                url:url,
                name:fileName
            },
            datetime: serverTimestamp()
        })
            .then(async (article) => {

            })
            .catch(err => setInput({ ...input, error: err.message }))
            .finally(() => {
                setInput({ ...input, loading: false })
                closeBTN.current.click();
            })
    }

    useEffect(() => {
        onSnapshot(query(collection(getFirestore(), "articles"), orderBy('datetime', 'desc')),
            snapshot => {
                setArticles(snapshot.docs.map(doc => {
                    const article = doc.data()
                    article.id = doc.id
                    return article;
                }))
            })
    }, [])

    return (
        <>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Article</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form method="post" onSubmit={submitArticle}>
                            <div className="modal-body">
                                <input onChange={e => setInput({ ...input, title: e.target.value })} type="text" className="form-control mb-2 " placeholder='Write the header' value={input.title} required />
                                <div className="mb-3">
                                    <label htmlFor="formFile" className="form-label">Provide any file (optional)</label>
                                    <input className="form-control" type="file" id="formFile" accept='image/*' ref={imgControl} />
                                </div>
                                <textarea onChange={e => setInput({ ...input, text: e.target.value })} value={input.text} className='form-control' rows="4" placeholder='Write the article' required></textarea>
                            </div>
                            <div className="modal-footer">
                                {input.error && <p className='text-danger'>{input.error}</p>}
                                <button ref={closeBTN} type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => {
                                    setInput({ title: "", img: null, text: "", loading: false, error: "" })
                                    imgControl.current.value = null;
                                }}>Close</button>
                                <button className="btn btn-primary" type="submit" disabled={input.loading}>
                                    Post
                                    {input.loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-md-8 p-4">
                        <div className="d-grid mb-3" onDoubleClick={articleWriting}>
                            <button type="button" className="btn btn-primary btn-block" data-bs-toggle="modal" data-bs-target="#exampleModal" disabled={disabled}>
                                Write an article
                            </button>
                        </div>
                        {
                            articles.length ? articles.map((article, index) => <SingleArticle key={index} article={article} />) : <Spinner />
                        }
                    </div>
                    <div className="col-md-4 p-4">
                        <div className="card">
                            <div className="card-header bg-primary text-light">
                                <h5>Latest Articles</h5>
                            </div>
                            <ul className='list-group'>
                            </ul>
                        </div>
                        <div className="card mt-2">
                            <div className="card-header bg-primary text-light">
                                <h5>Top Aricles</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <footer className="bg-primary pt-4 text-light">
                <div className="container">
                    <div className="row">

                        <div className="col-4">
                            <h4>Partners</h4>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWvo20hLfiJnfnW5fvZi3-LhW-BL8uXP-FnxfMmmC1&s" width={100} alt="" />
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWvo20hLfiJnfnW5fvZi3-LhW-BL8uXP-FnxfMmmC1&s" width={100} alt="" />
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWvo20hLfiJnfnW5fvZi3-LhW-BL8uXP-FnxfMmmC1&s" width={100} alt="" />
                        </div>
                        <div className="col-4">
                            <h5>Important Links</h5>
                            <ul className=''>
                                <li className=''>articles no 1</li>
                                <li className=''>articles no 2</li>
                                <li className=''>articles no 3</li>
                            </ul>
                        </div>
                        <div className="col-4">
                            <img className='text-light' width={"150px"} src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png" alt="" />
                        </div>
                    </div>
                </div>
            </footer> */}
        </>
    )
}

export default Blog