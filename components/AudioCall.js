import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import useCall from '../service/CallProvider'

const AudioCall = () => {
    const { call, cancelCall, userTrack, myTrack, recievingCall } = useCall()
    const [callInfo, setCallInfo] = useState({
        user: {}
    })

    useEffect(() => {
        if (call.ringing) {
            setCallInfo(pre => ({
                ...pre,
                user: call.sender
            }))
        } else if (call.calling) {
            setCallInfo(pre => ({
                ...pre,
                user: call.reciever
            }))
        }
    }, [call.ringing,call.calling])

    return (
        <div className="row h-100">
            <audio ref={userTrack} autoPlay={true}></audio>
            <audio ref={myTrack} autoPlay={true} muted></audio>
            <div className="col-12 col-md-6 m-auto bg-dark h-100 text-light py-5">
                <div className="d-flex flex-column align-items-center justify-content-between h-100">
                    <div className="d-flex flex-column align-items-center">
                        <Image src={callInfo.user.photoURL ? callInfo.user.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"150px"} height="150px" />
                        <h1>{callInfo.user.displayName || callInfo.user.email}</h1>
                    </div>
                    <div className="d-flex gap-5">
                        {(!call.onGoing && call.ringing) && <i className="bi bi-telephone-x-fill bg-success fs-1 p-2 rounded-circle" role={"button"} onClick={() => recievingCall()}></i>}
                        <i className="bi bi-telephone-x-fill bg-danger fs-1 p-2 rounded-circle" role={"button"} onClick={() => cancelCall(call.chatId)}></i>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default AudioCall