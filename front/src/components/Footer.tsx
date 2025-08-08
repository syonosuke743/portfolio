import React from 'react'
import Link from 'next/link'
import { Home, History } from 'lucide-react'

const Footer = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-12 bg-orange-100 flex items-center justify-around px-4">
      <nav className="flex w-full justify-around">
        <Link href="/home" className="flex flex-col items-center text-sm text-orange-600 hover:text-orange-700">
          <Home className="w-5 h-5" />
          <span className='text-xs text-center'>home</span>
        </Link>
        <Link href="/history" className="flex flex-col items-center text-sm text-orange-600 hover:text-orange-700">
          <History className="w-5 h-5 " />
          <span className='text-xs text-center'>history</span>
        </Link>
      </nav>
    </div>
  )
}

export default Footer

