import React from 'react'
import { Button } from './ui/button'

const Header = () => {
  return (
<div className="flex justify-between items-center h-12 bg-orange-300 px-4">
  <h1 className="text-2xl">TokoToko</h1>
  <Button className='	bg-orange-500 hover:bg-orange-600 text-white rounded-2xl'>ログアウト</Button>
</div>
  )
}

export default Header
