import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDoc, collection, getFirestore, query, orderBy, serverTimestamp, limit, getDocs, startAfter, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SingleArticle from './SingleArticle';
import Spinner from '../../components/Spinner';
import aiRequest from '../../service/aiRequest';

function Blog() {
    // Constants
    const ARTICLES_PER_PAGE = 5;

    // Refs
    const imgControl = useRef(null);
    const closeBtn = useRef(null);

    // URL Params
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');

    // States
    const [articles, setArticles] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        text: '',
        img: { url: '', name: '' },
        loading: false,
        error: ''
    });
    const [aiWriteLoading, setAiWriteLoading] = useState(false)

    const rephraseWithAi = async () => {
        setAiWriteLoading(true);
        setFormData(prev => ({ ...prev, error: '' }));
        if (!formData.text) {
            setFormData(prev => ({ ...prev, error: 'Please enter some text to rephrase.' }));
            setAiWriteLoading(false);
            return;
        }
        try {
            const aiResponse = await aiRequest(formData.text);
            setFormData(prev => ({ ...prev, text: aiResponse || prev.text }));
        } catch (error) {
            setFormData(prev => ({ ...prev, error: 'Error rephrasing text: ' + error.message + ' ' + error.stack }));
        } finally {
            setAiWriteLoading(false);
        }

    }

    // Fetch articles
    const fetchArticles = async () => {
        setIsLoading(true);
        try {
            const db = getFirestore();
            const articlesRef = collection(db, 'articles');

            // Get total count and set up real-time listener
            onSnapshot(query(articlesRef), (snapshot) => {
                const total = snapshot.size;
                setTotalPages(Math.ceil(total / ARTICLES_PER_PAGE));
            });

            // Set up real-time listener for paginated articles
            const q = query(
                articlesRef,
                orderBy('datetime', 'desc'),
                limit(ARTICLES_PER_PAGE * currentPage)
            );

            onSnapshot(q, (snapshot) => {
                const fetchedArticles = snapshot.docs
                    .slice((currentPage - 1) * ARTICLES_PER_PAGE)
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                setArticles(fetchedArticles);
            });
        } catch (error) {
            alert('Error fetching articles: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [currentPage]);

    // Handle article submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormData(prev => ({ ...prev, loading: true }));

        try {
            if (imgControl.current?.files[0]) {
                await handleImageUpload();
            } else {
                await saveArticle();
            }
        } catch (error) {
            setFormData(prev => ({ ...prev, error: error.message }));
        }
    };

    // Handle image upload
    const handleImageUpload = async () => {
        const file = imgControl.current.files[0];
        const storage = getStorage();
        const fileName = Date.now() + '-' + file.name.replace(/\s+/g, '-').toLowerCase();
        const storageRef = ref(storage, `articles/${fileName}`);
        setFormData(prev => ({ ...prev, loading: true, error: '' }));

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            await saveArticle(downloadURL, fileName);
        } catch (error) {
            throw new Error('Error uploading image: ' + error.message);
        }
    };

    // Save article to Firestore
    const saveArticle = async (imageUrl = '', fileName = '') => {
        try {
            const articleData = {
                title: formData.title,
                text: formData.text,
                img: { url: imageUrl, name: fileName },
                datetime: serverTimestamp()
            };

            await addDoc(collection(getFirestore(), 'articles'), articleData);
            alert('Article published successfully!');
            fetchArticles();
            setFormData(prev => ({ ...prev, loading: false, error: '' }));
            resetForm();
        } catch (error) {
            throw new Error('Error saving article: ' + error.message);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            text: '',
            img: { url: '', name: '' },
            loading: false,
            error: ''
        });
        if (imgControl.current) imgControl.current.value = '';
        if (closeBtn.current) closeBtn.current.click();
    };

    return (
        <div className="container py-4">
            {/* Login Modal */}
            <div className="modal fade" id="loginModal" tabIndex="-1">
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
                                if (password === process.env.REACT_APP_adminpass) {
                                    setIsAdmin(true);
                                    document.querySelector('#loginModalbtn').click();
                                    alert('Logged in as admin');
                                } else {
                                    alert('Invalid password');
                                }
                                e.target.reset();
                            }}>
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
                            <button className="d-none" type="button" data-bs-dismiss="modal" id="loginModalbtn"></button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Article Modal */}
            <div className="modal fade" id="articleModal" tabIndex="-1">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Write an Article</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" ref={closeBtn}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {formData.error && (
                                    <div className="alert alert-danger">{formData.error}</div>
                                )}
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="title"
                                        value={formData.title}
                                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="content" className="form-label">Content</label>
                                    <div className="position-relative">
                                        <textarea
                                            className="form-control"
                                            id="content"
                                            rows="10"
                                            value={formData.text}
                                            onChange={e => setFormData(prev => ({ ...prev, text: e.target.value }))}
                                            required
                                        ></textarea>
                                        {aiWriteLoading ? (
                                            <div className="position-absolute translate-middle" style={{ bottom: '15px', right: '15px' }}>
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : <i className={"bi bi-arrow-repeat position-absolute fs-2"} style={{
                                            cursor: 'pointer', bottom: '15px', right: '15px'
                                        }} onClick={rephraseWithAi}></i>}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="image" className="form-label">Image (optional)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="image"
                                        accept="image/*"
                                        ref={imgControl}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={formData.loading}
                                >
                                    {formData.loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send me-2"></i>
                                            Publish
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-8 p-4">
                    {/* Write Article Button */}
                    <div className="text-end mb-4">
                        {isAdmin ? (
                            <button
                                className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#articleModal"
                            >
                                <i className="bi bi-pencil-square me-2"></i>
                                Write an Article
                            </button>
                        ) : (
                            <button
                                className="btn btn-outline-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#loginModal"
                            >
                                <i className="bi bi-lock me-2"></i>
                                Login to Write
                            </button>
                        )}
                    </div>

                    {/* Articles List */}
                    {isLoading ? (
                        <div className="text-center py-4">
                            <Spinner />
                        </div>
                    ) : articles.length > 0 ? (
                        <>
                            <div className="row">
                                {articles.map(article => (
                                    <SingleArticle
                                        key={article.id}
                                        article={article}
                                        isAdmin={isAdmin}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <nav className="mt-4" onClick={() => window.scrollTo(0, 0)}>
                                <ul className="pagination pagination-sm justify-content-center">
                                    <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setSearchParams({ page: (currentPage - 1).toString() })}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li
                                            key={i + 1}
                                            className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => setSearchParams({ page: (i + 1).toString() })}
                                            >
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setSearchParams({ page: (currentPage + 1).toString() })}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-muted">No articles found</p>
                        </div>
                    )}
                </div>
                <div className="d-none d-md-block col-md-4"></div>
            </div>
        </div>
    );
}

export default Blog;