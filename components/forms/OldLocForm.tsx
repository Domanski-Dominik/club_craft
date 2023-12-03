import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Form } from "react-hook-form"; //Do usunięcia

const LocationForm = () => {
  const { register, control } = useForm();
  const router = useRouter();

  return (
    <section className="w-full max-w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">Utwórz Lokalizacje</span>
      </h1>
      <p className="desc text-left max-w-md">
        lokalizacje w swojej bazie klientów!
      </p>
      <Form
        className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
        onSubmit={async ({ formDataJson }) => {
          // Send form data to the API using fetch
          await fetch("/api/loc", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: formDataJson,
          })
            .then((response: Response) => response.json())
            .then((responseData) => {
              console.log("Location created:", responseData);
              router.push(`/locations/new/${responseData.id}`);
            })
            .catch((error) =>
              console.error("Error creating location: ", error)
            );
        }}
        encType={"application/json"} //you can also switch to json object
        onSuccess={() => {
          alert("Your application is updated.");
        }}
        onError={() => {
          alert("Submission has failed.");
        }}
        control={control}>
        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Nazwa lokalizacji:
          </span>
          <input
            {...register("name", { required: true })}
            placeholder="Nazwa lokalizacji"
            className="form_input"
          />
        </label>
        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Adres:
          </span>
          <input
            type="text"
            {...register("addres", { required: true })}
            className="form_input"
            placeholder="Adres"
          />
        </label>
        <div className="flex-end mx-3 mb-5 gap-4">
          <Link href="/locations" className="text-gray-500 text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            className="px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white">
            Zapisz lokalizację
          </button>
        </div>
      </Form>
    </section>
  );
};

export default LocationForm;
