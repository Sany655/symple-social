import React from 'react'
import withProtected from './middlewares/withProtected'

const Index = () => {
  return (
    <div>Index</div>
  )
}

export default withProtected(Index)