export default (state = {
    chats: [],
    loading: true
}, action) => {
    switch (action.type) {
        case "get-chats":
            return {
                ...state,
                loading: false,
                chats: action.payload
            }

        default: return state;
    }
}