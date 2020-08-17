//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config();


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect(process.env.DB_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

itemsSchema = {
  item: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  item: "Go to work"
});

const item2 = new Item({
  item: "Get food"
});

const item3 = new Item({
  item: "have fun"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Mission Complete");
          res.redirect("/");
        }
      });
    } else {
      res.render("list", {listTitle: "Today",newListItems: foundItems});
    }
  });

});

app.get("/:customListId", function(req, res) {
  const customListId = _.capitalize(req.params.customListId);

  List.findOne({name: customListId}, function(err, foundList){
    if(!err){
      if (!foundList) {
        const list = new List({
          name: customListId,
          items: defaultItems
        });
          list.save();
          res.redirect("/" + customListId);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemNew = new Item({
    item: itemName
  });

  if(listName === 'Today'){
    itemNew.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(itemNew);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemID, function(err) {
      if (!err) {
        console.log("You Good");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}},function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }
});

// Item.find({}, function(err, foundItems){
//   if(!err){
//     res.render("list", {listTitle: newListId, newListItems: foundItems});
//   };
// });


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;

if (port == null || port == "") {

port = 3000;

}


app.listen(port, function() {

console.log("Server has started Successfully");

});
