import { createContext, useRef, useState } from "react";
export const ProvRouteContext= createContext()
export const MyProvider = ({ children }) => {
    const [value, setValue] = useState()
    const ref =useRef(value)
    const [userName, setUserName] = useState("")
      return (
          <ProvRouteContext.Provider value={{ref,setValue,userName,setUserName}}>
            {children}
          </ProvRouteContext.Provider>)
  }