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

    const isOverdue = (deadline) => {
        return new Date(deadline) < new Date();
    }

    return (
        <div className="container py-5">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="fw-bold mb-0">My Tasks</h2>
                        <button className="btn btn-primary px-4" data-bs-toggle="modal" data-bs-target="#addTodoModal">
                            <i className="bi bi-plus-lg me-2"></i>Add Todo
                        </button>
                    </div>
                </div>
            </div>

            {/* Todo Cards */}
            {loading ? <Spinner /> : (
                <div className="row g-4">
                    {todos.length === 0 ? (
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center py-5">
                                    <h4 className="text-muted">No tasks yet</h4>
                                    <p>Create a new task to get started</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        todos.map(todo => (
                            <div key={todo.id} className="col-md-6 col-lg-4">
                                <div className={`card h-100 shadow-sm ${todo.isDone ? 'border-success' : isOverdue(todo.deadline) ? 'border-danger' : 'border-primary'}`}>
                                    <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                                        <span className={`badge ${todo.isDone ? 'bg-success' : isOverdue(todo.deadline) ? 'bg-danger' : 'bg-primary'}`}>
                                            {todo.isDone ? 'Completed' : isOverdue(todo.deadline) ? 'Overdue' : 'Pending'}
                                        </span>
                                        <div className="dropdown">
                                            <button className="btn btn-sm btn-link text-dark" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                <li>
                                                    <button 
                                                        className="dropdown-item" 
                                                        onClick={() => toggleDone(todo)}
                                                    >
                                                        {todo.isDone ? 'Mark as Pending' : 'Mark as Done'}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item" 
                                                        onClick={() => openEditModal(todo)}
                                                        data-bs-toggle="modal" 
                                                        data-bs-target="#editTodoModal"
                                                    >
                                                        Edit
                                                    </button>
                                                </li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item" 
                                                        onClick={() => extendDeadline(todo)}
                                                    >
                                                        Extend Deadline
                                                    </button>
                                                </li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item text-danger" 
                                                        onClick={() => deleteTodo(todo.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className={`card-title mb-3 ${todo.isDone ? 'text-decoration-line-through text-muted' : ''}`} style={{ whiteSpace: 'pre-line' }}>
                                            {todo.text}
                                        </div>
                                        <div className="d-flex mb-2 align-items-center">
                                            <i className="bi bi-calendar-event text-muted me-2"></i>
                                            <small className="text-muted">
                                                Created: {todo.createdAt?.toLocaleDateString()} at {todo.createdAt?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <i className={`bi bi-alarm me-2 ${isOverdue(todo.deadline) && !todo.isDone ? 'text-danger' : 'text-muted'}`}></i>
                                            <small className={`${isOverdue(todo.deadline) && !todo.isDone ? 'text-danger fw-bold' : 'text-muted'}`}>
                                                Due: {todo.deadline?.toLocaleDateString()} at {todo.deadline?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                {(() => {
                                                    if (!todo.deadline || todo.isDone) return null;
                                                    const now = new Date();
                                                    const diff = todo.deadline - now;
                                                    if (diff <= 0) return <span className="ms-2 text-danger">(Overdue)</span>;
                                                    const hours = Math.floor(diff / (1000 * 60 * 60));
                                                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                                                    return (
                                                        <span className="ms-2 text-primary">
                                                            ({hours}h {minutes}m {seconds}s left)
                                                        </span>
                                                    );
                                                })()}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-transparent border-top-0">
                                        <div className="d-flex gap-2">
                                            <button
                                                className={`btn btn-sm flex-grow-1 ${todo.isDone ? 'btn-outline-success' : 'btn-success'}`}
                                                onClick={() => toggleDone(todo)}
                                            >
                                                {todo.isDone ? 'Mark Pending' : 'Mark Complete'}
                                            </button>
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => openEditModal(todo)}
                                                data-bs-toggle="modal"
                                                data-bs-target="#editTodoModal"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => deleteTodo(todo.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add Todo Modal */}
            <div className="modal fade" id="addTodoModal" tabIndex="-1" aria-labelledby="addTodoModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addTodoModalLabel">Add New Task</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="todoText" className="form-label">Task Description</label>
                                    <textarea
                                        id="todoText"
                                        onChange={e => setNewTodo({ ...newTodo, text: e.target.value })}
                                        value={newTodo.text}
                                        className="form-control"
                                        placeholder="What needs to be done?"
                                        rows="15"
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="todoDeadline" className="form-label">Deadline</label>
                                    <input
                                        id="todoDeadline"
                                        type="datetime-local"
                                        className="form-control"
                                        value={newTodo.deadline}
                                        onChange={e => setNewTodo({ ...newTodo, deadline: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Add Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Edit Todo Modal */}
            <div className="modal fade" id="editTodoModal" tabIndex="-1" aria-labelledby="editTodoModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editTodoModalLabel">Edit Task</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleEdit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="editTodoText" className="form-label">Task Description</label>
                                    <textarea
                                        id="editTodoText"
                                        onChange={e => setEditTodo({ ...editTodo, text: e.target.value })}
                                        value={editTodo.text}
                                        className="form-control"
                                        placeholder="What needs to be done?"
                                        rows="15"
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editTodoDeadline" className="form-label">Deadline</label>
                                    <input
                                        id="editTodoDeadline"
                                        type="datetime-local"
                                        className="form-control"
                                        value={editTodo.deadline}
                                        onChange={e => setEditTodo({ ...editTodo, deadline: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Todo