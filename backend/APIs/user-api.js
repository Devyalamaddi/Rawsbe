const express = require('express');
const userApp = express.Router();
const verifyToken = require('../middlewares/verifyToken.js');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const expressAsyncHandler = require('express-async-handler');
const getConnection = require('../models/db');
const OracleDB = require('oracledb');


//RAW-Site-Blog-Explore   --------> RAWSBE

//ADMIN CREDENTIALS
const adminCredentials = {
    email:process.env.ADMIN_EMAIL,
    password: bcryptjs.hashSync(process.env.ADMIN_PASS, 10)
};


//to generate unique user ID
function generateUniqueUserId() {
    const prefix = "USR";
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const userId = `${prefix}${randomPart}`;
    return userId;
}
// User Registration(D)(D)
userApp.post('/registration', expressAsyncHandler(async (req, res) => {
    const newUser = req.body;
    // console.log(newUser);
    if(newUser.email===adminCredentials.email){
        return res.status(400).send({message: "Email not supported"});
    }
    let connection;
    try {
        connection = await getConnection(); // Get connection to the DB

        // Check for duplicate user based on email
        const checkUserSql = `SELECT * FROM users WHERE email = :email`;
        const result = await connection.execute(checkUserSql, { email:newUser.email});

        // console.log(result);

        if (result.rows.length > 0) {
            // If user exists, send response
            return res.send({ message: "User already existed" });
        } else {
            // Hash the password
            const hashedPassword = await bcryptjs.hash(newUser.password, 3);

            // Generate a unique user_id
            const userId = generateUniqueUserId();

            // Insert new user into the database
            const insertUserSql = `
                INSERT INTO users VALUES (:user_id, :name,:email, :password)
            `;
            await connection.execute(insertUserSql, {
                user_id:userId,
                name:newUser.name,
                email:newUser.email,
                password:hashedPassword
            }, { autoCommit: true });

            // Send response
            res.send({ message: "User Created" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Database error while registering the user line:25" });
    } finally {
        if (connection) {
            await connection.close(); // Close the connection after the operation
        }
    }
}));

//user login (d)(D)
userApp.post('/login', expressAsyncHandler(async(req,res)=>{
    const newUser = req.body;
    // console.log(newUser)
    if (newUser.email=== adminCredentials.email && bcryptjs.compareSync(newUser.password, adminCredentials.password)) {

        const token = jwt.sign(
            { userId: "admin", role: "admin", name:"admin"},
            process.env.SK_USER,
            { expiresIn: '2d' }
          );
       return res.send({message:"logged in as Admin",token:token,user:{ userId: "admin", role: "admin", name:"admin"}});
    } else {
        let connection;
        try {
            connection = await getConnection(); // Get connection to the DB

            // Check for user based on email and password
            const checkUserSql = `SELECT * FROM users WHERE email = :email`
            const result = await connection.execute(checkUserSql, {
                email:newUser.email
            });
            // console.log(result);

            if (result.rows.length > 0) {
                // If user exists, send response
                dbUser=result.rows[0];
                if(bcryptjs.compare(dbUser[3],newUser.password)){
                    
                    //token creation
                    const token = jwt.sign(
                        { userId: dbUser[0], role: "user", name:dbUser[1] },
                        process.env.SK_USER,
                        { expiresIn: '2d' }
                      );

                    return res.send({ message: "User logged in" ,token:token, user:{userId: dbUser[0], role: "user", name:dbUser[1]}});
                }else{
                    res.send({message:"wrong password"});
                }
                
            } else {
                // If user does not exist, send response
                res.status(401).send({ message: "Invalid email" });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: "Database error while logging In line:74" });
        } finally{
            if (connection) {
                await connection.close(); // Close the connection after the operation
            }
        }
    }

}))

//to get all blogs(D)(D)
userApp.get(
    '/blogs',
    expressAsyncHandler(async (req, res) => {
      let connection;
      try {
        connection = await getConnection(); // Get connection to the DB
        const result = await connection.execute(
          'SELECT blogid, movieid, userid, title, content, dateposted FROM MovieBlog',
          [],
          { outFormat: require('oracledb').OUT_FORMAT_OBJECT } // To get data as objects
        );
  
        // Process rows to read the CLOB content
        const blogs = await Promise.all(
          result.rows.map(async (row) => {
            if (row.CONTENT && typeof row.CONTENT.setEncoding === 'function') {
              row.CONTENT = await new Promise((resolve, reject) => {
                let clobData = '';
                row.CONTENT.setEncoding('utf8'); // Set encoding to read as text
                row.CONTENT.on('data', (chunk) => {
                  clobData += chunk;
                });
                row.CONTENT.on('end', () => resolve(clobData));
                row.CONTENT.on('error', (err) => reject(err));
              });
            }
            return row;
          })
        );
  
        res.send({ message: "getting all blogs", payload: blogs });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Database error while getting blogs" });
      } finally {
        if (connection) {
          await connection.close();
        }
      }
    })
  );

// to see blogs by a user (D)(D)
userApp.get('/blogs/user/:userId',verifyToken,expressAsyncHandler(async(req,res)=>{
    const userId = req.params.userId;
    let connection;
    try {
        connection = await getConnection(); // Get connection to the DB
        const result = await connection.execute('select * from movieblog where userID=:userId',{userId:userId},{autoCommit:true, outFormat:require('oracledb').OUT_FORMAT_OBJECT});
        const blogs = await Promise.all(
            result.rows.map(async (row) => {
              if (row.CONTENT && typeof row.CONTENT.setEncoding === 'function') {
                row.CONTENT = await new Promise((resolve, reject) => {
                  let clobData = '';
                  row.CONTENT.setEncoding('utf8'); // Set encoding to read as text
                  row.CONTENT.on('data', (chunk) => {
                    clobData += chunk;
                  });
                  row.CONTENT.on('end', () => resolve(clobData));
                  row.CONTENT.on('error', (err) => reject(err));
                });
              }
              return row;
            })
          );
        
          res.send({message:"getting all user blogs",payload:blogs});
    }catch(err){
        console.error(err.message);
    }finally{
        if(connection){
            await connection.close();
        }
    }
}))

//to see specific blog with blogId(d)(D)
userApp.get("/blogs/:blogID", expressAsyncHandler(async (req, res) => {
    const blogID = req.params.blogID;

    // Validate blogID
    if (!blogID) {
        return res.status(400).send({ message: "blogID parameter is missing" });
    }

    let connection;
    try {
        connection = await getConnection();
        
        const result = await connection.execute(
            "SELECT * FROM Movieblog WHERE blogID = :blogID",
            { blogID },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        // Process rows to read the CLOB content
        const blog = await Promise.all(result.rows.map(async (row) => {
            if (row.CONTENT) {
                row.CONTENT = await new Promise((resolve, reject) => {
                    let clobData = '';
                    row.CONTENT.setEncoding('utf8'); // Set encoding to read as text
                    row.CONTENT.on('data', (chunk) => {
                        clobData += chunk;
                    });
                    row.CONTENT.on('end', () => resolve(clobData));
                    row.CONTENT.on('error', (err) => reject(err));
                });
            }
            return row;
        }));

        if (blog && blog.length > 0) {
            res.send({ message: `Viewing blog of blogID: ${blogID}`, payload: blog });
        } else {
            res.status(404).send({ message: "Blog not found" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error retrieving blog", error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}));

//to see the commenst on the specific blogId(D)(D)
userApp.get('/comments/:blogID', expressAsyncHandler(async(req, res)=>{
    const blogID = req.params.blogID;
    if (!blogID) {
        return res.status(400).send({ message: "blogID parameter is missing" });
        }
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute('select * from userComments where blogid = :blogID',{blogID:blogID},{autoCommit:true, outFormat: OracleDB.OUT_FORMAT_OBJECT});
        res.send({message:"comments on specific blog", payload:result.rows})
    }catch(err){
        console.log("error while getting comments", err.message);
        res.send({message:err.message});
    }finally{
        if (connection){
            await connection.close();
        }
    }
}))

//to edit user themselves(d)
userApp.put('/edituser/:userId',expressAsyncHandler(async(req,res)=>{
    const userId = req.params.userId;
    let connection;
    try {
        connection = await getConnection(); // Get connection to the DB
        const {name,email,password} = req.body;
        const hashedPassword = await bcryptjs.hash(password, 10);
        const query = `UPDATE users SET name = :name, email = :email, password = :hashedPassword WHERE userId = :userId`;
        const values = {
            name:name, email:email, hashedPassword:hashedPassword, userId:userId};

        const result = await connection.execute(`UPDATE users SET name = :name, email = :email, password = :hashedPassword WHERE userId = :userId`,
            {
                name:name, email:email, hashedPassword:hashedPassword, userId:userId
            },{autoCommit:true});
        // console.log(result)
        res.send({message:"User updated"});
    }catch(err){
        console.error(err);
        res.send({message:err.message});
    }finally{
        await connection.close();
    }
}))

//function to generate unique blog ID
function generateUniqueBlogId() {
    const prefix = "BLG";
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const userId = `${prefix}${randomPart}`;
    return userId;
}
//write a blog into movieblog(d)(D)
userApp.post("/new-blog",verifyToken, expressAsyncHandler(async(req,res)=>{
    const newBlog = req.body;
    // console.log(newBlog)
    let connection;
    try {
        connection = await getConnection(); // Get connection to the DB
        const result = await connection.execute(`INSERT INTO MovieBlog VALUES (:blogId,:movieID,:userId,:blogTitle,:blogContent,:dateposted) `,{
            blogId:generateUniqueBlogId(),
            userId:newBlog.userId,
            movieID:newBlog.movieId,
            blogTitle:newBlog.blogTitle,
            blogContent:newBlog.blogContent,
            dateposted:new Date()
        },{autoCommit:true});
       
        res.send({message:"Blog posted successfully!",payload:newBlog});

    }catch(err){
        console.log(err);
        res.send({message:"Database error while writing new blog", error:err.message});
    } finally{
        if(connection)
        {
            await connection.close();
        }
    }
}))

//to handle search(d)
    //to get all genres
    userApp.get("/genres",expressAsyncHandler(async(req,res)=>{
        let connection;
        try{
            connection = await getConnection();
            const result = await connection.execute("SELECT * FROM genre",[],{outFormat:OracleDB.OUT_FORMAT_OBJECT});
            res.send({message:"getting all genres",payload:result.rows});
        }catch(err){
            console.log("error in getting genres", err.message);
            res.send({message:err.message});
        }finally{
            if(connection){
                await connection.close();
            }
        }
    }));

    //to get all movies(d)(D)
    userApp.get('/movies', expressAsyncHandler(async (req, res) => {
        let connection;
        try {
            connection = await getConnection();
            const result = await connection.execute(
                "SELECT * FROM movie",
                {},
                { outFormat: OracleDB.OUT_FORMAT_OBJECT }
            );
    
            // Process rows to read the CLOB content for each movie
            const movies = await Promise.all(result.rows.map(async (row) => {
                if (row.POSTERURL) {
                    // Convert CLOB data to text
                    row.POSTERURL = await new Promise((resolve, reject) => {
                        let clobData = '';
                        row.POSTERURL.setEncoding('utf8'); // Set encoding to read as text
                        row.POSTERURL.on('data', (chunk) => {
                            clobData += chunk;
                        });
                        row.POSTERURL.on('end', () => resolve(clobData));
                        row.POSTERURL.on('error', (err) => reject(err));
                    });
                }
                return row;
            }));
    
            res.send({ message: "Retrieved all movies", payload: movies });
        } catch (err) {
            console.error("Error while retrieving movies:", err);
            res.status(500).send({ message: "Error retrieving movies", error: err.message });
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }));
    
//to generate unique Comment ID
function generateUniqueCommentId() {
    const prefix = "CMT";
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const userId = `${prefix}${randomPart}`;
    return userId;
}
//to write a comment to that specific blog(d)(D)
userApp.post("/comment/:blogID", verifyToken, expressAsyncHandler(async (req, res) => {
    const blogID = req.params.blogID;
    const userCommentObj = req.body;
    const commentID = generateUniqueCommentId();
    const dateposted = new Date().toISOString().slice(0, 19).replace('T', ' ');  // Format date to 'YYYY-MM-DD HH:MM:SS'
    let connection;

    try {
        connection = await getConnection();
        
        const query = `
            INSERT INTO userComments (commentID, userID, blogID, content, dateposted)
            VALUES (:commentID, :userID, :blogID, :content, TO_DATE(:dateposted, 'YYYY-MM-DD HH24:MI:SS'))
        `;
        
        const result = await connection.execute(query, {
            commentID: commentID,
            userID: userCommentObj.userId,
            blogID: blogID,
            content: userCommentObj.content,
            dateposted: dateposted
        }, { autoCommit: true });
        
        // console.log(result);
        res.send({ message: "Comment posted successfully" });
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send({ message: "Error posting comment", error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}));

//to delete comment written by user by commentId that is commented by this user(d)(d)
userApp.delete("/comment/:commentID", verifyToken, expressAsyncHandler(async (req, res) => {
    const commentID = req.params.commentID;
    const userID = req.body.userId; // Assume userId is sent in the request body
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `DELETE FROM userComments WHERE commentID = :commentID AND userID = :userID`,
            { commentID, userID }, // Bind variables
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).send({ message: "Requested Comment to be deleted is not found" });
        }

        res.send({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error("Error deleting comment:", err.message);
        res.status(500).send({ message: "An error occurred while deleting the comment" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}));





//to verify is the user a ADMIN
function isAdmin(req,res,next){
    if (req.role!=='admin'){
        res.send({message:"Please login as Admin."});
    }
    next();
}
// Generate unique Movie ID
function generateUniqueMovieId() {
    const prefix = "Mov";
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const movieId = `${prefix}${randomPart}`;
    return movieId;
}
// Add movies (only for admin)(d)(d)
userApp.post("/new-movie", verifyToken,isAdmin, expressAsyncHandler(async (req, res) => {
    const newMovie = req.body; // Corrected usage of req.body
    // console.log(newMovie);
    let connection;

    try {
        connection = await getConnection();
        

        //check for duplicate movie insertion
        const check = await connection.execute(`SELECT * FROM movie WHERE moviename = :title`, {title:newMovie.movieName},{autoCommit:true});
        if(check.rows.length>0){
            return res.send({message:"Movie already exists."});
        }

        const result = await connection.execute(
            `INSERT INTO Movie (movieId, movieName, year, rating, posterURL, director, genres) 
             VALUES (:movieId, :movieName, :year, :rating, :posterURL, :director, :genres)`, // Added closing parenthesis
            {
                movieId: generateUniqueMovieId(),
                movieName: newMovie.movieName,
                year: Number(newMovie.year),
                genres: newMovie.genres,
                rating: newMovie.rating,
                posterURL: newMovie.posterURL,
                director: newMovie.director
            },
            { autoCommit: true }
        );

        // console.log(result);
        res.send({ message: "New Movie added successfully" });
    } catch (err) {
        console.error("Error while adding movie:", err.message);
        res.status(500).send({ errorMessage: "error", payload: {} });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}));

//get all the users if admin is logged
userApp.get("/users", verifyToken, isAdmin, expressAsyncHandler(async (req, res)=>{
    let connection;
    try{
        connection = await getConnection();
        const result = await connection.execute("SELECT * FROM users");
        res.send({payload:result.rows});
    }catch(err){
        console.error("Error while fetching users:", err.message);
        res.status(500).send({ errorMessage: "error", payload: {} });
    }finally{
        if(connection) {
            await connection.close();
        }
    }
}))

//deleting an user by admin using user ID (only for admin)(d)
userApp.delete("/deleteuser/:userId", verifyToken, isAdmin, expressAsyncHandler(async (req, res) => {
    const userId = req.params.userId;
    let connection;
    try {
        connection = await getConnection();

        // Delete from movieblog
        await connection.execute(
            `DELETE FROM movieblog WHERE userId = :userId`,
            { userId },
            { autoCommit: false }
        );

        // Delete from userComments
        await connection.execute(
            `DELETE FROM userComments WHERE userId = :userId`,
            { userId },
            { autoCommit: false }
        );

        // Delete from users
        await connection.execute(
            `DELETE FROM users WHERE userId = :userId`,
            { userId },
            { autoCommit: false }
        );

        // Commit the transaction
        await connection.commit();

        console.log("User and related records deleted successfully");
        res.send({ message: "User and related records deleted successfully" });
    } catch (err) {
        console.error("Error at deleting user:", err.message);
        res.status(500).send({ error: "Error deleting user" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}));

module.exports=userApp;