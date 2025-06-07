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
                setError("Article not found");
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
        <div className="py-5 bg-light min-vh-100">
            <article className="container">
                <div className="bg-white rounded-3 shadow-sm p-4 p-md-5">
                    <header className="mb-4">
                        <div className="d-flex justify-content-between align-items-start">
                            <h1 className="display-4 fw-bold mb-3">{article.title}</h1>
                            <div className="dropdown">
                                <button className="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="bi bi-three-dots-vertical fs-4"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button className="dropdown-item" onClick={() => confirmation("edit")}>
                                            <i className="bi bi-pencil me-2"></i>Edit
                                        </button>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={() => confirmation("delete")}>
                                            <i className="bi bi-trash me-2"></i>Delete
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="text-muted mb-4">
                            <i className="bi bi-calendar3 me-2"></i>
                            {new Date(article.datetime.seconds * 1000).toLocaleString('en-US', {
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

                    <div className="article-content">
                        <pre className="lh-lg fs-5 overflow-auto" style={{ whiteSpace: 'pre-wrap' }}>
                            {article.text}
                        </pre>
                    </div>
                </div>
            </article>
        </div>
    )
}

export default ArticlePage