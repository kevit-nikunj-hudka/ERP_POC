# ERP_POC
Task-3 of training program.

## Installation & Configuration

- clone the repository into your local machine after cloning the project do follow these steps

1. Install dependencies via npm:

```bash
npm i # (for local setup)
```

2. Create .env file identical to example.env with valid values

3. To start the server

```bash
npm start
```


#### Folder Structure

Common structure that is used in this project is as following

```
.
└── src
    |── db
    ├── routes
    ├── middleware
    ├── models
    ├── helper
    └── services
```

| File                 | Usage/Description                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| route                | All the routes for this feature will be defined here. It will not include any kind of business logic. It will just redirect to controller function for the particular route.      |
| models               | If feature will use DB then interfaces and schema for model will be defined here                                                                                                  |
| helper               | Helper functions should be defined here which will be used as business logic for the controller functions. however it won't have any kind of DB query directly used.              |

