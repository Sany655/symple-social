import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { useRouter } from "next/router"
import { useState } from "react"
import withPublic from "./middlewares/withPublic"
const Login = () => {
    const [form, setForm] = useState({
        email: "asd@asd.com",
        password: "asdasd",
        error: ""
    })

    function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log(user);
                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                setForm({ ...form, error: errorMessage })
                // ...
            });
    }

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
                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                                <input type="password" className="form-control" id="exampleInputPassword1" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <button type="submit" className="btn btn-primary me-2">Submit</button>
                            <button type="button" className="btn btn-outline-success" onClick={loginWithGoogle}>Google</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withPublic(Login)