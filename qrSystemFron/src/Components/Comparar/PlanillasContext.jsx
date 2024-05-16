import { createContext, useState } from 'react';

export const PlanillasContext = createContext();

export const PlanillasProvider = ({ children }) => {
    const [fileId, setFileId] = useState('');
    const [fileId2, setFileId2] = useState('');
    return (
        <PlanillasContext.Provider value={{ fileId, setFileId, fileId2, setFileId2 }}>
            {children}
        </PlanillasContext.Provider>
    );
};
