require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/database');

connectDatabase();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`Server is working on port ${PORT}`);
});

