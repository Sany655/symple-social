import { doc, getFirestore, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const RequestComponent = ({ friend, accept, declined }) => {
    const [requestProfile, setRequestProfile] = useState({})
    const { user } = useSelector(state => state.auth)
    useEffect(() => {
        onSnapshot(doc(getFirestore(), "users", friend.members.find(fr => fr !== user.uid)),
            snapshot => {
                setRequestProfile(snapshot.data());
            })
    }, [friend.members])
    return (
        <div className="card">
            <div className="card-body d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center  gap-3">
                    <img src={requestProfile.photoURL ? requestProfile.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"25px"} height="25px" />
                    <p className='m-0'>{requestProfile.displayName || requestProfile.email}</p>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-2">
                    <button className="btn btn-primary btn-sm" onClick={() => accept(requestProfile.uid)}>Accept</button>
                    <button className="btn btn-danger btn-sm" onClick={() => declined(requestProfile.uid)}>Declined</button>
                </div>
            </div>
        </div>
    )
}

export default RequestComponent