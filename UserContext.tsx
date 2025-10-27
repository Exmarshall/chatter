import React, { createContext, useState, ReactNode } from "react";

// 1️⃣ Define the shape of your context
interface UserContextType {
  userId: string;
  setUserId: (id: string) => void;
}

// 2️⃣ Create the context with an initial empty value
export const UserType = createContext<UserContextType | undefined>(undefined);

// 3️⃣ Define props type for the provider
interface UserProviderProps {
  children: ReactNode;
}

// 4️⃣ Create the provider component
export const UserContext = ({ children }: UserProviderProps) => {
  const [userId, setUserId] = useState<string>("");

  return (
    <UserType.Provider value={{ userId, setUserId }}>
      {children}
    </UserType.Provider>
  );
};
