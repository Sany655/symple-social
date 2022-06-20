import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import Router from "next/router";
import { useState } from "react";
import useFirebase from "./firebase";
import withPublic from "./middlewares/withPublic";

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
                    Router.replace("/")
                })
                .catch((error) => {
                    const errorCode = error.code;
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
                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                                <input type="password" className="form-control" id="exampleInputPassword1" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div className="mb-3 form-check">
                                <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                                <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
                            </div>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withPublic(Register)