import mongoose from 'mongoose';

const { connect, connection: _connection } = mongoose;


//cadena de conexion
const URI = process.env.MONGODB_URI
            ? process.env.MONGODB_URI
            : 'cadena'
            // mongodb+srv://admin:admin@cluster0.op2qq.mongodb.net/TaskCal?retryWrites=true&w=majority&appName=Cluster0
connect(URI)

const connection = _connection

connection.once('open', ()=>{
    console.log('La base de datos ha sido conectada: ', URI);
})