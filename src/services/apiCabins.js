import supabase, { supabaseUrl } from "./supabase";

//this function except for the error handling are generated directly from supabase by using the API docs created for our own database

//on supabase to get access to the GET for the function we need to set up a policy for it
export async function getCabins() {
  let { data, error } = await supabase.from("cabins").select("*");

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data;
}

export async function createCabin(newCabin) {
  const imageName = `${Math.random()}-${newCabin.image.name}`.replaceAll(
    "/",
    ""
  );
  const imagePath = `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;
  // https://nettxaarfoalzldbrltg.supabase.co/storage/v1/object/public/cabin-images//cabin-001.jpg
  // 1. Create Cabin
  const { data, error } = await supabase
    .from("cabins")
    .insert([{ ...newCabin, image: imagePath }]) //this work because we used the same for the field in the db and inside the form to create the obj
    .select();

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be created");
  }

  // 2. Upload image
  const { error: storageError } = await supabase.storage
    .from("cabin-images")
    .upload(imageName, newCabin.image);

  // 3. Delete the cabin IF there was an error uploading image
  if (storageError) {
    await supabase.from("cabins").delete().eq("id", data.id);
    console.error(storageError);
    throw new Error(
      "Cabin image could not be uploaded and the cabin was not created"
    );
  }
}

//on supabase to get access to the DELETE for the function we need to set up a policy for it
export async function deleteCabins(id) {
  const { data: cabin, error: cabinReadError } = await supabase
    .from("cabins")
    .select("*")
    .eq("id", id);

  if (cabinReadError) {
    console.error(cabinReadError);
    throw new Error("Can't retrieve cabin information from DB");
  }
  const imgFileName = cabin[0].image.split("/").at(-1);

  const { error } = await supabase.from("cabins").delete().eq("id", id);
  if (error) {
    console.error(error);
    throw new Error("Cabins could not be deleted");
  }
  const { error: errorStorage } = await supabase.storage
    .from("cabin-images")
    .remove([imgFileName]);

  if (errorStorage) {
    console.error(errorStorage);
    throw new Error("Cabins image could not be deleted");
  }
}
