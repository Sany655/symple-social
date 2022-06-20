
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useSelector } from "react-redux"
import Spinner from '../../components/Spinner';

function withProtected(Component) {
    return function WithProtected(props) {
        const router = useRouter();
        const user = useSelector(state => state.auth).user

        if (!user) {
            router.push("/login")
            return <Spinner />;
        }

        return <Component user={user} {...props} />;
    }
}

export default withProtected