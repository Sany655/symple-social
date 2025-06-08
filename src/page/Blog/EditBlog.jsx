import { collection, doc, getFirestore, serverTimestamp, updateDoc } from 'firebase/firestore'
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import React, { useRef, useState } from 'react'
import aiRequest from '../../service/aiRequest'

function EditBlog({ article, setEditPostState }) {
    const imgControl = useRef(null)
    const [aiWriteLoading, setAiWriteLoading] = useState(false)
    const [input, setInput] = useState({
        title: article.title,
        img: {
            url: article.img.url,
            name: article.img.name
        },
        text: article.text,
        loading: false,
        error: article.error,
    })

    const rephraseWithAi = async () => {
        setAiWriteLoading(true);
        setInput(prev => ({ ...prev, error: '' }));
        if (!input.text) {
            setInput(prev => ({ ...prev, error: 'Please enter some text to rephrase.' }));
            setAiWriteLoading(false);
            return;
        }
        try {
            const aiResponse = await aiRequest(input.text);
            setInput(prev => ({ ...prev, text: aiResponse || prev.text }));
        } catch (error) {
            setInput(prev => ({ ...prev, error: 'Error rephrasing text: ' + error.message + ' ' + error.stack }));
        } finally {
            setAiWriteLoading(false);
        }

    }

    const submitArticle = async e => {
        e.preventDefault();
        setInput({ ...input, loading: true })
        const img = { url: "", name: "" };
        const file = imgControl.current.files[0];
        if (file !== undefined) {
            const uploaded = await uploadfiles()
            img.url = uploaded.url;
            img.name = uploaded.name;
            console.log("deleted:" + article.img.name + " uploaded:" + img.name);
        }
        writingArtic(img.url, img.name)
    }

    async function uploadfiles() {
        const storage = getStorage();
        const file = imgControl.current.files[0]
        const fileName = Date.now() + '-' + file.name.replace(/\s+/g, '-').toLowerCase();
        const storageRef = ref(storage, 'articles/' + fileName);
        try {
            const snapshot = await uploadBytes(storageRef, file)
            try {
                const downloadURL = await getDownloadURL(snapshot.ref)
                try {
                    if (article.img.name) {
                        await deleteObject(ref(getStorage(), 'articles/' + article.img.name))
                    }
                    return { url: downloadURL, name: fileName }
                } catch (error) {
                    setInput(pre => ({ ...pre, error: error.message }))
                }
            } catch (error) {
                setInput({ ...input, error: 'Error getting download URL: ' + error });
            }
        } catch (error) {
            setInput({ ...input, error: 'Error uploading file: ' + error });
        }
    }

    function writingArtic(inpurl = input.img.url, impfileName = input.img.name) {
        const url = inpurl ? inpurl : input.img.url;
        const fileName = impfileName ? impfileName : input.img.name;
        updateDoc(doc(getFirestore(), "articles/" + article.id), {
            title: input.title,
            text: input.text,
            img: {
                url: url,
                name: fileName
            },
            datetime: serverTimestamp()
        })
            .then(async (article) => {

            })
            .catch(err => setInput({ ...input, error: err.message }))
            .finally(() => {
                setInput({ ...input, loading: false })
                setEditPostState(false)
            })
    }

    return (
        <div className="card mb-3">
            <div className="card-body">
                <form method="post" onSubmit={submitArticle}>
                    <input onChange={e => setInput({ ...input, title: e.target.value })} type="text" className="form-control mb-2 " placeholder='Write the header' value={input.title} required />
                    {input.img.url && <img src={input.img.url} className="card-img" />}
                    <p>Image Link : {input.img.url}</p>
                    <p>Image Name : {input.img.name}</p>
                    <div className="mb-3">
                        <label htmlFor="formFile" className="form-label">Provide any file (optional)</label>
                        <input className="form-control" type="file" id="formFile" accept='image/*' ref={imgControl} />
                    </div>
                    <div className="position-relative">
                        <textarea onChange={e => setInput({ ...input, text: e.target.value })} value={input.text} className='form-control mb-2' rows="4" placeholder='Write the article' required></textarea>
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
                    {input.error && <p className='text-danger'>{input.error}</p>}
                    <button type="button" className="btn btn-secondary me-2" onClick={() => {
                        setEditPostState(false)
                    }}>Close</button>
                    <button className="btn btn-primary" type="submit" disabled={input.loading}>
                        Update
                        {input.loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditBlog