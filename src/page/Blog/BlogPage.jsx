import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, deleteDoc, getFirestore, onSnapshot, getDoc } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import EditBlog from './EditBlog';
import AdminLogin from '../../components/AdminLogin';

function BlogPage() {
    const [error, setError] = useState("")
    const { id } = useParams();
    const [currentAction, setCurrentAction] = useState('')
    const navigate = useNavigate();
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
            if (doc.data()) {
                const artic = doc.data();
                artic.id = doc?.id;
                setArticle(artic);
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
            const docRef = doc(getFirestore(), "articles", article.id);
            if (!docRef) {
                throw new Error("Document reference not found");
            }
            await deleteDoc(docRef);
            const verifyDoc = await getDoc(docRef);
            if (!verifyDoc.exists()) {
                navigate(-1);
            } else {
                setError('Failed to delete document')
                throw new Error("Failed to delete document");
            }
        } catch (error) {
            setError("Failed to delete article: " + error.message);
            console.error("Delete error:", error);
        }
    }

    return (
        <div className="py-5 bg-light min-vh-100">
            <EditBlog article={article} />
            <AdminLogin
                callback={({ success, actionType }) => {
                    if (success) {
                        if (actionType === 'edit') {
                            const editBtn = document.createElement('button');
                            editBtn.setAttribute('type', 'button');
                            editBtn.setAttribute('data-bs-toggle', 'modal');
                            editBtn.setAttribute('data-bs-target', '#editBlogModal');
                            editBtn.style.display = 'none';
                            document.body.appendChild(editBtn);
                            editBtn.click();
                            document.body.removeChild(editBtn);
                        } else if (actionType === 'delete') {
                            if (article.img.name) {
                                deleteImage();
                            } else {
                                deletearticle();
                            }
                        }
                    }
                }}
                actionType={currentAction}
            />
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
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            data-bs-toggle="modal"
                                            data-bs-target="#adminLoginModal"
                                            onClick={() => setCurrentAction('edit')}
                                        >
                                            <i className="bi bi-pencil-fill me-2"></i>Edit
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item text-danger"
                                            data-bs-toggle="modal"
                                            data-bs-target="#adminLoginModal"
                                            onClick={() => setCurrentAction('delete')}
                                        >
                                            <i className="bi bi-x-lg me-2"></i>Delete
                                        </button>
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
                    <pre
                        className="article-content"
                        style={{
                            fontSize: "calc(0.9rem + 0.3vw)",
                            lineHeight: "1.8",
                            letterSpacing: "0.01em",
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit'
                        }}
                        dangerouslySetInnerHTML={{ __html: article.text }}
                    />
                </div>
            </article>
        </div>
    )
}

export default BlogPage