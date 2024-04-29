import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react'
import app from '../../firebase';

function FileShare() {
    const fileControl = useRef();
    const [eror, setError] = useState()
    const [loading, setLoading] = useState(false)
    const [list, setlist] = useState([])

    async function uploadFIle(e) {
        if (!loading) {
            e.preventDefault();
            setError("")
            const storage = getStorage(app);
            const file = fileControl.current.files[0]
            if (!file) setError("select a file under 1gb")
            else if (file.size > 1000000000) {
                setError("File size limit exceeded, 1gb is limit.")
            } else {
                setLoading(true)
                const storageRef = ref(storage, 'file-sharing/' + file.name);
                try {
                    const snapshot = await uploadBytes(storageRef, file)
                    try {
                        const downloadURL = await getDownloadURL(snapshot.ref)
                        setError("get you file by this link: " + downloadURL)
                        setLoading(false)
                    } catch (error) {
                        setError('Error getting download URL: ' + error);
                        setLoading(false)
                    }
                } catch (error) {
                    setError('Error uploading file: ' + error);
                    setLoading(false)
                }
                fileControl.current = null
            }
        }
    }

    async function askingPass() {
        setlist([])
        if (prompt("Password") === process.env.REACT_APP_adminpass) {
            try {
                const storage = getStorage();
                const storageRef = ref(storage, 'file-sharing/');
                listAll(storageRef).then((res) => {
                    setlist(res.items)
                }).catch((error) => {
                    console.log(error);
                });
            } catch (error) {
                console.log(error);
            }
        }
    }

    async function deleteItem(path) {
        const storage = getStorage();
        const desertRef = ref(storage, path);
        deleteObject(desertRef).then(() => {
            setlist(list.filter(item => item.fullPath != path))
        }).catch((error) => {
            console.log(error);
        });
    }


    return (
        <>
            <div className="card col-xl-3 col-lg-6 col-md-8 m-auto mt-5" onDoubleClick={askingPass}>
                <div className="card-body">
                    <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Upload file</label>
                        <div className="input-group">
                            <input type="file" className="form-control" id="exampleFormControlInput1" ref={fileControl} />
                            <button className="btn btn-outline-primary" type="button" id="button-addon2" onClick={uploadFIle}>
                                {loading ?
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div> : "Submit"}
                            </button>
                            <p>Files will be deleted after 24 hours</p>
                        </div>
                        <p className={`text-danger my-2`}>{eror && eror}</p>
                    </div>
                </div>
            </div>
            {list.length > 0 &&
                <div className="card col-xl-3 col-lg-6 col-md-8 m-auto mt-5">
                    <div className="card-body">
                        <ul className="list-group">
                            {list.map((item, index) => <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                <p className='m-0'>{item.name}</p>
                                <button className='btn btn-sm btn-danger' onClick={() => deleteItem(item.fullPath)}><i className="bi bi-x"></i></button>
                            </li>)}
                        </ul>
                    </div>
                </div>
            }
        </>
        // https://firebasestorage.googleapis.com/v0/b/todo-39878.appspot.com/o/file-sharing%2Fdua.jpg?alt=media&token=4a7dfa2e-c95e-4497-8c81-901470ef258a
        //https://firebasestorage.googleapis.com/v0/b/todo-39878.appspot.com/o/file-sharing%2Falgo%20lab%20repo.pdf?alt=media&token=19d7cb26-0f3f-4f4b-bb55-02baa61f67e2
        // https://firebasestorage.googleapis.com/v0/b/todo-39878.appspot.com/o/file-sharing%2Falgo%20lab%20repo.docx?alt=media&token=dd858372-1444-4417-9f38-e490e6aeb1a8
    )
}

export default FileShare