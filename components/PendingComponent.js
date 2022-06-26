import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

const PendingComponent = ({ friend , declined}) => {
    const [userProfile, setUserProfile] = useState({})
    const { user } = useSelector(state => state.auth)
    useEffect(() => {
        onSnapshot(doc(getFirestore(), "users", friend.members.find(fr => fr !== user.uid)),
            snapshot => {
                setUserProfile(snapshot.data());
            })
    }, [friend.members])
    return (
        <div className="card">
            <div className="card-body d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center  gap-3">
                    <Image src={userProfile.photoURL ? userProfile.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"25px"} height="25px" />
                    <p className='m-0'>{userProfile.displayName || userProfile.email}</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => declined(userProfile.uid)}>
                    Cancel Request
                    <i className="bi bi-x ms-2"></i>
                </button>
            </div>
        </div>
    )
}

export default PendingComponent