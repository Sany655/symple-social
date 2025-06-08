import React from 'react'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, deleteDoc, getFirestore, onSnapshot } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import EditBlog from './EditBlog';

function ArticlePage() {
    const [error, setError] = useState("")
    const [editPostState, setEditPostState] = useState(false)
    const { id } = useParams();
    const [article, setArticle] = useState({
        title: "",
        text: "",
        img: {
            name: "",
            url: ""
        },
        datetime: {
            seconds: 0
        }
    });

    useEffect(() => {
        const docRef = doc(getFirestore(), "articles", id);
        onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const artic = doc.data();
                artic.id = doc.id;
                setArticle(artic);
            } else {
                window.location.href = "/"
            }
        });
    }, [])

    async function deleteImage() {
        try {
            await deleteObject(ref(getStorage(), 'articles/' + article.img.name))
            deletearticle();
        } catch (error) {
            setError(error.message)
            console.log(error.message);
        }
    }

    async function deletearticle() {
        try {
            await deleteDoc(doc(getFirestore(), "articles", article.id))
        } catch (error) {
            setError(error.message)
        }
    }

    return editPostState ? <EditBlog setEditPostState={setEditPostState} article={article} /> : (
        <div className="py-5 bg-light min-vh-100">
            {/* Login Modal */}
            <div className="modal fade" id={`loginModalSingleArticle-${article.id}`} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Admin Login</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={e => {
                                e.preventDefault();
                                const password = e.target.password.value;
                                document.querySelector(`#loginModalHideBtn-${article.id}`).click();
                                if (password === process.env.REACT_APP_adminpass) {
                                    switch (e.target.actionType.value) {
                                        case "delete":
                                            if (article.img.name) {
                                                deleteImage()
                                            } else {
                                                deletearticle()
                                            }
                                            break;
                                        case "edit":
                                            setEditPostState(true);
                                            break;
                                    }
                                } else {
                                    alert('Invalid password');
                                }
                                e.target.reset();
                            }}>
                                <input type="hidden" name="actionType" value="" />
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    placeholder="Enter admin password"
                                    required
                                    autoComplete="on"
                                    autoFocus={true}
                                />
                            </form>
                            <button className="d-none" type="button" data-bs-dismiss="modal" id={`loginModalHideBtn-${article.id}`}></button>
                        </div>
                    </div>
                </div>
            </div>
            <article className="container">
                <div className="bg-white rounded-3 shadow-sm p-4 p-md-5">
                    <header className="mb-4">
                        <div className="d-flex justify-content-between align-items-start">
                            <h1 className="display-6 display-md-4 display-lg-3 fw-bold mb-3 text-break"
                                style={{
                                    textTransform: "capitalize",
                                    fontSize: "calc(1.2rem + 1.5vw)",
                                    lineHeight: "1.2"
                                }}>
                                {article.title}
                            </h1>
                            <div className="dropdown">
                                <button className="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="bi bi-three-dots-vertical fs-4"></i>
                                </button>
                                <ul className="dropdown-menu">
                                    <li className="dropdown-item" style={{ cursor: 'pointer' }} data-bs-toggle="modal" data-bs-target={`#loginModalSingleArticle-${article.id}`} onClick={() => {
                                        const actionInput = document.querySelector(`#loginModalSingleArticle-${article.id} input[name="actionType"]`);


                                        actionInput.value = 'edit';
                                    }}>
                                        <i className="bi bi-pencil-fill me-2"></i>Edit
                                    </li>
                                    <li className="dropdown-item text-danger" style={{ cursor: 'pointer' }} data-bs-toggle="modal" data-bs-target={`#loginModalSingleArticle-${article.id}`} onClick={() => {
                                        const actionInput = document.querySelector(`#loginModalSingleArticle-${article.id} input[name="actionType"]`);
                                        actionInput.value = 'delete';
                                    }}>
                                        <i className="bi bi-x-lg me-2"></i>Delete
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="text-muted mb-4">
                            <i className="bi bi-calendar3 me-2"></i>
                            {new Date(article.datetime?.seconds * 1000).toLocaleString('en-US', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}
                        </div>
                    </header>

                    {error && <div className='alert alert-danger'>{error}</div>}

                    {article.img.url && (
                        <div className="mb-4">
                            <img
                                src={article.img.url}
                                alt={article.title}
                                className="img-fluid rounded-3 w-100"
                                style={{ maxHeight: '500px', objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    {/* <div className="">
                        <pre className="lh-lg fs-5 overflow-auto" style={{ whiteSpace: 'pre-wrap' }}>
                            {article.text}
                        </pre>
                    </div> */}
                    {/* <div
                        className="lh-lg fs-5"
                        dangerouslySetInnerHTML={{ __html: article.text }}
                    /> */}
                    {/* {article.text.includes('<') && article.text.includes('>') ? (
                        // If text contains HTML tags, render with dangerouslySetInnerHTML
                        <div
                            className="lh-lg fs-6 fs-md-5"
                            dangerouslySetInnerHTML={{ __html: article.text }}
                        />
                    ) : (
                        // If text is plain text, render normally with pre-wrap
                        <pre className="lh-lg fs-6 fs-md-5 overflow-auto text-justify" style={{ whiteSpace: 'pre-wrap' }}>{article.text}</pre>
                    )} */}
                    {article.text.includes('<') && article.text.includes('>') ? (
                        <div
                            className="article-content"
                            style={{
                                fontSize: "calc(0.9rem + 0.3vw)",
                                lineHeight: "1.8",
                                letterSpacing: "0.01em"
                            }}
                            dangerouslySetInnerHTML={{ __html: article.text }}
                        />
                    ) : (
                        <pre
                            className="article-content text-justify"
                            style={{
                                whiteSpace: 'pre-wrap',
                                fontSize: "calc(0.9rem + 0.3vw)",
                                lineHeight: "1.8",
                                letterSpacing: "0.01em",
                                fontFamily: 'inherit'
                            }}>
                            {article.text}
                        </pre>
                    )}
                </div>
            </article>
        </div>
    )
}

export default ArticlePage