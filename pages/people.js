import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Image from 'next/image'
import axios from 'axios'
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import withProtected from './middlewares/withProtected'

const People = () => {
    const user = useSelector(state => state.auth).user
    const { list } = useSelector(state => state.peoples)

    function addFriend(id) {
        const friendId = id < user.uid ? id + user.uid : user.uid + id;
        getDoc(doc(getFirestore(), "chats", friendId)).then(res => {
            if (!res.exists()) {
                setDoc(doc(getFirestore(), "chats", friendId), {
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                    members: [user.uid, id],
                    status: false
                }).then(res => console.log(res))
            }
        }).catch(err => console.log(err.message))

    }

    return (
        <div className="container-fluid my-5">
            <div className="row">
                <div className="col-md-6 xl-3 m-auto">
                    {
                        list.length > 0 ? (
                            list.map(people => (
                                <div className="card" key={people.uid}>
                                    <div className="card-body d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center  gap-3">
                                            <Image src={people.photoURL ? people.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"25px"} height="25px" />
                                            <p className='m-0'>{people.displayName || people.email}</p>
                                        </div>
                                        {people.id === user.uid ? null : (
                                            <button className="btn btn-primary btn-sm" onClick={() => addFriend(people.uid)}>
                                                Add Friend
                                                <i className="bi bi-person-plus-fill fs-6 ms-2" role={"button"}></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                <h1>Users not available</h1>
                                <p>Invite people here to register</p>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default withProtected(People)