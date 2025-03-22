**Project Requirement**

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

**TECH DECISIONS**

-----Front End

-Routing ---> React Router --- standard for React SPAs

-Styling ---> styled components --- Very popular way of writing component-scoped cssm right inside JavaScript.

-Remote state management ---> React Query --- The best way of managing remote state, with features like caching, automatic re-fetching, pre-fetching, offline support, etcc. Alternatives are SWR and RTK Query(Redux-ToolKit), but this is the most popular

-UI State management ---> Context API --- There is almost no UI state needed in this app, so one simple context with useState will be enough. No need for Redux

-Form Management ---> React Hook Form --- Handling bigger forms can be a lot of work, such as manual state creation and error handling. A library can simplify all this

Other tools ---> React icons / React hot toast / Recharts / date-fns / Supabase
