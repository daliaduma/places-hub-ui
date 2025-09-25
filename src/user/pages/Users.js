import React, { useContext, useEffect, useState } from "react";

import UsersList from "../components/UsersList";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Button from "../../shared/components/FormElements/Button";
import { AuthContext } from "../../shared/context/auth-context";

const Users = () => {
  const auth = useContext(AuthContext);
  const [loadedUsers, setLoadedUsers] = useState([]);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const responseData = await sendRequest("/users");
        setLoadedUsers(responseData?.users);
      } catch (error) {
        console.log(error);
      }
    };
    loadUsers();
  }, [sendRequest]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className={"center"}>
          <LoadingSpinner />
        </div>
      )}

      <div className={"main-container"}>
        <h1>
          <span className={"text-primary"}>MERN Demo App</span>
        </h1>
        <h2 className={"text-bold"}>PlacesHub</h2>
        <p>
          A MERN demo with login, signup, and CRUD functionality for managing
          places, showcasing modern React, Node.js, Express, and MongoDB
          integration.
        </p>
        {!auth.isLoggedIn && <Button to={"/auth"}>Go to login</Button>}
      </div>
      {!isLoading && loadedUsers.length > 0 && (
        <UsersList items={loadedUsers} />
      )}
    </React.Fragment>
  );
};

export default Users;
