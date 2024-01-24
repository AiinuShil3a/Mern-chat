import React from 'react'

const avatar = ({username,userId ,online}) => {
    const colors = [
        "bg-teal-200",
        "bg-red-200",
        "bg-green-200",
        "bg-purple-200",
        "bg-blue-200",
        "bg-yellow-200",
        "bg-orange-200",
        "bg-pink-200",
        "bg-rose-200",
        "bg-fuchsia-200",
    ];
    const userIdBase10 = parseInt(userId.substring(10),16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
  return (
    <div className={'w-8 h-8 relative rounded-full flex items-center first-letter ' + color}>
        <div className='text-center w-full opacity-70 '>
            {username[0]}
            {online && (
              <div className='absolute w-3 h-3 bg-green-500 button-0 right-0 rounded-full border border-white'>

              </div>
            )}
            {!online && (
              <div className='absolute w-3 h-3 bg-gray-500 button-0 right-0 rounded-full border border-white'>

              </div>
            )}
        </div>
    </div>
  )
}

export default avatar