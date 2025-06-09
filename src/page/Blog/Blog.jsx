import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { addDoc, collection, getFirestore, query, orderBy, serverTimestamp, limit, getDocs, startAfter, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Spinner from '../../components/Spinner';
import aiRequest from '../../service/aiRequest';
import AdminLogin from '../../components/AdminLogin';

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
        <div className="container pt-2 pb-4">
            <AdminLogin
                callback={({ success, actionType }) => {
                    if (success) {
                        setIsAdmin(true);
                    }
                }}
                actionType="write"
            />

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
                    <div className="text-end">
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
                                data-bs-target="#adminLoginModal"
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
                                {articles.map((article, index) => (
                                    <article className="container my-4 p-4 bg-white rounded shadow-sm" key={index}>
                                        <header className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h1 className="display-6 display-md-4 display-lg-3 fw-bold mb-3 text-break"
                                                    style={{
                                                        textTransform: "capitalize",
                                                        fontSize: "calc(1.2rem + 1.5vw)",
                                                        lineHeight: "1.2"
                                                    }}>
                                                    <Link to={'blog/' + article.id} className='text-decoration-none text-dark'>{article.title}</Link>
                                                </h1>
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

                                        {article.img.url && (
                                            <div className="mb-4">
                                                <img src={article.img.url} alt={article.title} className="img-fluid rounded" />
                                            </div>
                                        )}

                                        <div>
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