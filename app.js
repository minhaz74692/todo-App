//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// Mongoose setup start
mongoose.connect(mongoUrl)
const itemsSchema = new Schema({
  title: String
});

const Items = mongoose.model("item", itemsSchema);

// const itemOne = new Items({ title: "Eat Breakfast" });
// const itemTwo = new Items({ title: "Take Bath" });
// const itemThree = Items({ title: "Go to market" });
// itemThree.save();

// Items.insertMany([itemOne, itemTwo, itemThree], (err)=>{
//   if (err) {
//     console.log(err);
//   }else{
//     console.log("Success your items are added!!");
//   }
// });
// Read data from DB

// Mongoose setup End\

const day = date.getDate();
app.get("/", function (req, res) {
  Items.find({}, (err, e) => {
    if (e.length === 0) {
      res.render("list", { listTitle: "Today", newListItems: [{ title: "Add todo list below!!" }] });
    } else {
      res.render("list", { listTitle: "Today", newListItems: e });
    };
  });
});

// Route with parameters
// Create customList schema
const customSchema = new Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("list", customSchema);

app.get("/:customListName", (req, res) => {
  const customList = _.capitalize(req.params.customListName);
  List.findOne({ name: customList }, async (err, found) => {
    if (!err) {
      if (!found) {
        const lists = new List({
          name: customList,
          items: { title: "Nothing" }
        });
        await lists.save();
        console.log("added new custom list");
        res.redirect("/" + customList);
      } else {
        console.log("Already Exist");
        res.render("list", { listTitle: found.name, newListItems: found.items })
      };
    };
  });
});

app.post("/", async (req, res) => {
  const item = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Items({ title: item });
  if (listName === "Today") {
    await newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, async (err, foundList) => {
      foundList.items.push(newItem);
      await foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.deleteItem;
  const checkedTitle = req.body.deleteTitle;
  if (checkedTitle === "Today") {
    Items.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        res.redirect("/");
      };
    });
  } else {
    List.findOneAndUpdate({name: checkedTitle}, {$pull: {items: {_id: checkedItemId}}}, (err,foundList)=>{/*Read this line and try to understand $pull*/
      if(!err){
        res.redirect("/" + checkedTitle);
      }
    });
  };
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started successfully!!");
});
