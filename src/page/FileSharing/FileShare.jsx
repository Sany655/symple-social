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
            const storage = getStorage(app);
            const storageRef = ref(storage, 'file-sharing/');
            listAll(storageRef).then((res) => {
                setlist(res.items)
                console.log(res);
            }).catch((error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
        }
    }

    async function deleteItem(path) {
        const storage = getStorage(app);
        const desertRef = ref(storage, path);
        deleteObject(desertRef).then(() => {
            setlist(list.filter(item => item.fullPath != path))
        }).catch((error) => {
            console.log(error);
        });
    }

    async function copydownloadlink(path) {
        const storage = getStorage(app);
        const fileRef = ref(storage, path);
        const link = await getDownloadURL(fileRef)
        console.log(link);
        navigator.clipboard.writeText(link).then(() => {
            alert('Text copied to clipboard');
        }, (err) => {
            console.error('Error copying text to clipboard', err);
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
                                <div>
                                    <button className='btn btn-sm btn-danger me-2' onClick={() => deleteItem(item.fullPath)}><i className="bi bi-x"></i></button>
                                    <button className='btn btn-sm btn-primary' onClick={() => copydownloadlink(item.fullPath)}><i className="bi bi-clipboard"></i></button>
                                </div>
                            </li>)}
                        </ul>
                    </div>
                </div>
            }
        </>
    )
}

export default FileShare