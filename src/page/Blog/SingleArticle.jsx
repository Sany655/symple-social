import React from 'react'
import { useState } from 'react';
import { doc, deleteDoc, getFirestore } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import EditBlog from './EditBlog';
import { Link } from 'react-router-dom';

function SingleArticle({ article }) {
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState("")
    const [editPostState, setEditPostState] = useState(false)
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

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

    function confirmation(type) {
        if (window.prompt("Enter Password: ") === process.env.REACT_APP_adminpass) {
            switch (type) {
                case "delete":
                    if (article.img.name) {
                        deleteImage()
                    } else {
                        deletearticle()
                    }
                    break;
                case "edit":
                    setEditPostState(true)
                    break;
                case "love":
                    console.log("HEllo");
                    break;
                default:
                    break;
            }
        }
    }

    return editPostState ? <EditBlog setEditPostState={setEditPostState} article={article} /> : (
        <article className="container my-4 p-4 bg-white rounded shadow-sm">
            <header className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h1 className="h2"><Link to={`/blog/${article.id}`} className='text-decoration-none text-dark'>{article.title}</Link></h1>
                    <div className="dropdown">
                        <button className="btn btn-link btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <button className="dropdown-item" onClick={() => confirmation("edit")}>
                                    <i className="bi bi-pencil-fill me-2"></i>Edit
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item text-danger" onClick={() => confirmation("delete")}>
                                    <i className="bi bi-x-lg me-2"></i>Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <small className="text-muted">
                    {new Date(article.datetime.seconds * 1000).toLocaleString('en-US', {
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
                <pre className={`${expanded ? '' : 'text-truncate'}`}>
                    <code>{article.text}</code>
                </pre>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-link p-0"
                        onClick={toggleExpanded}
                    >
                        {expanded ? 'Hide' : 'Expand'}
                    </button>
                    <Link to={`/blog/${article.id}`} className="">See More</Link>
                </div>
            </div>
        </article>
    )
}

export default SingleArticle