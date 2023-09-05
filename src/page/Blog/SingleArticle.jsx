import React from 'react'
import { useState } from 'react';
import "./single-article.css"
import { doc, deleteDoc, getFirestore } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import EditBlog from './EditBlog';

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
        <div className="card mb-3">
            <div className="card-header bg-primary text-light d-flex justify-content-between">
                <h4>{article.title}</h4>
                <div className="d-flex">
                    {/* <button className='btn btn-outline-light me-2' onClick={() => confirmation("love")}><i className="bi bi-heart-fill"></i></button> */}
                    <button className='btn btn-outline-light me-2' onClick={() => confirmation("edit")}><i className="bi bi-pencil-fill"></i></button>
                    <button className='btn btn-outline-light' onClick={() => confirmation("delete")}><i className="bi bi-x-lg"></i></button>
                </div>
            </div>
            <div className="card-body text-center">
                {error && <p className='text-center text-danger'>{error}</p>}
                {article.img.url && <img src={(article.img.url)} alt="" className='card-img' />}
                {expanded && (
                    <button className="load-more-btn" onClick={toggleExpanded}>
                        Load Less
                    </button>
                )}
                {article.text && <pre className={`article-text ${expanded ? 'expanded' : ''}`} style={{}}>{article.text}</pre>}
                {!expanded && (
                    <button className="load-more-btn" onClick={toggleExpanded}>
                        Load More
                    </button>
                )}
                {expanded && (
                    <button className="load-more-btn" onClick={toggleExpanded}>
                        Load Less
                    </button>
                )}
            </div >
        </div >
    )
}

export default SingleArticle