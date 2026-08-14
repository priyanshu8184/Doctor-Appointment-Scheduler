const{Sequelize}= require("sequelize")   //nodejs ko sql ke sath connect krwata hai

//database kes sath connect kr rhe h aur create kr rhe hai

const sequelize= new Sequelize(
    process.env.db_name,
    process.env.db_user,
    process.env.db_password,{
        host:process.env.db_host,
        dialect:"mysql"  // this tell which company database type is that
    }
);

const connectDB= async()=>{
    try{
        await sequelize.authenticate();
        console.log("connected to database");

        await sequelize.sync();
        console.log("all model synchronised")

    }catch(error){
        console.log("error connecting to database");
        console.log(error.message);
        process.exit(1)
    }
}

module.exports=sequelize;        //connection pbject ko export krdo
module.exports.connectDB= connectDB;


//this file will be used for connecting the backend with sql server
// npm i express dotenv mysql2 sequelize for connection with sql
