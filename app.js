import express from "express";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bodyparser from "body-parser";
import multer from "multer";
import path from "path";
import imageminMozjpeg from "imagemin-mozjpeg";
import imagemin from "imagemin";
import imageminJpegtran from "imagemin-jpegtran";
import imageminPngquant from "imagemin-pngquant";
import findRemoveSync from 'find-remove';

const app = express();
const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

console.log(_dirname)
// console.log(path.join(__dirname + "/uploads"));
app.use('/uploads', express.static(path.join(_dirname + '/uploads')));

app.use(express.static('public'));

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", upload.single("image"), (req, res, next) => {
  const file = req.file;
  let ext;

  if (!file) {
    res.render("error");
  }

  if (file.mimetype === "image/jpeg") {
    ext = "jpg";
  }
  if (file.mimetype === "image/png") {
    ext = "png";
  }
  console.log(file.path);

  res.render("image", { url: file.path, name: file.filename, ext: ext });
});

app.post("/compress/uploads/:name/:ext", async (req, res) => {
  const files = await imagemin(["uploads/" + req.params.name], {
    destination: "output",
    plugins: [
      imageminMozjpeg({ quality: 50 }),
      imageminPngquant({
        quality: [0.1, 0.1],
      }),
    ],
  });

  function download() {
    res.download(files[0].destinationPath);
  }

  function delta() {
    const deloutput = findRemoveSync(_dirname + '/output', { extensions: ['.png', '.jpg', 'jpeg'] });
    const delupload = findRemoveSync(_dirname + '/uploads', { extensions: ['.png', '.jpg', 'jpeg'] });
    console.log(deloutput);
    console.log(delupload);
  }
  download();
  setTimeout(delta, 3000);
});

app.post("/back", function (req, res) {
  console.log(req);
  res.render("index");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => {
  console.log("thank go i ma here")
});
