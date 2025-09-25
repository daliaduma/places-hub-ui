import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import "./PlaceForm.css";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const UpdatePlace = () => {
  const auth = useContext(AuthContext);
  const history = useHistory();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const placeId = useParams().placeId;
  const [loadedPlace, setLoadedPlace] = useState();
  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseData = await sendRequest(`/places/${placeId}`);
        const place = responseData.place;
        setLoadedPlace(place);
        setFormData(
          {
            title: {
              value: place.title,
              isValid: true,
            },
            description: {
              value: place.description,
              isValid: true,
            },
          },
          true,
        );
      } catch (error) {}
    };
    fetchData();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(`/places/${placeId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
	      headers: { Authorization: `Bearer ${auth.token}` },
      });
      history.push(`/${auth.userId}/places`);
    } catch (error) {}
  };

  const handleCancel = () => {
    history.push(`/${auth.userId}/places`);
  };

  if (!loadedPlace) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="center">
          <LoadingSpinner>Loading...</LoadingSpinner>
        </div>
      )}
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
        <div className={"header"}>
          <h1>Edit place</h1>
        </div>
        <div className={"content"}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            disabled={isLoading}
            initialValue={loadedPlace?.title}
            initialValid={formState.inputs.title.isValid}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (min. 5 characters)."
            onInput={inputHandler}
            disabled={isLoading}
            initialValue={loadedPlace?.description}
            initialValid={formState.inputs.description.isValid}
          />
        </div>

        <p className={"action"}>
          <span style={{ marginRight: "16px" }}>
            <Button inverse type="button" onClick={handleCancel}>
              Cancel
            </Button>
          </span>
          <Button type="submit" disabled={!formState.isValid || isLoading}>
            Update place
          </Button>
        </p>
      </form>
    </>
  );
};

export default UpdatePlace;
