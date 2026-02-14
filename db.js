const sql = require("mssql/msnodesqlv8");

require("dotenv").config();

const config ={
    connectionString:
    `Driver={ODBC Driver 18 for Sql Server};Server=${process.env.USER_DB};Database=StudentDB;Trusted_Connection=yes;Encrypt=no;TrustServerCertificate=yes`,
};

async function connectToDB(){
    console.log("Trying to connect to the Database........");
    try{
        await sql.connect(config);
        console.log("Successfully Connected to the dataBase.....");
    }catch(err){
        console.log("Failed to coonect: " , err);
    }
}


module.exports = {sql,connectToDB};