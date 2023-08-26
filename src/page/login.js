import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { useState } from "react"
import SignWithGoogle from "../components/SignWithGoogle"
import React from "react";
const Login = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
        error: ""
    })

    const login = e => {
        e.preventDefault()
        signInWithEmailAndPassword(getAuth(), form.email, form.password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setForm({ ...form, error: errorMessage })
            });
    }

    return (
        <div className="container-fluid">
            <div className="row mt-5">
                <div className="col-10 col-md-6 col-lg-4 col-xl-3 m-auto">
                    <div className="card">
                        <form className="card-body" onSubmit={login}>
                            <h3 className="text-center">Login</h3>
                            {
                                form.error && (
                                    <div className="alert alert-danger">{form.error}</div>
                                )
                            }
                            <div className="mb-3">
                                <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                                <input required placeholder="Enter Email" type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                                <input required placeholder="Enter Password" type="password" className="form-control" id="exampleInputPassword1" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <button type="submit" className="btn btn-primary me-2">Submit</button>
                            <SignWithGoogle setForm={setForm} form={form}/>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login