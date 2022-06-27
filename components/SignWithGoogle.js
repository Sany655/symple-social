import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import React from 'react'

const SignWithGoogle = ({ setForm, form }) => {

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
                getDoc(doc(getFirestore(), "users", user.uid)).then(userRes => {
                    if (userRes.exists()) {
                        console.log("user exists");
                        return;
                    } else {
                        console.log("creating user");
                        setDoc(doc(getFirestore(), "users", user.uid), {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            phoneNumber: user.phoneNumber,
                            timestamp: serverTimestamp()
                        }).then(res => console.log(res)).catch(err => console.log(err.message))
                    }
                })
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
    return (
        <button type="button" className="btn btn-outline-success" onClick={loginWithGoogle}>Google</button>
    )
}

export default SignWithGoogle