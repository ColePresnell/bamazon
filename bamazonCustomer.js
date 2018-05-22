var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazonDB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  showProducts();
  orderProducts();
  
});

function showProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log("\n" + "Item ID: " + res[i].item_id + "\nItem: " + res[i].product_name + "\nUnit price: $" + res[i].price + "\n")
        }
    });
};

function orderProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        //prompt the usert to enter:
        // 1) the id of the product they want to buy
        // 2) how many units they want to buy
        inquirer.prompt([
            {
                name: "productID",
                type: "input",
                message: "\nWhat is the ID of the product that you want to buy?"
            },
            {
                name: "productQuantity",
                type: "input",
                message: "How many units of the product do you want to buy?"
            }
        ]).then(function (answer) {
            //get the ID from user's input and match it to the available items
            var selectedItem;
            for (i = 0; i < res.length; i++) {
                if (res[i].item_id === parseInt(answer.productID)) {
                    selectedItem = res[i];
                }
            }
            if (!selectedItem) {
                console.log("Could not find product with ID " + answer.productID);
                return;
            }
            //check if we have enough quantity on hand to process the order
            //if not, log the phrase :"insufficient quantity!" and stop the order
            if (parseInt(selectedItem.stock_quantity) < parseInt(answer.productQuantity)) {
                console.log("Insufficient quantity! PLEASE SELECT ANOTHER ITEM.");
                showProducts();
            }
            //if quantity on hand is sufficient to complete the order
            //show total cost of the purchase 
            else {
                //update sql database to reflect remaining quantity
                var updatedQuantity = parseInt(selectedItem.stock_quantity) - parseInt(answer.productQuantity);
                connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: updatedQuantity
                        },
                        {
                            item_id: selectedItem.item_id
                        }
                    ], function (err) {
                        if (err) throw err;
                        var totalPrice = parseInt(selectedItem.price) * parseInt(answer.productQuantity);
                        console.log("Your order has been receved. Your total price is $" + totalPrice + "!");
                    }
                )
            };
        });
    });
};
