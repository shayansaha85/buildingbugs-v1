# buildingbugs

- To start buildingbugs first clone the repository
```bash
git clone https://github.com/shayansaha85/buildingbugs-v1.git
```
- Download NodeJS from [here](https://nodejs.org/en/download)
- Download and configure MongoDB server from [here](https://www.mongodb.com/try/download/community)
- Navigate to the directory where you cloned the project and where **package.json** is presnet
- Replace the MongoDB URL in the **.env** file. (If you are running MongoDB community server locally then the default configurations in **.env** will work fine)
- Run this command to install all libraries
```bash
npm install
```
- Start the application with this command
```bash
npm run dev
```
- It will automatically launch the front end in port **5173** and server in the port **5000**