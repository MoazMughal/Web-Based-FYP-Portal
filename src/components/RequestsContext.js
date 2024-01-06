import React, { createContext, useState } from "react";

export const RequestsContext = createContext();

export const RequestsProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);

  const addRequest = (request) => {
    setRequests((prevRequests) => [...prevRequests, request]);
  };

  const deleteRequest = (requestId) => {
    setRequests((prevRequests) =>
      prevRequests.filter((request) => request.id !== requestId)
    );
  };

  return (
    <RequestsContext.Provider value={{ requests, addRequest, deleteRequest }}>
      {children}
    </RequestsContext.Provider>
  );
};
