import React, { useEffect, useRef } from 'react';

function AdminLogin({ callback, actionType = '' }) {
    const closebtn = useRef(null)
    const handleSubmit = (e) => {
        e.preventDefault();
        const password = e.target.password.value;
        if (password === (process.env.NODE_ENV === 'production' ? process.env.REACT_APP_adminpass : ' ')) {
            callback({ success: true, actionType });
            closebtn.current.click()
        } else {
            alert('Invalid password');
        }
        e.target.reset();
    };

    return (
        <div
            className="modal fade"
            id="adminLoginModal"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="adminLoginModalLabel">
                            Admin Login
                            {actionType && ` - ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
                        </h5>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <input type="hidden" name="actionType" value={actionType} />
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="username"
                                    placeholder="Enter admin username"
                                    required
                                    autoComplete="current-username"
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    placeholder="Enter admin password"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" ref={closebtn}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;