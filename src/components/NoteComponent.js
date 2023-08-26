import { collection, doc, getFirestore, serverTimestamp, updateDoc } from 'firebase/firestore'
import React, { useState } from 'react'

function NoteComponent({ note, user }) {
    const [text, setText] = useState(note.text)
    const [tag, setTag] = useState(note.tag)
    const handleSubmit = (e) => {
        e.preventDefault()
        if (text.length !== 0 && tag.length !== 0) {
            updateDoc(doc(getFirestore(), "notes", user.uid, 'note',note.id), {
                tag: tag,
                text: text,
                updated: serverTimestamp(),
            }).then(res => {
                
            }).catch(err => console.log(err));
        }
    }
    return (
        <>
            <button className="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target={`#addNoteModal${note.id}`}>Edit</button>
            <div className="modal fade" id={`addNoteModal${note.id}`} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit note</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <input onChange={e => { setTag(e.target.value) }} value={tag} type="text" className="form-control mb-2" placeholder='Title' />
                                <textarea onChange={e => { setText(e.target.value) }} className="form-control" placeholder='Details' value={text}></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NoteComponent