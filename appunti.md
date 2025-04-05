---
# **Project Requirement**
---

Authentication:

    - Login functionality for the use of the app
    - Create a new user still need a user to be logged in, to make sure it is an employee
    - update name and password, and ability to upload a photo

Cabins:

    - table view? of all cabins, cabins photo, name, capacity, price and current discount.
    - Users should be able to update, delete and create a cabin

Bookings:

    -table view? with all bookings, showing arrival and departures, status and paid amount, cabin and guest data
    -Booking status can be:
      - unconfirmed
      - checked in
      - checked out
    the table should be filterable by this
    - Other booking data includes:
      -number of guests,
      -number of nights,
      -guest observation(review?)
      -if they booked for breakfast or not (boolean)
      -breakfast price

Check in/out:

    -Users should be able to delete, check in and check out a booking as the guest arrives(no editing necessary for now)
    -Booking may not have been paid yet on guest arrival. Therefore, on check in, users need to accept payment(outside the app) and then comfirm that payment inside the app
    -On check in the guest can ask to add breakfast if it didn't had it before

Guests:

    -Guest data should be:
      -full name
      -email
      -national ID
      -nationality
      -country flag for easy identification

Dashboard:

    -The initial app screen should be a dashboard, to display important information for the last 7, 30 or 90 days:
      - a list of guests checking in and out on the current day. Users should be able to perform there tasks from here
      -Statistics on recent bookings, sales, check ins and occupacy rates.
      -A chart showing all daily hotel sales, showing both "total" sales and "extras" sales (only breakfast at the moment)
      -A chart showing statistics on stay durations, as this is an important metric for the hotel

Settings:

    -Users should be able to define a few application-wide settings:
      -breakfast price,
      - min and max nights/booking (how long can they stay)
      - max guests/booking (how many people per booking)
    -App needs a dark mode

we can divide this features in this necessary pages:

    -Dashboard ==> /dashboard

    -Bookings ==> /bookings <--- bookings

    -Cabins ==> /cabins <--- cabins

    -Booking check in ==> /checkin/:bookingID <---- checkin and out

    -App settings ==> /settings <--App settings

    -User sign up ==> /users <--- Authentication

    - Login ==> /Login <--- Authentication

    -account settings ==> /account <--- Authentication

keep in mind that if you are doing this on your own you might now figure all of this from the start, just a part the rest would come later while doing and implementing things

---

## TECH DECISIONS

---

### Front End

- Routing ---> React Router --- standard for React SPAs

- Styling ---> styled components --- Very popular way of writing component-scoped cssm right inside JavaScript.

- Remote state management ---> React Query --- The best way of managing remote state, with features like caching, automatic re-fetching, pre-fetching, offline support, etcc. Alternatives are SWR and RTK Query(Redux-ToolKit), but this is the most popular

- UI State management ---> Context API --- There is almost no UI state needed in this app, so one simple context with useState will be enough. No need for Redux

- Form Management ---> React Hook Form --- Handling bigger forms can be a lot of work, such as manual state creation and error handling. A library can simplify all this

Other tools ---> React icons / React hot toast / Recharts / date-fns / Supabase

** React Query || tanstack query **

We create a query Client to set up the relative provider to make then the query work for most of the app based on where this provider is located, the same thing as any other provider so far.

the query client is declared like this:

    `
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // staleTime: 60 * 1000,
          staleTime: 0, //is the time that it takes for data to be considered old and so need to be refetched
        },
      },
    });
    `

then we set the query client provider:

    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <GlobalStyles />
      <BrowserRouter>
        ...
      </BrowserRouter>
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
          },
        }}
      />
    </QueryClientProvider>

to install the react query devtool, is a npm package called "@tanstack/react-query-devtools", we just need to include a component as soon as we declare the query client provider:

    import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {...}
    </QueryClientProvider>

to get fetch data we use the useQuery custom hooks, that take an object with a queryKey that is the identifier of the data and a Queryfn that it will use to fetch the data, it will return a huge object with a lot of kind of data, like status, data, if it's loading, if it's fetching, the error and so on,

     const {
    isPending,
    data: cabins,
    error,

    } = useQuery({
    queryKey: ["cabins"],
    queryFn: getCabins,
    });

to do mutation, which basically mean delete, update, create and so on, we use the useMutation custom hooks, that takes a mutationfn that will use to localize the data, and potentially a onSuccess callback function to handle the invalidation of the current data to force a refetching as soon as a mutation happens. The hook return a state to identify the current status of the operation and the function to actually handle the mutation that we can pass to an event handler or call ourself to start the mutation.

    function CabinRow({ cabin }) {
      const {
        id: cabinId,
        name,
        maxCapacity,
        regularPrice,
        discount,
        image,
      } = cabin;

      // We need the query client again to force the invalidation of the query during the mutation
      const queryClient = useQueryClient();

      //Declaration of the useMutation custom hook, with the two callbacks, to evade confusion the first callback, deleteCabins, comes from the services/apiCabins were we declared the deleteCabins function by using the comand from supabase API docs.
      //TO NOTE, invalidate is different from stale, stale is data that is gotten old and might have changed and needs to be refetched, a invalidated data is not acceptable so the script will immediately refetch and refresh the page which is why it makes  the mutation operation so fluid compared to not using the onSuccess cb because it would keep the mutated state as originally was until the user moves to a new page or a refresh happens.

      const { isPending, mutate } = useMutation({
        mutationFn: deleteCabins,
        onSuccess: () => {
          toast.success("Cabin successfully deleted");
          queryClient.invalidateQueries({ queryKey: ["cabins"] });
        },
        onError: (err) => toast.error(err.message),
      });

      return (
        <TableRow role="row">
          ...
          <button onClick={() => mutate(cabinId)} disabled={isPending}>
            Delete
          </button>
        </TableRow>
      );
    }

the mutation hook accept even the onError cb for when an error happens, so we can pass a comand inside to handle the error or display it. the most basic would be alert.

    const { isPending, mutate } = useMutation({
            mutationFn: deleteCabins,
            onSuccess: () => {
              toast.success("Cabin successfully deleted");
              queryClient.invalidateQueries({ queryKey: ["cabins"] });
            },

            //it gets automatically access to the error throw from inside the deleteCabins if it happens
            onError: (err) => toast.error(err.message),


          });

whenever an error happens react query will keep trying to fetch a few times before stopping, to mitigate a temporary error during fetching

to display messages is often used a pop up windows called toast, in this case we use a third-party library to get a component for it,
to use it we include the Toaster component that will take a few props to personalize our toast windows.
for example: - styling the container - the position, that has some pre-defined values that you can check on the documentation - the gutter - a toast options that includes : - the duration of the display on success - the duration of the display on error,

    <QueryClientProvider client={queryClient}>
      ...
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
          },
        }}
      />
    </QueryClientProvider>

And we make use of those toast like this :

      const { isPending, mutate } = useMutation({
        mutationFn: deleteCabins,
        onSuccess: () => {
          toast.success("Cabin successfully deleted");  <== toast on success instead of the alert
          queryClient.invalidateQueries({ queryKey: ["cabins"] });
        },
        onError: (err) => toast.error(err.message),    <== toast on error instead of the alert
      });

# React-hook-form

it's a library that let's abstract the control of a form and with the use of some custom hooks get access to all the values, controls and logic of a form

## useForm

custom hook that give access to vary methods to be used in a form

       const { register, handleSubmit, reset, getValues, formState } = useForm();

- register, we use it to spread inside a input the onBlur and onChange attributes already controlled by the hook

        <Input
          type="text"
          id="name"
          disabled={isPending}
          {...register("name")}
         />

- handleSubmit, lets me define what happens on submit by defining a first function for success, and second one for error that the handle will call for me

        function onSubmit(data) {
        mutate(data);
        }

        <Form onSubmit={handleSubmit(onSubmit, onError)}>

- reset, method given to us by useForm that reset the state of the form to it's initialState (usually empty)

        const { isPending, mutate } = useMutation({
        mutationFn: createCabin,
        onSuccess: () => {
          toast.success("New cabin successfully created");
          queryClient.invalidateQueries({ queryKey: ["cabins"] });
          reset();
        },
        onError: (err) => toast.error(err.message),
        });

- getValues, method given that when called give us a object with all the values of the form, that we can use to do validation inside the form for example

         <Input
          type="number"
          id="discount"
          defaultValue={0}
          disabled={isPending}
          {...register("discount", {
            required: "This field is required",
            valueAsNumber: true,
            validate: (value) =>
              value <= getValues().regularPrice ||
              "Discount should be less than the regular price",
          })}
        />

- formState, it's an object that contain a lot of data about the form, one of which is 'errors' that contains the error throw by the form

        const { errors } = formState;

          function onError(errors) {
           console.log(errors);
          }

## Form Validation

we can define some pre-defined validator inside the form or make a custom one if none of the already existing one is enough

ex. defined ones (required, min [determine the min value for the field, and the message to be given in case of error]):

         <Input
          type="number"
          id="maxCapacity"
          disabled={isPending}
          {...register("maxCapacity", {
            required: "This field is required",
            min: {
              value: 1,
              message: "Capacity should be at least 1",
            },
          })}
        />

ex. custom ones, we define it by using the validate field and passing in a cb function that will handle the validation, in this case if the discount is higher than the currently inputed price it will send back the error message if it's correct it will authorize the value

        <Input
          type="number"
          id="discount"
          defaultValue={0}
          disabled={isPending}
          {...register("discount", {
            required: "This field is required",
            valueAsNumber: true,
            validate: (value) =>
              value <= getValues().regularPrice ||
              "Discount should be less than the regular price",
          })}
        />

## useForm optionObject

The useForm hooks can take a optionObject as parameter that can define for example the defaultValue of the form, which in this case we use to prefill the form with the already existing values of the field in case of the edit form.

    const { register, handleSubmit, reset, getValues, formState } = useForm({
    defaultValues: isEditSession ? editValues : {},
    });

## useMutation toNote

toNote: about the useMutation hooks, the mutationfn cb can actually take only one parameter, so in case we need more than one we have to compose them in a object before passing it in.

    const { isPending: isEditing, mutate: editCabin } = useMutation({
        mutationFn: ({ newCabinData, id }) => createEditCabin(newCabinData, id),
        onSuccess: () => {
          toast.success("Cabin successfully edited");
          queryClient.invalidateQueries({ queryKey: ["cabins"] });
          reset();
        },
        onError: (err) => toast.error(err.message),
      });
