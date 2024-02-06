// api/controllers/comments.js

const Comment = require("../models/comment");
const mongoose = require("mongoose");

const getAllCommentsByPostID = async (req, res) => {
  try {
    const comments = await Comment.aggregate([
      {
        $match: {
          post_id: new mongoose.Types.ObjectId(req.params.postId), // Convert user_id to ObjectId because it's a string
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          message: 1,
          full_name: "$userDetails.full_name",
          profile_pic: "$userDetails.profile_pic",
        },
      },
    ]);
    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const submitComment = async (req, res) => {
  try {
    const { userId, commentText } = req.body;
    const postId = req.body.postId;

    const comment = new Comment({
      post_id: postId,
      message: commentText,
      user_id: userId,
    });

    comment
      .save()
      .then((comment) => {
        res
          .status(201)
          .json({ message: "Comment created successfully", comment: comment });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const CommentsController = {
  submitComment: submitComment,
  getAllCommentsByPostID: getAllCommentsByPostID,
};

module.exports = CommentsController;