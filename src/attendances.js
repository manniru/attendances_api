const express = require("express");
const router = express.Router();
const RateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
var uuid = require("node-uuid");

const AttendanceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: function genUUID() {
        uuid.v1();
      }
    },
    userId: { type: String },
    deviceId: { type: String },
    tagId: { type: String },
    time: { type: Number }
    // date: { type: Date, default: Date.now }
  },
  {
    versionKey: false
    // timestamps: { createdAt: true, updatedAt: false }
  }
);
const Attendance = (module.exports = mongoose.model(
  "attendance",
  AttendanceSchema
));

const minutes = 5;
const postLimiter = new RateLimit({
  windowMs: minutes * 60 * 1000, // milliseconds
  max: 100, // Limit each IP to 100 requests per windowMs
  delayMs: 0, // Disable delaying - full speed until the max limit is reached
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      msg: `You made too many requests. Please try again after ${minutes} minutes.`
    });
  }
});

// READ (ONE)
router.get("/:id", (req, res) => {
  Attendance.findById(req.params.id)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      res.status(404).json({ success: false, msg: `No such attendance.` });
    });
});

// READ (ALL)
router.get("/", (req, res) => {
  Attendance.find({})
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, msg: `Something went wrong. ${err}` });
    });
});

// CREATE
router.post("/", postLimiter, (req, res) => {
  let newAttendance = new Attendance({
    _id: uuid.v1(),
    userId: req.body.userId,
    deviceId: req.body.deviceId,
    tagId: req.body.tagId,
    time: +new Date()
  });
  // console.log(newAttendance);

  newAttendance
    .save()
    .then(result => {
      res.json({
        success: true,
        msg: `Successfully added!`,
        result: {
          _id: result._id,
          userId: result.userId,
          deviceId: result.deviceId,
          tagId: result.tagId
        }
      });
    })
    .catch(err => {
      console.log(err);
      if (err.errors) {
        res
          .status(500)
          .json({ success: false, msg: `Something went wrong. ${err}` });
      }
    });
  // res.json({ message: "Success" });
});

// UPDATE
router.put("/:id", (req, res) => {
  // Validate the age
  let age = sanitizeAge(req.body.age);
  if (age < 5 && age != "")
    return res
      .status(403)
      .json({ success: false, msg: `You're too young for this.` });
  else if (age > 130 && age != "")
    return res
      .status(403)
      .json({ success: false, msg: `You're too old for this.` });

  let updatedAttendance = {
    userId: req.body.userId,
    deviceId: req.body.deviceId,
    tagId: req.body.age
  };

  Attendance.findOneAndUpdate({ _id: req.params.id }, updatedAttendance, {
    runValidators: true,
    context: "query"
  })
    .then(oldResult => {
      Attendance.findOne({ _id: req.params.id })
        .then(newResult => {
          res.json({
            success: true,
            msg: `Successfully updated!`,
            result: {
              _id: newResult._id,
              userId: newResult.userId,
              deviceId: newResult.deviceId,
              tagId: newResult.tagId
            }
          });
        })
        .catch(err => {
          res
            .status(500)
            .json({ success: false, msg: `Something went wrong. ${err}` });
          return;
        });
    })
    .catch(err => {
      if (err.errors) {
        res
          .status(500)
          .json({ success: false, msg: `Something went wrong. ${err}` });
      }
    });
});

// DELETE
router.delete("/:id", (req, res) => {
  Attendance.findByIdAndRemove(req.params.id)
    .then(result => {
      res.json({
        success: true,
        msg: `It has been deleted.`,
        result: {
          _id: result._id,
          userId: result.userId,
          deviceId: result.deviceId,
          tagId: result.tagId
        }
      });
    })
    .catch(err => {
      res.status(404).json({ success: false, msg: "Nothing to delete." });
    });
});

module.exports = router;
