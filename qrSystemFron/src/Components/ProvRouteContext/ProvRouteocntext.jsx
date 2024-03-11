import { createContext, useRef, useState } from "react";
export const ProvRouteContext= createContext()
export const MyProvider = ({ children }) => {
    const [value, setValue] = useState()
    const ref =useRef(value)
    const [userName, setUserName] = useState("")
    const [userid, setUserId] = useState()
      return (
          <ProvRouteContext.Provider value={{ref,setValue,userName,setUserName,userid,setUserId}}>
            {children}
          </ProvRouteContext.Provider>)
  }