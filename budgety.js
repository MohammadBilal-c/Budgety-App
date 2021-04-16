var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;

  };
  Expense.prototype.calcPercentage = function (totalincome) {
    if (totalincome > 0) {
      this.percentage = Math.round((this.value / totalincome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  }



  var income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;

  };


  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: 0
  };
  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      //create a new id
      if (data.allItems[type] > 0) {
        ID = data.allItems[type][data.allItems[type] - 1].id + 1;
      } else {
        ID = 0;
      }

      //creat a new item based on inc or exp
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      }
      else if (type === 'inc') {
        newItem = new income(ID, des, val);
      }
      // push it into the data structure
      data.allItems[type].push(newItem);
      //return a new item
      return newItem;
    },
    deleteItems: function (type, id) {
      var ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;

      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }
    },



    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      //calculate budget income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    },
    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc)
      });
    },
    getPercentages: function () {
      var allPer = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPer;

    },


    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },


    testing: function () {
      console.log(data);
    }
  };

})()


var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLable: '.item__percentage'
  }
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListIteam: function (obj, type) {
      var html, newHtml, element;
      // create HTML string with placeholder text               
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      //replace placeholder texr with actual 
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description)
      newHtml = newHtml.replace('%value%', obj.value)
      // insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem: function (selectId) {
      var el = document.getElementById(selectId);
      el.parentNode.removeChild(el);
    },




    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      })
    },
    displayBudget: function (obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      };

    },
    displayPercentages: function (percentage) {
      var fields = document.querySelector(DOMstrings.expensesPercentageLable);

      var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };
      nodeListForEach(fields, function (current, index) {
        if (percentage[index] > 0) {
          current.textContent = percentage[index] + '%';
        } else {
          current.textContent = '---';
        }

      });
    },

    getDOMstring: function () {
      return DOMstrings;
    }
  }


})()
var Controller = (function (budgetCtrl, UICtrl) {

  var setupEventkistener = function () {
    var DOM = UICtrl.getDOMstring();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItems);


    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItems();

      }

    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItems);


  };
  var updateBudget = function () {
    // calculet the budget
    budgetCtrl.calculateBudget();

    // Return budget
    var budget = budgetCtrl.getBudget();


    // disolay the budget in UI
    UICtrl.displayBudget(budget);

  };
  var updatePercentages = function () {
    // calculate %
    budgetCtrl.calculatePercentages();

    // read % from budget controler
    var percentage = budgetCtrl.getPercentages();
    //update UI with new %
    // console.log(updatePercentages);
    UICtrl.displayPercentages(percentage);
  };






  var ctrlAddItems = function () {

    var input, newItem;
    //   get the field input data
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // add the items to the budget controller
      newitem = budgetCtrl.addItem(input.type, input.description, input.value);


      // add the items to the UI
      UICtrl.addListIteam(newitem, input.type);

      // clear fields
      UICtrl.clearFields();

      // Calculate and update budget
      updateBudget();

      //calculate and update the %
      updatePercentages();
    };



  };
  var ctrlDeleteItems = function (event) {
    var itemId, splitId, type, ID;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      splitId = itemId.split('-');
      type = splitId[0];
      ID = parseInt(splitId[1]);


      // delete the item for the data structure
      budgetCtrl.deleteItems(type, ID);

      // delete the item for the UI
      UICtrl.deleteListItem(itemId);

      // update and show the new budget
      updateBudget();



    }
  }
  return {
    init: function () {
      console.log('app is started');
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventkistener();
    }
  }

})(budgetController, UIController)

Controller.init();

function abc(num, index) {
  return num + index
} (23, 4)
// abc
console.log(abc)



























