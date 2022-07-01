import { collection, deleteField, doc, getDoc, getDocs, getFirestore, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

const Context = createContext()
export const CallProvider = ({ children }) => {
    const { user } = useSelector(state => state.auth)
    const [call, setCall] = useState({
        calling: false,
        ringing: false,
        onGoing: false,
        type: null,
        sender: {},
        reciever: {},
        restart: false,
        chatId: null,
        timer: 0
    })
    const pc = useRef()
    const dc = useRef()
    const myTrack = useRef()
    const userTrack = useRef()


    // delete callState
    useEffect(() => {
        if (user) {
            async function getFriends() {
                onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid), where("callState.status", "==", "cancelled")),
                    friends => {
                        startingPc()
                        cancelCall()
                        friends.docs.map(chat => {
                            updateDoc(doc(getFirestore(), "chats", chat.id), { callState: deleteField() }).then().catch(err => console.log("delete callState ", err.message))
                        })
                    })
            }

            getFriends()
        }
    }, [])

    // getting ring
    useEffect(() => {
        if (user) {
            onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid), where("callState.callingTo", "==", user.uid), where("callState.status", "==", "ringing")),
                snapshot => {
                    snapshot.docs.map(snapMap => {
                        getDoc(doc(getFirestore(), "users", snapMap.data().callState.callingFrom)).then(sender => {
                            if (confirm((sender.data().displayName || sender.data().email) + " is calling you, yould u want to recieve?")) {
                                recievingCall({
                                    sender: sender.data(),
                                    reciever: user,
                                    chatId: snapMap.id,
                                    callState: snapMap.data().callState
                                })
                            } else {
                                startingPc()
                                cancelCall(snapMap.id)
                            }
                        }).catch(err => console.log("err gettung user ", err.message))
                    })
                })
        }
    }, [])

    // getting answer
    useEffect(() => {
        if (user) {
            if (call.calling) {
                let z = 0;
                onSnapshot(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid), where("callState.status", "==", "answering"), where("callState.callingFrom", "==", user.uid), where("callState.callingTo", "==", call.reciever.uid)),
                    snapshot => {
                        snapshot.docs.map(snapMap => {
                            const remoteDesc = new RTCSessionDescription(JSON.parse(snapMap.data().callState.answer));
                            if (z === 0) {
                                z = z++;
                                pc.current.setRemoteDescription(remoteDesc).then(() => {

                                })
                            } else {
                                console.log(z);
                            }
                        })
                    })
            }
        }
    }, [call, pc.current])

    // getting user track
    useEffect(() => {
        if (pc.current && userTrack.current) {
            pc.current.ontrack = e => {
                console.log("set track");
                userTrack.current.srcObject = e.streams[0];
            }
        }
    }, [call.calling, call.ringing, userTrack.current])

    function recievingCall(callData) {
        const calType = callData.callState.type === "audio" ? false : "video" && true;
        setMyTrack(calType).then(() => {
            pc.current.ondatachannel = e => {
                dc.current = e.channel;
                dc.current.onopen = () => {
                    console.log("channel opened! what to do next?");
                };
            }
            const remoteDesc = new RTCSessionDescription(JSON.parse(callData.callState.offer))
            pc.current.setRemoteDescription(remoteDesc).then(() => {
                pc.current.createAnswer().then(answer => {
                    pc.current.setLocalDescription(answer).then(() => {
                        pc.current.onicecandidate = e => {
                            updateDoc(doc(getFirestore(), "chats", callData.chatId), {
                                "callState.answer": JSON.stringify(pc.current.localDescription),
                                "callState.status": "answering",
                                "callState.timestamp": serverTimestamp(),
                                lastMessage: serverTimestamp()
                            }).then((data) => {
                                setCall(prevState => ({
                                    ...prevState,
                                    sender: callData.sender,
                                    reciever: user,
                                    ringing: true,
                                    chatId: callData.id,
                                    type: callData.callState.type
                                }))
                            })
                        };
                    })
                })
            })

            // console.log(callData);
        })
    }

    function cancelCall(chatId) {
        if (chatId) {
            updateDoc(doc(getFirestore(), "chats", chatId), { "callState.status": "cancelled" }).then(() => {

            }).catch(err => console.log("delete callState to cancel call ", err.message))
        } else {
            getDocs(query(collection(getFirestore(), "chats"), where("members", "array-contains", user.uid), where("callState.status", "in", ["ringing", "answering"]))).then(chats => {
                chats.docs.map(chat => {
                    updateDoc(doc(getFirestore(), "chats", chat.id), { "callState.status": "cancelled" }).then(() => {

                    }).catch(err => console.log("delete callState to cancel call ", err.message))
                })
            })
        }
    }

    function startingPc() {
        if (pc.current) {
            pc.current.close()
            pc.current = null
        }
        pc.current = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:numb.viagenie.ca',
                    credential: '@TnaWcnWVWu4QRn',
                    username: 'mazharulalam26@gmail.com'
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: '@TnaWcnWVWu4QRn',
                    username: 'mazharulalam26@gmail.com'
                },
            ]
        })
        dc.current = null
        if (myTrack.current) {
            myTrack.current.getTracks().forEach(track => {
                track.stop()
                track.close()
            })
            myTrack.current = null
        }
        userTrack.current = null
        setCall(pre => ({
            ...pre,
            calling: false,
            ringing: false,
            type: null,
            sender: {},
            reciever: {},
            chatId: null,
            restart: false
        }))
    }

    function setMyTrack(type) {
        if (window.navigator.mediaDevices) {
            return window.navigator.mediaDevices.getUserMedia({ audio: true, video: type }).then(stream => {
                stream.getTracks().forEach(track => {
                    if (track.getConstraints().noiseSuppression) {
                        track.applyConstraints({ noiseSuppression: true })
                    }
                    pc.current.addTrack(track, stream)
                });
                myTrack.current = stream;

            }).catch(err => console.log("track ", err.message))
        } else {
            alert("window.navigator.mediaDevices error")
        }
    }

    function sendingOffer(friendProfile, inbox) {
        dc.current = pc.current.createDataChannel("channel")
        dc.current.onopen = () => {
            console.log("data channel opened, what to do with it?");
        };
        pc.current.createOffer().then(offer => {
            pc.current.setLocalDescription(offer).then(() => {
                pc.current.onicecandidate = e => {
                    updateDoc(doc(getFirestore(), "chats", inbox.chatId), {
                        callState: {
                            offer: JSON.stringify(pc.current.localDescription),
                            callingTo: friendProfile.uid,
                            callingFrom: user.uid,
                            status: "ringing",
                            type: "audio",
                            timestamp: serverTimestamp(),
                        },
                        lastMessage: serverTimestamp()
                    }).then((data) => {
                        console.log(data);
                        setCall(pre => ({
                            ...pre,
                            calling: true,
                            type: "audio",
                            reciever: friendProfile,
                            chatId: inbox.chatId,
                            sender: user
                        }))
                    })
                }
            }).catch(err => console.log("error in setLocalDescription ", err.message))
        }).catch(err => console.log("error in create offer ", err.message))
    }

    return (
        <Context.Provider value={{ call, setMyTrack, sendingOffer, myTrack: myTrack.current, userTrack, cancelCall }}>
            {children}
        </Context.Provider>
    )
}

export default function useCall() {
    return useContext(Context)
}