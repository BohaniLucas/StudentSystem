const express = require("express");
const path = require("path");
const {sql,connectToDB} = require("./db");
const session = require("express-session");

const app = express();

connectToDB();

app.use(
    session({
       secret:"mySecretKey",
       resave: false,
       saveUninitialized:true
    })
);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"frontEnd")));

app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname,"frontEnd","index.html"));
});

app.get("/success", (req,res) =>{
    res.sendFile(path.join(__dirname,"frontEnd" , "success.html"));
});

app.get("/api/details", async(req,res) =>{
    try{
        const results = await  sql.query`
        SELECT * FROM Students ORDER BY DateRegistered DESC
        `;
        res.json(results.recordset);
    }catch(err){
        res.status(500).send("System error: " + err);
    }
})

app.post("/submit-application", async (req,res) =>{
    const {name , surname , course} = req.body;
    try{
        await sql.query`
        INSERT INTO Students(Name,Surname,Course)
        VALUES(${name},${surname},${course})
        `;
        res.status(200).redirect(`/success?name=${encodeURIComponent(name)}`);
    }catch(err){
        res.status(500).send("Opps something went wrong: " + err);
    }
});
app.get("/admin", (req,res) =>{
    res.sendFile(path.join(__dirname ,"frontEnd","admin.html"));
});

//admin.html

app.post("/api/adminDetails" , async (req,res) =>{
    const {name,passWord} = req.body;
    try{
        const results = await sql.query`
        SELECT * FROM Admins
        WHERE [Name]=${name} AND [PassWord] = ${passWord}`;

        if(results.recordset.length > 0){
            req.session.isAdmin = true;

            req.session.save(()=>{
                 res.redirect("/dashboard");
            });  

        }else{
            res.send("Admin with those details does not exits");
        }
    }catch(err){
        res.status(500).json("Server erro: " + err);
    }
});

app.get("/dashboard" , (req,res)=>{
    if(!req.session.isAdmin){
        return res.redirect("/admin");
    }
    res.sendFile(path.join(__dirname,"frontEnd","dashboard.html"));
})

app.get("/search" , (req,res) =>{
    res.sendFile(path.join(__dirname,"frontEnd", "searchStudent.html"));
});

app.get("/api/search/:id" , async(req,res) =>{
    const studentID = req.params.id;
    try{
        const results = await sql.query`
            SELECT * FROM Students
            WHERE [Id] = ${studentID}
        `;
        res.status(200).json(results.recordset);
    }catch(err){
        res.status(500).json({success:false, error:err.message})
    }
});

app.delete("/api/del/details/:id" , async (req,res) =>{
    const userId = req.params.id;
    try{
        await sql.query`
        DELETE FROM Students WHERE [Id] = ${userId}
        `;
        res.status(200).json({success: true})
    }catch(err){
        res.status(500).json({success: false, error : err.message});
    }
});

app.put("/api/student/edit/:id" , async (req,res)=>{
    const studentId = req.params.id;
    const {course} = req.body;
    try{
        await sql.query`
        UPDATE Students 
        SET [Course] = ${course}
        WHERE [Id] = ${studentId}
        `;
        res.status(200).json({success: true})
    }catch(err){
        res.status(500).json({success: false, error: err.message})
    }
});

app.listen(3000, ()=>{
    console.log("The Website is running on http://localhost:3000");
});