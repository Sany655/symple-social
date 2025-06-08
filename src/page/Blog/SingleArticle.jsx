import React from 'react'
import { useState } from 'react';
import { doc, deleteDoc, getFirestore } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import EditBlog from './EditBlog';
import { Link } from 'react-router-dom';

function SingleArticle({ article }) {
    const [error, setError] = useState("")
    const [editPostState, setEditPostState] = useState(false)

    async function deleteImage() {
        alert(article.id)
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
        <article className="container my-4 p-4 bg-white rounded shadow-sm">
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
            <header className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h1 className="display-6 display-md-4 display-lg-3 fw-bold mb-3 text-break"
                        style={{
                            textTransform: "capitalize",
                            fontSize: "calc(1.2rem + 1.5vw)",
                            lineHeight: "1.2"
                        }}>
                        <Link to={'blog/'+article.id} className='text-decoration-none text-dark'>{article.title}</Link>
                    </h1>
                    <div className="dropdown">
                        <button className="btn btn-link btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bi bi-three-dots-vertical"></i>
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
                <small className="text-muted">
                    {new Date(article.datetime?.seconds * 1000).toLocaleString('en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })}
                </small>
            </header>

            {error && <div className='alert alert-danger'>{error}</div>}

            {article.img.url && (
                <div className="mb-4">
                    <img src={article.img.url} alt={article.title} className="img-fluid rounded" />
                </div>
            )}

            <div>
                {/* <pre className={`text-truncate ${article.text.length > 200 ? 'text-break' : ''}`}>
                    {article.text}
                </pre> */}
                {/* <div
                    className="text-truncate"
                    dangerouslySetInnerHTML={{ __html: article.text }}
                /> */}
                <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    whiteSpace: 'pre-wrap'
                }}>
                    {article.text.replace(/<[^>]+>/g, '')}
                </div>

                <div className="d-flex gap-2">
                    <Link to={`/blog/${article.id}`} className="">See More</Link>
                </div>
            </div>
        </article>
    )
}

export default SingleArticle