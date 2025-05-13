import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import Spinner from '../components/Spinner'

function Todo() {
    const [todos, setTodos] = useState([])
    const [newTodo, setNewTodo] = useState({ text: '', deadline: '' })
    const [editTodo, setEditTodo] = useState({ id: null, text: '', deadline: '' })
    const [loading, setLoading] = useState(true)
    const user = useSelector(state => state.auth).user

    useEffect(() => {
        onSnapshot(
            query(
                collection(getFirestore(), 'todos', user.uid, 'todo'),
                orderBy('isDone', 'asc'), // not done first, done later
                orderBy('deadline', 'asc')
            ),
            (snapshot) => {
            setTodos(snapshot.docs.map(doc => ({
                id: doc.id,
                text: doc.data().text,
                createdAt: doc.data().createdAt?.toDate(),
                deadline: doc.data().deadline?.toDate(),
                isDone: doc.data().isDone || false
            })))
            setLoading(false)
        });
    }, [user.uid])

    const handleAdd = (e) => {
        e.preventDefault()
        if (newTodo.text.length !== 0 && newTodo.deadline) {
            addDoc(collection(getFirestore(), "todos", user.uid, 'todo'), {
                text: newTodo.text,
                createdAt: serverTimestamp(),
                deadline: new Date(newTodo.deadline),
                isDone: false
            }).then(() => {
                setNewTodo({ text: '', deadline: '' })
            }).catch(err => console.log(err));
        }
    }

    const handleEdit = (e) => {
        e.preventDefault()
        if (editTodo.text.length !== 0 && editTodo.deadline && editTodo.id) {
            updateDoc(doc(getFirestore(), "todos", user.uid, 'todo', editTodo.id), {
                text: editTodo.text,
                deadline: new Date(editTodo.deadline)
            }).then(() => {
                setEditTodo({ id: null, text: '', deadline: '' })
            }).catch(err => console.log(err));
        }
    }

    const deleteTodo = (id) => {
        if (window.confirm("Are you sure you want to delete this todo?")) {
            deleteDoc(doc(getFirestore(), 'todos', user.uid, 'todo', id))
                .catch(err => console.log(err));
        }
    }

    const toggleDone = (todo) => {
        updateDoc(doc(getFirestore(), "todos", user.uid, 'todo', todo.id), {
            isDone: !todo.isDone
        }).catch(err => console.log(err));
    }

    const extendDeadline = (todo) => {
        const newDeadline = new Date(todo.deadline);
        newDeadline.setDate(newDeadline.getDate() + 1); // Extend by 1 day
        updateDoc(doc(getFirestore(), "todos", user.uid, 'todo', todo.id), {
            deadline: newDeadline
        }).catch(err => console.log(err));
    }

    const openEditModal = (todo) => {
        setEditTodo({
            id: todo.id,
            text: todo.text,
            deadline: todo.deadline.toISOString().slice(0, 16)
        });
    }

    return (
        <div className="container">
            <div className="d-flex align-items-center justify-content-between mt-5">
                <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addTodoModal">Add Todo</button>
            </div>

            {/* Add Todo Modal */}
            <div className="modal fade" id="addTodoModal" tabIndex="-1" aria-labelledby="addTodoModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addTodoModalLabel">Add Todo</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="modal-body">
                                <textarea
                                    onChange={e => setNewTodo({ ...newTodo, text: e.target.value })}
                                    value={newTodo.text}
                                    className="form-control mb-3"
                                    placeholder="What needs to be done?"
                                    rows="3"
                                ></textarea>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={newTodo.deadline}
                                    onChange={e => setNewTodo({ ...newTodo, deadline: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Add Todo</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Edit Todo Modal */}
            <div className="modal fade" id="editTodoModal" tabIndex="-1" aria-labelledby="editTodoModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editTodoModalLabel">Edit Todo</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleEdit}>
                            <div className="modal-body">
                                <textarea
                                    onChange={e => setEditTodo({ ...editTodo, text: e.target.value })}
                                    value={editTodo.text}
                                    className="form-control mb-3"
                                    placeholder="What needs to be done?"
                                    rows="3"
                                ></textarea>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={editTodo.deadline}
                                    onChange={e => setEditTodo({ ...editTodo, deadline: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Todo List */}
            {loading ? <Spinner /> : (
                <div className="mt-4">
                    {todos.map(todo => (
                        <div key={todo.id} className={`card mb-3 ${todo.isDone ? 'bg-light' : ''}`}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex gap-2 me-2">
                                        <p className="text-muted small">
                                            Created: {todo.createdAt?.toLocaleString()},
                                        </p>
                                        <p className={`large ${new Date(todo.deadline) < new Date() ? 'text-danger' : 'text-primary'}`}>
                                            Deadline: {todo.deadline?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className={`btn btn-sm ${todo.isDone ? 'btn-success' : 'btn-outline-success'}`}
                                            onClick={() => toggleDone(todo)}
                                        >
                                            {todo.isDone ? '✓ Done' : 'Mark Done'}
                                        </button>
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => openEditModal(todo)}
                                            data-bs-toggle="modal"
                                            data-bs-target="#editTodoModal"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-outline-warning btn-sm"
                                            onClick={() => extendDeadline(todo)}
                                        >
                                            Extend
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => deleteTodo(todo.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <h5 className={`card-title ${todo.isDone ? 'text-muted text-decoration-line-through' : ''}`}>
                                    {todo.text}
                                </h5>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Todo