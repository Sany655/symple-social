import React from 'react'
import { useState } from 'react';
import "./single-article.css"
import { doc, deleteDoc, getFirestore } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";

function SingleArticle({ article }) {
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState("")

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    async function deleteImage() {
        try {
            await deleteObject(ref(getStorage(), 'articles/' + article.img.name))
            deleteartic();
        } catch (error) {
            setError(error.message)
            console.log(error.message);
        }
    }

    async function deleteartic() {
        try {
            await deleteDoc(doc(getFirestore(), "articles", article.id))
        } catch (error) {
            setError(error.message)
        }
    }

    async function deletearticle() {
        const pas = window.prompt("What is the password?")
        if (pas === process.env.REACT_APP_adminpass) {
            if (article.img.name) {
                deleteImage()
            } else {
                deleteartic()
            }
        }
    }

    async function editarticle() {
        console.log(article);
    }

    return (
        <div className="card mb-3">
            <div className="card-header bg-primary text-light d-flex justify-content-between">
                <h4>{article.title}</h4>
                <div className="">
                    {/* <button className='btn btn-outline-light me-2' onClick={editarticle}><i class="bi bi-pencil"></i></button> */}
                    <button className='btn btn-outline-light' onClick={deletearticle}><i className="bi bi-x-lg"></i></button>
                </div>
            </div>
            <div className="card-body text-center">
                {error && <p className='text-center text-danger'>{error}</p>}
                {article.img.url && <img src={(article.img.url)} alt="" width="350rem" className='mb-4' />}
                <div></div>
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