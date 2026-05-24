import React, { createContext, useState} from 'react';

export const PassContext = createContext();
export const PassProvider = ({children}) => {
    const [passes, setPasses] = useState([]);
    const [currentPass, setCurrentPass] = useState(null);

    return (
        <PassContext.Provider value={{ passes, setPasses, currentPass, setCurrentPass}}>
            {children}
        </PassContext.Provider>
    )
};