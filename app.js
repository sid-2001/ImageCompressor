const express = require("express");
const bodyparser = require("body-parser");
const multer = require("multer");
const path = require("path");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const findRemoveSync = require('find-remove')
const app = express();
console.log(path.join(__dirname + "/uploads"));
app.use('/uploads', express.static(path.join(__dirname + '/uploads')));
app.use(express.static('public'))

app.set("view engine", "ejs");
//app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));



const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});


const upload = multer({
  storage: storage
});

app.get("/", (req, res) => {
  res.render("index");
});








app.post("/", upload.single("image"), (req, res, next) => {
  const file = req.file;
  var ext;

  if (!file) {
    const error = new Error("Please Upload a file");
//    error.httpStatusCode = 404;
//    return next(error);
      res.render("error");
  }
    
  if (file.mimetype == "image/jpeg") {
    ext = "jpg";
  }
  if (file.mimetype == "image/png") {
    ext = "png";
    }
    console.log(file.path)

  res.render("image", { url: file.path, name: file.filename, ext: ext });
});

app.post("/compress/uploads/:name/:ext", async (req, res) => {
  const files = await imagemin(["uploads/" + req.params.name], {
    destination: "output",
    plugins: [
      imageminMozjpeg({quality: 50}),
      imageminPngquant({
        quality: [0.1, 0.1]
      })
    ]
  });

    function download(){
    res.download(files[0].destinationPath);
    }
    
    
    
    function delta(){
    const deloutput =findRemoveSync(__dirname + '/output', {extensions: ['.png', '.jpg' ,'jpeg']});
        const delupload=findRemoveSync(__dirname + '/uploads', {extensions: ['.png', '.jpg' ,'jpeg']});
    console.log(deloutput);
        console.log(delupload)
        
        
}
    download();
    setTimeout(delta, 3000);
    
});
app.post("/back",function(req,res){
    
    console.log(req);
    res.render("index");
    
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);