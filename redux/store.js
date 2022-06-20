import { combineReducers, createStore } from "redux";
import AuthReducer from "./reducers/AuthReducer";

const store = createStore(combineReducers({
    auth:AuthReducer
}))

export default store;