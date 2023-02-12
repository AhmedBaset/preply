const dropdowns = require("./src/dropdowns.json")

const controllers = Object.entries(dropdowns).map(([key, value]) => { 
   const options = Object.entries(value).map(([number, option]) => {
      return option
   });

   return [key, options]
});

console.log(controllers);