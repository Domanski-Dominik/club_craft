"use client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome,faUsers,faUserCheck,faCoins,faPlus, faCircleUser} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {signIn, signOut, useSession} from 'next-auth/react'


const Nav = () => {
  const { data: session,status }= useSession();
  const [toggleDropdown, settoggleDropdown] = useState(false);
  const [toggleDropUp, setToggleDropUp] = useState(false);


  return (
    <>
    <nav className="top_nav color_gradient" >
      <div className="flex-between max-w-5xl mx-auto">
      <Link href="/locations" className="flex gap-2 flex-center">
        <Image 
          src="/logo_figure.svg"
          alt="Sportify Logo"
          width={50}
          height={50}
          className="object-contain "
        />
        <p className="logo_text">Sportify</p>
      </Link>
      

      {/* Desktop Navigation */}
      <div className="sm:flex hidden">
        {session?.user ? (

        <div className="flex gap-3 md:gap-5">
           <Link href="/stat"
              className="outline_btn">
               Statystyki
            </Link> 
            
            <Link href="/payments"
              className="outline_btn">
               Płatności
            </Link>

            <Link href="/locations"
            className="outline_btn">
              Obecność
            </Link>

            <FontAwesomeIcon 
              icon={faCircleUser} 
              onClick={() => settoggleDropdown((prev) => !prev)} 
              className="text-4xl mr-4"
            />
           
            {toggleDropdown && (
              <div className="absolute right-0  mt-14 w-1/3 p-5 rounded-lg bg-white min-w-[210px] flex flex-col gap-2 justify-end items-end z-10">
                <Link 
                 href="/profile"
                 className="dropdown_link"
                 onClick={() => settoggleDropdown(false)}
                 >
                  My Profile
                </Link>
                <Link 
                  href="/"
                  className="dropdown_link"
                  onClick={() => settoggleDropdown(false)}
                >
                 coś się wstawi
                </Link>
                <button 
                  type="button"
                  className="mt-5 w-full black_btn"
                  onClick={() => {
                    settoggleDropdown(false);
                    signOut();
                  }}
                  >
                   Wyloguj się
                </button>
              </div>
            )}
          
          </div>
        ): (
          <>
          {status === "unauthenticated" && (
            <button
              type="button"
              onClick={() => signIn()}
              className="outline_btn mr-10"
            >
              Zaloguj się
            </button>
          )}
          </>
        )
        }
      </div>
      
      {/* Mobile Navigation */}
      <div className="sm:hidden flex relative">
        {session?.user ? (
          <div className="flex">
            <FontAwesomeIcon 
              icon={faCircleUser}
              onClick={() => settoggleDropdown((prev) => !prev)} 
              className="text-4xl mr-4"
            />

                {toggleDropdown && (
                  <div className="dropdown z-10">
                    <Link 
                      href="/locations"
                      className="dropdown_link"
                      onClick={() => settoggleDropdown(false)}
                      >
                        Obecność
                      </Link>
                      <Link 
                      href="/payments"
                      className="dropdown_link"
                      onClick={() => settoggleDropdown(false)}
                      >
                        Płatności
                      </Link>
                      <Link 
                      href="/stat"
                      className="dropdown_link"
                      onClick={() => settoggleDropdown(false)}
                      >
                        Statystyki
                      </Link>
                      <button 
                      type="button"
                      className="mt-5 w-full black_btn"
                      onClick={() => {
                        settoggleDropdown(false);
                        signOut();
                      }}
                      >
                        Wyloguj się
                      </button>
                  </div>
                )}
          </div>
        ): (<></>
        )}
      </div>
      </div>
    </nav>
  
    {/* Mobile Navigation Bottom*/}
      {/*<footer className='color_gradient bottom_nav sm:hidden'>
        <div className="sm:hidden flex relative">
        <Link href='' className="w-1/5 text-center px-px" >
            <FontAwesomeIcon icon={faHome} className="text-2xl" />
            <div className="nav_btn">Klub</div>
          </Link>
          <Link href='/participants' className="w-1/5 text-center px-px">
            <FontAwesomeIcon icon={faUsers} className="text-2xl" />
            <div className="nav_btn">Uczestnicy</div>
          </Link>
          <button 
          onClick={() => setToggleDropUp((prev) => !prev)} className="w-1/5 text-center px-px border-2 rounded-full ">
              <FontAwesomeIcon icon={faPlus} className="text-4xl"/>
          </button>
          <Link href='/locations' className="w-1/5 text-center px-px">
          <FontAwesomeIcon icon={faUserCheck} className="text-2xl"/>
            <div className="nav_btn">Obecność</div>
          </Link>
          <Link href='/payments' className="w-1/5 text-center px-px">
            <FontAwesomeIcon icon={faCoins} className="text-2xl"/>
            <div className="nav_btn">Płatności</div>
          </Link>

        </div>
        {toggleDropUp && (
              <div className="absolute bottom-20 end-1/4 p-1 rounded-lg bg-white flex flex-col w-1/2 items-center z-10 border-2 border-black">
               <ul className="list-none">
                <li className="w-full border-b-2 border-black border-opacity-100 py-3 dark:border-opacity-50"><Link 
                 href="/locations/group/new"
                 className=" text-sm font-inter text-gray-700 hover:text-gray-500 font-medium"
                 onClick={() => setToggleDropUp(false)}
                 >
                  Dodaj Grupę
                </Link></li>
                <li  className="w-full border-b-2 border-black border-opacity-100 py-3 dark:border-opacity-50"><Link 
                  href="/locations/new"
                  className=" text-sm font-inter text-gray-700 hover:text-gray-500 font-medium"
                  onClick={() => setToggleDropUp(false)}
                >
                 Dodaj Lokalizacje
                </Link></li>
                <li className="w-full py-3"><Link 
                 href="/participants/new"
                 className=" text-sm font-inter text-gray-700 hover:text-gray-500 font-medium"
                 onClick={() => setToggleDropUp(false)}
                 >
                  Dodaj Uczestnika
                </Link></li>
                </ul>
              </div>
            )}
        </footer>*/}
      
    </>
  )
}

export default Nav
