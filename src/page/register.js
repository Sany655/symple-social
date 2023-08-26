import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import SignWithGoogle from "../components/SignWithGoogle";
import React from "react";

const Register = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
        error: ""
    })
    const register = e => {
        e.preventDefault();
        if (form.email && form.password) {
            createUserWithEmailAndPassword(getAuth(), form.email, form.password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    setDoc(doc(getFirestore(),"users",user.uid),{
                        uid:user.uid,
                        email:user.email,
                        displayName:user.displayName,
                        photoURL:user.photoURL,
                        phoneNumber:user.phoneNumber,
                        timestamp:serverTimestamp()
                    }).then(res => console.log(res)).catch(err => console.log(err.message))
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    setForm({ ...form, error: errorMessage })
                });
        }
    }

    return (
        <div className="container-fluid">
            <div className="row mt-5">
                <div className="col-10 col-md-6 col-lg-4 col-xl-3 m-auto">
                    <div className="card">
                        <form className="card-body" onSubmit={register}>
                            <h3 className="text-center">Register</h3>
                            {
                                form.error && (
                                    <div className="alert alert-danger">{form.error}</div>
                                )
                            }
                            <div className="mb-3">
                                <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter Email" required/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                                <input type="password" className="form-control" id="exampleInputPassword1" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter Password" required/>
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

export default Register