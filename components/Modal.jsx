import { faX } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from 'react'

const Modal = ({open, onClose, children}) => {
  return (
    <div onClick={onClose} className={`fixed inset-0 flex justify-center items-center transition-colors ${open ? "visible bg-black/50" : "invisible"}`}>
        <div 
         onClick={(e) => e.stopPropagation()}
         className={`bg-gray-200  rounded-xl shadow p-6 transition-all ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}`}
        >
            <button 
             onClick={onClose}
             className='absolute top-2 right-2 p-1 rounded-lg text-gray-600 bg-transparent hover:bg-gray-50 hover:text-gray-600'>
                <FontAwesomeIcon icon={faX} />
            </button>
            {children}
        </div>
    
    </div>
  )
}

export default Modal