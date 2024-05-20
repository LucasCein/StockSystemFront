import { createContext, useRef, useState } from "react";
export const ProvRouteContext= createContext()
export const MyProvider = ({ children }) => {
    const [value, setValue] = useState()
    const ref =useRef(value)
    const [userName, setUserName] = useState("")
    const [userid, setUserId] = useState()
    const back='https://stocksystemback-vw6v.onrender.com'
      return (
// Suggested code may be subject to a license. Learn more: ~LicenseLog:3835192673.
          <ProvRouteContext.Provider value={{ref,setValue,userName,setUserName,userid,setUserId, back}}>
            {children}
          </ProvRouteContext.Provider>)
  }