const CallReducer = (state = {
    pc: null,
    tracks: {
        user: null, mine: null
    },
    calling: false,
    ringing: false,
    type: null,
    sender: {},
    reciever: {},
    restart: false,
    chatId: null
}, action) => {
    switch (action.type) {
        case "set-pc":
            return {
                ...state,
                pc: new RTCPeerConnection({
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
                }),
                tracks: {
                    user: null, mine: null
                },
                calling: false,
                ringing: false,
                type: null,
                sender: {},
                reciever: {},
                chatId: null
            };
        case "my-track":
            return {
                ...state,
                tracks: {
                    ...state.tracks,
                    mine: action.payload
                }
            };
        case "user-track":
            return {
                ...state,
                tracks: {
                    ...state.tracks,
                    user: action.payload
                }
            };
        case "calling":
            return {
                ...state,
                calling: true,
                type: action.payload.type,
                reciever: action.payload.reciever,
            };
        case "ringing":
            return {
                ...state,
                ringing: true,
                type: action.payload.type,
                sender: action.payload.sender
            };
        case "restart":
            console.log(!state.restart);
            return {
                ...state,
                restart: !state.restart,
            };
        default: return state;
    }
}

export default CallReducer