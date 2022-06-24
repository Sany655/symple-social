export default (state = {
    list:[],
    requests:[],
    pendings:[],
}, action) => {
    switch (action.type) {
        case "get-friends":
            return {
                ...state,
                list:action.payload
            }
        case "get-requests":
            return {
                ...state,
                requests:action.payload
            }
        case "get-pendings":
            return {
                ...state,
                pendings:action.payload
            }
        default: return state;
    }
}