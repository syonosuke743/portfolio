"use client"

import { Slider } from '@/components/ui/slider'
import React from 'react'
import { useState } from 'react'

const page = () => {

  const [value, setValue] = useState<number[]>([1])

  return (
    <form>
      <div className='max-w-md mx-[20px] my-10 bg-[#EACC66] p-8 rounded-lg text-center shadow-md'>
        <div className='flex  justify-center mb-7'>
        現在地からの距離、スポットの順番・種別を決めよう！
        </div>
        <p className='text-center mb-3 text-2xl'>距離(M)</p>
        <Slider
          value={value}
          onValueChange={setValue}
          max={5000}       // 最大値（任意）
          step={100}        // ステップ幅（任意）
          aria-label="距離スライダー"
        />
        <p className='text-center mt-4'>選択中:{value[0]}M</p>

        <div className='mt-7 text-2xl'>中継スポット選択</div>
        コンボボックスは明日
      </div>
    </form>
  )
}

export default page
