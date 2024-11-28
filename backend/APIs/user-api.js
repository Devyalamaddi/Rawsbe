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

//To generate unique user ID
function generateUniqueUserId() {
    const prefix = "USR";
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const userId = `${prefix}${randomPart}`;
    return userId;
}
//User Registration(d)(D)
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

//User login (d)(D)
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
                // console.log(dbUser)
                // console.log(newUser.password);
                // console.log(await bcryptjs.hash(newUser.password,3))
                if(await bcryptjs.compare(newUser.password,dbUser[3])){
                    
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

}));

//To get all blogs(d)(D)
userApp.get('/blogs',expressAsyncHandler(async (req, res) => {
      let connection;
      try {
        connection = await getConnection(); // Get connection to the DB
        const result = await connection.execute(
          `SELECT * FROM MovieBlog where status = 'T' `,
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
}));

//to get flagged blogs (admin)
//To get all blogs(d)(D)
userApp.get('/blogs/admin',expressAsyncHandler(async (req, res) => {
    let connection;
    try {
      connection = await getConnection(); // Get connection to the DB
      const result = await connection.execute(
        `SELECT * FROM MovieBlog where status = 'F' `,
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
}));

//To see blogs by a user (d)(D)
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
}));

//To see specific blog with blogId(d)(D)
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
            // Process CLOB data for CONTENT
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

            // Process CLOB data for FIRSTHALFREVIEW
            if (row.FIRSTHALFREVIEW) {
                row.FIRSTHALFREVIEW = await new Promise((resolve, reject) => {
                    let clobData = '';
                    row.FIRSTHALFREVIEW.setEncoding('utf8'); // Set encoding to read as text
                    row.FIRSTHALFREVIEW.on('data', (chunk) => {
                        clobData += chunk;
                    });
                    row.FIRSTHALFREVIEW.on('end', () => resolve(clobData));
                    row.FIRSTHALFREVIEW.on('error', (err) => reject(err));
                });
            }

            // Process CLOB data for SECONDHALFREVIEW
            if (row.SECONDHALFREVIEW) {
                row.SECONDHALFREVIEW = await new Promise((resolve, reject) => {
                    let clobData = '';
                    row.SECONDHALFREVIEW.setEncoding('utf8'); // Set encoding to read as text
                    row.SECONDHALFREVIEW.on('data', (chunk) => {
                        clobData += chunk;
                    });
                    row.SECONDHALFREVIEW.on('end', () => resolve(clobData));
                    row.SECONDHALFREVIEW.on('error', (err) => reject(err));
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

// Get comments for a specific blog by blogID(D)(D)
userApp.get('/comments/:blogID', expressAsyncHandler(async (req, res) => {
    const blogID = req.params.blogID;
    if (!blogID) {
        return res.status(400).send({ message: "blogID parameter is missing" });
    }
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            'SELECT COMMENTID, USERID, BLOGID, CONTENT, TO_CHAR(DATEPOSTED, \'YYYY-MM-DD\') AS DATEPOSTED FROM userComments WHERE blogid = :blogID',
            { blogID },
            { autoCommit: true, outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        const comments = await Promise.all(
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
        res.send({ message: "Comments on specific blog", payload: comments });
    } catch (err) {
        console.error("Error while getting comments:", err.message);
        res.status(500).send({ message: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}));

//to get blogs count on a movie by movieid
userApp.get('/blogcount/:movieid', expressAsyncHandler(async (req, res) =>{
    const movieid = req.params.movieid;
    // console.log(movieid)
    if (!movieid) {
        return res.status(400).send({ message: "movieid parameter is missing" });
    }
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute
        ('SELECT COUNT(blogid) as c FROM movieblog WHERE movieid = :movieid and status = :st',
            { movieid:movieid, st:'T' },
            { autoCommit: true, outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        const blogCount = result.rows[0] || 0;
        // console.log(result.rows[0])
        res.send({ message: "Blog count on a movie", payload: blogCount.C });
    } catch (err) {
        console.error("Error while getting blog count:", err.message);
        res.status(500).send({ message: err.message});
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}));

//To edit user themselves(d)(D)
userApp.put("/edituser/:userId",expressAsyncHandler(async (req, res) => {
      const userId = req.params.userId;
      let connection;
      try {
        connection = await getConnection();
        const { name, password } = req.body;
        const hashedPassword =await bcryptjs.hash(password, 10)
  
        const updateQuery = hashedPassword
          ? `UPDATE users SET name = :name, password = :hashedPassword WHERE userId = :userId`
          : `UPDATE users SET name = :name WHERE userId = :userId`;
  
        await connection.execute(
          updateQuery,
          { name:name,
            hashedPassword:hashedPassword, 
            userId:userId },
          { autoCommit: true }
        );
  
        res.send({ message: "User updated" });
      } catch (err) {
        console.error(err);
        res.send({ message: err.message });
      } finally {
        await connection.close();
      }
    })
  );
  

//Function to generate unique blog ID
function generateUniqueBlogId() {
    const prefix = "BLG";
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const userId = `${prefix}${randomPart}`;
    return userId;
}
//Write a blog into movieblog(d)(D)
userApp.post("/new-blog",verifyToken, expressAsyncHandler(async(req,res)=>{
    const newBlog = req.body;
    // console.log(newBlog)
    let connection;
    try {
        connection = await getConnection(); // Get connection to the DB
        await connection.execute(`INSERT INTO MovieBlog VALUES (:blogId,:movieID,:userId,:blogTitle,:blogContent,:dateposted,:fhRa,:shRa, :oar, :fhr, :shr,0,0,:status) `,{
            blogId:generateUniqueBlogId(),
            userId:newBlog.userId,
            movieID:newBlog.movieId,
            blogTitle:newBlog.blogTitle,
            blogContent:newBlog.blogContent,
            dateposted:new Date(),
            fhRa:newBlog.firstHalfRating,
            shRa:newBlog.secondHalfRating,
            oar:newBlog.overallRating,
            fhr:newBlog.firstHalfReview,
            shr:newBlog.secondHalfReview,
            status:"T"
        },{autoCommit:true});
       
        res.send({message:"Blog posted successfully!",payload:newBlog});

    }catch(err){
        // console.log(err);
        res.send({message:"Database error while writing new blog", error:err.message});
    } finally{
        if(connection)
        {
            await connection.close();
        }
    }
}));

//To handle search(d)
    //to get all genres
    userApp.get("/genres",expressAsyncHandler(async(req,res)=>{
        let connection;
        try{
            connection = await getConnection();
            const result = await connection.execute("SELECT * FROM genre",[],{outFormat:OracleDB.OUT_FORMAT_OBJECT});
            res.send({message:"getting all genres",payload:result.rows});
        }catch(err){
            // console.log("error in getting genres", err.message);
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
    
//To generate unique Comment ID
function generateUniqueCommentId() {
    const prefix = "CMT";
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const userId = `${prefix}${randomPart}`;
    return userId;
}
//To write a comment to that specific blog(d)(D)
userApp.post("/comment/:blogID", verifyToken, expressAsyncHandler(async (req, res) => {
    const blogID = req.params.blogID;
    const userCommentObj = req.body;
    const commentID = generateUniqueCommentId();
    const dateposted = new Date().toISOString().slice(0, 19).replace('T', ' ');  // Format date to 'YYYY-MM-DD HH:MM:SS'
    let connection;

    try {
        connection = await getConnection();
        
        const query = `INSERT INTO userComments (commentID, userID, blogID, content, dateposted) VALUES (:commentID, :userID, :blogID, :content, TO_DATE(:dateposted, 'YYYY-MM-DD HH24:MI:SS'))`;
        await connection.execute(query, {
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

//To delete comment written by user by commentId that is commented by this user(d)(D)
userApp.delete("/comment/:commentID", verifyToken, expressAsyncHandler(async (req, res) => {
    const commentID = req.params.commentID;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `DELETE FROM userComments WHERE commentID = :commentID`,
            { commentID},
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

// Get user by userID(D)(D)
userApp.get("/user/:userId", expressAsyncHandler(async (req, res) => {
    const userId = req.params.userId;
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT name,email FROM users WHERE userid = :1`,
        [userId],
        { outFormat: OracleDB.OUT_FORMAT_ARRAY }
      );
      if (result.rows.length === 0) {
        res.status(404).send({ message: "User not found" });
      } else {
        res.send({ payload: result.rows[0] });
      }
    } catch (err) {
      console.error("Error fetching user:", err.message);
      res.status(500).send({ message: err.message });
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }));
  


//To verify is the user a ADMIN
function isAdmin(req,res,next){
    if (req.role!=='admin'){
        res.send({message:"Please login as Admin."});
    }
    next();
}
//Generate unique Movie ID
function generateUniqueMovieId() {
    const prefix = "Mov";
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const movieId = `${prefix}${randomPart}`;
    return movieId;
}
//Add movies (only for admin)(d)(D)
userApp.post("/new-movie", verifyToken,isAdmin, expressAsyncHandler(async (req, res) => {
    const newMovie = req.body;
    let connection;

    try {
        connection = await getConnection();
        //check for duplicate movie insertion
        const check = await connection.execute(`SELECT * FROM movie WHERE moviename = :title`, {title:newMovie.movieName},{autoCommit:true});
        if(check.rows.length>0){
            return res.send({message:"Movie already exists."});
        }

        await connection.execute(
            `INSERT INTO Movie (movieId, movieName, year, posterURL, director, genres) 
             VALUES (:movieId, :movieName, :year, :posterURL, :director, :genres)`, 
            {
                movieId: generateUniqueMovieId(),
                movieName: newMovie.movieName,
                year: Number(newMovie.year),
                genres: newMovie.genres,
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

//delete a blog by blogId
userApp.delete("/delete-blog/:blogId",verifyToken, isAdmin, expressAsyncHandler(async (req, res) => {
    const blogId = req.params.blogId;
    // console.log(blogId)
    let connection;
    try {
        connection = await getConnection();
        const response=await connection.execute(`DELETE FROM movieblog WHERE blogId = :blogId`, 
            { blogId: blogId },
            { autoCommit: true});
            // console.log(response);
            res.send({ message: "Blog deleted successfully" });
    }catch(err){
        console.log("Error while deleting the blog:", err.message);
    }finally{
        if(connection){
            await connection.close();
        }
    }
}));

//Get all the users if admin is logged
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
}));

//Deleting an user by admin using user ID (only for admin)(d)
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

        // console.log("User and related records deleted successfully");
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

function generateUniqueVoteId() {
    const prefix = "VOT";
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomPart}`;
}
userApp.post("/vote",verifyToken,expressAsyncHandler(async (req, res) => {
        const { voteType, blogId, userId } = req.body;

        // Validate request data
        if (!voteType || !blogId || !userId) {
            return res.status(400).send({ message: "Missing required fields" });
        }

        const voteId = generateUniqueVoteId();
        let connection;

        try {
            connection = await getConnection();

            // Check if the user has already voted
            const existingVote = await connection.execute(
                `SELECT * FROM blogVotes WHERE userId = :userId AND blogId = :blogId`,
                { userId, blogId }
            );

            if (existingVote.rows.length > 0) {
                return res.status(400).send({ message: "User has already voted" });
            }

            // Insert the vote
            await connection.execute(
                `INSERT INTO blogVotes (voteId, blogId, userId) VALUES (:voteId, :blogId, :userId)`,
                { voteId, blogId, userId}
            );

            // Update the appropriate counter
            const updateField = voteType === "U" ? "upvotes" : "downvotes";
            await connection.execute(
                `UPDATE movieblog SET ${updateField} = ${updateField} + 1 WHERE blogId = :blogId`,
                { blogId }
            );

            // Check vote counts and update status if necessary
            const blogData = await connection.execute(
                `SELECT upvotes, downvotes FROM movieblog WHERE blogId = :blogId`,
                { blogId }
            );

            if (blogData.rows.length > 0) {
    const { UPVOTES: upvotes, DOWNVOTES: downvotes } = blogData.rows[0];
    
    // Get the total number of users by joining with the 'users' table
    const totalUsersResult = await connection.execute(
        `SELECT COUNT(*) AS totalUsers FROM users`
    );
    const totalUsers = totalUsersResult.totalUsers;
    
    const totalVotes = upvotes + downvotes;

    if (totalVotes > 0) {
        // Calculate the downvote percentage based on the total number of users
        const downvotePercentage = (downvotes / totalUsers) * 100;

        // If downvotes exceed 60% of total users, set STATUS to 'F'
        if (downvotePercentage > 60) {
            await connection.execute(
                `UPDATE movieblog SET STATUS = 'F' WHERE blogId = :blogId`,
                { blogId }
            );
        }
    }
}


            // Commit the transaction
            await connection.commit();
            res.send({ message: "Vote Casted" });
        } catch (err) {
            console.error("Error during voting:", err.message);
            res.status(500).send({ message: "Error voting" });
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    })
);

// Get upvotes and downvotes for a blog by ID
userApp.get('/vote/:blogId', verifyToken, expressAsyncHandler(async (req, res) => {
    const { blogId } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT upvotes,DOWNVOTES FROM movieblog WHERE blogId = :blogId`,
            { blogId }
        );
        // console.log(result.rows[0])
        res.send(result.rows[0]);
    } catch (err) {
        console.error("Error getting upvote count:", err.message);
        res.status(500).send({ error: "Error getting upvote count" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}));

module.exports=userApp;