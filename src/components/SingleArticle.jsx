import React from 'react'
import { useState } from 'react';
import "./single-article.css"
import { doc, deleteDoc, getFirestore } from "firebase/firestore";

function SingleArticle({ article }) {
    const [expanded, setExpanded] = useState(false);
    const [disabled, setdisabled] = useState(true)

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    async function deletearticle() {
        const pas = window.prompt("What is the password?")
        if (pas === process.env.REACT_APP_adminpass) {
            await deleteDoc(doc(getFirestore(), "articles", article.id))
        }
    }

    return (
        <div className="card mb-3">
            <div className="card-header bg-primary text-light d-flex justify-content-between">
                <h4>{article.title}</h4>
                <button className='btn btn-outline-light' onClick={deletearticle}><i class="bi bi-x-lg"></i></button>
            </div>
            <div className="card-body text-center">
                {article.img && <img src={article.img} alt="" width="350rem" className='mb-4' />}
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