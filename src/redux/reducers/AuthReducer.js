const initialState = {
    user:null,
    loading:false,
    error:""
};
const AuthReducer = (state=initialState,action) => {
    switch (action.type) {
        case "auth-check":
            return {
                ...state,
                user:action.payload
            };
        
    
        default:return state;
    }
}

export default AuthReducer