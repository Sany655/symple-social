function disconnectCall() {
    // window.location.reload();
    setIsChannelOpen(false)
    setLoading(false)

    localStream.current.srcObject && localStream.current.srcObject.getTracks().forEach(track => {
        track.stop()
    });
    mediaStream.current.srcObject && mediaStream.current.srcObject.getTracks().forEach(track => {
        track.stop()
    });

    dispatch({ type: "restartPc" })
    if (callingUser.length) {
        socket.emit("discardCall", callingUser)
    }
}

useEffect(() => {
    socket.on("allUsers", (data) => {
        dispatch({ type: "setUsers", payload: data })
    })
}, [])

useEffect(() => {
    socket.on("disConnectedUser", () => {
        // window.location.reload()
        disconnectCall()

    })
    socket.on("disconnect", () => {
        disconnectCall()
        // window.location.reload()
    })
}, [])

useEffect(() => {
    if (dc.current) {
        dc.current.onmessage = e => {
            setMessages([{
                id: null,
                message: e.data
            }, ...messages])
        };
    }
}, [dc.current, messages])

async function getTracks(type) {
    try {
        const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true, video: type })
        stream.getTracks().forEach(track => {
            if (track.getConstraints().noiseSuppression) {
                track.applyConstraints({ noiseSuppression: true })
            }
            pc.addTrack(track, stream)
        });
        setCallType(type)
        return stream;
    } catch (error) {
        throw "Your device doesn't support it";
    }
}

useEffect(() => {
    socket.on("callUser", async data => {
        if (isChannelOpen) {
            socket.emit("discardCall", [socket.id, data.id])
        } else {
            const perm = window.confirm("some one calling you.. recieve call?")
            if (perm) {
                setCallingUser([socket.id, data.id])
                setLoading(true)
                getTracks(data.type).then((stream) => {
                    localStream.current.srcObject = stream
                    let localDescriptions;
                    pc.onicecandidate = e => localDescriptions = pc.localDescription;
                    pc.ondatachannel = e => {
                        dc.current = e.channel;
                        dc.current.onopen = () => {
                            socket.emit("inCall", [socket.id, data.id]);
                            setIsChannelOpen(true)
                            setLoading(false)
                        };
                    }
                    const remoteDesc = new RTCSessionDescription(data.offer)
                    pc.setRemoteDescription(remoteDesc).then(() => { })
                    pc.createAnswer().then(answer => {
                        pc.setLocalDescription(answer).then(() => { })
                    })

                    setTimeout(() => {
                        socket.emit("sendingAnswer", {
                            id: data.id,
                            answer: localDescriptions
                        })
                    }, 1500)
                }).catch(err => {
                    setErrors([...errors, err])
                    socket.emit("discardCall", [socket.id, data.id])
                    setLoading(false)
                })
            } else {
                socket.emit("discardCall", [socket.id, data.id])
            }
        }
    })
    return () => socket.removeListener("callUser")
}, [pc])

useEffect(() => {
    socket.on("recievingingAnswer", data => {
        const remoteDesc = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(remoteDesc).then(() => {

        })
    })

    return () => socket.removeListener("recievingingAnswer")
}, [pc])

const callUser = async (id, type) => {
    setCallingUser([socket.id, id])
    setLoading(true)
    getTracks(type).then((stream) => {
        localStream.current.srcObject = stream
        let localDescriptions;

        dc.current = pc.createDataChannel("channel")
        dc.current.onopen = () => {
            setIsChannelOpen(true)
            socket.emit("inCall", [socket.id, id]);
            setLoading(false)
        };
        pc.onicecandidate = e => {
            localDescriptions = pc.localDescription
        };
        pc.createOffer().then(offer => {
            pc.setLocalDescription(offer).then(() => {

            })
        })

        setTimeout(() => {
            if (localDescriptions) {
                socket.emit("callUser", {
                    id: id,
                    offer: localDescriptions,
                    type: type
                })
            }
        }, 1500)
    }).catch(err => {
        setErrors([...errors, err])
        setLoading(false)
    })
}

useEffect(() => {
    let pc1 = pc;
    pc1.ontrack = e => {
        mediaStream.current.srcObject = e.streams[0];
    }
    return () => pc1 = null
}, [pc])