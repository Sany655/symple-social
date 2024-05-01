import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react'
import app from '../../firebase';
import axios from 'axios';

function FileShare() {
    const fileControl = useRef();
    const [eror, setError] = useState({msg:""})
    const [loading, setLoading] = useState(false)
    const [list, setlist] = useState([])
    const [locallist, setLocallist] = useState([])

    useEffect(() => {
        try {
            const listFromLocal = JSON.parse(localStorage.getItem('shared-files')) || []
            setLocallist(listFromLocal)
        } catch (error) {
            console.log(error);
        }
    }, [])


    async function uploadFIle(e) {
        if (!loading) { 
            e.preventDefault();
            setError({msg:""})
            const storage = getStorage(app);
            const file = fileControl.current.files[0]
            if (!file) setError({msg:"select a file under 1gb"})
            else if (file.size > 1000000000) {
                setError({msg:"File size limit exceeded, 1gb is limit."})
            } else {
                setLoading(true)
                const storageRef = ref(storage, 'file-sharing/' + file.name);
                try {
                    const snapshot = await uploadBytes(storageRef, file)
                    try {
                        const downloadURL = await getDownloadURL(snapshot.ref)
                        localStorage.setItem('shared-files', locallist.length > 0 ? locallist : JSON.stringify([{ fullPath: "file-sharing/" + file.name, name: file.name, url: downloadURL }]))
                        setLocallist([...locallist, { fullPath: "file-sharing/" + file.name, name: file.name, url: downloadURL }])
                        setError({type:"scc",msg:"get you file by this link: " + downloadURL})
                        setLoading(false)
                    } catch (error) {
                        setError({type:"err",msg:'Error getting download URL: ' + error});
                        setLoading(false)
                    }
                } catch (error) {
                    setError({type:"err",msg:'Error uploading file: ' + error });
                    setLoading(false)
                }
                fileControl.current = null
            }
        }
    }

    async function showingAllFileList() {
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

    async function deleteItem(path, type) {
        const storage = getStorage(app);
        const desertRef = ref(storage, path);
        deleteObject(desertRef).then(() => {
            if (type == "all") {
                setlist(list.filter(item => item.fullPath != path))
            } else {
                setLocallist(locallist.filter(item => item.fullPath != path))
                localStorage.setItem("shared-files",JSON.stringify(locallist.filter(item => item.fullPath != path)))
            }
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
            <div className="card col-xl-3 col-lg-6 col-md-8 m-auto mt-5" onDoubleClick={showingAllFileList}>
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
                        <p className={`my-2`}>{eror.msg && eror.msg}</p>
                    </div>
                </div>
            </div>
            {locallist.length > 0 &&
                <div className="card col-xl-3 col-lg-6 col-md-8 m-auto mt-5">
                    <div className="card-header text-center">My files</div>
                    <div className="card-body">
                        <ul className="list-group">
                            {locallist.map((item, index) => <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                <p className='m-0'>{item.name}</p>
                                <div>
                                    <button className='btn btn-sm btn-danger me-2' onClick={() => deleteItem(item.fullPath, "local")}><i className="bi bi-x"></i></button>
                                    <button className='btn btn-sm btn-primary' onClick={() => copydownloadlink(item.fullPath)}><i className="bi bi-clipboard"></i></button>
                                </div>
                            </li>)}
                            <li className="list-group text-center">Your file list only saved in your local machine</li>
                        </ul>
                    </div>
                </div>
            }
            {list.length > 0 &&
                <div className="card col-xl-3 col-lg-6 col-md-8 m-auto mt-5">
                    <div className="card-body">
                        <ul className="list-group">
                            {list.map((item, index) => <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                <p className='m-0'>{item.name}</p>
                                <div>
                                    <button className='btn btn-sm btn-danger me-2' onClick={() => deleteItem(item.fullPath, "all")}><i className="bi bi-x"></i></button>
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