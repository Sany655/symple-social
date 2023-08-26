import { useDispatch, useSelector } from "react-redux"
import React, { useEffect, useState } from "react"
import { doc, getFirestore, onSnapshot } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

const FriendComponent = ({friend,declined}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(state => state.auth)
    const [friendProfile, setFriendProfile] = useState({})
    useEffect(() => {
        onSnapshot(doc(getFirestore(),"users",friend.members.find(fr => fr !== user.uid)),
        snapshot => {
            setFriendProfile(snapshot.data());
        })
    },[friend.members])
    return (
        <div className="card">
            <div className="card-body d-flex align-items-center justify-content-between flex-column flex-sm-row gap-4">
                <div className="d-flex align-items-center  gap-3">
                    <img src={friendProfile.photoURL ? friendProfile.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"35px"} height="35px" />
                    <div className="d-flex align-items-center gap-3">
                        <h5 className='m-0'>{friendProfile.displayName || friendProfile.email}</h5>
                        {friendProfile.active && <i className='bg-success rounded-circle' style={{ width: "15px", height: "15px" }}></i>}
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-primary btn-sm" onClick={() => {
                        dispatch({ type: "get-inbox", payload: friend })
                        navigate("/inbox")
                    }}>
                        messages
                        <i className="bi bi-messenger ms-2"></i>
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => declined(friendProfile.uid)}>Unfriend</button>
                </div>
            </div>
        </div>
    )
}

export default FriendComponent