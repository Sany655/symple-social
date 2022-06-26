import { deleteDoc, doc, getFirestore, updateDoc } from 'firebase/firestore'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FriendComponent from '../components/FriendComponent'
import PendingComponent from '../components/PendingComponent'
import RequestComponent from '../components/RequestComponent'
import Spinner from '../components/Spinner'
import withProtected from './middlewares/withProtected'

const Friend = () => {
    const user = useSelector(state => state.auth).user
    const { list, pendings, requests, loading } = useSelector(state => state.friends)

    const accept = (id) => {
        const chatId = id < user.uid ? id + user.uid : user.uid + id;
        updateDoc(doc(getFirestore(), "chats", chatId), {
            status: true
        }).then(res => console.log(res))
    }
    const declined = (id) => {
        const chatId = id < user.uid ? id + user.uid : user.uid + id;
        if (confirm("Are you sure?")) {
            deleteDoc(doc(getFirestore(), "chats", chatId))
        }
    }

    return (
        <div className="container-fluid my-4">
            {
                loading ? <Spinner /> : (
                    <div className="row">
                        <div className="col-md-8 xl-3 m-auto">
                            <ul className="nav nav-pills mb-3 justify-content-around" id="pills-tab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link position-relative" id="pills-Friends-tab" data-bs-toggle="pill" data-bs-target="#pills-Friends" type="button" role="tab" aria-controls="pills-Friends" aria-selected="false">
                                        Friends
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{list.length}<span className="visually-hidden">Sent Friends</span>
                                        </span>
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link position-relative" id="pills-Requests-tab" data-bs-toggle="pill" data-bs-target="#pills-Requests" type="button" role="tab" aria-controls="pills-Requests" aria-selected="false">
                                        Requests
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{requests.length}<span className="visually-hidden">Friends Requests</span>
                                        </span>
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link position-relative" id="pills-Pending-tab" data-bs-toggle="pill" data-bs-target="#pills-Pending" type="button" role="tab" aria-controls="pills-Pending" aria-selected="false">
                                        Pending
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{pendings.length}<span className="visually-hidden">Sent Requests</span>
                                        </span>
                                    </button>
                                </li>
                            </ul>
                            <div className="tab-content" id="pills-tabContent">
                                <div className="tab-pane fade show active" id="pills-Friends" role="tabpanel" aria-labelledby="pills-Friends-tab">
                                    {
                                        list.map(friend => (
                                            <FriendComponent key={friend.chatId} friend={friend} declined={declined} />
                                        ))
                                    }
                                </div>
                                <div className="tab-pane fade" id="pills-Requests" role="tabpanel" aria-labelledby="pills-Requests-tab">
                                    {
                                        requests.map(friend => (
                                            <RequestComponent friend={friend} accept={accept} declined={declined} key={friend.chatId} />
                                        ))
                                    }
                                </div>
                                <div className="tab-pane fade" id="pills-Pending" role="tabpanel" aria-labelledby="pills-Pending-tab">
                                    {
                                        pendings.map(friend => (
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