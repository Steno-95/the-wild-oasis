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

export async function createEditCabin(newCabin, id) {
  const hasImagePath = newCabin.image?.startsWith?.(supabaseUrl);

  const imageName = `${Math.random()}-${newCabin.image.name}`.replaceAll(
    "/",
    ""
  );

  const imagePath = hasImagePath
    ? newCabin.image
    : `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;
  // https://nettxaarfoalzldbrltg.supabase.co/storage/v1/object/public/cabin-images//cabin-001.jpg

  // 1. Create/edit Cabin
  let query = supabase.from("cabins");

  // A) CREATE
  if (!id) query = query.insert([{ ...newCabin, image: imagePath }]); //this work because we used the same for the field in the db and inside the form to create the obj

  // B) EDIT
  if (id) query = query.update({ ...newCabin, image: imagePath }).eq("id", id);

  const { data, error } = await query.select().single();
  if (error) {
    console.error(error);
    throw new Error("Cabins could not be created");
  }

  // 2. Upload image
  if (hasImagePath) return data;

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

  return data;
}

//on supabase to get access to the DELETE for the function we need to set up a policy for it
export async function deleteCabins(id) {
  //select all entries on db for comparison
  const { data, error: cabinReadError } = await supabase
    .from("cabins")
    .select("*");

  //identify the element to delete
  const cabin = data.filter((item) => item.id === id).at(0);
  //check if in all the entries there is more than one element that points at the same image in the bucket and store them in an array
  const imgUsed = data.filter((item) => item.image === cabin.image);

  if (cabinReadError) {
    console.error(cabinReadError);
    throw new Error("Can't retrieve cabin information from DB");
  }

  //identify the name of the file to delete
  const imgFileName = cabin.image.split("/").at(-1);

  const { error } = await supabase.from("cabins").delete().eq("id", id);
  if (error) {
    console.error(error);
    throw new Error("Cabins could not be deleted");
  }

  //check if more than one element uses the image if yes it terminate otherwise proced to delete from the bucket
  if (imgUsed.length !== 1) return;

  const { error: errorStorage } = await supabase.storage
    .from("cabin-images")
    .remove([imgFileName]);

  if (errorStorage) {
    console.error(errorStorage);
    throw new Error("Cabins image could not be deleted");
  }
}
