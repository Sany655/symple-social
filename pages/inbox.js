import { addDoc, collection, doc, getFirestore, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Spinner from '../components/Spinner'
import withProtected from './middlewares/withProtected'

const Inbox = () => {
    const { inbox, loading } = useSelector(state => state.inbox)
    const { user } = useSelector(state => state.auth)
    const router = useRouter()
    const [text, setText] = useState("")
    const [chat, setChat] = useState([])
    const [ctld, setCtld] = useState(false)
    const [friendProfile, setFriendProfile] = useState({})

    const sendMessage = (e) => {
        setCtld(true)
        e.preventDefault()
        addDoc(collection(getFirestore(), "chats", inbox.chatId, "messages"), {
            message: text,
            seen: false,
            sentAt: serverTimestamp(),
            sentBy: user.uid
        }).then(() => {
            setText("")
            setCtld(false)
        }).catch(err => console.log(err.message))
    }

    useEffect(() => {
        if (!inbox.chatId) {
            router.push("/friend")
        } else {
            onSnapshot(collection(getFirestore(), "chats", inbox.chatId, "messages"),
                snapshot => {
                    setChat(snapshot.docs.map(doc => {
                        const ct = doc.data()
                        ct.id = doc.id
                        return ct;
                    }))
                })

            onSnapshot(doc(getFirestore(), "users", inbox.members.find(fr => fr !== user.uid)),
                snapshot => {
                    setFriendProfile(snapshot.data());
                })
        }
    }, [inbox.chatId,inbox.members,router,user.uid])

    return (
        <div className="container-fluid" style={{ flex: "1 1 auto" }}>
            {
                loading ? <Spinner /> : (
                    <div className="row h-100">
                        <div className="col-md-6 xl-3 m-auto card h-100">
                            <div className="card-body h-100 d-flex flex-column">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="d-flex align-items-center gap-3">
                                        <Image src={friendProfile.photoURL ? friendProfile.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"25px"} height="25px" />
                                        <h5 className='m-0'>{friendProfile.displayName || friendProfile.email}</h5>
                                        {friendProfile.active && <i className='bg-success rounded-circle' style={{ width: "10px", height: "10px" }}></i>}
                                    </div>
                                    <div className="dropdown">
                                        <i className="bi bi-three-dots-vertical" role={"button"} data-bs-toggle="dropdown" aria-expanded="false"></i>
                                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                                            <li><a className='dropdown-item'>a</a></li>
                                            <li><a className='dropdown-item'>a</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className='card h-100'>
                                    <div className="card-body overflow-auto d-flex flex-column-reverse" style={{ height: "70vh" }}>
                                        {
                                            chat.sort((a, b) => b.sentAt - a.sentAt).map(message => {
                                                if (message.sentBy === user.uid) {
                                                    return <div key={message.id} className='my-1 text-end'>
                                                        <small className='d-block text-center my-1'>{String(message.sentAt?.toDate().toLocaleTimeString()) + ' - ' + String(message.sentAt?.toDate().toLocaleDateString())}</small>
                                                        <p className='text-light bg-primary p-1 d-inline rounded'>{message.message}</p>
                                                    </div>
                                                } else {
                                                    return <div key={message.id} className='my-1 text-start'>
                                                        <small className='d-block text-center my-1'>{String(message.sentAt?.toDate().toLocaleTimeString()) + ' - ' + String(message.sentAt?.toDate().toLocaleDateString())}</small>
                                                        <p className='text-primary bg-light p-1 d-inline rounded'>{message.message}</p>
                                                    </div>
                                                }
                                            })
                                        }
                                    </div>
                                </div>
                                <form className="input-group mb-3" onSubmit={sendMessage}>
                                    <input type="text" className="form-control" placeholder="Message" value={text} onChange={e => setText(e.target.value)} />
                                    <button className='input-group-text' disabled={ctld} type={ctld ? 'button' : 'submit'} id="basic-addon2">
                                        {ctld ? (
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        ) : <span className="bi bi-send"></span>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default withProtected(Inbox)