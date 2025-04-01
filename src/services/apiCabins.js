import supabase from "./supabase";

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
  const { data, error } = await supabase
    .from("cabins")
    .insert([newCabin]) //this work because we used the same for the field in the db and inside the form to create the obj
    .select();

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be created");
  }
}

//on supabase to get access to the DELETE for the function we need to set up a policy for it
export async function deleteCabins(id) {
  const { error } = await supabase.from("cabins").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be deleted");
  }
}
