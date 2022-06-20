import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { useSelector } from "react-redux"
import Spinner from '../../components/Spinner';

const withPublic = (Component) => {
    return function WithPublic(props) {
        const router = useRouter();
        const user = useSelector(state => state.auth).user

        if (user) {
            router.push("/")
            return <Spinner />;
        }

        return <Component user={user} {...props} />;
    }
}

export default withPublic