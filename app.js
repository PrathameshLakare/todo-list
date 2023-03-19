const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-prathamesh:Test123@cluster0.cy8nsgq.mongodb.net/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function (req, res) {
  // const day = date.getDate();

  const items = Item.find({}).then(function (foundItems) {

    if (foundItems.length == 0) {

      Item.insertMany(defaultItems)
        .then(function () {
          console.log("successfully added");
        })
        .catch(function (err) {
          console.log(err);
        });
        res.redirect("/");
    } else {
      res.render("list", { listTitle: "today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name:itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName})
    .then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    })
  }

});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName})
    .then(function(foundList){
        if(!foundList){
            //Create new list
            const list = new List({
                name: customListName,
                items:defaultItems
            })
            list.save();
            res.redirect("/"+customListName);
        }else{
           // show list
           res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
        }
    })
    .catch(function(err){
        console.log(err);
    })
})

app.post("/work", function (req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.post("/delete",function(req,res){
    const checkItemId =req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkItemId)
        .then(function(){
            console.log("item deleted");
            res.redirect("/")
        })
        .catch(function(err){
            console.log(err);
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkItemId}}})
        .then(function(foundList){
            res.redirect("/"+ listName);
        })
        .catch(function(err){
            console.log(err);
        })
    }
    
})

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
