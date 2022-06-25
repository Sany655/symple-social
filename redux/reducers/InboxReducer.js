export default (state = {
    chats: [],
    inbox: [],
    loading: true
}, action) => {
    switch (action.type) {
        case "get-chats":
            return {
                ...state,
                loading: false,
                chats: action.payload
            }
        case "get-inbox":
            return {
                ...state,
                loading: false,
                inbox: action.payload
            }

        default: return state;
    }
}