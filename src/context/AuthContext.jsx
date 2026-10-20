import { createContext, useEffect, useState } from 'react'
import api from '../utils/axios'

export const AuthContext=createContext()
export const AuthProvider=({children})=>{
  const [user,setUser]=useState(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    const storedUser=localStorage.getItem("user")
    if(storedUser){
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  },[])

  const register=async (name,email,password)=>{
    try {
      const {data}=await api.post('/auth/register',{name,email,password})
      setUser(data)
      return data
    } catch (err) {
      console.error("Register failed",err);
      throw err
    }
  }
  const login= async (email,password)=>{
    try {
      const {data}=await api.post('/auth/login',{email,password})
      setUser(data)
      localStorage.setItem('user',JSON.stringify(data))
      localStorage.setItem('token',data.token)
      return data
    } catch (error) {
      console.error("Login failed",error);
      throw error
    }
  }

  
const verifyOtp = async (email, otp) => {
    try {
        console.log("Email:", email);
        console.log("OTP:", otp);

        const { data } = await api.post('/auth/verify-otp', {
            email,
            otp
        });

        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);

        return data;
    } catch (error) {
        console.error(
            "OTP verification failed:",
            error.response?.data || error.message
        );

        throw error;
    }
};

  const logout=()=>{
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }
  return (
    <AuthContext.Provider value={{user,loading,login,logout,verifyOtp,register}}>
      {children}
    </AuthContext.Provider>
  )
}