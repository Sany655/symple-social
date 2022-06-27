import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, onSnapshotsInSync, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FriendComponent from '../components/FriendComponent'
import PendingComponent from '../components/PendingComponent'
import RequestComponent from '../components/RequestComponent'
import Spinner from '../components/Spinner'
import withProtected from './middlewares/withProtected'

const Friend = () => {
    const user = useSelector(state => state.auth).user
    const [data, setData] = useState({
        friends: [],
        pendings: [],
        requests: [],
        loading: false
    })

    useEffect(() => {
        setData({ ...data, loading: true })
        onSnapshot(query(collection(getFirestore(), "chats"), orderBy("lastMessage", "desc"), where("members", "array-contains", user.uid)), snapChats => {
            const requests = []
            const pendings = []
            const friends = []
            snapChats.docs.map(async (chat) => {
                const chatDoc = chat.data()
                chatDoc.chatId = chat.id;
                if ((!chatDoc.status) & (chatDoc.createdBy !== user.uid)) {
                    requests.push(chatDoc)
                } else if ((!chatDoc.status) & (chatDoc.createdBy === user.uid)) {
                    pendings.push(chatDoc)
                } else {
                    friends.push(chatDoc)
                }
            })
            setData({ loading: false, friends: friends, requests: requests, pendings: pendings })
        })

        // getDocs(collection(getFirestore(), "chats", "NhXMkhDHnVZ5c8kaHBsQ4UxRmAH2dh0r0NBl89h3y4wU1aYWYJUw1v12", "messages")).then(res => {
        //     console.log(res.docs.length);
        // })
    }, [])

    const accept = (id) => {
        const chatId = id < user.uid ? id + user.uid : user.uid + id;
        updateDoc(doc(getFirestore(), "chats", chatId), {
            status: true,
            lastMessage: serverTimestamp()
        }).then(res => console.log(res))
    }
    const declined = (id) => {
        const chatId = id < user.uid ? id + user.uid : user.uid + id;
        if (confirm("Are you sure?")) {
            getDocs(collection(getFirestore(), "chats", chatId, "messages")).then(snapChat => {
                if (snapChat.docs.length > 0) {
                    if (confirm("Would you want to delete all messages too?")) {
                        snapChat.docs.map(snapMsg => {
                            deleteDoc(doc(getFirestore(), "chats", chatId, "messages", snapMsg.id)).then(res => {
                                console.log(res);
                            }).catch(err => console.log("deleting message error ", err.message))
                        })
                    }
                }
            }).catch(err => console.log("getting messages error ", err.message))
            deleteDoc(doc(getFirestore(), "chats", chatId)).catch(err => console.log("deleting chat error ", err.message))

        }
    }

    return (
        <div className="container-fluid my-4">
            {
                data.loading ? <Spinner /> : (
                    <div className="row">
                        <div className="col-md-8 xl-3 m-auto">
                            <ul className="nav nav-pills mb-3 justify-content-around" id="pills-tab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active position-relative" id="pills-Friends-tab" data-bs-toggle="pill" data-bs-target="#pills-Friends" type="button" role="tab" aria-controls="pills-Friends" aria-selected="false">
                                        Friends
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{data.friends.length}<span className="visually-hidden">Sent Friends</span>
                                        </span>
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link position-relative" id="pills-Requests-tab" data-bs-toggle="pill" data-bs-target="#pills-Requests" type="button" role="tab" aria-controls="pills-Requests" aria-selected="false">
                                        Requests
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{data.requests.length}<span className="visually-hidden">Friends Requests</span>
                                        </span>
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link position-relative" id="pills-Pending-tab" data-bs-toggle="pill" data-bs-target="#pills-Pending" type="button" role="tab" aria-controls="pills-Pending" aria-selected="false">
                                        Pending
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{data.pendings.length}<span className="visually-hidden">Sent Requests</span>
                                        </span>
                                    </button>
                                </li>
                            </ul>
                            <div className="tab-content" id="pills-tabContent">
                                <div className="tab-pane fade show active" id="pills-Friends" role="tabpanel" aria-labelledby="pills-Friends-tab">
                                    {
                                        data.friends.map(friend => (
                                            <FriendComponent key={friend.chatId} friend={friend} declined={declined} />
                                        ))
                                    }
                                </div>
                                <div className="tab-pane fade" id="pills-Requests" role="tabpanel" aria-labelledby="pills-Requests-tab">
                                    {
                                        data.requests.map(friend => (
                                            <RequestComponent friend={friend} accept={accept} declined={declined} key={friend.chatId} />
                                        ))
                                    }
                                </div>
                                <div className="tab-pane fade" id="pills-Pending" role="tabpanel" aria-labelledby="pills-Pending-tab">
                                    {
                                        data.pendings.map(friend => (
                                            <PendingComponent friend={friend} key={friend.chatId} declined={declined} />
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default withProtected(Friend)