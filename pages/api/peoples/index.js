import admin from "../../../firebase-admin"
import auth from "firebase-admin/auth"

export default async (req, res) => {
    // auth.listUsers().then(data => {
    //     res.status(200).json({users:"data.users"})
    // })
    const data = (await admin.auth().listUsers()).users
    res.send({users:data})
}