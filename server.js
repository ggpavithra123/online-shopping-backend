const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');


// Setting up config file
dotenv.config({ path: 'backend/config/config.env' });

connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise Rejection'); 
    server.close(() => {
        process.exit(1);
    });
});



process.on('uncaughtException',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception error');
    server.close(()=>{
        process.exit(1);
    })
});

//console.log(a);
