import multer from 'multer';
import path from 'path';
import { v4 as uuidV4 } from 'uuid';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler'
import fs from 'node:fs';

dotenv.config()

let mimeTypes = process.env.MIME_TYPES?.split(',')

mimeTypes = mimeTypes.map(mimeType => mimeType.trim());

const uploadPath = process.env.UPLOAD_PATH ?? 'uploads';


const fileNameFormat = (file) => `${file.originalname}`
// Handling file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    fs.exists(uploadPath, exist => {
      if (!exist) {
        return fs.mkdir(uploadPath, error => cb(error, uploadPath))
      }
      return cb(null, uploadPath)
    })
  },
  filename: (req, file, cb) => {
    cb(null, fileNameFormat(file));
  }
});

const fileFilter = (req, file, cb) => {
  cb(null, mimeTypes.includes(file.mimetype))
}
const upload = multer({ storage, fileFilter })


export const uploader = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    try {
      const filePath = req?.file !== null ? req?.file?.path : null
      req.file = filePath;
      next();
    } catch (err) {
      fs.unlink(path.join(uploadPath, req?.file), (error) => {
        if (error) throw Error("Error")
      })
    }
  });
}

// upload multiple files
export const uploaderMultiple = (req, res, next) => {
  upload.array('files')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    try {
      const filePath = req?.files !== null ? req?.files.map(file => file.path) : null
      req.files = filePath;
      next();
    } catch (err) {
      req.files.forEach(file => {
        fs.unlink(path.join(uploadPath, file), (error) => {
          if (error) throw Error("Error")
        })
      })
    }
  });
} 