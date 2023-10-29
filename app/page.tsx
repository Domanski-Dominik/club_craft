'use client'
import { Box, Button } from "@mui/material"
import { useRouter } from "next/navigation"

const Home = () => {
  const router = useRouter()
  return (
    <>
       <Box className='head_text text-center mb-10'> <span className='blue_gradient'>Witaj w systemie!</span>
       </Box>
       <Button 
       onClick={()=>router.push('/login')}
       variant="outlined"
       color="secondary"
       >Zaloguj się</Button>
    </>
  )
}

export default Home