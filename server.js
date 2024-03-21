const express = require('express');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Định nghĩa mô hình ảnh
const imageSchema = new mongoose.Schema({
    imagePath: { type: String, required: true }
});
const Image = mongoose.model('Image', imageSchema);

// Cấu hình phục vụ các tệp từ thư mục "uploads" tại URL "/uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cấu hình đường dẫn tới template engine (ví dụ: EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Route để render trang hiển thị ảnh và xử lý upload ảnh
app.get('/gallery1', (req, res) => {
    // Lấy tất cả các ảnh từ cơ sở dữ liệu
    Image.find({})
        .then(images => {
            // Render trang gallery và truyền danh sách tệp ảnh vào template
            res.render('gallery1', { images: images });
        })
        .catch(err => {
            console.error('Error reading images from database:', err);
            res.status(500).send('Internal Server Error');
        });
});

// Route để xử lý upload ảnh và lưu đường dẫn vào cơ sở dữ liệu
app.post('/upload', upload.single('image'), (req, res) => {
    const imagePath = '/uploads/' + req.file.filename; // Tạo đường dẫn cho ảnh đã upload
    // Tạo một bản ghi mới trong cơ sở dữ liệu với đường dẫn của ảnh
    Image.create({ imagePath: imagePath })
        .then(newImage => {
            res.redirect('/gallery1');
        })
        .catch(err => {
            console.error('Error saving image to database:', err);
            res.status(500).send('Internal Server Error');
        });
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('Server is running on port 3001');
});
