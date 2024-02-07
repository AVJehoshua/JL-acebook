// api/controllers/posts.js

const Post = require("../models/post");
const { generateToken } = require("../lib/token");
const mongoose = require("mongoose");

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
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
          image: 1,
          createdAt: 1,
        },
      },
    ]);
    const token = generateToken(req.user_id);
    res.status(200).json({ posts, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPostsByUser = async (req, res) => {
  let user_id = req.params.id;

  try {
    const posts = await Post.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id), // Convert user_id to ObjectId if it's a string
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
          image: 1,
        },
      },
    ]);
    const token = generateToken(req.user_id);
    res.status(200).json({ posts, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createPost = async (req, res) => {
  try {
    let image = "";

    if (req.file) {
      image =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/" +
        req.file.filename;
    }

    const { message, user_id } = req.body;
    // const image = req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename;

    const post = new Post({ message, user_id, image });
    await post.save();

    const newToken = generateToken(req.user_id);
    res.status(201).json({ message: "OK", token: newToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const PostsController = {
  getAllPosts: getAllPosts,
  createPost: createPost,
  getPostsByUser: getPostsByUser,
};

module.exports = PostsController;
