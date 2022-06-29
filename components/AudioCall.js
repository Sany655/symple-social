import Image from 'next/image'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useCall from '../service/CallProvider'

const AudioCall = () => {
    const dispatch = useDispatch()
    const { call, cancelCall, userTrack } = useCall()

    const recieveCall = () => null
    
    return (
        <div className="container-fluid h-100">
            <div className="row h-100">
                <audio src={userTrack && userTrack}></audio>
                <div className="col-12 col-md-6 m-auto bg-dark h-100 text-light py-5">
                    <div className="d-flex flex-column align-items-center justify-content-between h-100">
                        <div className="d-flex flex-column align-items-center">
                            <Image src={call.reciever.photoURL ? call.reciever.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"150px"} height="150px" />
                            <h1>{call.reciever.displayName || call.reciever.email}</h1>
                        </div>
                        <div className="d-flex gap-5">
                            <i className="bi bi-telephone-fill bg-success fs-1 p-2 rounded-circle" role={"button"} onClick={() => recieveCall()}></i>
                            <i className="bi bi-telephone-x-fill bg-danger fs-1 p-2 rounded-circle" role={"button"} onClick={() => cancelCall(call.chatId)}></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AudioCall