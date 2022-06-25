import { deleteDoc, doc, getFirestore, updateDoc } from 'firebase/firestore'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import withProtected from './middlewares/withProtected'

const friend = () => {
    const user = useSelector(state => state.auth).user
    const { list, pendings, requests } = useSelector(state => state.friends)
    const router = useRouter()
    const dispatch = useDispatch()

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
            <div className="row">
                <div className="col-md-6 xl-3 m-auto">
                    <ul className="nav nav-pills mb-3 justify-content-around" id="pills-tab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="pills-Friends-tab" data-bs-toggle="pill" data-bs-target="#pills-Friends" type="button" role="tab" aria-controls="pills-Friends" aria-selected="true">Friends</button>
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
                                list.filter(frnd => frnd.status === true).map(friend => (
                                    <div className="card" key={friend.uid}>
                                        <div className="card-body d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center  gap-3">
                                                <Image src={friend.photoURL ? friend.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"35px"} height="35px" />
                                                <div className="">
                                                    <h5 className='m-0'>{friend.displayName || friend.email}</h5>
                                                    <p className="m-1">{friend.messages.length>0&&friend.messages[0].message}</p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <button className="btn btn-primary btn-sm" onClick={() => {
                                                    dispatch({type:"get-chats",payload:friend})
                                                    router.push("/inbox")
                                                }}>
                                                    messages
                                                    <i className="bi bi-messenger ms-2"></i>
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => declined(friend.uid)}>Unfriend</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="tab-pane fade" id="pills-Requests" role="tabpanel" aria-labelledby="pills-Requests-tab">
                            {
                                requests.map(friend => (
                                    <div className="card" key={friend.uid}>
                                        <div className="card-body d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center  gap-3">
                                                <Image src={friend.photoURL ? friend.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"25px"} height="25px" />
                                                <p className='m-0'>{friend.displayName || friend.email}</p>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between gap-2">
                                                <button className="btn btn-primary btn-sm" onClick={() => accept(friend.uid)}>Accept</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => declined(friend.uid)}>Declined</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="tab-pane fade" id="pills-Pending" role="tabpanel" aria-labelledby="pills-Pending-tab">
                            {
                                pendings.filter(frnd => (frnd.status !== true) & frnd.createdBy === user.uid).map(friend => (
                                    <div className="card" key={friend.uid}>
                                        <div className="card-body d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center  gap-3">
                                                <Image src={friend.photoURL ? friend.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"25px"} height="25px" />
                                                <p className='m-0'>{friend.displayName || friend.email}</p>
                                            </div>
                                            <button className="btn btn-primary btn-sm" onClick={() => declined(friend.uid)}>
                                                Cancel Request
                                                <i className="bi bi-x ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withProtected(friend)