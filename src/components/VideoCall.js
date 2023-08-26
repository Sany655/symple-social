import React from 'react'

const VideoCall = ({ friendProfile, recieveCall, cancelCall }) => {
    return (
        <div className="container-fluid h-100">
            <div className="row h-100">
                <div className="col-12 col-md-6 m-auto bg-dark h-100 text-light py-5">
                    <div className="d-flex flex-column align-items-center justify-content-between h-100">
                        <div className="d-flex flex-column align-items-center">
                            <img src={friendProfile.photoURL ? friendProfile.photoURL : "/default_user.png"} alt="" className='rounded-circle' width={"150px"} height="150px" />
                            <h1>{friendProfile.displayName || friendProfile.email}</h1>
                        </div>
                        <div className="d-flex gap-5">
                            <i className="bi bi-camera-video bg-success fs-1 p-2 rounded-circle" role={"button"} onClick={() => recieveCall()}></i>
                            <i className="bi bi-camera-video-off bg-danger fs-1 p-2 rounded-circle" role={"button"} onClick={() => cancelCall()}></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoCall