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

## ** React Query || tanstack query **

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

## Render Props Pattern

What it means is that not always is possible to pass a set jsx to a component for reusability, because it might have some logic that is hard to reuse without writing a separate component. The solution that came out of this is the Render Props Pattern that basically makes you pass to the component the function needed to render. For example if you have different lists that should display different items, is possible to reuse the list components by specifying the login of the map function with the render props, so you basically from outside you give to the component throught the render props which component it should display and with what props

    function List({ title, items, render }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const displayItems = isCollapsed ? items.slice(0, 3) : items;

    function toggleOpen() {
      setIsOpen((isOpen) => !isOpen);
      setIsCollapsed(false);
    }

    return (
      <div className="list-container">
        <div className="heading">
          <h2>{title}</h2>
          <button onClick={toggleOpen}>
            {isOpen ? <span>&or;</span> : <span>&and;</span>}
          </button>
        </div>
        /*Here we can see that the map method takes the render prop, normaly it would be the normal item => <Item /> with whatever props we were going to pass in, doing it this way makes it dinamic without the use of the children prop and with more personalization*/
        {isOpen && <ul className="list">{displayItems.map(render)}</ul>}

      <button onClick={() => setIsCollapsed((isCollapsed) => !isCollapsed)}>
        {isCollapsed ? `Show all ${items.length}` : "Show less"}
      </button>
      </div>
    );
    }

example of the render props with different functions to display different items

    export default function App() {
    return (
      <div>
        <h1>Render Props Demo</h1>

        <div className="col-2">
          <List
            title="Products"
            items={products}
            render={(product) => (
              <ProductItem key={product.productName} product={product} />
            )}
          />

          <List
            title="Companies"
            items={companies}
            render={(company) => (
              <CompanyItem
                key={company.companyName}
                company={company}
                defaultVisibility={false}
              />
            )}
          />
        </div>
      </div>
    );
    }

## HOC Higher Order Components

Stands for an enhanced component, usually used when you get a component from a 3-rd party library that you can't modify to suit your case with some logic, so you basically create a function that takes the components and return an enhanced components with the new logic added to it,

3-rd party component example:

    function ProductList({ title, items }) {
      return (
        <ul className="list">
          {items.map((product) => (
            <ProductItem key={product.productName} product={product} />
          ))}
        </ul>
      );
    }

enhanced component returned:

    export default function withToggles(WrappedComponent) {
    return function List(props) {
      const [isOpen, setIsOpen] = useState(true);
      const [isCollapsed, setIsCollapsed] = useState(false);

      const displayItems = isCollapsed ? props.items.slice(0, 3) : props.items;

      function toggleOpen() {
        setIsOpen((isOpen) => !isOpen);
        setIsCollapsed(false);
      }

      return (
        <div className="list-container">
          <div className="heading">
            <h2>{props.title}</h2>
            <button onClick={toggleOpen}>
              {isOpen ? <span>&or;</span> : <span>&and;</span>}
            </button>
          </div>
          {isOpen && <WrappedComponent {...props} items={displayItems} />}

          <button onClick={() => setIsCollapsed((isCollapsed) => !isCollapsed)}>
            {isCollapsed ? `Show all ${props.items.length}` : "Show less"}
          </button>
        </div>
      );
    };
     }

## Compound Component Pattern

Is a bit of more work to write it down as there is more steps from setting up the context api, create a component, even if simple, for each part and then add them all as property to the principal component to be exported outside, this way we have component that only work with a specific parent but that are extremely personalizable without the need to use a lot of props

Example

    import { useState, createContext, useContext } from "react";

    //1. Create a context
    const CounterContext = createContext();

    //2. Create Parent Component
    function Counter({ children }) {
      const [count, setCount] = useState(0);
      const increase = () => setCount((c) => c + 1);
      const decrease = () => setCount((c) => c - 1);

      return (
        <CounterContext.Provider value={{ count, increase, decrease }}>
          <span>{children}</span>
        </CounterContext.Provider>
      );
    }

    //3. Create Child components that will help implementing the common task
    function Count() {
      const { count } = useContext(CounterContext);
      return <span> {count} </span>;
    }
    function Label({ children }) {
      return <span>{children} </span>;
    }
    function Increase({ icon }) {
      const { increase } = useContext(CounterContext);
      return <button onClick={increase}>{icon}</button>;
    }
    function Decrease({ icon }) {
      const { decrease } = useContext(CounterContext);
      return <button onClick={decrease}>{icon}</button>;
    }
    //4. Add child components as properties to parent components

    Counter.Count = Count;
    Counter.Label = Label;
    Counter.Increase = Increase;
    Counter.Decrease = Decrease;

    export default Counter;

Example of the power of a Compount Component

    export default function App() {
      return (
        <div>
          <h1>Compound Component Pattern</h1>
          //No need to pass a lot of props for personalization
          {/*     <Counter
            iconIncrease="+"
            iconDecrease="-"
            label="My NOT so flexible counter"
            hideLabel={false}
            hideIncrease={false}
            hideDecrease={false}
          />
        */}

        //You just call inside the Component the relative component piece you want to show, and give them their props
          <Counter>
            <Counter.Label>My Super Flexible Counter </Counter.Label>
            <Counter.Decrease icon="-" />
            <Counter.Increase icon="+" />
            <Counter.Count />
          </Counter>

        //You can change the display simply by swapping around the order of their call, mixing in some htmls and so on
          <div>
            <Counter>
            <div>
              <Counter.Decrease icon="◀" />
            <div>
              <Counter.Count />
            <div>
              <Counter.Increase icon="▶" />
            </div>
            </Counter>
          </div>
        </div>
      );
    }

## React Portal

is a feature that allow us to render an element outside of a parent component dom structure, while still keeping the elements in the original position in the component tree.
In other words it lets us render a component in any place we want inside the dom tree, while keeping it in the same place in the react tree so that the props work properly, usually used for components that want to stay on top of other element, like modals for example

The syntax for it is instead of return the jsx element is to call the createPortal(), that take as first parameter, the jsx to return, the second argument where to place this element (document.body for example or document.querySelector())

    function Modal({ children, onClose }) {
      return createPortal(
        <Overlay>
          <StyledModal>
            <Button onClick={onClose}>
              <HiXMark />
            </Button>
            <div>{children}</div>
          </StyledModal>
        </Overlay>,
        document.body
      );
    }

portal is necessary mostly for reusability because you can encounter in the css some overflow hidden that cut out your modal, so by using the portal you can bypass this problem
