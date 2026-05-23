const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: function(req, file, cb) {
    let ext = path.extname(file.originalname).toLowerCase()
    let name = path.basename(file.originalname, ext).replace(/\s+/g, '_')
    let finalName = name + '_' + Date.now() + ext
    cb(null, finalName)
  }
})

function checkFileType(req, file, cb) {
  let allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('i only accept images sorry'))
  }
}

const upload = multer({
  storage: storage,
  fileFilter: checkFileType,
  limits: {
    fileSize: 5242880 
  }
})

module.exports = upload
